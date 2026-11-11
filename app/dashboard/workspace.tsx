"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/actions";
import {
  Activity, ArrowUpRight, Bot, BriefcaseBusiness, ChartNoAxesCombined,
  CheckCircle2, FileSearch, LayoutDashboard, Lightbulb, LogOut, Menu,
  Plus, Search, Settings, ShieldCheck, Sparkles, Target, TrendingUp, X,
  UserRound, Trash2, ExternalLink
} from "lucide-react";

type Section = "Overview" | "My Gigs" | "Gig Analyzer" | "Performance" | "Growth Plan" | "Profile" | "AI Growth Coach" | "Keyword Research" | "Competitor Research";
type Profile = { id: string; display_name: string | null; fiverr_username: string | null; seller_level: string | null; primary_niche: string | null; website_url: string | null; onboarding_completed: boolean };
type Gig = { id: string; title: string; description: string; tags: string[]; category: string | null; subcategory: string | null; starting_price: number | null; currency: string; status: "draft" | "active" | "paused"; gig_url: string | null };
type Performance = { id: string; period_start: string; period_end: string; impressions: number; clicks: number; orders: number; revenue: number; currency: string; gig_id: string | null };
type Task = { id: string; title: string; description: string; category: string; priority: "low" | "medium" | "high"; status: "pending" | "in_progress" | "completed" };

const navigation: { label: Section; icon: typeof LayoutDashboard }[] = [
  { label: "Overview", icon: LayoutDashboard }, { label: "My Gigs", icon: BriefcaseBusiness },
  { label: "Gig Analyzer", icon: FileSearch }, { label: "Performance", icon: ChartNoAxesCombined },
  { label: "Growth Plan", icon: Target }, { label: "AI Growth Coach", icon: Bot },
  { label: "Keyword Research", icon: Search }, { label: "Competitor Research", icon: Activity },
];

const starterTasks = [
  { title: "Add your first Fiverr gig", description: "Save a gig so you can review and track it in one place.", category: "setup", priority: "high" as const },
  { title: "Record your latest performance", description: "Enter the latest impressions, clicks, orders and revenue from Fiverr analytics.", category: "analytics", priority: "medium" as const },
  { title: "Review your ideal buyer", description: "Write down who your service is best suited to help.", category: "positioning", priority: "medium" as const },
  { title: "Choose one improvement to test", description: "Make one deliberate change and observe the result over time.", category: "growth", priority: "low" as const },
];

