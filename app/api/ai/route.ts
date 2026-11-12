import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type RequestBody = {
  mode?: "gig-analysis" | "coach";
  gigId?: string;
  gig?: { title?: string; description?: string; tags?: string };
  message?: string;
  history?: { role: "user" | "assistant"; content: string }[];
  attachments?: { path: string; name: string; mimeType: string; size: number }[];
  conversationId?: string;
};

const SYSTEM_BASE = `You are MILE Growth Coach, a practical and honest coach for independent freelancers working across marketplaces, direct clients and their own businesses.
Give clear, specific, commercially useful advice in plain English. Be supportive but candid.
Never promise rankings, impressions, orders, revenue or first-page placement. Never claim access to Fiverr's private algorithm, live search volume, seller analytics or private competitor data.
Clearly distinguish observed facts from hypotheses. Do not invent metrics, keyword volumes, competitor information or Fiverr rules.
Prioritise actions the seller can actually take. Avoid generic motivational filler. Use short headings and concise bullet points.`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI is not configured yet. Add GEMINI_API_KEY to the Vercel environment variables." }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    }

    const body = (await request.json()) as RequestBody;
    if (body.mode === "coach" && (typeof body.conversationId !== "string" || !body.conversationId)) return NextResponse.json({ error: "Start a conversation before sending a message." }, { status: 400 });
    if (body.mode !== "gig-analysis" && body.mode !== "coach") {
      return NextResponse.json({ error: "Choose a valid AI action." }, { status: 400 });
    }

    const [{ data: profile }, { data: gigs }, { data: performance }] = await Promise.all([
      supabase.from("profiles").select("display_name,fiverr_username,seller_level,primary_niche,website_url").eq("id", user.id).maybeSingle(),
      supabase.from("gigs").select("id,title,description,tags,category,starting_price,currency,status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("performance_entries").select("period_start,impressions,clicks,orders,revenue,currency,gig_id").eq("user_id", user.id).order("period_start", { ascending: false }).limit(30),
    ]);

    const sellerContext = {
      profile: profile ?? {},
      savedGigs: gigs ?? [],
      recentPerformanceSnapshots: performance ?? [],
    };

    let taskPrompt = "";
    let multimodalInput: { type: string; text?: string; data?: string; mime_type?: string }[] | null = null;
    if (body.mode === "gig-analysis") {
      const gigId = typeof body.gigId === "string" ? body.gigId : "";
      const gig = (gigs ?? []).find((item) => item.id === gigId);
      if (!gig) {
        return NextResponse.json({ error: "Select one of your saved gigs before requesting an AI review." }, { status: 400 });
      }
      const submitted = body.gig && typeof body.gig === "object" ? body.gig : {};
      const reviewGig = {
        title: typeof submitted.title === "string" ? submitted.title.slice(0, 180) : gig.title,
        description: typeof submitted.description === "string" ? submitted.description.slice(0, 6000) : gig.description,
        tags: typeof submitted.tags === "string" ? submitted.tags.slice(0, 600) : (gig.tags ?? []).join(", "),
        category: gig.category, starting_price: gig.starting_price, currency: gig.currency, status: gig.status,
      };
      taskPrompt = `Review this seller's Fiverr gig. Analyse buyer clarity, offer positioning, specificity, description structure, trust signals, deliverables, tags relevance and likely buyer objections. Do not infer ranking or search-volume data. Give: (1) concise overall diagnosis, (2) strengths, (3) priority issues with reasons, (4) a suggested improved title, (5) a rewritten description only if the existing description gives enough information—do not invent credentials or deliverables, (6) tag ideas labelled as hypotheses to validate, (7) three practical next actions. If information is missing, say exactly what is missing.\n\nGig data:\n${JSON.stringify(reviewGig)}`;
    } else {
      const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
      if (!message && (!Array.isArray(body.attachments) || body.attachments.length === 0)) return NextResponse.json({ error: "Write a message or attach a file for your growth coach to review." }, { status: 400 });
      const history = Array.isArray(body.history) ? body.history.slice(-8).map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: typeof item.content === "string" ? item.content.slice(0, 1500) : "",
      })).filter((item) => item.content) : [];
      const attachmentItems = Array.isArray(body.attachments) ? body.attachments.slice(0, 5) : [];
      const allowedMime = new Set(["application/pdf","text/plain","text/markdown","text/csv","application/json","image/jpeg","image/png","image/webp","image/gif"]);
      const inputParts: { type: string; text?: string; data?: string; mime_type?: string }[] = [{
        type: "text",
        text: `Use the seller context below to answer the seller's latest question. If there is not enough data, ask one focused follow-up question. Diagnose performance carefully: low impressions may relate to relevance, demand, competition or indexing; impressions without clicks may suggest title/thumbnail/positioning issues; clicks without orders may suggest offer, price, trust or conversion friction. Treat these as hypotheses, not facts about Fiverr's algorithm.

Seller context:
${JSON.stringify(sellerContext)}

Recent conversation:
${JSON.stringify(history)}

Latest seller question:
${message}`
      }];
      let totalAttachmentBytes = 0;
      for (const attachment of attachmentItems) {
        if (!attachment || typeof attachment.path !== "string" || !attachment.path.startsWith(`${user.id}/`) || !allowedMime.has(attachment.mimeType) || !Number.isFinite(attachment.size) || attachment.size <= 0 || attachment.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: "One of the attachments is invalid or too large." }, { status: 400 });
        }
        totalAttachmentBytes += attachment.size;
        if (totalAttachmentBytes > 12 * 1024 * 1024) return NextResponse.json({ error: "The combined attachments are too large. Please send fewer or smaller files." }, { status: 413 });
        const { data: file, error: downloadError } = await supabase.storage.from("ai-attachments").download(attachment.path);
        if (downloadError || !file) return NextResponse.json({ error: "An attachment could not be accessed. Please upload it again." }, { status: 400 });
        const bytes = Buffer.from(await file.arrayBuffer());
        inputParts.push({
          type: attachment.mimeType.startsWith("image/") ? "image" : attachment.mimeType === "application/pdf" ? "document" : "text",
          ...(attachment.mimeType === "application/pdf" || attachment.mimeType.startsWith("image/") ? { data: bytes.toString("base64"), mime_type: attachment.mimeType } : { text: `Attached file: ${attachment.name}\\n\\n${bytes.toString("utf8").slice(0, 30000)}` }),
        });
      }
      multimodalInput = inputParts;
      taskPrompt = inputParts[0].text ?? "";
      const { data: conversation, error: conversationError } = await supabase.from("ai_conversations").select("id,title").eq("id", body.conversationId!).eq("user_id", user.id).maybeSingle();
      if (conversationError || !conversation) return NextResponse.json({ error: "This conversation could not be found." }, { status: 404 });
      const userMessage = message || "Please review the attached files.";
      const { error: messageSaveError } = await supabase.from("ai_messages").insert({
        conversation_id: conversation.id,
        user_id: user.id,
        role: "user",
        content: userMessage,
        attachments: attachmentItems.map((item) => ({ name: item.name, mimeType: item.mimeType, size: item.size, path: item.path })),
      });
      if (messageSaveError) return NextResponse.json({ error: "Your message could not be saved. Please try again." }, { status: 500 });
    }

    // Try the current Flash model first, then a lighter stable model if Google is busy.
    // Keep each attempt bounded so the dashboard receives a useful response before the function times out.
    const models = ["gemini-3.5-flash-lite", "gemini-3.7-flash"];
    let result: any = null;
    let lastError = "The AI service is temporarily unavailable.";

    for (const model of models) {
      try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
            "Api-Revision": "2026-05-20",
          },
          body: JSON.stringify({
            model,
            input: multimodalInput ?? taskPrompt,
            system_instruction: SYSTEM_BASE,
            store: false,
            generation_config: {
              max_output_tokens: body.mode === "gig-analysis" ? 1800 : 1000,
            },
          }),
          signal: AbortSignal.timeout(22000),
        });

        const payload = await response.json().catch(() => ({}));
        if (response.ok) {
          result = payload;
          break;
        }

        const providerMessage = payload?.error?.message || `Gemini returned HTTP ${response.status}.`;
        lastError = providerMessage;
        console.error(`Gemini model ${model} failed:`, payload);

        // Only retry on temporary capacity/rate/server failures. Other errors need configuration fixes.
        if (![408, 429, 500, 502, 503, 504].includes(response.status)) break;
      } catch (error) {
        lastError = error instanceof Error && error.name === "TimeoutError"
          ? `The ${model} request timed out.`
          : "The AI provider could not be reached.";
        console.error(`Gemini model ${model} request failed:`, error);
      }
    }

    if (!result) {
      return NextResponse.json({
        error: "The AI service is busy right now. Your message has not been lost—please try again in a moment.",
        detail: lastError,
      }, { status: 503 });
    }

    const answer = typeof result.output_text === "string" ? result.output_text : (result.steps ?? [])
      .filter((step: { type?: string }) => step.type === "model_output")
      .flatMap((step: { content?: { type?: string; text?: string }[] }) => step.content ?? [])
      .filter((part: { type?: string }) => part.type === "text")
      .map((part: { text?: string }) => part.text ?? "")
      .join("\n\n");

    if (body.mode === "gig-analysis") {
      const gigId = body.gigId as string;
      const { error: saveError } = await supabase.from("analysis_reports").insert({
        user_id: user.id,
        gig_id: gigId,
        report_type: "ai_gig_review",
        findings: { text: answer },
        recommendations: [],
      });
      if (saveError) console.error("Could not save AI gig report:", saveError.message);
    }

    if (body.mode === "coach") {
      const conversationId = body.conversationId as string;
      const { error: assistantSaveError } = await supabase.from("ai_messages").insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "assistant",
        content: answer,
        attachments: [],
      });
      if (assistantSaveError) console.error("Could not save AI response:", assistantSaveError.message);
      await supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId).eq("user_id", user.id);
    }
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({ error: "Something went wrong while contacting the AI service. Please try again." }, { status: 500 });
  }
}
