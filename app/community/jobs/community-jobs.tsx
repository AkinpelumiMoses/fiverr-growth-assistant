"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BriefcaseBusiness, Plus, Search, X, Clock3, UserRound, Bell, Check } from "lucide-react";

type Job = {
  id: string; poster_id: string; title: string; description: string; niche: string;
  required_skills: string[]; budget_type: string; budget_min: number | null;
  budget_max: number | null; currency: string; deadline: string | null;
  status: "open" | "closed" | "filled"; created_at: string;
};
const niches = ["Graphic Design","Branding & Brand Identity","Web Development","WordPress","UI/UX Design","Video Editing","Digital Marketing","Writing & Translation","Other"];
const currencies = ["USD","NGN","GBP","EUR","CAD","AUD"];
type CommunityNotification = { id: string; title: string; body: string; job_id: string; read_at: string | null; created_at: string };

export default function CommunityJobs() {
  const supabase = useMemo(() => createClient(), []);
  const [jobs,setJobs] = useState<Job[]>([]);
  const [userId,setUserId] = useState("");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All niches");
  const [showForm,setShowForm] = useState(false);
  const [editingJobId,setEditingJobId] = useState<string | null>(null);
  const [saving,setSaving] = useState(false);
  const [mine,setMine] = useState(false);
  const [selectedNiches,setSelectedNiches] = useState<string[]>([]);
  const [notifications,setNotifications] = useState<CommunityNotification[]>([]);
  const [preferencesSaving,setPreferencesSaving] = useState(false);
  const [preferencesMessage,setPreferencesMessage] = useState("");
  const [form,setForm] = useState({title:"",description:"",niche:"Graphic Design",skills:"",budget_type:"not_specified",budget_min:"",budget_max:"",currency:"USD",deadline:""});
  async function load() {
    setLoading(true); setError("");
    const {data:{user},error:authError}=await supabase.auth.getUser();
    if(authError || !user){setError("Please sign in to view community opportunities.");setLoading(false);return;}
    setUserId(user.id);
    const [preferenceResult, notificationResult] = await Promise.all([
      supabase.from("community_notification_preferences").select("niches").eq("user_id", user.id).maybeSingle(),
      supabase.from("community_notifications").select("id,title,body,job_id,read_at,created_at").eq("recipient_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    if (preferenceResult.error) setError(preferenceResult.error.message);
    else setSelectedNiches(preferenceResult.data?.niches ?? []);
    if (notificationResult.error) setError(notificationResult.error.message);
    else setNotifications((notificationResult.data ?? []) as CommunityNotification[]);
    let query=supabase.from("community_jobs").select("id,poster_id,title,description,niche,required_skills,budget_type,budget_min,budget_max,currency,deadline,status,created_at").order("created_at",{ascending:false}).limit(100);
    if(mine) query=query.eq("poster_id",user.id);
    const {data,error:queryError}=await query;
    if(queryError)setError(queryError.message); else setJobs((data??[]) as Job[]);
    setLoading(false);
  }
  useEffect(()=>{load();},[mine]);
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel("community-notifications-" + userId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_notifications", filter: "recipient_id=eq." + userId }, (payload) => {
        setNotifications((current) => [payload.new as CommunityNotification, ...current].slice(0, 20));
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [supabase, userId]);
  async function saveNotificationPreferences() {
    if (!userId || preferencesSaving) return;
    setPreferencesSaving(true); setPreferencesMessage("");
    const { error: saveError } = await supabase.from("community_notification_preferences").upsert({
      user_id: userId, niches: selectedNiches, enabled: true, updated_at: new Date().toISOString()
    });
    setPreferencesMessage(saveError ? saveError.message : "Your opportunity alerts have been saved.");
    setPreferencesSaving(false);
  }
  async function markNotificationRead(notification: CommunityNotification) {
    if (notification.read_at) return;
    const readAt = new Date().toISOString();
    const { error: updateError } = await supabase.from("community_notifications").update({ read_at: readAt }).eq("id", notification.id);
    if (updateError) setError(updateError.message);
    else setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: readAt } : item));
  }
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault(); if(saving)return;
    setSaving(true);setError("");
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setError("Please sign in again.");setSaving(false);return;}
    const payload={
      poster_id:user.id,title:form.title.trim(),description:form.description.trim(),niche:form.niche,
      required_skills:form.skills.split(",").map(s=>s.trim()).filter(Boolean).slice(0,12),
      budget_type:form.budget_type,
      budget_min:form.budget_min?Number(form.budget_min):null,
      budget_max:form.budget_max?Number(form.budget_max):null,
      currency:form.currency,deadline:form.deadline||null
    };
    const result = editingJobId
      ? await supabase.from("community_jobs").update({...payload, updated_at:new Date().toISOString()}).eq("id",editingJobId).eq("poster_id",user.id)
      : await supabase.from("community_jobs").insert(payload);
    if(result.error)setError(result.error.message);
    else {setForm({title:"",description:"",niche:"Graphic Design",skills:"",budget_type:"not_specified",budget_min:"",budget_max:"",currency:"USD",deadline:""});setEditingJobId(null);setShowForm(false);await load();}
    setSaving(false);
  }
  async function changeStatus(job:Job,status:"open"|"closed"|"filled"){
    const {error:updateError}=await supabase.from("community_jobs").update({status,updated_at:new Date().toISOString()}).eq("id",job.id).eq("poster_id",userId);
    if(updateError)setError(updateError.message); else await load();
  }
  function editJob(job:Job){
    setEditingJobId(job.id);
    setForm({title:job.title,description:job.description,niche:job.niche,skills:job.required_skills.join(", "),budget_type:job.budget_type,budget_min:job.budget_min==null?"":String(job.budget_min),budget_max:job.budget_max==null?"":String(job.budget_max),currency:job.currency,deadline:job.deadline??""});
    setShowForm(true);
    window.scrollTo({top:0,behavior:"smooth"});
  }
  const filtered=jobs.filter(j=>(filter==="All niches"||j.niche===filter)&&(!search.trim()||[j.title,j.description,j.niche,...j.required_skills].join(" ").toLowerCase().includes(search.trim().toLowerCase())));
  function budget(j:Job){if(j.budget_type==="not_specified")return "Budget not specified";if(j.budget_type==="volunteer")return "Volunteer / collaboration";const range=[j.budget_min!=null?Number(j.budget_min).toLocaleString():"",j.budget_max!=null?Number(j.budget_max).toLocaleString():""].filter(Boolean).join(" – ");return `${j.currency} ${range||"To be discussed"} · ${j.budget_type}`;}
  return <div className="community-jobs-page mx-auto max-w-[1200px]">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold text-[#168B56]">COMMUNITY OPPORTUNITIES</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Find opportunities. Share the load.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#777d77]">Post work you need help with, or find opportunities shared by freelancers in your niche.</p></div><button onClick={()=>setShowForm(v=>!v)} className="inline-flex items-center gap-2 rounded-xl bg-[#168B56] px-4 py-3 text-sm font-bold text-white">{showForm?<X size={16}/>:<Plus size={16}/>} {showForm?"Close form":"Post an opportunity"}</button></div>
    <div className="mb-5 flex flex-wrap items-center gap-3"><Link href="/community" className="text-xs font-semibold text-[#168B56]">← Freelancer directory</Link><Link href="/community/notifications" className="rounded-full border border-[#dfe5e9] bg-white px-3 py-2 text-xs font-semibold text-[#168B56]">Notifications & interests</Link><button onClick={()=>setMine(false)} className={`rounded-full px-3 py-2 text-xs font-semibold ${!mine?"bg-[#222325] text-white":"bg-white text-[#555d56] border"}`}>All opportunities</button><button onClick={()=>setMine(true)} className={`rounded-full px-3 py-2 text-xs font-semibold ${mine?"bg-[#222325] text-white":"bg-white text-[#555d56] border"}`}>My posts</button></div>
    <section className="mb-6 grid gap-5 rounded-2xl border border-[#e5eae6] bg-white p-5 md:grid-cols-[1fr_1fr]">
      <div>
        <div className="flex items-center gap-2"><Bell size={17} className="text-[#168B56]"/><h2 className="text-sm font-extrabold">Opportunity alerts</h2></div>
        <p className="mt-2 text-xs leading-5 text-[#777d77]">Choose the niches you want to hear about. We’ll notify you when a member posts a matching opportunity.</p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {niches.map((niche) => <label key={niche} className="flex items-center gap-2 text-xs text-[#505a52]">
            <input type="checkbox" checked={selectedNiches.includes(niche)} onChange={(event) => setSelectedNiches((current) => event.target.checked ? [...current, niche] : current.filter((item) => item !== niche))} className="h-4 w-4 accent-[#168B56]"/>
            {niche}
          </label>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={saveNotificationPreferences} disabled={preferencesSaving} className="rounded-lg bg-[#168B56] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{preferencesSaving ? "Saving…" : "Save alert preferences"}</button>
          {preferencesMessage && <span role="status" className="text-[11px] text-[#68736b]">{preferencesMessage}</span>}
        </div>
      </div>
      <div className="border-t border-[#eef0ee] pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold">Your notifications</h2><span className="rounded-full bg-[#eaf8ef] px-2.5 py-1 text-[10px] font-bold text-[#168B56]">{notifications.filter((item) => !item.read_at).length} unread</span></div>
        {notifications.length === 0 ? <p className="mt-3 text-xs leading-5 text-[#929992]">No matching opportunities yet. Choose your niches and alerts will appear here.</p> :
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {notifications.map((notification) => <button key={notification.id} type="button" onClick={() => markNotificationRead(notification)} className={`block w-full rounded-xl border p-3 text-left ${notification.read_at ? "border-[#eef0ee] bg-white" : "border-[#cfe9d7] bg-[#f5fbf6]"}`}>
              <span className="flex items-start justify-between gap-2 text-xs font-bold">{notification.title}{notification.read_at && <Check size={13} className="shrink-0 text-[#168B56]"/>}</span>
              <span className="mt-1 block text-[11px] leading-5 text-[#68736b]">{notification.body}</span>
              <span className="mt-1 block text-[10px] text-[#929992]">{new Date(notification.created_at).toLocaleString()}</span>
            </button>)}
          </div>}
      </div>
    </section>
    {showForm&&<form onSubmit={submit} className="mb-7 grid gap-4 rounded-2xl border border-[#e5eae6] bg-white p-5 md:grid-cols-2"><div className="md:col-span-2"><h2 className="text-base font-extrabold">{editingJobId?"Edit your opportunity":"Create an opportunity"}</h2><p className="mt-1 text-xs text-[#788078]">{editingJobId?"Update the details before saving.":"Share enough detail for another freelancer to understand the work."}</p></div>
      <label className="grid gap-1.5 text-xs font-semibold md:col-span-2">Opportunity title<input required minLength={8} maxLength={120} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Need a logo designer for three client projects" className="rounded-xl border p-3 text-sm font-normal"/></label>
      <label className="grid gap-1.5 text-xs font-semibold">Niche<select value={form.niche} onChange={e=>setForm({...form,niche:e.target.value})} className="rounded-xl border p-3 text-sm font-normal">{niches.map(n=><option key={n}>{n}</option>)}</select></label>
      <label className="grid gap-1.5 text-xs font-semibold">Required skills <span className="font-normal text-[#888]">Separate with commas</span><input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="Illustrator, logo design, branding" className="rounded-xl border p-3 text-sm font-normal"/></label>
      <label className="grid gap-1.5 text-xs font-semibold md:col-span-2">Describe the work<textarea required minLength={30} maxLength={5000} rows={5} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Explain the project, what help you need and what someone will be responsible for..." className="rounded-xl border p-3 text-sm font-normal"/></label>
      <label className="grid gap-1.5 text-xs font-semibold">Payment type<select value={form.budget_type} onChange={e=>setForm({...form,budget_type:e.target.value})} className="rounded-xl border p-3 text-sm font-normal"><option value="not_specified">To be discussed</option><option value="fixed">Fixed price</option><option value="hourly">Hourly</option><option value="volunteer">Volunteer / collaboration</option></select></label>
      <label className="grid gap-1.5 text-xs font-semibold">Currency<select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})} className="rounded-xl border p-3 text-sm font-normal">{currencies.map(c=><option key={c}>{c}</option>)}</select></label>
      <label className="grid gap-1.5 text-xs font-semibold">Minimum budget<input type="number" min="0" value={form.budget_min} onChange={e=>setForm({...form,budget_min:e.target.value})} className="rounded-xl border p-3 text-sm font-normal"/></label>
      <label className="grid gap-1.5 text-xs font-semibold">Maximum budget<input type="number" min="0" value={form.budget_max} onChange={e=>setForm({...form,budget_max:e.target.value})} className="rounded-xl border p-3 text-sm font-normal"/></label>
      <label className="grid gap-1.5 text-xs font-semibold">Deadline (optional)<input type="date" min={new Date().toISOString().slice(0,10)} value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} className="rounded-xl border p-3 text-sm font-normal"/></label>
      <div className="flex items-end md:col-span-2"><button disabled={saving} className="rounded-xl bg-[#168B56] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving?(editingJobId?"Saving changes…":"Publishing…"):(editingJobId?"Save changes":"Publish opportunity")}</button></div>
    </form>}
    {error&&<p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mb-5 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929992]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search opportunities or skills" className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm"/></label><select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border bg-white px-3 py-3 text-sm"><option>All niches</option>{niches.map(n=><option key={n}>{n}</option>)}</select></div>
    {loading?<p className="py-16 text-center text-sm text-[#777]">Loading opportunities…</p>:filtered.length===0?<div className="rounded-2xl border border-dashed bg-white p-12 text-center"><BriefcaseBusiness className="mx-auto mb-3 text-[#168B56]"/><h2 className="font-bold">No opportunities here yet</h2><p className="mt-2 text-sm text-[#888]">When a freelancer shares a project, it will appear here.</p></div>:<div className="grid gap-4 md:grid-cols-2">{filtered.map(job=><article key={job.id} className="rounded-2xl border border-[#e8ece8] bg-white p-5"><div className="mb-3 flex items-center justify-between gap-3"><span className="rounded-full bg-[#eaf8ef] px-3 py-1.5 text-[10px] font-bold text-[#168B56]">{job.niche}</span><span className="text-[10px] text-[#888]">{new Date(job.created_at).toLocaleDateString()}</span></div><h2 className="text-lg font-extrabold">{job.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#68736b]">{job.description}</p>{job.required_skills.length>0&&<div className="mt-3 flex flex-wrap gap-2">{job.required_skills.map(s=><span key={s} className="rounded-full bg-[#f3f5f3] px-2.5 py-1 text-[10px] text-[#59645c]">{s}</span>)}</div>}<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><div className="text-xs font-semibold">{budget(job)}{job.deadline&&<p className="mt-1 flex items-center gap-1 text-[10px] font-normal text-[#888]"><Clock3 size={11}/> Due {new Date(job.deadline+"T00:00:00").toLocaleDateString()}</p>}</div>{job.poster_id===userId?<div className="flex flex-wrap items-center justify-end gap-2"><span className="self-center text-[10px] text-[#888]">Your post · {job.status}</span>{job.status==="open"&&<><button onClick={()=>editJob(job)} className="rounded-lg border px-3 py-2 text-[10px] font-bold">Edit</button><button onClick={()=>changeStatus(job,"filled")} className="rounded-lg border px-3 py-2 text-[10px] font-bold">Mark filled</button><button onClick={()=>changeStatus(job,"closed")} className="rounded-lg border px-3 py-2 text-[10px] font-bold">Close</button></>}{job.status!=="open"&&<button onClick={()=>changeStatus(job,"open")} className="rounded-lg border border-[#168B56] px-3 py-2 text-[10px] font-bold text-[#168B56]">Reopen</button>}{job.status!=="open"&&<button onClick={()=>editJob(job)} className="rounded-lg border px-3 py-2 text-[10px] font-bold">Edit</button>}</div>:<span className="inline-flex items-center gap-1 text-[10px] text-[#888]"><UserRound size={12}/> Member opportunity</span>}</div></article>)}</div>}
    <p className="mt-7 text-[10px] leading-5 text-[#929992]">Please agree on scope, payment and delivery terms directly before starting work. Never share passwords or account access.</p>
  </div>;
}
