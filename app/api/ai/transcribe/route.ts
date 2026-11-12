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
    const allowed = new Set(["audio/webm", "audio/webm;codecs=opus", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"]);
    if (!audioBase64 || !allowed.has(mimeType) || audioBase64.length > 12_000_000) {
      return NextResponse.json({ error: "That voice recording is invalid or too large. Please record a shorter note." }, { status: 400 });
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [
          { text: "Transcribe the spoken audio accurately in the original language. Return only the words spoken. Do not answer the speaker or add commentary. If speech is unclear, transcribe only what you can confidently hear." },
          { inline_data: { mime_type: mimeType.split(";")[0], data: audioBase64 } }
        ] }],
        generationConfig: { temperature: 0, maxOutputTokens: 1200 }
      }),
      signal: AbortSignal.timeout(22000),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Gemini audio transcription failed:", payload);
      return NextResponse.json({ error: "The voice transcription service is temporarily unavailable." }, { status: 503 });
    }
    const transcript = (payload?.candidates?.[0]?.content?.parts ?? []).map((part: { text?: string }) => part.text ?? "").join("\n").trim();
    if (!transcript) return NextResponse.json({ error: "I couldn't detect clear speech. Please try recording again." }, { status: 422 });
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("AI voice transcription error:", error);
    return NextResponse.json({ error: "Unable to process this voice note right now." }, { status: 500 });
  }
}
