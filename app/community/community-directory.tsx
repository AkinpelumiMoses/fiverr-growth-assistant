"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users, ExternalLink, BriefcaseBusiness, Globe2, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PublicProfile = {
  id: string; display_name: string | null; fiverr_username: string | null; seller_level: string | null;
  primary_niche: string | null; avatar_url: string | null; bio: string | null; fiverr_profile_url: string | null;
  skills: string | null; experience_years: number | null; website_url: string | null; work_platforms: string[] | null;
  upwork_profile_url: string | null; linkedin_url: string | null; other_work_url: string | null;
};

export default function CommunityDirectory() {
  const supabase = useMemo(() => createClient(), []);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("All niches");
  const [platform, setPlatform] = useState("All platforms");

  useEffect(() => {
    let active = true;
    async function loadProfiles() {
      setLoading(true); setError("");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { if (active) { setError("Please sign in to explore the freelancer community."); setLoading(false); } return; }
      if (active) setCurrentUserId(user.id);
      const { data, error: queryError } = await supabase.from("profiles")
        .select("id,display_name,fiverr_username,seller_level,primary_niche,avatar_url,bio,fiverr_profile_url,skills,experience_years,website_url,work_platforms,upwork_profile_url,linkedin_url,other_work_url")
        .eq("community_discoverable", true).order("display_name", { ascending: true }).limit(100);
      if (!active) return;
      if (queryError) setError("We couldn't load the community right now. " + queryError.message);
      else setProfiles((data ?? []) as PublicProfile[]);
      setLoading(false);
    }
    loadProfiles();
    return () => { active = false; };
  }, [supabase]);

  useEffect(() => {
    let alive = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    async function joinPresence() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !alive) return;
      channel = supabase.channel("mile-online-members", { config: { presence: { key: user.id } } });
      const refresh = () => {
        if (!alive || !channel) return;
        const state = channel.presenceState<{ user_id?: string }>();
        setOnlineIds(Object.keys(state).filter(id => id !== user.id));
      };
      channel.on("presence", { event: "sync" }, refresh).on("presence", { event: "join" }, refresh).on("presence", { event: "leave" }, refresh)
        .subscribe(async status => {
          if (status === "SUBSCRIBED") {
            await channel?.track({ user_id: user.id, online_at: new Date().toISOString() });
            refresh();
          }
        });
    }
    void joinPresence();
    return () => { alive = false; if (channel) void supabase.removeChannel(channel); };
  }, [supabase]);

  const niches = useMemo(() => ["All niches", ...Array.from(new Set(profiles.map(p => p.primary_niche?.trim()).filter((v): v is string => Boolean(v))))].sort((a,b) => a === "All niches" ? -1 : a.localeCompare(b)), [profiles]);
  const platforms = useMemo(() => ["All platforms", ...Array.from(new Set(profiles.flatMap(p => p.work_platforms ?? []))).sort()], [profiles]);
  const myProfile = profiles.find(profile => profile.id === currentUserId) ?? null;

  const matchFor = (candidate: PublicProfile) => {
    const ownNiche = (myProfile?.primary_niche ?? "").toLowerCase();
    const theirNiche = (candidate.primary_niche ?? "").toLowerCase();
    const ownSkills = (myProfile?.skills ?? "").toLowerCase();
    const theirSkills = (candidate.skills ?? "").toLowerCase();
    const ownText = `${ownNiche} ${ownSkills}`;
    const theirText = `${theirNiche} ${theirSkills}`;
    const groups = [
      { terms: ["brand", "graphic design", "logo", "visual", "ui/ux", "product design"], complements: ["web", "developer", "software", "copy", "writing", "marketing", "video"] },
      { terms: ["web", "developer", "software", "frontend", "backend"], complements: ["brand", "graphic", "ui/ux", "copy", "content", "seo", "marketing"] },
      { terms: ["copy", "writing", "content"], complements: ["brand", "graphic", "web", "developer", "marketing", "video"] },
      { terms: ["marketing", "social media", "seo"], complements: ["brand", "graphic", "web", "developer", "video", "copy"] },
      { terms: ["video", "motion", "animation"], complements: ["brand", "graphic", "marketing", "social media", "copy"] },
    ];
    const ownGroup = groups.find(group => group.terms.some(term => ownText.includes(term)));
    const complementary = Boolean(ownGroup && ownGroup.complements.some(term => theirText.includes(term)));
    const sameNiche = Boolean(ownNiche && theirNiche && (ownNiche === theirNiche || ownNiche.includes(theirNiche) || theirNiche.includes(ownNiche)));
    const sharedPlatform = (myProfile?.work_platforms ?? []).some(item => (candidate.work_platforms ?? []).includes(item));
    const ownSkillTerms = ownSkills.split(/[,·|]/).map(value => value.trim()).filter(value => value.length > 2);
    const sharedSkills = ownSkillTerms.filter(skill => theirText.includes(skill)).length;
    const score = (complementary ? 5 : 0) + (sameNiche ? 2 : 0) + (sharedPlatform ? 1 : 0) + Math.min(sharedSkills, 2);
    const reason = complementary ? "Complementary skills" : sameNiche ? "Similar specialisation" : sharedSkills ? "Shared skills" : sharedPlatform ? "Shared work platforms" : "Potential network connection";
    return { score, reason };
  };

  const recommended = useMemo(() => profiles
    .filter(profile => profile.id !== currentUserId)
    .map(profile => ({ profile, ...matchFor(profile) }))
    .sort((a, b) => b.score - a.score || (a.profile.display_name ?? "").localeCompare(b.profile.display_name ?? ""))
    .slice(0, 3), [profiles, currentUserId, myProfile?.primary_niche, myProfile?.skills, myProfile?.work_platforms]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return profiles.filter(profile => {
      if (profile.id === currentUserId) return false;
      const matchesNiche = niche === "All niches" || profile.primary_niche === niche;
      const matchesPlatform = platform === "All platforms" || (profile.work_platforms ?? []).includes(platform);
      const haystack = [profile.display_name, profile.fiverr_username, profile.primary_niche, profile.skills, profile.bio, profile.seller_level, ...(profile.work_platforms ?? [])].filter(Boolean).join(" ").toLowerCase();
      return matchesNiche && matchesPlatform && (!term || haystack.includes(term));
    });
  }, [profiles, search, niche, platform, currentUserId]);

  return <div className="community-directory mx-auto max-w-[1400px]">
    <div className="mb-8"><p className="text-xs font-bold text-[#168B56]">FREELANCER COMMUNITY</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Freelancers, connected.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#777d77]">Discover freelancers from different platforms and specialties, explore what they do, and find people who can help move work forward.</p></div>
    {myProfile && recommended.length > 0 && <section className="mb-7 rounded-2xl border border-[#dce9df] bg-[#f7fbf8] p-5 md:p-6">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#168B56]">MILE MATCH</p><h3 className="mt-1 text-xl font-extrabold text-[#222925]">Connections worth exploring.</h3><p className="mt-1 max-w-xl text-xs leading-5 text-[#69736c]">A starting point for finding people whose skills, specialisation or work platforms may complement yours.</p></div><span className="text-[10px] text-[#78837b]">Early matching · based on profile details</span></div>
      <div className="grid gap-3 md:grid-cols-3">{recommended.map(({profile, reason}) => <article key={profile.id} className="flex min-w-0 flex-col rounded-xl border border-[#e4ebe5] bg-white p-4">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaf8ef] text-sm font-bold text-[#168B56]">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover"/> : (profile.display_name || "F").split(/\s+/).map(part=>part[0]).slice(0,2).join("").toUpperCase()}</div><div className="min-w-0"><p className="truncate text-xs font-bold text-[#303a32]">{profile.display_name || "Freelancer"}</p><p className="truncate text-[10px] text-[#78837b]">{profile.primary_niche || "Independent freelancer"}</p></div></div>
        <span className="mt-3 inline-flex w-fit rounded-full bg-[#eef8f0] px-2.5 py-1 text-[10px] font-semibold text-[#168B56]">{reason}</span>
        <p className="mt-2 line-clamp-2 min-h-9 text-[10px] leading-5 text-[#78837b]">{profile.skills || profile.bio || "Explore their profile to learn more about their work."}</p>
        <Link href={`/community/${profile.id}`} className="mt-3 inline-flex items-center justify-center rounded-lg bg-[#168B56] px-3 py-2.5 text-[11px] font-bold text-white hover:bg-[#117447]">Explore freelancer</Link>
      </article>)}</div>
      <p className="mt-3 text-[10px] leading-5 text-[#879188]">Recommendations are heuristic suggestions, not verified compatibility or endorsements. Complete your profile to improve relevance.</p>
    </section>}
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#e9ece9] bg-white p-4 md:flex-row">
      <label className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929992]"/><input aria-label="Search freelancers" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, username, skill or niche" className="w-full rounded-xl border border-[#dfe5e9] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#168B56]"/></label>
      <select aria-label="Filter by niche" value={niche} onChange={e => setNiche(e.target.value)} className="rounded-xl border border-[#dfe5e9] bg-white px-4 py-3 text-sm outline-none focus:border-[#168B56] md:min-w-[210px]">{niches.map(item => <option key={item} value={item}>{item}</option>)}</select>
      <select aria-label="Filter by platform" value={platform} onChange={e => setPlatform(e.target.value)} className="rounded-xl border border-[#dfe5e9] bg-white px-4 py-3 text-sm outline-none focus:border-[#168B56] md:min-w-[190px]">{platforms.map(item => <option key={item} value={item}>{item}</option>)}</select>
    </div>
    <div className="mb-4 flex items-center justify-between"><p className="text-xs font-semibold text-[#69736c]">{loading ? "Finding freelancers…" : `${filtered.length} freelancer${filtered.length === 1 ? "" : "s"} found`}</p><span className="inline-flex items-center gap-1.5 text-[10px] text-[#929992]"><Users size={13}/> Opt-in profiles only</span></div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1,2,3].map(n=><div key={n} className="h-64 animate-pulse rounded-2xl border border-[#e9ece9] bg-white"/>)}</div>}
    {!loading && !error && filtered.length === 0 && <div className="rounded-2xl border border-dashed border-[#dce3dd] bg-white px-6 py-16 text-center"><Users size={30} className="mx-auto mb-4 text-[#168B56]"/><h3 className="text-base font-bold">{profiles.length ? "No matching freelancers" : "The community is just getting started"}</h3><p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#929992]">{profiles.length ? "Try another search term or choose a different niche." : "When freelancers choose to make their profiles discoverable, they will appear here. You can enable this in Profile settings."}</p></div>}
    {!loading && !error && filtered.length > 0 && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(profile => {
      const initials = (profile.display_name || profile.fiverr_username || "F").split(/[\s._-]+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()).join("");
      const fiverrUrl = profile.fiverr_profile_url?.startsWith("https://") ? profile.fiverr_profile_url : profile.fiverr_username ? `https://www.fiverr.com/${encodeURIComponent(profile.fiverr_username)}` : null;
      const websiteUrl = profile.website_url?.startsWith("https://") ? profile.website_url : null;
      const upworkUrl = profile.upwork_profile_url?.startsWith("https://") ? profile.upwork_profile_url : null;
      const linkedinUrl = profile.linkedin_url?.startsWith("https://") ? profile.linkedin_url : null;
      const otherUrl = profile.other_work_url?.startsWith("https://") ? profile.other_work_url : null;
      const online = onlineIds.includes(profile.id);
      return <article key={profile.id} className="flex min-w-0 flex-col rounded-2xl border border-[#e9ece9] bg-white p-5 shadow-[0_8px_30px_rgba(27,42,32,.035)]">
        <div className="flex items-center gap-3"><div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-visible rounded-full bg-[#eaf8ef] text-lg font-bold text-[#168B56]"><div className="h-full w-full overflow-hidden rounded-full">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover"/> : initials}</div><span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${online ? "bg-[#18a957]" : "bg-[#b9c0bb]"}`} title={online ? "Online now" : "Offline"}/></div>
          <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-extrabold">{profile.display_name || profile.fiverr_username || "Freelancer"}</h3><p className="mt-1 truncate text-xs text-[#929992]">{profile.primary_niche || "Freelancer"} · {online ? <span className="font-semibold text-[#168B56]">Online now</span> : "Offline"}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2">{profile.primary_niche && <span className="rounded-full bg-[#eaf8ef] px-3 py-1.5 text-[10px] font-bold text-[#168B56]">{profile.primary_niche}</span>}{profile.seller_level && <span className="rounded-full bg-[#f3f5f3] px-3 py-1.5 text-[10px] font-semibold text-[#68736b]">{profile.seller_level}</span>}{(profile.work_platforms ?? []).map(item=><span key={item} className="rounded-full border border-[#e5eae6] px-3 py-1.5 text-[10px] font-medium text-[#59645c]">{item}</span>)}</div>
        <p className="mt-4 line-clamp-3 min-h-[60px] text-xs leading-6 text-[#69736c]">{profile.bio || "This freelancer has not added a short introduction yet."}</p>
        {profile.skills && <div className="mt-3"><p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#929992]">Skills</p><p className="line-clamp-2 text-xs leading-5 text-[#515b53]">{profile.skills}</p></div>}
        <div className="mt-auto mt-5 flex flex-col gap-3 border-t border-[#eef0ee] pt-4"><span className="text-[10px] text-[#929992]">{profile.experience_years != null ? `${profile.experience_years} years experience` : "Community member"}</span>
          <div className="flex flex-wrap justify-end gap-2">{websiteUrl && <a href={websiteUrl} target="_blank" rel="noreferrer" aria-label="Open portfolio" title="Portfolio" className="rounded-lg border border-[#e5eae6] p-2 text-[#68736b] hover:bg-[#f4f8f4]"><BriefcaseBusiness size={14}/></a>}{upworkUrl && <a href={upworkUrl} target="_blank" rel="noreferrer" aria-label="Open Upwork profile" title="Upwork" className="rounded-lg border border-[#e5eae6] p-2 text-[#68736b] hover:bg-[#f4f8f4]"><ExternalLink size={14}/></a>}{linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="Open LinkedIn profile" title="LinkedIn" className="rounded-lg border border-[#e5eae6] p-2 text-[#68736b] hover:bg-[#f4f8f4]"><Globe2 size={14}/></a>}{otherUrl && <a href={otherUrl} target="_blank" rel="noreferrer" aria-label="Open other work profile" title="Other profile" className="rounded-lg border border-[#e5eae6] p-2 text-[#68736b] hover:bg-[#f4f8f4]"><ExternalLink size={14}/></a>}{fiverrUrl && <a href={fiverrUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#222325] px-3 py-2 text-[10px] font-bold text-white hover:bg-[#404145]">View Fiverr <ExternalLink size={12}/></a>}</div>
          <div className="grid grid-cols-2 gap-2"><Link href={`/community/${profile.id}`} className="inline-flex items-center justify-center rounded-xl border border-[#dfe7e0] px-3 py-3 text-xs font-bold text-[#354239] hover:bg-[#f5f8f5]">View profile</Link><Link href={`/messages?user=${profile.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#168B56] px-3 py-3 text-xs font-bold text-white hover:bg-[#117447]">Message <MessageCircle size={14}/></Link></div>
        </div>
      </article>;
    })}</div>}
    <p className="mt-7 text-[10px] leading-5 text-[#929992]">Only signed-in members can browse this directory. Each freelancer controls whether their profile appears here. Private contact details and account email addresses are not displayed.</p>
  </div>;
}
