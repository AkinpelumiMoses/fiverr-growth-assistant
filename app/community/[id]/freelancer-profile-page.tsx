"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, ExternalLink, Globe2, MessageCircle, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id:string; display_name:string|null; fiverr_username:string|null; seller_level:string|null; primary_niche:string|null;
  avatar_url:string|null; bio:string|null; fiverr_profile_url:string|null; skills:string|null; experience_years:number|null;
  website_url:string|null; work_platforms:string[]|null; upwork_profile_url:string|null; linkedin_url:string|null; other_work_url:string|null;
};

export default function FreelancerProfilePage() {
  const params=useParams<{id:string}>();
  const supabase=useMemo(()=>createClient(),[]);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [online,setOnline]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{
    let active=true;
    (async()=>{
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){if(active){setError("Please sign in to view freelancer profiles.");setLoading(false);}return;}
      const {data,error:queryError}=await supabase.from("profiles")
        .select("id,display_name,fiverr_username,seller_level,primary_niche,avatar_url,bio,fiverr_profile_url,skills,experience_years,website_url,work_platforms,upwork_profile_url,linkedin_url,other_work_url")
        .eq("id",params.id).eq("community_discoverable",true).maybeSingle();
      if(!active)return;
      if(queryError)setError(queryError.message);else if(!data)setError("This profile is unavailable or is no longer public.");else setProfile(data as Profile);
      setLoading(false);
    })();
    return()=>{active=false;};
  },[params.id,supabase]);
  useEffect(()=>{
    let alive=true;let channel:ReturnType<typeof supabase.channel>|null=null;
    async function watch(){
      const {data:{user}}=await supabase.auth.getUser();
      if(!user||!alive)return;
      channel=supabase.channel("mile-online-members",{config:{presence:{key:user.id}}});
      const refresh=()=>{if(!alive||!channel)return;setOnline(Object.prototype.hasOwnProperty.call(channel.presenceState(),params.id));};
      channel.on("presence",{event:"sync"},refresh).on("presence",{event:"join"},refresh).on("presence",{event:"leave"},refresh).subscribe(async status=>{
        if(status==="SUBSCRIBED"){await channel?.track({user_id:user.id,online_at:new Date().toISOString()});refresh();}
      });
    }
    void watch();return()=>{alive=false;if(channel)void supabase.removeChannel(channel);};
  },[params.id,supabase]);
  const links=profile?[
    {label:"Portfolio / website",url:profile.website_url,icon:BriefcaseBusiness},
    {label:"Fiverr",url:profile.fiverr_profile_url||(profile.fiverr_username?`https://www.fiverr.com/${encodeURIComponent(profile.fiverr_username)}`:null),icon:ExternalLink},
    {label:"Upwork",url:profile.upwork_profile_url,icon:ExternalLink},
    {label:"LinkedIn",url:profile.linkedin_url,icon:Globe2},
    {label:"Other work",url:profile.other_work_url,icon:ExternalLink}
  ].filter(item=>item.url?.startsWith("https://")): [];
  const initials=(profile?.display_name||profile?.fiverr_username||"M").split(/[\s._-]+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()).join("");
  return <main className="min-h-screen bg-[#f7f8f7] px-4 py-7 text-[#222325] md:px-8 md:py-10"><div className="mx-auto max-w-5xl">
    <Link href="/community" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#69736c] hover:text-[#168B56]"><ArrowLeft size={15}/> Back to community</Link>
    {loading?<div className="h-96 animate-pulse rounded-3xl border border-[#e5eae6] bg-white"/>:error?<div role="alert" className="rounded-2xl border border-[#e5eae6] bg-white p-8 text-sm text-[#69736c]">{error}</div>:profile&&<div className="overflow-hidden rounded-3xl border border-[#e5eae6] bg-white shadow-[0_12px_40px_rgba(27,42,32,.04)]">
      <div className="h-2 bg-[#168B56]"/>
      <div className="p-6 md:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-visible rounded-full bg-[#eaf8ef] text-3xl font-extrabold text-[#168B56]"><div className="h-full w-full overflow-hidden rounded-full">{profile.avatar_url?<img src={profile.avatar_url} alt="" className="h-full w-full object-cover"/>:initials}</div><span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-white ${online?"bg-[#18a957]":"bg-[#b9c0bb]"}`}/></div>
          <div className="min-w-0 flex-1"><p className="text-[11px] font-bold tracking-[.16em] text-[#168B56]">MILE FREELANCER PROFILE</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{profile.display_name||profile.fiverr_username||"Freelancer"}</h1><p className="mt-2 text-sm text-[#68736b]">{profile.primary_niche||"Independent freelancer"}{profile.experience_years!=null? ` · ${profile.experience_years} years experience`:""}</p><p className={`mt-3 inline-flex items-center gap-2 text-xs font-semibold ${online?"text-[#168B56]":"text-[#929992]"}`}><span className={`h-2 w-2 rounded-full ${online?"bg-[#18a957]":"bg-[#b9c0bb]"}`}/>{online?"Online now":"Currently offline"}</p></div>
          <Link href={`/messages?user=${profile.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#168B56] px-5 py-3 text-sm font-bold text-white hover:bg-[#117447]"><MessageCircle size={16}/> Message freelancer</Link>
        </div>
        <div className="mt-9 grid gap-8 md:grid-cols-[1.4fr_.8fr]">
          <section><h2 className="text-xs font-bold uppercase tracking-[.14em] text-[#929992]">About</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#515b53]">{profile.bio||"This freelancer has not added an introduction yet."}</p>
            <div className="mt-8"><h2 className="text-xs font-bold uppercase tracking-[.14em] text-[#929992]">Skills & expertise</h2>{profile.skills?<div className="mt-3 flex flex-wrap gap-2">{profile.skills.split(/[,\n]/).map(s=>s.trim()).filter(Boolean).map((skill,i)=><span key={i} className="rounded-full border border-[#e3e9e4] bg-[#fafcf9] px-3 py-2 text-xs font-medium text-[#465248]">{skill}</span>)}</div>:<p className="mt-3 text-sm text-[#929992]">No skills added yet.</p>}</div>
            <div className="mt-8"><h2 className="text-xs font-bold uppercase tracking-[.14em] text-[#929992]">Work platforms</h2><div className="mt-3 flex flex-wrap gap-2">{(profile.work_platforms??[]).length?(profile.work_platforms??[]).map(p=><span key={p} className="rounded-full bg-[#eaf8ef] px-3 py-2 text-xs font-semibold text-[#168B56]">{p}</span>):<span className="text-sm text-[#929992]">Not specified</span>}{profile.seller_level&&<span className="rounded-full border border-[#e3e9e4] px-3 py-2 text-xs text-[#68736b]">{profile.seller_level}</span>}</div></div>
          </section>
          <aside className="rounded-2xl bg-[#f7faf7] p-5"><h2 className="text-xs font-bold uppercase tracking-[.14em] text-[#929992]">Across the web</h2>{links.length?<div className="mt-4 space-y-2">{links.map(({label,url,icon:Icon})=><a key={label} href={url!} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-[#e6ece7] bg-white px-3 py-3 text-xs font-semibold text-[#465248] hover:border-[#168B56]"><span className="flex items-center gap-2"><Icon size={14}/>{label}</span><ExternalLink size={13} className="text-[#929992]"/></a>)}</div>:<p className="mt-3 text-xs leading-5 text-[#929992]">No external work links have been added yet.</p>}
            <div className="mt-6 border-t border-[#e5ece6] pt-5"><p className="text-[10px] font-bold uppercase tracking-wide text-[#929992]">Experience</p><p className="mt-2 text-2xl font-extrabold text-[#222325]">{profile.experience_years!=null?profile.experience_years:"—"}<span className="ml-2 text-xs font-medium text-[#929992]">years</span></p></div>
          </aside>
        </div>
      </div>
    </div>}
    <p className="mt-5 text-center text-[10px] leading-5 text-[#929992]">MILE displays only information the freelancer has chosen to share with the community.</p>
  </div></main>;
}
