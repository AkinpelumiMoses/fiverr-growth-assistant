import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI transcription is not configured yet." }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    }

    const body = await request.json() as { audioBase64?: string; mimeType?: string };
    const audioBase64 = typeof body.audioBase64 === "string" ? body.audioBase64 : "";
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
    const normalizedMime = mimeType.split(";")[0].trim().toLowerCase();
    const allowed = new Set(["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"]);

    if (!audioBase64 || !allowed.has(normalizedMime) || audioBase64.length > 12_000_000) {
      return NextResponse.json(
        { error: "That voice recording is invalid or too large. Please record a shorter note." },
        { status: 400 },
      );
    }

    // Use Google's speech-to-text model rather than a general chat model.
    // General-purpose models can respond to, reinterpret, or hallucinate audio content.
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-transcribe:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              {
                text: "Transcribe this audio verbatim. Return only the words that are actually spoken, in the language spoken. Do not answer the speaker, summarize, translate, complete unfinished sentences, infer missing words, or add any explanation. If no speech is clearly audible, return an empty transcription.",
              },
              {
                inline_data: {
                  mime_type: normalizedMime,
                  data: audioBase64,
                },
              },
            ],
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 1200,
            audioTranscriptionConfig: {
              mode: "VERBATIM",
            },
          },
        }),
        signal: AbortSignal.timeout(25000),
      },
    );

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = payload?.error?.message || `Gemini transcription returned HTTP ${response.status}.`;
      console.error("Dedicated Gemini transcription failed:", { status: response.status, detail });
      return NextResponse.json(
        { error: "Voice transcription is temporarily unavailable. Your recording is still available—please try again." },
        { status: 503 },
      );
    }

    const transcript = (payload?.candidates?.[0]?.content?.parts ?? [])
      .map((part: { text?: string }) => part.text ?? "")
      .join("\n")
      .trim();

    if (!transcript) {
      return NextResponse.json(
        { error: "I couldn't detect clear speech in that recording. Please try again in a quieter place." },
        { status: 422 },
      );
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("AI voice transcription error:", error);
    return NextResponse.json(
      { error: "Unable to process this voice note right now. Please try again." },
      { status: 500 },
    );
  }
}
