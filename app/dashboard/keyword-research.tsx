"use client";

import { useMemo, useState } from "react";
import { Copy, Search, Tags, Plus, X, Info } from "lucide-react";

type Competitor = { name:string; tags:string };
export default function KeywordResearch() {
  const [service,setService]=useState("");
  const [ownTags,setOwnTags]=useState("");
  const [competitors,setCompetitors]=useState<Competitor[]>([{name:"Competitor 1",tags:""},{name:"Competitor 2",tags:""},{name:"Competitor 3",tags:""}]);
  const [notice,setNotice]=useState("");
  const parse=(value:string)=>value.split(/[,\n]/).map(v=>v.trim().replace(/^#/, "").toLowerCase()).filter(Boolean);
  const analysis=useMemo(()=>{
    const seed=parse(service).join(" ");
    const words=new Set(seed.split(/\s+/).filter(w=>w.length>2));
    const all=[...parse(ownTags).map(tag=>({tag,source:"Your gig"})),...competitors.flatMap(c=>parse(c.tags).map(tag=>({tag,source:c.name})))];
    const unique=[...new Set(all.map(x=>x.tag))];
    return unique.map(tag=>{
      const tagWords=tag.split(/\s+/).filter(w=>w.length>2);
      const matched=tagWords.filter(w=>words.has(w));
      const count=all.filter(x=>x.tag===tag).length;
      const relevance=tagWords.length?Math.round(matched.length/tagWords.length*100):0;
      const coverage=competitors.filter(c=>parse(c.tags).includes(tag)).length;
      const score=Math.min(100,Math.round(relevance*.65+Math.min(coverage,3)/3*35));
      return {tag,count,coverage,relevance,score,own:parse(ownTags).includes(tag)};
    }).sort((a,b)=>b.score-a.score||b.coverage-a.coverage||a.tag.localeCompare(b.tag));
  },[service,ownTags,competitors]);
  const copy=async(value:string)=>{try{await navigator.clipboard.writeText(value);setNotice("Copied to clipboard.");}catch{setNotice("Clipboard access is unavailable in this browser.");}};
  const updateCompetitor=(index:number,field:keyof Competitor,value:string)=>setCompetitors(old=>old.map((c,i)=>i===index?{...c,[field]:value}:c));
  const addCompetitor=()=>setCompetitors(old=>[...old,{name:`Competitor ${old.length+1}`,tags:""}]);
  const removeCompetitor=(index:number)=>setCompetitors(old=>old.filter((_,i)=>i!==index));
  const ranked=analysis.filter(x=>x.score>0);
  return <div className="max-w-5xl space-y-6">
    <header><p className="text-xs font-bold tracking-[.15em] text-[#168B56]">FIVERR KEYWORD & TAG RESEARCH</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">Research before you optimize.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#737d75]">Compare your gig tags with tags used by similar public gigs. Find relevant phrases that appear across competitors and spot gaps in your current tag set.</p></header>
    <section className="rounded-2xl border border-[#e5eae6] bg-white p-5 md:p-6"><div className="flex items-center gap-2"><Search size={17} className="text-[#168B56]"/><h3 className="text-sm font-extrabold">1. Define the service you want to rank for</h3></div><label className="mt-4 block text-xs font-semibold text-[#566158]">Main service or buyer search phrase<input value={service} onChange={e=>setService(e.target.value)} placeholder="e.g. minimalist logo design for a beauty brand" className="mt-2 w-full rounded-xl border border-[#dfe5e9] px-4 py-3 text-sm outline-none focus:border-[#168B56]"/></label><label className="mt-4 block text-xs font-semibold text-[#566158]">Your current Fiverr tags <span className="font-normal text-[#929992]">· comma-separated</span><textarea value={ownTags} onChange={e=>setOwnTags(e.target.value)} rows={2} placeholder="logo design, minimalist logo, beauty logo..." className="mt-2 w-full rounded-xl border border-[#dfe5e9] px-4 py-3 text-sm outline-none focus:border-[#168B56]"/></label></section>
    <section className="rounded-2xl border border-[#e5eae6] bg-white p-5 md:p-6"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Tags size={17} className="text-[#168B56]"/><h3 className="text-sm font-extrabold">2. Add tags from comparable Fiverr gigs</h3></div><p className="mt-2 text-xs leading-5 text-[#7b837c]">Open relevant gigs on Fiverr and enter the tags you can verify. Add more competitors to improve the comparison.</p></div><button onClick={addCompetitor} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#eaf8ef] px-3 py-2 text-xs font-bold text-[#168B56]"><Plus size={14}/> Add gig</button></div>
      <div className="mt-4 space-y-3">{competitors.map((item,index)=><div key={index} className="rounded-xl border border-[#edf0ed] p-3"><div className="mb-2 flex items-center gap-2"><input value={item.name} onChange={e=>updateCompetitor(index,"name",e.target.value)} aria-label="Competitor label" className="min-w-0 flex-1 border-0 bg-transparent text-xs font-bold outline-none"/>{competitors.length>1&&<button onClick={()=>removeCompetitor(index)} aria-label="Remove competitor" className="rounded-md p-1 text-[#929992] hover:bg-[#f4f6f4]"><X size={14}/></button>}</div><textarea value={item.tags} onChange={e=>updateCompetitor(index,"tags",e.target.value)} rows={2} placeholder="Enter tags separated by commas..." className="w-full rounded-lg border border-[#e5eae6] px-3 py-2 text-xs outline-none focus:border-[#168B56]"/></div>)}</div>
    </section>
    <section className="rounded-2xl border border-[#e5eae6] bg-white p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#168B56]">RESEARCH OUTPUT</p><h3 className="mt-1 text-lg font-extrabold">Tag comparison</h3><p className="mt-1 text-xs text-[#7b837c]">{analysis.length} unique tags · {ranked.length} with phrase overlap</p></div><button disabled={!ranked.length} onClick={()=>copy(ranked.map(x=>x.tag).join(", "))} className="inline-flex items-center gap-2 rounded-lg border border-[#dfe5e9] px-3 py-2 text-xs font-bold text-[#465248] disabled:opacity-40"><Copy size={14}/> Copy ranked tags</button></div>
      {analysis.length===0?<div className="mt-5 rounded-xl border border-dashed border-[#dfe5e9] p-8 text-center"><Tags size={25} className="mx-auto text-[#168B56]"/><p className="mt-3 text-sm font-semibold">Your research will appear here</p><p className="mt-1 text-xs text-[#929992]">Enter your service phrase and add competitor tags above.</p></div>:<div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead><tr className="border-b border-[#edf0ed] text-[10px] uppercase tracking-wide text-[#929992]"><th className="pb-3 pr-3">Tag</th><th className="pb-3 pr-3">Competitors using it</th><th className="pb-3 pr-3">Phrase relevance</th><th className="pb-3">Research score</th></tr></thead><tbody>{analysis.map(item=><tr key={item.tag} className="border-b border-[#f0f2f0]"><td className="py-3 pr-3 font-bold text-[#354239]">{item.tag}{item.own&&<span className="ml-2 rounded-full bg-[#f1f3f1] px-2 py-1 text-[9px] font-semibold text-[#68736b]">Your tag</span>}</td><td className="py-3 pr-3 text-[#68736b]">{item.coverage} / {competitors.length}</td><td className="py-3 pr-3 text-[#68736b]">{item.relevance}%</td><td className="py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#edf1ed]"><div className="h-full rounded-full bg-[#168B56]" style={{width:`${item.score}%`}}/></div><span className="font-bold tabular-nums">{item.score}</span></div></td></tr>)}</tbody></table></div>}
      {notice&&<p role="status" className="mt-3 text-xs text-[#168B56]">{notice}</p>}
    </section>
    <div className="flex gap-3 rounded-xl bg-[#f0f6f1] p-4"><Info size={17} className="mt-0.5 shrink-0 text-[#168B56]"/><p className="text-[11px] leading-5 text-[#68736b]">This is a comparison score based only on the phrase and tags you enter. It is not Fiverr search volume, keyword difficulty, ranking data or a prediction of clicks. Validate tags against current Fiverr results and test changes against your own impressions, click-through rate and orders.</p></div>
  </div>;
}