export default function DashboardWorkspace() {
  const supabase = useMemo(() => createClient(), []);
  const [section, setSection] = useState<Section>("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState({ display_name: "", fiverr_username: "", seller_level: "", primary_niche: "", website_url: "" });
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gigForm, setGigForm] = useState({ title: "", gig_url: "", description: "", tags: "", category: "", starting_price: "", status: "active" as "draft" | "active" | "paused" });
  const [metricForm, setMetricForm] = useState({ date: new Date().toISOString().slice(0, 10), impressions: "", clicks: "", orders: "", revenue: "", gig_id: "" });
  const [analysisGig, setAnalysisGig] = useState("");
  const [analysisText, setAnalysisText] = useState({ title: "", description: "", tags: "" });
  const [analysisDone, setAnalysisDone] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachMessages, setCoachMessages] = useState<{ role: "user" | "assistant"; content: string; attachments?: { path?: string; name: string; mimeType: string; size: number; url?: string }[] }[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [coachAttachments, setCoachAttachments] = useState<File[]>([]);
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [coachHistory, setCoachHistory] = useState<{ id: string; title: string; messages: { role: "user" | "assistant"; content: string; attachments?: { path?: string; name: string; mimeType: string; size: number; url?: string }[] }[]; updatedAt: string }[]>([]);

  useEffect(() => {
    let active = true;
    async function loadChatHistory() {
      setChatHistoryLoading(true);
      const { data: conversations, error } = await supabase.from("ai_conversations").select("id,title,updated_at").order("updated_at", { ascending: false }).limit(40);
      if (!active) return;
      if (error) setNotice(error.message);
      setCoachHistory((conversations ?? []).map((item) => ({ id: item.id, title: item.title, updatedAt: item.updated_at, messages: [] })));
      setChatHistoryLoading(false);
    }
    loadChatHistory();
    return () => { active = false; };
  }, [supabase]);

  useEffect(() => {
    try { window.localStorage.setItem("fga-coach-history", JSON.stringify(coachHistory)); } catch {}
  }, [coachHistory]);

  useEffect(() => {
    let active = true;
    async function loadWorkspace() {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !user) {
        setNotice("Your session could not be verified. Please log in again.");
        setLoading(false);
        return;
      }
      setUserEmail(user.email ?? "");
      const [profileResult, gigsResult, performanceResult, tasksResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("gigs").select("id,title,description,tags,category,subcategory,starting_price,currency,status,gig_url").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("performance_entries").select("id,period_start,period_end,impressions,clicks,orders,revenue,currency,gig_id").eq("user_id", user.id).order("period_start", { ascending: false }),
        supabase.from("growth_tasks").select("id,title,description,category,priority,status").eq("user_id", user.id).order("created_at", { ascending: true }),
      ]);
      if (!active) return;
      const failed = [profileResult.error, gigsResult.error, performanceResult.error, tasksResult.error].find(Boolean);
      if (failed) setNotice(failed.message);
      const p = profileResult.data as Profile | null;
      setProfile(p);
      setProfileForm({
        display_name: p?.display_name ?? (user.user_metadata?.full_name ?? ""),
        fiverr_username: p?.fiverr_username ?? "",
        seller_level: p?.seller_level ?? "",
        primary_niche: p?.primary_niche ?? "",
        website_url: p?.website_url ?? "",
      });
      setGigs((gigsResult.data ?? []) as Gig[]);
      setPerformance((performanceResult.data ?? []) as Performance[]);
      let loadedTasks = (tasksResult.data ?? []) as Task[];
      if (!loadedTasks.length && !tasksResult.error) {
        const { data: inserted, error } = await supabase.from("growth_tasks").insert(starterTasks.map((task) => ({ ...task, user_id: user.id, status: "pending" }))).select("id,title,description,category,priority,status");
        if (error) setNotice(error.message);
        else loadedTasks = (inserted ?? []) as Task[];
      }
      setTasks(loadedTasks);
      setLoading(false);
    }
    loadWorkspace();
    return () => { active = false; };
  }, [supabase]);

  const totals = useMemo(() => performance.reduce((sum, item) => ({
    impressions: sum.impressions + item.impressions,
    clicks: sum.clicks + item.clicks,
    orders: sum.orders + item.orders,
    revenue: sum.revenue + Number(item.revenue || 0),
  }), { impressions: 0, clicks: 0, orders: 0, revenue: 0 }), [performance]);

  const auditChecks = [
    { label: "Specific service title", passed: analysisText.title.trim().length >= 20 && analysisText.title.trim().length <= 80, help: "Use a clear, specific title that tells buyers what you deliver." },
    { label: "Buyer-focused description", passed: analysisText.description.trim().length >= 250, help: "Explain the buyer's problem, your process, deliverables and next step." },
    { label: "Five relevant search tags", passed: analysisText.tags.split(",").filter((tag) => tag.trim()).length >= 5, help: "Add five relevant phrases, separated by commas." },
  ];
  const auditScore = Math.round(auditChecks.filter((item) => item.passed).length / auditChecks.length * 100);

  async function runAiAnalysis() {
    if (!analysisGig) { setNotice("Save this gig first, then select it for an AI review."); return; }
    setAiLoading(true); setAiResult(""); setNotice("");
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "gig-analysis", gigId: analysisGig, gig: analysisText }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The AI review could not be completed.");
      setAiResult(result.answer); setAnalysisDone(true);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to complete the AI review."); }
    finally { setAiLoading(false); }
  }

  async function sendCoachMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = coachInput.trim();
    if ((!message && coachAttachments.length === 0) || coachLoading) return;
    setCoachLoading(true); setNotice(""); setUploadingAttachments(coachAttachments.length > 0);
    let conversationId = activeConversationId;
    const queuedFiles = [...coachAttachments];
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) { setNotice("Please sign in again before sending a message."); setCoachLoading(false); return; }
    const nextMessages = [...coachMessages, { role: "user" as const, content: message || "Please review the attached files.", attachments: queuedFiles.map((file) => ({ name: file.name, mimeType: file.type, size: file.size })) }];
    setCoachMessages(nextMessages); setCoachInput(""); setCoachAttachments([]);
    try {
      if (!conversationId) {
        const { data: created, error } = await supabase.from("ai_conversations").insert({ user_id: currentUser.id, title: message.slice(0, 64) || queuedFiles[0]?.name || "New conversation" }).select("id,title,updated_at").single();
        if (error || !created) throw new Error(error?.message || "Could not create a conversation.");
        conversationId = created.id; setActiveConversationId(created.id);
        setCoachHistory((old) => [{ id: created.id, title: created.title, updatedAt: created.updated_at, messages: [] }, ...old]);
      }
      const attachmentMeta: { path: string; name: string; mimeType: string; size: number }[] = [];
      for (const file of queuedFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
        const path = `${currentUser.id}/${conversationId}/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from("ai-attachments").upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error(`Could not upload ${file.name}: ${error.message}`);
        attachmentMeta.push({ path, name: file.name, mimeType: file.type, size: file.size });
      }
      setUploadingAttachments(false);
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "coach", message: message || "Please review the attached files.", conversationId, attachments: attachmentMeta, history: coachMessages.slice(-8) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The coach could not respond.");
      const completed = [...nextMessages, { role: "assistant" as const, content: result.answer }];
      setCoachMessages(completed);
      setCoachHistory((old) => [{ id: conversationId!, title: old.find((item) => item.id === conversationId)?.title || message.slice(0, 64) || queuedFiles[0]?.name || "Conversation", messages: completed, updatedAt: new Date().toISOString() }, ...old.filter((item) => item.id !== conversationId)].slice(0, 40));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to contact the AI coach.");
      setCoachMessages(nextMessages); setCoachInput(message); setCoachAttachments(queuedFiles);
    } finally { setUploadingAttachments(false); setCoachLoading(false); }
  }

  async function openCoachChat(id: string) {
    setActiveConversationId(id); setSection("AI Growth Coach"); setMobileOpen(false); setNotice("");
    const { data, error } = await supabase.from("ai_messages").select("role,content,attachments").eq("conversation_id", id).order("created_at", { ascending: true });
    if (error) return setNotice(error.message);
    const restored = await Promise.all((data ?? []).map(async (item) => {
      const files = Array.isArray(item.attachments) ? item.attachments as {path:string;name:string;mimeType:string;size:number}[] : [];
      const attachments = await Promise.all(files.map(async (file) => { const { data: signed } = await supabase.storage.from("ai-attachments").createSignedUrl(file.path, 300); return { ...file, url: signed?.signedUrl }; }));
      return { role: item.role as "user" | "assistant", content: item.content, attachments };
    }));
    setCoachMessages(restored);
  }

  async function startNewCoachChat() {
    if (coachMessages.length && activeConversationId) {
      setCoachHistory((old) => old.map((item) => item.id === activeConversationId ? { ...item, messages: coachMessages, updatedAt: new Date().toISOString() } : item));
    }
    setActiveConversationId(null); setCoachMessages([]); setCoachInput(""); setCoachAttachments([]); setNotice("");
  }

  async function deleteCoachChat(id: string) {
    const { data: rows } = await supabase.from("ai_messages").select("attachments").eq("conversation_id", id);
    const paths = (rows ?? []).flatMap((row) => Array.isArray(row.attachments) ? row.attachments.map((file: {path?:string}) => file.path).filter((path): path is string => Boolean(path)) : []);
    if (paths.length) { const { error: fileError } = await supabase.storage.from("ai-attachments").remove(paths); if (fileError) return setNotice(fileError.message); }
    const { error } = await supabase.from("ai_conversations").delete().eq("id", id);
    if (error) return setNotice(error.message);
    setCoachHistory((old) => old.filter((item) => item.id !== id));
    if (activeConversationId === id) { setActiveConversationId(null); setCoachMessages([]); }
  }

  async function saveProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setNotice("Please log in again to save your profile.");
    setSaving(true); setNotice("");
    const { data, error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: profileForm.display_name.trim() || null,
      fiverr_username: profileForm.fiverr_username.trim() || null,
      seller_level: profileForm.seller_level || null,
      primary_niche: profileForm.primary_niche.trim() || null,
      website_url: profileForm.website_url.trim() || null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }).select("*").single();
    if (error) setNotice(error.message);
    else { setProfile(data as Profile); setNotice("Your profile has been saved."); }
    setSaving(false);
  }

  async function saveGig(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gigForm.title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setNotice("Please log in again to save a gig.");
    setSaving(true); setNotice("");
    const payload = {
      user_id: user.id, title: gigForm.title.trim(), gig_url: gigForm.gig_url.trim() || null,
      description: gigForm.description.trim(), tags: gigForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      category: gigForm.category.trim() || null, starting_price: gigForm.starting_price ? Number(gigForm.starting_price) : null,
      currency: "USD", status: gigForm.status,
    };
    const { data, error } = await supabase.from("gigs").insert(payload).select("id,title,description,tags,category,subcategory,starting_price,currency,status,gig_url").single();
    if (error) setNotice(error.message);
    else { setGigs((old) => [data as Gig, ...old]); setGigForm({ title: "", gig_url: "", description: "", tags: "", category: "", starting_price: "", status: "active" }); setNotice("Gig saved to your workspace."); }
    setSaving(false);
  }

  async function deleteGig(id: string) {
    if (!window.confirm("Remove this gig from your workspace? Its performance snapshots will be kept without a gig link.")) return;
    const { error: unlinkError } = await supabase.from("performance_entries").update({ gig_id: null }).eq("gig_id", id);
    if (unlinkError) return setNotice(unlinkError.message);
    const { error: reportError } = await supabase.from("analysis_reports").update({ gig_id: null }).eq("gig_id", id);
    if (reportError) return setNotice(reportError.message);
    const { error } = await supabase.from("gigs").delete().eq("id", id);
    if (error) setNotice(error.message);
    else { setGigs((old) => old.filter((gig) => gig.id !== id)); setPerformance((old) => old.map((row) => row.gig_id === id ? { ...row, gig_id: null } : row)); setNotice("Gig removed. Performance history was preserved."); }
  }

  async function saveMetrics(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const impressions = Number(metricForm.impressions), clicks = Number(metricForm.clicks), orders = Number(metricForm.orders), revenue = Number(metricForm.revenue);
    if ([impressions, clicks, orders, revenue].some((value) => !Number.isFinite(value) || value < 0) || clicks > impressions || orders > clicks) {
      setNotice("Check the figures. Clicks cannot exceed impressions, and orders cannot exceed clicks."); return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setNotice("Please log in again to save performance.");
    setSaving(true); setNotice("");
    const { data, error } = await supabase.from("performance_entries").insert({
      user_id: user.id, gig_id: metricForm.gig_id || null, period_start: metricForm.date, period_end: metricForm.date,
      impressions, clicks, orders, revenue, currency: "USD",
    }).select("id,period_start,period_end,impressions,clicks,orders,revenue,currency,gig_id").single();
    if (error) setNotice(error.message);
    else { setPerformance((old) => [data as Performance, ...old]); setMetricForm({ date: new Date().toISOString().slice(0, 10), impressions: "", clicks: "", orders: "", revenue: "", gig_id: "" }); setNotice("Performance snapshot saved."); }
    setSaving(false);
  }

  async function toggleTask(task: Task) {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    const { data, error } = await supabase.from("growth_tasks").update({ status: nextStatus, completed_at: nextStatus === "completed" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", task.id).select("id,title,description,category,priority,status").single();
    if (error) setNotice(error.message);
    else setTasks((old) => old.map((item) => item.id === task.id ? data as Task : item));
  }

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const initials = (profileForm.display_name || userEmail || "FG").split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FG";

  function go(next: Section) { setSection(next); setMobileOpen(false); setNotice(""); }

  return <main className="workspace-shell min-h-screen bg-[#f7f8f7] text-[#222325]">
    <aside style={{ width: sidebarCollapsed ? 88 : 292 }} className={`workspace-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#e9ece9] bg-white px-4 py-6 transition-[width,transform] duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-9 flex items-center justify-between"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1DBF73] text-white shadow-sm"><TrendingUp size={20}/></div>{!sidebarCollapsed && <div className="min-w-0"><p className="truncate text-sm font-extrabold tracking-tight">Fiverr Growth</p><p className="text-[9px] font-bold tracking-[.17em] text-[#858B86]">ASSISTANT</p></div>}</div><div className="flex items-center gap-1"><button onClick={() => setSidebarCollapsed((value) => !value)} className="hidden rounded-lg p-2 text-[#777d77] hover:bg-[#f4f6f4] lg:block" aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}><Menu size={17}/></button><button onClick={() => setMobileOpen(false)} className="p-2 lg:hidden" aria-label="Close navigation"><X size={18}/></button></div></div>
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#858B86]">Workspace</p>
      <nav className="space-y-1">{navigation.map((item) => { const Icon = item.icon; return <button key={item.label} onClick={() => go(item.label)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-xs font-semibold transition ${section === item.label ? "bg-[#eaf8ef] text-[#16794b]" : "text-[#62646A] hover:bg-[#f5f6f5] hover:text-[#222325]"}`}><Icon size={17}/>{item.label}{item.label === "AI Growth Coach" && <span className="ml-auto rounded-full bg-[#eaf8ef] px-2 py-0.5 text-[9px] font-bold text-[#168B56]">AI</span>}</button>; })}</nav>
      <div className="mt-auto space-y-3"><div className={`rounded-xl bg-[#eaf8ef] ${sidebarCollapsed ? "flex justify-center p-3" : "p-4"}`} title={sidebarCollapsed ? "Grow with clarity" : undefined}><Lightbulb size={18} className="shrink-0 text-[#1DBF73]"/>{!sidebarCollapsed && <><p className="mt-2 text-xs font-bold">Grow with clarity.</p><p className="mt-1 text-[11px] leading-5 text-[#4C6658]">Understand your numbers. Improve your offer. Make deliberate moves.</p></>}</div><button onClick={() => go("Profile")} title={sidebarCollapsed ? "Profile" : undefined} className={`flex w-full items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-xs font-semibold text-[#62646A] hover:bg-[#f5f6f5]`}><UserRound size={17}/>{!sidebarCollapsed && "Profile & settings"}</button><form action={signOut}><button type="submit" title={sidebarCollapsed ? "Log out" : undefined} className={`flex w-full items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-xs font-semibold text-[#62646A] hover:bg-[#f5f6f5]`}><LogOut size={17}/>{!sidebarCollapsed && "Log out"}</button></form></div>
    </aside>
    {mobileOpen && <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/25 lg:hidden"/>}
    <section className={`workspace-main min-h-screen transition-[padding] duration-200 ${sidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[292px]"}`}>
      <header className="workspace-topbar sticky top-0 z-20 flex h-[88px] items-center justify-between border-b border-[#e9ece9] bg-white/95 px-5 backdrop-blur md:px-9"><div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 hover:bg-[#f3f5f3] lg:hidden" aria-label="Open navigation"><Menu size={20}/></button><div><p className="text-[10px] text-[#929992]">WORKSPACE / {section.toUpperCase()}</p><h1 className="text-base font-extrabold tracking-tight">{section}</h1></div></div><div className="flex items-center gap-2"><button onClick={() => go("Profile")} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-[#f4f6f4] sm:flex"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#222325] text-[11px] font-bold text-white">{initials}</span><span className="hidden max-w-[150px] text-left lg:block"><span className="block truncate text-xs font-bold">{profileForm.display_name || "Your profile"}</span><span className="block max-w-[150px] truncate text-[10px] text-[#929992]">{userEmail}</span></span></button><form action={signOut} className="hidden sm:block"><button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-[#e7ebe7] px-3 py-2.5 text-xs font-bold text-[#555d56] hover:bg-[#f5f7f5]"><LogOut size={15}/> Log out</button></form></div></header>
      <div className="workspace-content mx-auto max-w-[1680px] px-6 py-9 md:px-10 md:py-12 2xl:px-14">
        {notice && <div role="status" className="mb-5 rounded-lg border border-[#d8eadf] bg-[#f0faf3] px-4 py-3 text-xs text-[#246642]">{notice}</div>}
        {loading ? <div className="py-24 text-center text-sm text-[#777d77]">Loading your workspace…</div> : <>
          {section === "Overview" && <><div className="workspace-overview-hero mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold text-[#168B56]">YOUR SELLER WORKSPACE</p><h2 className="workspace-page-title text-4xl font-extrabold tracking-[-.055em] md:text-5xl">Good to have you back{profileForm.display_name ? `, ${profileForm.display_name.split(" ")[0]}` : ""}.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#777d77]">A clear view of your gigs, performance and next steps.</p></div><button onClick={() => go("My Gigs")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#222325] px-4 py-3 text-xs font-bold text-white hover:bg-[#404145]"><Plus size={15}/> Add a gig</button></div>
            <div className="workspace-stat-grid mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{[{label:"Impressions",value:totals.impressions.toLocaleString(),icon:Activity},{label:"Clicks",value:totals.clicks.toLocaleString(),icon:ArrowUpRight},{label:"Orders",value:totals.orders.toLocaleString(),icon:BriefcaseBusiness},{label:"Revenue",value:"$"+totals.revenue.toLocaleString(),icon:TrendingUp}].map((item) => { const Icon=item.icon; return <div key={item.label} className="workspace-stat-card rounded-xl border border-[#e9ece9] bg-white p-6"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-[#777d77]">{item.label}</p><Icon size={17} className="text-[#168B56]"/></div><p className="mt-4 text-[28px] font-extrabold tracking-tight">{item.value}</p><p className="mt-2 text-[10px] text-[#9aa19a]">From your saved snapshots</p></div>; })}</div>
            <div className="workspace-overview-grid grid gap-6 2xl:grid-cols-[1.2fr_.8fr]"><div className="workspace-panel rounded-xl border border-[#e9ece9] bg-white p-6 md:p-8"><h3 className="text-base font-extrabold">Your gigs</h3><p className="mt-1 text-xs text-[#929992]">Services saved to your workspace.</p>{gigs.length ? <div className="mt-5 divide-y divide-[#eef0ee]">{gigs.slice(0,4).map((gig)=><div key={gig.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-semibold">{gig.title}</p><p className="mt-1 text-[10px] capitalize text-[#929992]">{gig.status} · {gig.tags.length} tags</p></div><button onClick={()=>{setAnalysisGig(gig.id);setAnalysisText({title:gig.title,description:gig.description,tags:gig.tags.join(", ")});go("Gig Analyzer")}} className="shrink-0 text-[11px] font-bold text-[#168B56]">Review</button></div>)}</div> : <div className="mt-5 rounded-lg border border-dashed border-[#dce3dd] p-7 text-center"><BriefcaseBusiness className="mx-auto mb-2 text-[#168B56]" size={22}/><p className="text-xs font-semibold">No gigs saved yet</p><p className="mt-1 text-[11px] text-[#929992]">Add your first gig to start organising your services.</p><button onClick={()=>go("My Gigs")} className="mt-3 text-xs font-bold text-[#168B56]">Add a gig <ArrowUpRight className="inline" size={13}/></button></div>}</div>
              <div className="workspace-panel rounded-xl border border-[#e9ece9] bg-white p-6 md:p-8"><div className="flex items-center justify-between"><div><h3 className="text-base font-extrabold">Your next steps</h3><p className="mt-1 text-xs text-[#929992]">A simple growth checklist.</p></div><ShieldCheck className="text-[#168B56]"/></div><div className="mt-5 space-y-4">{tasks.map((task)=><label key={task.id} className="flex cursor-pointer items-start gap-3 text-xs"><input type="checkbox" checked={task.status==="completed"} onChange={()=>toggleTask(task)} className="mt-0.5 h-4 w-4 accent-[#1DBF73]"/><span className={task.status==="completed"?"text-[#9aa19a] line-through":"font-medium text-[#555d56]"}>{task.title}</span></label>)}</div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#edf0ed]"><div className="h-full rounded-full bg-[#1DBF73]" style={{width:(tasks.length?completedTasks/tasks.length*100:0)+"%"}}/></div><p className="mt-2 text-[10px] text-[#929992]">{completedTasks} of {tasks.length} completed</p></div></div></>}
          {section === "Profile" && <><div className="mb-7"><p className="text-xs font-bold text-[#168B56]">YOUR ACCOUNT</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Seller profile</h2><p className="mt-2 text-sm text-[#777d77]">Keep your details up to date. Your profile helps us tailor future guidance.</p></div><div className="max-w-2xl rounded-xl border border-[#e9ece9] bg-white p-5 md:p-7"><div className="mb-6 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf8ef] text-[#168B56]"><UserRound size={20}/></div><div><p className="text-sm font-bold">{profileForm.display_name || "Your name"}</p><p className="text-xs text-[#929992]">{userEmail}</p></div></div><div className="grid gap-4 sm:grid-cols-2">{[{label:"Full name",key:"display_name",placeholder:"Your name"},{label:"Fiverr username",key:"fiverr_username",placeholder:"Your Fiverr username"},{label:"Primary niche",key:"primary_niche",placeholder:"e.g. Brand identity design"},{label:"Website / portfolio",key:"website_url",placeholder:"https://"}].map((field)=> <label key={field.key} className="block"><span className="mb-2 block text-xs font-semibold">{field.label}</span><input className="w-full rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm[field.key as keyof typeof profileForm]} placeholder={field.placeholder} onChange={(event)=>setProfileForm((old)=>({...old,[field.key]:event.target.value}))}/></label>)}<label className="block"><span className="mb-2 block text-xs font-semibold">Seller level</span><select className="w-full rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.seller_level} onChange={(event)=>setProfileForm((old)=>({...old,seller_level:event.target.value}))}><option value="">Select your level</option><option value="New Seller">New Seller</option><option value="Level 1">Level 1</option><option value="Level 2">Level 2</option><option value="Top Rated Seller">Top Rated Seller</option><option value="Pro">Pro</option></select></label></div><button onClick={saveProfile} disabled={saving} className="mt-6 rounded-lg bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{saving?"Saving…":"Save profile"}</button></div></>}
          {section === "My Gigs" && <><div className="mb-7"><p className="text-xs font-bold text-[#168B56]">YOUR SERVICES</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">My gigs</h2><p className="mt-2 text-sm text-[#777d77]">Save your public Fiverr gig links and details in one place.</p></div><div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><form onSubmit={saveGig} className="space-y-4 rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><h3 className="text-sm font-bold">Add a gig</h3><label className="block"><span className="mb-2 block text-xs font-semibold">Gig title *</span><input required className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.title} onChange={(e)=>setGigForm((old)=>({...old,title:e.target.value}))} placeholder="I will design a brand identity"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Public Fiverr gig URL</span><input type="url" className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.gig_url} onChange={(e)=>setGigForm((old)=>({...old,gig_url:e.target.value}))} placeholder="https://www.fiverr.com/username/gig-name"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Description</span><textarea className="min-h-[115px] w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.description} onChange={(e)=>setGigForm((old)=>({...old,description:e.target.value}))} placeholder="Paste your gig description"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Tags (comma-separated)</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.tags} onChange={(e)=>setGigForm((old)=>({...old,tags:e.target.value}))} placeholder="logo design, branding, brand identity"/></label><div className="grid grid-cols-2 gap-3"><label><span className="mb-2 block text-xs font-semibold">Category</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.category} onChange={(e)=>setGigForm((old)=>({...old,category:e.target.value}))} placeholder="Graphics & Design"/></label><label><span className="mb-2 block text-xs font-semibold">Starting price (USD)</span><input type="number" min="0" step="0.01" className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.starting_price} onChange={(e)=>setGigForm((old)=>({...old,starting_price:e.target.value}))} placeholder="25"/></label></div><label className="block"><span className="mb-2 block text-xs font-semibold">Status</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.status} onChange={(e)=>setGigForm((old)=>({...old,status:e.target.value as typeof old.status}))}><option value="active">Active</option><option value="paused">Paused</option><option value="draft">Draft</option></select></label><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-50"><Plus size={15}/>{saving?"Saving…":"Save gig"}</button></form><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold">Saved gigs</h3><p className="mt-1 text-xs text-[#929992]">{gigs.length} gig{gigs.length===1?"":"s"} in your workspace</p></div></div>{gigs.length ? <div className="mt-4 divide-y divide-[#eef0ee]">{gigs.map((gig)=><div key={gig.id} className="py-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold">{gig.title}</p><p className="mt-1 text-[11px] capitalize text-[#929992]">{gig.status}{gig.starting_price!==null? ` · $ ${gig.starting_price}`:""}</p>{gig.tags.length>0&&<p className="mt-2 text-[11px] text-[#777d77]">{gig.tags.join(" · ")}</p>}</div><button onClick={()=>deleteGig(gig.id)} className="rounded-md p-2 text-[#929992] hover:bg-red-50 hover:text-red-600" aria-label="Delete gig"><Trash2 size={16}/></button></div>{gig.gig_url&&<a href={gig.gig_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#168B56]">Open Fiverr gig <ExternalLink size={12}/></a>}<button onClick={()=>{setAnalysisGig(gig.id);setAnalysisText({title:gig.title,description:gig.description,tags:gig.tags.join(", ")});go("Gig Analyzer")}} className="ml-4 text-[11px] font-semibold text-[#62646A]">Review details</button></div>)}</div> : <div className="flex min-h-[280px] flex-col items-center justify-center text-center"><BriefcaseBusiness size={25} className="mb-3 text-[#168B56]"/><p className="text-xs font-semibold">Your saved gigs will appear here</p><p className="mt-1 text-[11px] text-[#929992]">Add a gig using the form.</p></div>}</div></div></>}
          {section === "Performance" && <><div className="mb-7"><p className="text-xs font-bold text-[#168B56]">SELLER ANALYTICS</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Track what is changing.</h2><p className="mt-2 text-sm text-[#777d77]">Enter figures from your Fiverr analytics. We do not fetch private Fiverr account metrics.</p></div><div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><form onSubmit={saveMetrics} className="space-y-3 rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><h3 className="text-sm font-bold">Add performance snapshot</h3><label className="block"><span className="mb-1 block text-xs font-semibold">Date</span><input type="date" required className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm.date} onChange={(e)=>setMetricForm((old)=>({...old,date:e.target.value}))}/></label>{[{label:"Impressions",key:"impressions"},{label:"Clicks",key:"clicks"},{label:"Orders",key:"orders"},{label:"Revenue (USD)",key:"revenue"}].map((field)=><label key={field.key} className="block"><span className="mb-1 block text-xs font-semibold">{field.label}</span><input type="number" min="0" step={field.key==="revenue"?"0.01":"1"} required className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm[field.key as keyof typeof metricForm]} onChange={(e)=>setMetricForm((old)=>({...old,[field.key]:e.target.value}))}/></label>)}<label className="block"><span className="mb-1 block text-xs font-semibold">Link to gig (optional)</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm.gig_id} onChange={(e)=>setMetricForm((old)=>({...old,gig_id:e.target.value}))}><option value="">All gigs / not specified</option>{gigs.map((gig)=><option key={gig.id} value={gig.id}>{gig.title}</option>)}</select></label><button disabled={saving} className="w-full rounded-lg bg-[#222325] px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{saving?"Saving…":"Save snapshot"}</button></form><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><h3 className="text-sm font-bold">Saved performance</h3>{performance.length?<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[460px] text-left text-xs"><thead className="text-[10px] text-[#929992]"><tr>{["DATE","IMPRESSIONS","CLICKS","ORDERS","REVENUE"].map((heading)=><th key={heading} className="pb-3 pr-3">{heading}</th>)}</tr></thead><tbody>{performance.map((row)=><tr key={row.id} className="border-t border-[#eef0ee]"><td className="py-3 pr-3">{row.period_start}</td><td className="pr-3">{row.impressions.toLocaleString()}</td><td className="pr-3">{row.clicks.toLocaleString()}</td><td className="pr-3">{row.orders}</td><td className="pr-3">{row.currency} {Number(row.revenue).toLocaleString()}</td></tr>)}</tbody></table></div>:<div className="flex min-h-[260px] flex-col items-center justify-center text-center"><ChartNoAxesCombined className="mb-3 text-[#168B56]"/><p className="text-xs font-semibold">No snapshots yet</p><p className="mt-1 text-[11px] text-[#929992]">Your saved records will appear here.</p></div>}</div></div></>}
          {section === "Growth Plan" && <div className="max-w-3xl"><div className="mb-7"><p className="text-xs font-bold text-[#168B56]">YOUR ACTION LIST</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Small steps, saved progress.</h2><p className="mt-2 text-sm text-[#777d77]">Mark tasks complete as you work. Your progress is saved to your account.</p></div><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-7">{tasks.map((task)=><div key={task.id} className="flex items-start gap-3 border-b border-[#eef0ee] py-4 last:border-0"><input type="checkbox" checked={task.status==="completed"} onChange={()=>toggleTask(task)} className="mt-1 h-4 w-4 accent-[#1DBF73]"/><div><p className={task.status==="completed"?"text-sm text-[#9aa19a] line-through":"text-sm font-semibold"}>{task.title}</p><p className="mt-1 text-xs leading-5 text-[#777d77]">{task.description}</p><p className="mt-2 text-[10px] uppercase tracking-wide text-[#929992]">{task.priority} priority · {task.status.replace("_"," ")}</p></div></div>)}</div></div>}
          {section === "Gig Analyzer" && <><div className="mb-7"><p className="text-xs font-bold text-[#168B56]">GIG QUALITY REVIEW</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Make your offer easier to choose.</h2><p className="mt-2 text-sm text-[#777d77]">A basic checklist, not an official Fiverr score or ranking prediction.</p></div><div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><div className="space-y-4 rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><label className="block"><span className="mb-2 block text-xs font-semibold">Choose a saved gig</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisGig} onChange={(e)=>{const gig=gigs.find((item)=>item.id===e.target.value);setAnalysisGig(e.target.value);if(gig)setAnalysisText({title:gig.title,description:gig.description,tags:gig.tags.join(", ")});setAnalysisDone(false);}}><option value="">Enter details manually</option>{gigs.map((gig)=><option key={gig.id} value={gig.id}>{gig.title}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-semibold">Gig title</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisText.title} onChange={(e)=>{setAnalysisText((old)=>({...old,title:e.target.value}));setAnalysisDone(false);}}/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Description</span><textarea className="min-h-[170px] w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisText.description} onChange={(e)=>{setAnalysisText((old)=>({...old,description:e.target.value}));setAnalysisDone(false);}} placeholder="Paste your gig description"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Tags (comma-separated)</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisText.tags} onChange={(e)=>{setAnalysisText((old)=>({...old,tags:e.target.value}));setAnalysisDone(false);}} placeholder="brand identity, logo design, ..."/></label><button onClick={runAiAnalysis} disabled={!analysisGig || aiLoading} className="rounded-lg bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-40">{aiLoading?"Analysing…":"Run AI review"}</button><p className="text-[11px] text-[#929992]">AI reviews the saved gig details. Save any edits to My Gigs first.</p></div><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><p className="text-xs font-bold text-[#777d77]">YOUR REVIEW</p>{analysisDone?<><p className="mt-5 text-xs font-bold text-[#168B56]">AI GIG REVIEW</p><div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#4b514c]">{aiResult}</div><p className="mt-5 rounded-lg bg-[#f0faf3] p-3 text-[10px] leading-5 text-[#4C6658]">AI guidance is based on the details you saved. Suggestions are hypotheses, not Fiverr ranking or search-volume data.</p></>:<div className="flex min-h-[300px] flex-col items-center justify-center text-center"><FileSearch size={25} className="mb-3 text-[#168B56]"/><p className="text-sm font-semibold">Your AI review will appear here</p><p className="mt-2 max-w-xs text-xs text-[#929992]">Select one of your saved gigs and run an AI review.</p></div>}</div></div></>}
          {section === "AI Growth Coach" && <div className="w-full">
            <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div><p className="text-[11px] font-extrabold tracking-[.2em] text-[#168B56]">YOUR PERSONAL SELLER INTELLIGENCE</p><h2 className="mt-3 max-w-4xl text-4xl font-extrabold leading-[1.04] tracking-[-.06em] md:text-6xl">A clearer way to<br className="hidden md:block"/> think through growth.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#737b74]">Ask questions, share files and revisit your previous conversations. Your coach can use your saved Fiverr workspace context.</p></div>
              <button onClick={startNewCoachChat} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#222325] px-5 text-xs font-bold text-white hover:bg-[#404145]"><Plus size={16}/> New conversation</button>
            </div>
            <div className="grid min-h-[690px] gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
              <aside className="flex flex-col overflow-hidden rounded-2xl border border-[#e5eae6] bg-white">
                <div className="border-b border-[#edf0ed] p-5"><p className="text-sm font-extrabold">Your conversations</p><p className="mt-1 text-xs text-[#929992]">Private to your account</p></div>
                <div className="flex-1 space-y-1 overflow-y-auto p-3">
                  {chatHistoryLoading && <p className="p-3 text-xs text-[#929992]">Loading history…</p>}
                  {!chatHistoryLoading && !coachHistory.length && <p className="p-4 text-xs leading-6 text-[#929992]">Your saved AI conversations will appear here.</p>}
                  {coachHistory.map((chat)=><div key={chat.id} className={`group flex items-center gap-1 rounded-xl ${activeConversationId===chat.id?"bg-[#eaf8ef]":"hover:bg-[#f5f7f5]"}`}><button onClick={()=>openCoachChat(chat.id)} className="min-w-0 flex-1 px-3 py-3 text-left"><span className="block truncate text-xs font-bold text-[#343b35]">{chat.title}</span><span className="mt-1 block text-[10px] text-[#929992]">{new Date(chat.updatedAt).toLocaleDateString()}</span></button><button onClick={()=>deleteCoachChat(chat.id)} title="Delete conversation" className="mr-2 rounded-lg p-2 text-[#9aa29b] opacity-0 hover:bg-white hover:text-red-600 group-hover:opacity-100"><Trash2 size={14}/></button></div>)}
                </div>
              </aside>
              <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e5eae6] bg-white shadow-[0_14px_50px_rgba(24,42,30,.045)]">
                <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-4 md:px-7"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf8ef] text-[#168B56]"><Bot size={20}/></div><div><p className="text-sm font-extrabold">Growth Coach</p><p className="mt-1 text-[10px] text-[#8b948d]">AI-powered seller support</p></div></div><span className="rounded-full bg-[#f1f8f3] px-3 py-1.5 text-[10px] font-bold text-[#168B56]">Private workspace</span></div>
                <div className="min-h-[390px] flex-1 space-y-5 overflow-y-auto p-5 md:p-8">
                  {!coachMessages.length && <div className="flex min-h-[330px] flex-col items-center justify-center text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf8ef] text-[#168B56]"><Sparkles size={28}/></div><h3 className="text-xl font-extrabold tracking-tight">What are we working on today?</h3><p className="mt-2 max-w-md text-xs leading-6 text-[#929992]">Ask about your gig, pricing, positioning or performance. You can also attach documents and images for the coach to review.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={()=>setCoachInput("Review my gig positioning and tell me what to improve.")} className="rounded-full border border-[#e5eae6] px-4 py-2 text-[11px] font-semibold hover:bg-[#f5f7f5]">Review my gig</button><button onClick={()=>setCoachInput("Help me understand my Fiverr performance.")} className="rounded-full border border-[#e5eae6] px-4 py-2 text-[11px] font-semibold hover:bg-[#f5f7f5]">Understand my metrics</button></div></div>}
                  {coachMessages.map((item,index)=><div key={index} className={item.role==="user"?"ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[#eaf8ef] p-4 md:p-5":"mr-auto max-w-[94%] rounded-2xl rounded-bl-md bg-[#f6f8f6] p-4 md:p-5"}><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#168B56]">{item.role==="user"?"You":"Growth Coach"}</p><div className="whitespace-pre-wrap text-sm leading-7 text-[#414942]">{item.content}</div>{item.attachments?.length ? <div className="mt-3 flex flex-wrap gap-2">{item.attachments.map((file,i)=><a key={i} href={file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#dfe7e1] bg-white/80 px-3 py-2 text-[11px] font-semibold text-[#4f5a51]"><FileSearch size={13}/>{file.name}</a>)}</div> : null}</div>)}
                  {coachLoading && <div className="flex items-center gap-3 text-xs text-[#929992]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#1DBF73]"/>{uploadingAttachments?"Uploading your files…":"Your coach is thinking…"}</div>}
                </div>
                <form onSubmit={sendCoachMessage} className="border-t border-[#edf0ed] p-4 md:p-6">
                  {coachAttachments.length>0 && <div className="mb-3 flex flex-wrap gap-2">{coachAttachments.map((file,index)=><div key={index} className="flex max-w-full items-center gap-2 rounded-xl border border-[#e3e9e4] bg-[#f8faf8] px-3 py-2 text-xs"><FileSearch size={15}/><span className="max-w-[180px] truncate">{file.name}</span><button type="button" onClick={()=>setCoachAttachments(old=>old.filter((_,i)=>i!==index))} className="text-[#929992] hover:text-red-600"><X size={14}/></button></div>)}</div>}
                  <textarea value={coachInput} onChange={(event)=>setCoachInput(event.target.value)} maxLength={2000} rows={3} placeholder="Message your Growth Coach…" className="min-h-[90px] w-full resize-y rounded-xl border border-[#dfe5e9] p-4 text-sm outline-none focus:border-[#168B56]"/>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e4e9e5] px-3 py-2.5 text-xs font-semibold text-[#59635b] hover:bg-[#f5f8f5]"><Plus size={15}/> Attach files<input type="file" multiple accept=".pdf,.txt,.md,.csv,.json,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx" className="hidden" onChange={(event)=>{const files=Array.from(event.target.files??[]);const valid=files.filter(file=>file.size<=10*1024*1024);if(files.length!==valid.length)setNotice("Each file must be 10 MB or smaller.");setCoachAttachments(old=>[...old,...valid].slice(0,5));event.target.value="";}}/></label><span className="text-[10px] text-[#929992]">Up to 5 files · 10 MB each</span></div><button disabled={coachLoading||(!coachInput.trim()&&!coachAttachments.length)} className="inline-flex items-center gap-2 rounded-xl bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-40">{coachLoading?"Working…":"Send message"}<ArrowUpRight size={15}/></button></div>
                </form>
              </section>
            </div>
          </div>}
          {(section === "Keyword Research" || section === "Competitor Research") && <div className="max-w-3xl rounded-xl border border-[#e9ece9] bg-white p-7 md:p-10"><Search size={25} className="text-[#168B56]"/><p className="mt-5 text-xs font-bold text-[#168B56]">COMING DEVELOPMENT STAGE</p><h2 className="mt-2 text-2xl font-extrabold">{section}</h2><p className="mt-3 text-sm leading-6 text-[#777d77]">{section==="Keyword Research"?"Research buyer-intent phrases with evidence, without inventing search volume or difficulty.":"Compare public gig positioning, offers and pricing using accessible information and seller-provided links."}</p></div>}
        </>}
        <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-[#e9ece9] py-5 text-[10px] text-[#929992] sm:flex-row"><span>Fiverr Growth Assistant · Seller workspace</span><span>Guidance, not guarantees of rankings or orders.</span></footer>
      </div>
    </section>
  </main>;
}
