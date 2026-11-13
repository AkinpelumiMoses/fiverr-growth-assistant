import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI transcription is not configured yet." }, { status: 503 });

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

    const body = await request.json() as { audioBase64?: string; mimeType?: string };
    const audioBase64 = typeof body.audioBase64 === "string" ? body.audioBase64 : "";
    const mimeType = typeof body.mimeType === "string" ? body.mimeType.split(";")[0].trim().toLowerCase() : "";
    const allowed = new Set(["audio/wav", "audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg"]);
    if (!audioBase64 || !allowed.has(mimeType) || audioBase64.length > 12_000_000) {
      return NextResponse.json({ error: "That voice recording is invalid or too large. Please record a shorter note." }, { status: 400 });
    }

    const audioBytes = Buffer.from(audioBase64, "base64");
    if (!audioBytes.length) return NextResponse.json({ error: "The recording is empty. Please record again." }, { status: 400 });

    // Gemini 3.5 Transcribe is served through the Interactions API. Audio must
    // first be uploaded with the Files API; it is not a generateContent model.
    const startUpload = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(audioBytes.length),
        "X-Goog-Upload-Header-Content-Type": mimeType,
      },
      body: JSON.stringify({ file: { display_name: `mile-voice-${Date.now()}` } }),
      signal: AbortSignal.timeout(10000),
    });
    if (!startUpload.ok) {
      const detail = await startUpload.text().catch(() => "");
      console.error("Gemini file upload initialization failed:", startUpload.status, detail);
      return NextResponse.json({ error: "Could not prepare your recording for transcription. Please try again." }, { status: 503 });
    }

    const uploadUrl = startUpload.headers.get("x-goog-upload-url");
    if (!uploadUrl) {
      console.error("Gemini file upload did not return an upload URL.");
      return NextResponse.json({ error: "The transcription service did not accept the recording. Please try again." }, { status: 503 });
    }

    const upload = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Length": String(audioBytes.length),
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
      },
      body: audioBytes,
      signal: AbortSignal.timeout(15000),
    });
    const uploadedFile = await upload.json().catch(() => ({}));
    const fileUri = uploadedFile?.file?.uri;
    if (!upload.ok || typeof fileUri !== "string") {
      console.error("Gemini audio upload failed:", upload.status, uploadedFile);
      return NextResponse.json({ error: "Your recording could not be uploaded for transcription. Please try again." }, { status: 503 });
    }

    const transcription = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        model: "gemini-3.5-transcribe",
        input: [{ type: "audio", uri: fileUri, mime_type: mimeType }],
        generation_config: {
          transcription_config: {
            mode: { type: "verbatim" },
          },
        },
      }),
      signal: AbortSignal.timeout(25000),
    });
    const result = await transcription.json().catch(() => ({}));
    if (!transcription.ok) {
      console.error("Gemini transcription request failed:", transcription.status, result?.error?.message);
      return NextResponse.json({ error: "The transcription service could not understand that recording. Please try again." }, { status: 503 });
    }

    const transcript = typeof result?.output_text === "string" ? result.output_text.trim() : "";
    if (!transcript) {
      return NextResponse.json({ error: "I couldn't detect clear speech in that recording. Please try again in a quieter place." }, { status: 422 });
    }
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("AI voice transcription error:", error);
    return NextResponse.json({ error: "Unable to process this voice note right now. Please try again." }, { status: 500 });
  }
}
