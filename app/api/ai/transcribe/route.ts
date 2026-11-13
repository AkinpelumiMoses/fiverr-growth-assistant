import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI is not configured yet." }, { status: 503 });
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

    const body = await request.json() as { audioBase64?: string; mimeType?: string };
    const audioBase64 = typeof body.audioBase64 === "string" ? body.audioBase64 : "";
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
    const normalizedMime = mimeType.split(";")[0].trim().toLowerCase();
    const allowed = new Set(["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"]);
    if (!audioBase64 || !allowed.has(normalizedMime) || audioBase64.length > 12_000_000) {
      return NextResponse.json({ error: "That voice recording is invalid or too large. Please record a shorter note." }, { status: 400 });
    }
    const models = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"];
    let payload: any = null;
    let lastFailure = "The transcription service did not return a response.";
    for (const model of models) {
      try {
        const attempt = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [
              { text: "Transcribe the spoken audio accurately in the original language. Return only the words spoken. Do not answer the speaker or add commentary. If speech is unclear, transcribe only what you can confidently hear." },
              { inline_data: { mime_type: normalizedMime, data: audioBase64 } }
            ] }],
            generationConfig: { temperature: 0, maxOutputTokens: 1200 }
          }),
          signal: AbortSignal.timeout(25000),
        });
        const attemptPayload = await attempt.json().catch(() => ({}));
        if (attempt.ok) {
          payload = attemptPayload;
          break;
        }
        lastFailure = attemptPayload?.error?.message || `Gemini ${model} returned HTTP ${attempt.status}.`;
        console.error("Gemini transcription model failed:", { model, status: attempt.status, detail: lastFailure });
        if (![408, 429, 500, 502, 503, 504].includes(attempt.status)) break;
      } catch (attemptError) {
        lastFailure = attemptError instanceof Error ? attemptError.message : "The transcription request timed out.";
        console.error("Gemini transcription attempt timed out:", { model, detail: lastFailure });
      }
    }
    if (!payload) {
      return NextResponse.json({ error: "Voice transcription is temporarily unavailable. Your recording is still saved—please try again.", detail: lastFailure }, { status: 503 });
    }
    const transcript = (payload?.candidates?.[0]?.content?.parts ?? []).map((part: { text?: string }) => part.text ?? "").join("\n").trim();
    if (!transcript) return NextResponse.json({ error: "I couldn't detect clear speech. Please try recording again." }, { status: 422 });
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("AI voice transcription error:", error);
    return NextResponse.json({ error: "Unable to process this voice note right now." }, { status: 500 });
  }
}
