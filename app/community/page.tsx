"use client";

import { useState } from "react";
import CommunityFeed from "./community-feed";
import CommunityDirectory from "./community-directory";

type CommunityView = "feed" | "discover";

export default function CommunityPage() {
  const [view, setView] = useState<CommunityView>("feed");

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-7 flex items-center justify-between">
          <a href="/dashboard" className="text-sm font-extrabold tracking-wide text-[#000080]">← MILE</a>
          <a href="/dashboard" className="text-xs font-semibold text-[#666B76] transition hover:text-[#000080]">Back to workspace</a>
        </div>

        <div className="mb-7 flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] pb-4">
          <button
            type="button"
            onClick={() => setView("feed")}
            aria-pressed={view === "feed"}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${view === "feed" ? "bg-[#000080] text-white" : "bg-white text-[#666B76] hover:bg-[#EEF0F7]"}`}
          >
            Community feed
          </button>
          <button
            type="button"
            onClick={() => setView("discover")}
            aria-pressed={view === "discover"}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${view === "discover" ? "bg-[#000080] text-white" : "bg-white text-[#666B76] hover:bg-[#EEF0F7]"}`}
          >
            Discover freelancers
          </button>
        </div>

        {view === "feed" ? <CommunityFeed /> : <CommunityDirectory />}
      </div>
    </main>
  );
}
