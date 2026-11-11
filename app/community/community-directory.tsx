"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users, ExternalLink, MapPin, BriefcaseBusiness, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PublicProfile = {
  id: string;
  display_name: string | null;
  fiverr_username: string | null;
  seller_level: string | null;
  primary_niche: string | null;
  avatar_url: string | null;
  bio: string | null;
  fiverr_profile_url: string | null;
  skills: string | null;
  experience_years: number | null;
  website_url: string | null;
};

export default function CommunityDirectory() {
  const supabase = useMemo(() => createClient(), []);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("All niches");

  useEffect(() => {
    let active = true;
    async function loadProfiles() {
      setLoading(true);
      setError("");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        if (active) { setError("Please sign in to explore the freelancer community."); setLoading(false); }
        return;
      }
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("id,display_name,fiverr_username,seller_level,primary_niche,avatar_url,bio,fiverr_profile_url,skills,experience_years,website_url")
        .eq("community_discoverable", true)
        .order("display_name", { ascending: true })
        .limit(100);
      if (!active) return;
      if (queryError) setError("We couldn't load the community right now. " + queryError.message);
      else setProfiles((data ?? []) as PublicProfile[]);
      setLoading(false);
    }
    loadProfiles();
    return () => { active = false; };
  }, [supabase]);

  const niches = useMemo(() => ["All niches", ...Array.from(new Set(profiles.map(p => p.primary_niche?.trim()).filter((v): v is string => Boolean(v))))].sort((a,b) => a === "All niches" ? -1 : a.localeCompare(b)), [profiles]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return profiles.filter(profile => {
      const matchesNiche = niche === "All niches" || profile.primary_niche === niche;
      const haystack = [profile.display_name, profile.fiverr_username, profile.primary_niche, profile.skills, profile.bio, profile.seller_level].filter(Boolean).join(" ").toLowerCase();
      return matchesNiche && (!term || haystack.includes(term));
    });
  }, [profiles, search, niche]);

  return <div className="mx-auto max-w-[1400px]">
    <div className="mb-8">
      <p className="text-xs font-bold text-[#168B56]">MEET OTHER SELLERS</p>
      <h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Freelancers, in one place.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#777d77]">Discover other Fiverr freelancers, explore their skills and connect through the profiles they choose to share.</p>
    </div>
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#e9ece9] bg-white p-4 md:flex-row">
      <label className="relative min-w-0 flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929992]"/>
        <input aria-label="Search freelancers" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, username, skill or niche" className="w-full rounded-xl border border-[#dfe5e9] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#168B56]"/>
      </label>
      <select aria-label="Filter by niche" value={niche} onChange={e => setNiche(e.target.value)} className="rounded-xl border border-[#dfe5e9] bg-white px-4 py-3 text-sm outline-none focus:border-[#168B56] md:min-w-[210px]">
        {niches.map(item => <option key={item} value={item}>{item}</option>)}
      </select>
    </div>
    <div className="mb-4 flex items-center justify-between">
      <p className="text-xs font-semibold text-[#69736c]">{loading ? "Finding freelancers…" : `${filtered.length} freelancer${filtered.length === 1 ? "" : "s"} found`}</p>
      <span className="inline-flex items-center gap-1.5 text-[10px] text-[#929992]"><Sparkles size={13}/> Opt-in profiles only</span>
    </div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1,2,3].map(n=><div key={n} className="h-64 animate-pulse rounded-2xl border border-[#e9ece9] bg-white"/>)}</div>}
    {!loading && !error && filtered.length === 0 && <div className="rounded-2xl border border-dashed border-[#dce3dd] bg-white px-6 py-16 text-center"><Users size={30} className="mx-auto mb-4 text-[#168B56]"/><h3 className="text-base font-bold">{profiles.length ? "No matching freelancers" : "The community is just getting started"}</h3><p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#929992]">{profiles.length ? "Try another search term or choose a different niche." : "When freelancers choose to make their profiles discoverable, they will appear here. You can enable this in Profile settings."}</p></div>}
    {!loading && !error && filtered.length > 0 && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(profile => {
      const initials = (profile.display_name || profile.fiverr_username || "F").split(/[\s._-]+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()).join("");
      const fiverrUrl = profile.fiverr_profile_url?.startsWith("https://") ? profile.fiverr_profile_url : profile.fiverr_username ? `https://www.fiverr.com/${encodeURIComponent(profile.fiverr_username)}` : null;
      const websiteUrl = profile.website_url?.startsWith("https://") ? profile.website_url : null;
      return <article key={profile.id} className="flex min-w-0 flex-col rounded-2xl border border-[#e9ece9] bg-white p-5 shadow-[0_8px_30px_rgba(27,42,32,.035)]">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaf8ef] text-lg font-bold text-[#168B56]">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover"/> : initials}</div>
          <div className="min-w-0"><h3 className="truncate text-sm font-extrabold">{profile.display_name || profile.fiverr_username || "Freelancer"}</h3><p className="mt-1 truncate text-xs text-[#929992]">{profile.fiverr_username ? `@${profile.fiverr_username}` : "Fiverr freelancer"}</p></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{profile.primary_niche && <span className="rounded-full bg-[#eaf8ef] px-3 py-1.5 text-[10px] font-bold text-[#168B56]">{profile.primary_niche}</span>}{profile.seller_level && <span className="rounded-full bg-[#f3f5f3] px-3 py-1.5 text-[10px] font-semibold text-[#68736b]">{profile.seller_level}</span>}</div>
        <p className="mt-4 line-clamp-3 min-h-[60px] text-xs leading-6 text-[#69736c]">{profile.bio || "This freelancer has not added a short introduction yet."}</p>
        {profile.skills && <div className="mt-3"><p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#929992]">Skills</p><p className="line-clamp-2 text-xs leading-5 text-[#515b53]">{profile.skills}</p></div>}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#eef0ee] pt-4 mt-5">
          <span className="text-[10px] text-[#929992]">{profile.experience_years != null ? `${profile.experience_years} years experience` : "Community member"}</span>
          <div className="flex gap-2">{websiteUrl && <a href={websiteUrl} target="_blank" rel="noreferrer" aria-label="Open portfolio" title="Portfolio" className="rounded-lg border border-[#e5eae6] p-2 text-[#68736b] hover:bg-[#f4f8f4]"><BriefcaseBusiness size={14}/></a>}{fiverrUrl && <a href={fiverrUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#222325] px-3 py-2 text-[10px] font-bold text-white hover:bg-[#404145]">View Fiverr <ExternalLink size={12}/></a>}</div>
        </div>
      </article>;
    })}</div>}
    <p className="mt-7 text-[10px] leading-5 text-[#929992]">Only signed-in members can browse this directory. Each freelancer controls whether their profile appears here. Contact details and account email addresses are not displayed.</p>
  </div>;
}
