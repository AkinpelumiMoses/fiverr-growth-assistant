"use client";

import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Users, Compass } from "lucide-react";
import Link from "next/link";
import CommunityFeed from "./community-feed";
import CommunityDirectory from "./community-directory";

type CommunityView = "feed" | "discover";

export default function CommunityPage() {
  const [view, setView] = useState<CommunityView>("feed");

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-4 py-5 text-[#172019] md:px-8 md:py-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-7 flex items-center justify-between">
          <Link href="/dashboard" className="group inline-flex items-center gap-2 text-sm font-black tracking-tight text-[#111A14]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111A14] text-sm font-black text-[#D7F36A]">M</span>
            <span>MILE <span className="font-medium text-[#89928A]">/ COMMUNITY</span></span>
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-[#E1E7DF] bg-white px-4 py-2.5 text-xs font-bold text-[#58635A] transition hover:border-[#B7C69B] hover:text-[#111A14]">
            <ArrowLeft size={14}/> Back to workspace
          </Link>
        </header>

        <div className="mb-8 flex flex-col gap-5 rounded-[26px] border border-[#202A21] bg-[#111A14] p-5 text-white shadow-[0_18px_50px_rgba(17,26,20,.10)] md:flex-row md:items-center md:justify-between md:px-7 md:py-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#D7F36A]">The MILE network</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">Good work moves further together.</h1>
            <p className="mt-2 max-w-xl text-xs leading-6 text-[#C2CCC1] md:text-sm">A space to share your work, meet other freelancers and find the right people for what comes next.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[.04] p-1.5">
            <button type="button" onClick={() => setView("feed")} aria-pressed={view === "feed"} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold transition ${view === "feed" ? "bg-[#D7F36A] text-[#111A14] shadow-sm" : "text-[#C2CCC1] hover:bg-white/10 hover:text-white"}`}>
              <Users size={15}/> Community feed
            </button>
            <button type="button" onClick={() => setView("discover")} aria-pressed={view === "discover"} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold transition ${view === "discover" ? "bg-[#D7F36A] text-[#111A14] shadow-sm" : "text-[#C2CCC1] hover:bg-white/10 hover:text-white"}`}>
              <Compass size={15}/> Discover
            </button>
          </div>
        </div>

        {view === "feed" ? <CommunityFeed /> : <CommunityDirectory />}
        <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-[#E2E8E0] pt-5 text-[10px] text-[#8A948B] sm:flex-row">
          <span>© MILE · Every step has a purpose.</span>
          <span className="inline-flex items-center gap-1">Built for people who build <ArrowUpRight size={11}/></span>
        </footer>
      </div>
    </main>
  );
}
