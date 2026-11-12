import CommunityJobs from "./community-jobs";

export default function CommunityJobsPage() {
  return <main className="min-h-screen bg-[#f7f8f7] px-5 py-8 md:px-10 md:py-12"><div className="mx-auto mb-8 flex max-w-[1200px] items-center justify-between"><a href="/dashboard" className="text-sm font-bold text-[#222325]">← MILE</a><a href="/community" className="text-xs font-semibold text-[#168B56]">Freelancer directory</a></div><CommunityJobs /></main>;
}
