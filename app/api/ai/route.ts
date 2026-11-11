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
};

const SYSTEM_BASE = `You are Fiverr Growth Assistant, a practical and honest coach for Fiverr freelancers.
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
      if (!message) return NextResponse.json({ error: "Type a question for your growth coach." }, { status: 400 });
      const history = Array.isArray(body.history) ? body.history.slice(-8).map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: typeof item.content === "string" ? item.content.slice(0, 1500) : "",
      })).filter((item) => item.content) : [];
      taskPrompt = `Use the seller context below to answer the seller's latest question. If there is not enough data, ask one focused follow-up question. Diagnose performance carefully: low impressions may relate to relevance, demand, competition or indexing; impressions without clicks may suggest title/thumbnail/positioning issues; clicks without orders may suggest offer, price, trust or conversion friction. Treat these as hypotheses, not facts about Fiverr's algorithm.

Seller context:
${JSON.stringify(sellerContext)}

Recent conversation:
${JSON.stringify(history)}

Latest seller question:
${message}`;
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_BASE }] },
        contents: [{ role: "user", parts: [{ text: taskPrompt }] }],
        generationConfig: {
          maxOutputTokens: body.mode === "gig-analysis" ? 1800 : 1000,
          temperature: 0.4,
        },
      }),
      signal: AbortSignal.timeout(55000),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Gemini API error:", result);
      return NextResponse.json({ error: "The AI service could not complete that request. Please try again shortly." }, { status: 502 });
    }

    const answer = (result.candidates ?? [])
      .flatMap((candidate: { content?: { parts?: { text?: string }[] } }) => candidate.content?.parts ?? [])
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

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({ error: "Something went wrong while contacting the AI service. Please try again." }, { status: 500 });
  }
}
