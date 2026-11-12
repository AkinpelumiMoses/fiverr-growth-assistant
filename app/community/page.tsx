import CommunityDirectory from "./community-directory";

export default function CommunityPage() {
  return <main className="min-h-screen bg-[#f7f8f7] px-5 py-8 md:px-10 md:py-12"><div className="mx-auto mb-8 flex max-w-[1400px] items-center justify-between"><a href="/dashboard" className="text-sm font-bold text-[#222325]">← MILE</a><a href="/dashboard" className="text-xs font-semibold text-[#168B56]">Back to workspace</a></div><CommunityDirectory /></main>;
}
