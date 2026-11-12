"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CommunityDirectory from "@/app/community/community-directory";
import KeywordResearch from "@/app/dashboard/keyword-research";
import CompetitorResearch from "@/app/dashboard/competitor-research";
import { signOut } from "@/app/auth/actions";
import {
  Activity, ArrowUpRight, Bot, BriefcaseBusiness, ChartNoAxesCombined, Users, Bell,
  CheckCircle2, FileSearch, LayoutDashboard, Lightbulb, LogOut, Menu,
  Plus, Search, Settings, ShieldCheck, Target, TrendingUp, X, Mic, Square, Play,
  UserRound, Trash2, ExternalLink, MessageCircle, Paperclip, Send, AudioLines, LoaderCircle
} from "lucide-react";

type Section = "Overview" | "Community" | "My Gigs" | "Gig Analyzer" | "Performance" | "Growth Plan" | "Profile" | "AI Growth Coach" | "Keyword Research" | "Competitor Research";
type Profile = { id: string; display_name: string | null; fiverr_username: string | null; seller_level: string | null; primary_niche: string | null; website_url: string | null; avatar_url: string | null; bio: string | null; fiverr_profile_url: string | null; skills: string | null; experience_years: number | null; community_discoverable: boolean | null; onboarding_completed: boolean; work_platforms: string[] | null; upwork_profile_url: string | null; linkedin_url: string | null; other_work_url: string | null };
type Gig = { id: string; title: string; description: string; tags: string[]; category: string | null; subcategory: string | null; starting_price: number | null; currency: string; status: "draft" | "active" | "paused"; gig_url: string | null };
type Performance = { id: string; period_start: string; period_end: string; impressions: number; clicks: number; orders: number; revenue: number; currency: string; gig_id: string | null };
type Task = { id: string; title: string; description: string; category: string; priority: "low" | "medium" | "high"; status: "pending" | "in_progress" | "completed" };

const navigation: { label: Section; icon: typeof LayoutDashboard }[] = [
  { label: "Overview", icon: LayoutDashboard }, { label: "Community", icon: Users }, { label: "My Gigs", icon: BriefcaseBusiness },
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileForm, setProfileForm] = useState({ display_name: "", work_platforms: [] as string[], fiverr_username: "", seller_level: "", primary_niche: "", website_url: "", upwork_profile_url: "", linkedin_url: "", other_work_url: "", bio: "", fiverr_profile_url: "", skills: "", experience_years: "", ideal_client: "", community_discoverable: false });
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gigForm, setGigForm] = useState({ title: "", gig_url: "", description: "", tags: "", category: "", starting_price: "", status: "active" as "draft" | "active" | "paused" });
  const [metricForm, setMetricForm] = useState({ date: new Date().toISOString().slice(0, 10), impressions: "", clicks: "", orders: "", revenue: "", currency: "USD", gig_id: "" });
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
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
      const [profileResult, privateProfileResult, gigsResult, performanceResult, tasksResult] = await Promise.all([
        supabase.from("profiles").select("id,display_name,fiverr_username,seller_level,primary_niche,website_url,avatar_url,bio,fiverr_profile_url,skills,experience_years,community_discoverable,onboarding_completed,work_platforms,upwork_profile_url,linkedin_url,other_work_url").eq("id", user.id).maybeSingle(),
        supabase.from("profile_private").select("ideal_client").eq("user_id", user.id).maybeSingle(),
        supabase.from("gigs").select("id,title,description,tags,category,subcategory,starting_price,currency,status,gig_url").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("performance_entries").select("id,period_start,period_end,impressions,clicks,orders,revenue,currency,gig_id").eq("user_id", user.id).order("period_start", { ascending: false }),
        supabase.from("growth_tasks").select("id,title,description,category,priority,status").eq("user_id", user.id).order("created_at", { ascending: true }),
      ]);
      if (!active) return;
      const failed = [profileResult.error, privateProfileResult.error, gigsResult.error, performanceResult.error, tasksResult.error].find(Boolean);
      if (failed) setNotice(failed.message);
      const p = profileResult.data as Profile | null;
      setProfile(p);
      setProfileForm({
        display_name: p?.display_name ?? (user.user_metadata?.full_name ?? ""),
        work_platforms: p?.work_platforms ?? [],
        fiverr_username: p?.fiverr_username ?? "",
        seller_level: p?.seller_level ?? "",
        primary_niche: p?.primary_niche ?? "",
        website_url: p?.website_url ?? "",
        upwork_profile_url: p?.upwork_profile_url ?? "",
        linkedin_url: p?.linkedin_url ?? "",
        other_work_url: p?.other_work_url ?? "",
        bio: p?.bio ?? "",
        fiverr_profile_url: p?.fiverr_profile_url ?? "",
        skills: p?.skills ?? "",
        experience_years: p?.experience_years == null ? "" : String(p.experience_years),
        ideal_client: privateProfileResult.data?.ideal_client ?? "",
        community_discoverable: p?.community_discoverable ?? false,
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

  async function sendCoachMessage(event?: React.FormEvent<HTMLFormElement>, overrides?: { message?: string; attachments?: File[] }): Promise<boolean> {
    event?.preventDefault();
    const message = (overrides?.message ?? coachInput).trim();
    const queuedFiles = overrides?.attachments ?? [...coachAttachments];
    if ((!message && queuedFiles.length === 0) || coachLoading) return false;
    setCoachLoading(true); setNotice(""); setUploadingAttachments(queuedFiles.length > 0);
    let conversationId = activeConversationId;
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) { setNotice("Please sign in again before sending a message."); setCoachLoading(false); return false; }
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
      const displayAttachments = await Promise.all(attachmentMeta.map(async (file) => { const { data: signed } = await supabase.storage.from("ai-attachments").createSignedUrl(file.path, 300); return { ...file, url: signed?.signedUrl }; }));
      const completed = [...nextMessages.slice(0, -1), { ...nextMessages[nextMessages.length - 1], attachments: displayAttachments }, { role: "assistant" as const, content: result.answer }];
      setCoachMessages(completed);
      setCoachHistory((old) => [{ id: conversationId!, title: old.find((item) => item.id === conversationId)?.title || message.slice(0, 64) || queuedFiles[0]?.name || "Conversation", messages: completed, updatedAt: new Date().toISOString() }, ...old.filter((item) => item.id !== conversationId)].slice(0, 40));
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to contact the AI coach.");
      setCoachMessages(nextMessages); setCoachInput(message); setCoachAttachments(queuedFiles);
      return false;
    } finally { setUploadingAttachments(false); setCoachLoading(false); }
  }


  function clearVoicePreview() {
    if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
    setVoicePreviewUrl(null); setVoiceBlob(null); setVoiceSeconds(0);
  }

  async function startVoiceRecording() {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setNotice("Voice recording is not supported by this browser. Try a recent version of Chrome.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      voiceChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) voiceChunksRef.current.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(voiceChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size) {
          const url = URL.createObjectURL(blob);
          setVoiceBlob(blob); setVoicePreviewUrl(url);
        }
      };
      recorderRef.current = recorder;
      recorder.start(500);
      setVoiceRecording(true); setVoiceSeconds(0);
      voiceTimerRef.current = setInterval(() => setVoiceSeconds((seconds) => {
        if (seconds >= 119) { if (recorder.state === "recording") recorder.stop(); setVoiceRecording(false); if (voiceTimerRef.current) clearInterval(voiceTimerRef.current); voiceTimerRef.current = null; return 120; }
        return seconds + 1;
      }), 1000);
    } catch {
      setNotice("Microphone access was blocked. Allow microphone access in your browser and try again.");
    }
  }

  function stopVoiceRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setVoiceRecording(false);
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    voiceTimerRef.current = null;
  }

  async function transcribeVoiceNote() {
    if (!voiceBlob || voiceBusy || coachLoading) return;
    setVoiceBusy(true); setNotice("");
    try {
      const bytes = new Uint8Array(await voiceBlob.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      const audioBase64 = btoa(binary);
      const response = await fetch("/api/ai/transcribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64, mimeType: voiceBlob.type || "audio/webm" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your voice note could not be transcribed.");
      const transcript = typeof result.transcript === "string" ? result.transcript.trim() : "";
      if (!transcript) throw new Error("I couldn't hear clear speech in that recording. Please try again.");
      const sent = await sendCoachMessage(undefined, { message: transcript, attachments: [] });
      if (sent) {
        clearVoicePreview();
        setNotice("Your transcribed voice note has been sent to the Growth Coach.");
      } else {
        setCoachInput(transcript);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to process this voice note.");
    } finally { setVoiceBusy(false); }
  }

  async function sendVoiceAudioToCoach() {
    if (!voiceBlob || voiceBusy || coachLoading) return;
    const mimeType = (voiceBlob.type || "audio/webm").split(";")[0];
    const extension = mimeType === "audio/mp4" ? "m4a" : mimeType === "audio/ogg" ? "ogg" : "webm";
    const audioFile = new File([voiceBlob], `mile-voice-note-${Date.now()}.${extension}`, { type: mimeType });
    setNotice("");
    const sent = await sendCoachMessage(undefined, {
      message: "Please listen to my voice note and respond to what I said.",
      attachments: [audioFile],
    });
    if (sent) clearVoicePreview();
  }

  useEffect(() => () => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, [voicePreviewUrl]);

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

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setNotice("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice("Your profile picture must be 5 MB or smaller.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setNotice("Please log in again before changing your picture.");
    setAvatarUploading(true);
    setNotice("");
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) {
      setNotice(uploadError.message);
      setAvatarUploading(false);
      return;
    }
    const { data: publicFile } = supabase.storage.from("avatars").getPublicUrl(path);
    const { data, error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: profileForm.display_name.trim() || null,
      fiverr_username: profileForm.fiverr_username.trim() || null,
      seller_level: profileForm.seller_level || null,
      primary_niche: profileForm.primary_niche.trim() || null,
      website_url: profileForm.website_url.trim() || null,
      avatar_url: publicFile.publicUrl,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }).select("*").single();
    if (error) {
      await supabase.storage.from("avatars").remove([path]);
      setNotice(error.message);
    } else {
      setProfile(data as Profile);
      setNotice("Profile picture updated.");
    }
    setAvatarUploading(false);
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
      work_platforms: profileForm.work_platforms,
      upwork_profile_url: profileForm.upwork_profile_url.trim() || null,
      linkedin_url: profileForm.linkedin_url.trim() || null,
      other_work_url: profileForm.other_work_url.trim() || null,
      bio: profileForm.bio.trim() || null,
      fiverr_profile_url: profileForm.fiverr_profile_url.trim() || null,
      skills: profileForm.skills.trim() || null,
      experience_years: profileForm.experience_years.trim() ? Number(profileForm.experience_years) : null,
      community_discoverable: profileForm.community_discoverable,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }).select("*").single();
    if (error) {
      setNotice(error.message);
    } else {
      const { error: privateError } = await supabase.from("profile_private").upsert({
        user_id: user.id,
        ideal_client: profileForm.ideal_client.trim() || null,
        updated_at: new Date().toISOString(),
      });
      setProfile(data as Profile);
      setNotice(privateError ? `Public profile saved, but private details could not be saved: ${privateError.message}` : "Your profile has been saved.");
    }
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
      impressions, clicks, orders, revenue, currency: metricForm.currency,
    }).select("id,period_start,period_end,impressions,clicks,orders,revenue,currency,gig_id").single();
    if (error) setNotice(error.message);
    else { setPerformance((old) => [data as Performance, ...old]); setMetricForm({ date: new Date().toISOString().slice(0, 10), impressions: "", clicks: "", orders: "", revenue: "", currency: "USD", gig_id: "" }); setNotice("Performance snapshot saved."); }
    setSaving(false);
  }

  async function toggleTask(task: Task) {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    const { data, error } = await supabase.from("growth_tasks").update({ status: nextStatus, completed_at: nextStatus === "completed" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", task.id).select("id,title,description,category,priority,status").single();
    if (error) setNotice(error.message);
    else setTasks((old) => old.map((item) => item.id === task.id ? data as Task : item));
  }

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const profileCompletionFields = [profileForm.display_name, profileForm.primary_niche, profileForm.bio, profileForm.skills, profileForm.website_url, profileForm.work_platforms.length ? "yes" : "", profile?.avatar_url || ""];
  const profileCompletion = Math.round(profileCompletionFields.filter((value) => Boolean(String(value).trim())).length / profileCompletionFields.length * 100);
  const activeGigs = gigs.filter((gig) => gig.status === "active").length;
  const clickThroughRate = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;
  const revenueByCurrency = performance.reduce((groups, entry) => { groups[entry.currency] = (groups[entry.currency] || 0) + Number(entry.revenue || 0); return groups; }, {} as Record<string, number>);
  const revenueDisplay = Object.entries(revenueByCurrency).length ? Object.entries(revenueByCurrency).map(([currency, amount]) => `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`).join(" · ") : "—";
  const initials = (profileForm.display_name || userEmail || "FG").split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FG";

  function go(next: Section) { setSection(next); setMobileOpen(false); setNotice(""); }

  return <main className="workspace-shell min-h-screen bg-[#f7f8f7] text-[#222325]">
    <aside style={{ width: sidebarCollapsed ? 88 : 292 }} className={`workspace-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#e9ece9] bg-white px-4 py-6 transition-[width,transform] duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className={`mb-9 flex ${sidebarCollapsed ? "flex-col items-center gap-3" : "items-center justify-between"} `}><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1DBF73] text-white shadow-sm"><TrendingUp size={20}/></div>{!sidebarCollapsed && <div className="min-w-0"><p className="truncate text-sm font-extrabold tracking-tight">MILE</p><p className="text-[9px] font-bold tracking-[.17em] text-[#858B86]">EVERY STEP HAS A PURPOSE</p></div>}</div><div className={`flex items-center gap-1 ${sidebarCollapsed ? "justify-center" : ""}`}><button onClick={() => setSidebarCollapsed((value) => !value)} className="hidden rounded-lg p-2 text-[#777d77] hover:bg-[#f4f6f4] lg:block" aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}><Menu size={17}/></button><button onClick={() => setMobileOpen(false)} className="p-2 lg:hidden" aria-label="Close navigation"><X size={18}/></button></div></div>
      {!sidebarCollapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#858B86]">Workspace</p>}
      <nav className={`workspace-nav-scroll min-h-0 flex-1 ${sidebarCollapsed ? "space-y-2" : "space-y-1"}`}>{navigation.map((item) => { const Icon = item.icon; return <button key={item.label} title={sidebarCollapsed ? item.label : undefined} aria-label={item.label} onClick={() => go(item.label)} className={`flex w-full items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} rounded-lg px-3 py-3 text-left text-xs font-semibold transition ${section === item.label ? "bg-[#eaf8ef] text-[#16794b]" : "text-[#62646A] hover:bg-[#f5f6f5] hover:text-[#222325]"}`}><Icon size={17}/>{!sidebarCollapsed && <>{item.label}{item.label === "AI Growth Coach" && <span className="ml-auto rounded-full bg-[#eaf8ef] px-2 py-0.5 text-[9px] font-bold text-[#168B56]">AI</span>}</>}</button>; })}<div className={`my-3 border-t border-[#edf0ed] ${sidebarCollapsed ? "mx-1" : "mx-2"}`}/><a href="/messages" title={sidebarCollapsed ? "Messages" : undefined} className={`flex w-full items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} rounded-lg px-3 py-3 text-xs font-semibold text-[#62646A] transition hover:bg-[#f5f6f5] hover:text-[#00851e]`}><MessageCircle size={17}/>{!sidebarCollapsed && "Messages"}</a><a href="/community/jobs" title={sidebarCollapsed ? "Opportunities" : undefined} className={`flex w-full items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} rounded-lg px-3 py-3 text-xs font-semibold text-[#62646A] transition hover:bg-[#f5f6f5] hover:text-[#00851e]`}><BriefcaseBusiness size={17}/>{!sidebarCollapsed && "Opportunities"}</a><a href="/community/notifications" title={sidebarCollapsed ? "Notifications" : undefined} className={`flex w-full items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} rounded-lg px-3 py-3 text-xs font-semibold text-[#62646A] transition hover:bg-[#f5f6f5] hover:text-[#00851e]`}><Bell size={17}/>{!sidebarCollapsed && "Notifications"}</a></nav>
      <div className="mt-auto space-y-3"><div className={`rounded-xl bg-[#eaf8ef] ${sidebarCollapsed ? "flex justify-center p-3" : "p-4"}`} title={sidebarCollapsed ? "Grow with clarity" : undefined}><Lightbulb size={18} className="shrink-0 text-[#1DBF73]"/>{!sidebarCollapsed && <><p className="mt-2 text-xs font-bold">Grow with clarity.</p><p className="mt-1 text-[11px] leading-5 text-[#4C6658]">Understand your numbers. Improve your offer. Make deliberate moves.</p></>}</div><button onClick={() => go("Profile")} title={sidebarCollapsed ? "Profile" : undefined} className={`flex w-full items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-xs font-semibold text-[#62646A] hover:bg-[#f5f6f5]`}><UserRound size={17}/>{!sidebarCollapsed && "Profile & settings"}</button><form action={signOut}><button type="submit" title={sidebarCollapsed ? "Log out" : undefined} className={`flex w-full items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-xs font-semibold text-[#62646A] hover:bg-[#f5f6f5]`}><LogOut size={17}/>{!sidebarCollapsed && "Log out"}</button></form></div>
    </aside>
    {mobileOpen && <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/25 lg:hidden"/>}
    <section className={`workspace-main min-h-screen transition-[padding] duration-200 ${sidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[292px]"}`}>
      <header className="workspace-topbar sticky top-0 z-20 flex h-[88px] items-center justify-between border-b border-[#e9ece9] bg-white/95 px-5 backdrop-blur md:px-9"><div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 hover:bg-[#f3f5f3] lg:hidden" aria-label="Open navigation"><Menu size={20}/></button><div><p className="text-[10px] text-[#929992]">WORKSPACE / {section.toUpperCase()}</p><h1 className="text-base font-extrabold tracking-tight">{section}</h1></div></div><div className="flex items-center gap-2"><button onClick={() => go("Profile")} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-[#f4f6f4] sm:flex"><span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#222325] text-[11px] font-bold text-white">{profile?.avatar_url ? <img src={profile.avatar_url} alt="Your profile" className="h-full w-full object-cover"/> : initials}</span><span className="hidden max-w-[150px] text-left lg:block"><span className="block truncate text-xs font-bold">{profileForm.display_name || "Your profile"}</span><span className="block max-w-[150px] truncate text-[10px] text-[#929992]">{userEmail}</span></span></button><form action={signOut} className="hidden sm:block"><button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-[#e7ebe7] px-3 py-2.5 text-xs font-bold text-[#555d56] hover:bg-[#f5f7f5]"><LogOut size={15}/> Log out</button></form></div></header>
      <div className="workspace-content mx-auto max-w-[1680px] px-6 py-9 md:px-10 md:py-12 2xl:px-14">
        {notice && <div role="status" className="mb-5 rounded-lg border border-[#d8eadf] bg-[#f0faf3] px-4 py-3 text-xs text-[#246642]">{notice}</div>}
        {loading ? <div className="py-24 text-center text-sm text-[#777d77]">Loading your workspace…</div> : <>
          {section === "Community" && <CommunityDirectory />}
          {section === "Overview" && <><div className="workspace-overview-hero mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold text-[#168B56]">YOUR SELLER WORKSPACE</p><h2 className="workspace-page-title text-4xl font-extrabold tracking-[-.055em] md:text-5xl">Good to have you back{profileForm.display_name ? `, ${profileForm.display_name.split(" ")[0]}` : ""}.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#777d77]">A clear view of your independent work, activity and next steps.</p></div><button onClick={() => go("My Gigs")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#222325] px-4 py-3 text-xs font-bold text-white hover:bg-[#404145]"><Plus size={15}/> Add a gig</button></div>
            <div className="workspace-stat-grid mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{[{label:"Impressions",value:totals.impressions.toLocaleString(),icon:Activity},{label:"Click-through rate",value:clickThroughRate.toFixed(1)+"%",icon:ArrowUpRight},{label:"Orders",value:totals.orders.toLocaleString(),icon:BriefcaseBusiness},{label:"Revenue",value:revenueDisplay,icon:TrendingUp}].map((item) => { const Icon=item.icon; return <div key={item.label} className="workspace-stat-card rounded-xl border border-[#e9ece9] bg-white p-6"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-[#777d77]">{item.label}</p><Icon size={17} className="text-[#168B56]"/></div><p className="mt-4 text-[28px] font-extrabold tracking-tight">{item.value}</p><p className="mt-2 text-[10px] text-[#9aa19a]">From your saved snapshots</p></div>; })}</div>
            <div className="workspace-overview-grid grid gap-6 2xl:grid-cols-[1.2fr_.8fr]"><div className="workspace-panel rounded-xl border border-[#e9ece9] bg-white p-6 md:p-8"><h3 className="text-base font-extrabold">Your gigs</h3><p className="mt-1 text-xs text-[#929992]">Services saved to your workspace.</p>{gigs.length ? <div className="mt-5 divide-y divide-[#eef0ee]">{gigs.slice(0,4).map((gig)=><div key={gig.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-semibold">{gig.title}</p><p className="mt-1 text-[10px] capitalize text-[#929992]">{gig.status} · {gig.tags.length} tags</p></div><button onClick={()=>{setAnalysisGig(gig.id);setAnalysisText({title:gig.title,description:gig.description,tags:gig.tags.join(", ")});go("Gig Analyzer")}} className="shrink-0 text-[11px] font-bold text-[#168B56]">Review</button></div>)}</div> : <div className="mt-5 rounded-lg border border-dashed border-[#dce3dd] p-7 text-center"><BriefcaseBusiness className="mx-auto mb-2 text-[#168B56]" size={22}/><p className="text-xs font-semibold">No gigs saved yet</p><p className="mt-1 text-[11px] text-[#929992]">Add your first gig to start organising your services.</p><button onClick={()=>go("My Gigs")} className="mt-3 text-xs font-bold text-[#168B56]">Add a gig <ArrowUpRight className="inline" size={13}/></button></div>}</div>
              <div className="workspace-panel rounded-xl border border-[#e9ece9] bg-white p-6 md:p-8"><div className="flex items-center justify-between"><div><h3 className="text-base font-extrabold">Your next steps</h3><p className="mt-1 text-xs text-[#929992]">A simple growth checklist.</p></div><ShieldCheck className="text-[#168B56]"/></div><div className="mt-5 space-y-4">{tasks.map((task)=><label key={task.id} className="flex cursor-pointer items-start gap-3 text-xs"><input type="checkbox" checked={task.status==="completed"} onChange={()=>toggleTask(task)} className="mt-0.5 h-4 w-4 accent-[#1DBF73]"/><span className={task.status==="completed"?"text-[#9aa19a] line-through":"font-medium text-[#555d56]"}>{task.title}</span></label>)}</div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#edf0ed]"><div className="h-full rounded-full bg-[#1DBF73]" style={{width:(tasks.length?completedTasks/tasks.length*100:0)+"%"}}/></div><p className="mt-2 text-[10px] text-[#929992]">{completedTasks} of {tasks.length} completed</p></div></div></>}
          {section === "Profile" && <><div className="mb-7"><p className="text-xs font-bold text-[#168B56]">YOUR ACCOUNT</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Seller profile</h2><p className="mt-2 text-sm text-[#777d77]">Keep your details up to date. Your profile helps us tailor future guidance.</p></div><div className="max-w-3xl rounded-xl border border-[#e9ece9] bg-white p-5 md:p-7"><div className="mb-6 rounded-xl bg-[#f5faf6] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#27352b]">Profile strength</p><p className="mt-1 text-[11px] text-[#78847a]">A complete profile helps other freelancers understand your work.</p></div><strong className="text-xl text-[#00851e]">{profileCompletion}%</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e2ebe3]"><div className="h-full rounded-full bg-[#00A525] transition-all" style={{width:profileCompletion+"%"}}/></div></div><div className="mb-7 flex flex-wrap items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5ebe6] bg-[#eaf8ef] text-xl font-bold text-[#168B56]">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="Your profile picture" className="h-full w-full object-cover"/> : initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{profileForm.display_name || "Your name"}</p>
                <p className="mt-1 text-xs text-[#929992]">{userEmail}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-lg bg-[#222325] px-4 py-2.5 text-xs font-bold text-white">
                    {avatarUploading ? "Uploading…" : profile?.avatar_url ? "Change picture" : "Upload picture"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={avatarUploading} onChange={uploadAvatar}/>
                  </label>
                  <span className="text-[10px] text-[#929992]">JPG, PNG or WebP · up to 5 MB</span>
                </div>
              </div>
            </div><div className="grid gap-4 sm:grid-cols-2">
              {[{label:"Full name",key:"display_name",placeholder:"Your name"},{label:"Primary niche",key:"primary_niche",placeholder:"e.g. Brand identity design"},{label:"Portfolio / website",key:"website_url",placeholder:"https://yourportfolio.com"},{label:"Upwork profile link",key:"upwork_profile_url",placeholder:"https://www.upwork.com/freelancers/..."},{label:"LinkedIn profile",key:"linkedin_url",placeholder:"https://www.linkedin.com/in/..."},{label:"Other work profile",key:"other_work_url",placeholder:"https://..."},{label:"Skills / services",key:"skills",placeholder:"Brand identity, logo design, packaging"}].map((field)=> <label key={field.key} className="block"><span className="mb-2 block text-xs font-semibold">{field.label}</span><input className="w-full rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm[field.key as "display_name" | "primary_niche" | "website_url" | "upwork_profile_url" | "linkedin_url" | "other_work_url" | "skills"]} placeholder={field.placeholder} onChange={(event)=>setProfileForm((old)=>({...old,[field.key]:event.target.value}))}/></label>)}
              <div className="sm:col-span-2"><p className="mb-3 text-xs font-semibold">Where do you work?</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{["Fiverr","Upwork","Freelancer.com","Contra","Direct clients","Other"].map((platform)=><label key={platform} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-xs font-medium transition ${profileForm.work_platforms.includes(platform)?"border-[#00A525] bg-[#f0faf2] text-[#087a27]":"border-[#e1e7e1] bg-white text-[#59635b]"}`}><input type="checkbox" checked={profileForm.work_platforms.includes(platform)} onChange={(event)=>setProfileForm((old)=>({...old,work_platforms:event.target.checked?[...old.work_platforms,platform]:old.work_platforms.filter((item)=>item!==platform)}))} className="h-3.5 w-3.5 accent-[#00A525]"/>{platform}</label>)}</div><p className="mt-2 text-[10px] text-[#929992]">Choose every platform you currently use. MILE supports independent work across different channels.</p></div>{profileForm.work_platforms.includes("Fiverr") && <><label className="block"><span className="mb-2 block text-xs font-semibold">Fiverr username</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.fiverr_username} placeholder="Your Fiverr username" onChange={(event)=>setProfileForm((old)=>({...old,fiverr_username:event.target.value}))}/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Fiverr profile link</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.fiverr_profile_url} placeholder="https://www.fiverr.com/yourusername" onChange={(event)=>setProfileForm((old)=>({...old,fiverr_profile_url:event.target.value}))}/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Fiverr seller level</span><select className="w-full rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.seller_level} onChange={(event)=>setProfileForm((old)=>({...old,seller_level:event.target.value}))}><option value="">Select your level</option><option value="New Seller">New Seller</option><option value="Level 1">Level 1</option><option value="Level 2">Level 2</option><option value="Top Rated Seller">Top Rated Seller</option><option value="Pro">Pro</option></select></label></>}
              <label className="block"><span className="mb-2 block text-xs font-semibold">Years of experience</span><input type="number" min="0" max="60" className="w-full rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.experience_years} placeholder="e.g. 2" onChange={(event)=>setProfileForm((old)=>({...old,experience_years:event.target.value}))}/></label>
              <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-semibold">About you</span><textarea maxLength={1000} rows={4} className="w-full resize-y rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.bio} placeholder="Describe your experience, approach and the value you bring to buyers." onChange={(event)=>setProfileForm((old)=>({...old,bio:event.target.value}))}/><span className="mt-1 block text-right text-[10px] text-[#929992]">{profileForm.bio.length}/1000</span></label>
              <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-semibold">Who do you help?</span><textarea maxLength={500} rows={2} className="w-full resize-y rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.ideal_client} placeholder="e.g. Startups and small businesses building a distinctive brand." onChange={(event)=>setProfileForm((old)=>({...old,ideal_client:event.target.value}))}/></label>
              <div className="sm:col-span-2 rounded-xl border border-[#e5eae6] bg-[#f8fbf8] p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={profileForm.community_discoverable} onChange={(event)=>setProfileForm((old)=>({...old,community_discoverable:event.target.checked}))} className="mt-1 h-4 w-4 accent-[#1DBF73]"/>
                  <span><span className="block text-xs font-bold text-[#343b35]">Make my profile discoverable in the freelancer community</span><span className="mt-1 block text-[11px] leading-5 text-[#777d77]">When the community launches, other members may find your public professional profile. Your email address and private account details will not be displayed.</span></span>
                </label>
              </div>
            </div><button onClick={saveProfile} disabled={saving} className="mt-6 rounded-lg bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{saving?"Saving…":"Save profile"}</button></div></>}
          {section === "My Gigs" && <><div className="mb-7"><p className="text-xs font-bold text-[#168B56]">YOUR SERVICES</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">My gigs</h2><p className="mt-2 text-sm text-[#777d77]">Save your public Fiverr gig links and details in one place.</p></div><div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><form onSubmit={saveGig} className="space-y-4 rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><h3 className="text-sm font-bold">Add a gig</h3><label className="block"><span className="mb-2 block text-xs font-semibold">Gig title *</span><input required className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.title} onChange={(e)=>setGigForm((old)=>({...old,title:e.target.value}))} placeholder="I will design a brand identity"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Public Fiverr gig URL</span><input type="url" className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.gig_url} onChange={(e)=>setGigForm((old)=>({...old,gig_url:e.target.value}))} placeholder="https://www.fiverr.com/username/gig-name"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Description</span><textarea className="min-h-[115px] w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.description} onChange={(e)=>setGigForm((old)=>({...old,description:e.target.value}))} placeholder="Paste your gig description"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Tags (comma-separated)</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.tags} onChange={(e)=>setGigForm((old)=>({...old,tags:e.target.value}))} placeholder="logo design, branding, brand identity"/></label><div className="grid grid-cols-2 gap-3"><label><span className="mb-2 block text-xs font-semibold">Category</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.category} onChange={(e)=>setGigForm((old)=>({...old,category:e.target.value}))} placeholder="Graphics & Design"/></label><label><span className="mb-2 block text-xs font-semibold">Starting price (USD)</span><input type="number" min="0" step="0.01" className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.starting_price} onChange={(e)=>setGigForm((old)=>({...old,starting_price:e.target.value}))} placeholder="25"/></label></div><label className="block"><span className="mb-2 block text-xs font-semibold">Status</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.status} onChange={(e)=>setGigForm((old)=>({...old,status:e.target.value as typeof old.status}))}><option value="active">Active</option><option value="paused">Paused</option><option value="draft">Draft</option></select></label><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-50"><Plus size={15}/>{saving?"Saving…":"Save gig"}</button></form><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold">Saved gigs</h3><p className="mt-1 text-xs text-[#929992]">{gigs.length} gig{gigs.length===1?"":"s"} in your workspace</p></div></div>{gigs.length ? <div className="mt-4 divide-y divide-[#eef0ee]">{gigs.map((gig)=><div key={gig.id} className="py-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold">{gig.title}</p><p className="mt-1 text-[11px] capitalize text-[#929992]">{gig.status}{gig.starting_price!==null? ` · $ ${gig.starting_price}`:""}</p>{gig.tags.length>0&&<p className="mt-2 text-[11px] text-[#777d77]">{gig.tags.join(" · ")}</p>}</div><button onClick={()=>deleteGig(gig.id)} className="rounded-md p-2 text-[#929992] hover:bg-red-50 hover:text-red-600" aria-label="Delete gig"><Trash2 size={16}/></button></div>{gig.gig_url&&<a href={gig.gig_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#168B56]">Open Fiverr gig <ExternalLink size={12}/></a>}<button onClick={()=>{setAnalysisGig(gig.id);setAnalysisText({title:gig.title,description:gig.description,tags:gig.tags.join(", ")});go("Gig Analyzer")}} className="ml-4 text-[11px] font-semibold text-[#62646A]">Review details</button></div>)}</div> : <div className="flex min-h-[280px] flex-col items-center justify-center text-center"><BriefcaseBusiness size={25} className="mb-3 text-[#168B56]"/><p className="text-xs font-semibold">Your saved gigs will appear here</p><p className="mt-1 text-[11px] text-[#929992]">Add a gig using the form.</p></div>}</div></div></>}
          {section === "Performance" && <><div className="mb-7"><p className="text-xs font-bold text-[#168B56]">SELLER ANALYTICS</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Track what is changing.</h2><p className="mt-2 text-sm text-[#777d77]">Enter figures from your Fiverr analytics. We do not fetch private Fiverr account metrics.</p></div><div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><form onSubmit={saveMetrics} className="space-y-3 rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><h3 className="text-sm font-bold">Add performance snapshot</h3><label className="block"><span className="mb-1 block text-xs font-semibold">Date</span><input type="date" required className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm.date} onChange={(e)=>setMetricForm((old)=>({...old,date:e.target.value}))}/></label>{[{label:"Impressions",key:"impressions"},{label:"Clicks",key:"clicks"},{label:"Orders",key:"orders"},{label:`Revenue (${metricForm.currency})`,key:"revenue"}].map((field)=><label key={field.key} className="block"><span className="mb-1 block text-xs font-semibold">{field.label}</span><input type="number" min="0" step={field.key==="revenue"?"0.01":"1"} required className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm[field.key as keyof typeof metricForm]} onChange={(e)=>setMetricForm((old)=>({...old,[field.key]:e.target.value}))}/></label>)}<label className="block"><span className="mb-1 block text-xs font-semibold">Link to gig (optional)</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm.gig_id} onChange={(e)=>setMetricForm((old)=>({...old,gig_id:e.target.value}))}><option value="">All gigs / not specified</option>{gigs.map((gig)=><option key={gig.id} value={gig.id}>{gig.title}</option>)}</select></label><label className="block"><span className="mb-1 block text-xs font-semibold">Revenue currency</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm.currency} onChange={(e)=>setMetricForm((old)=>({...old,currency:e.target.value}))}><option value="USD">USD — US Dollar</option><option value="NGN">NGN — Nigerian Naira</option><option value="GBP">GBP — British Pound</option><option value="EUR">EUR — Euro</option><option value="CAD">CAD — Canadian Dollar</option><option value="AUD">AUD — Australian Dollar</option></select></label><button disabled={saving} className="w-full rounded-lg bg-[#222325] px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{saving?"Saving…":"Save snapshot"}</button></form><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><h3 className="text-sm font-bold">Saved performance</h3>{performance.length?<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[460px] text-left text-xs"><thead className="text-[10px] text-[#929992]"><tr>{["DATE","IMPRESSIONS","CLICKS","ORDERS","REVENUE"].map((heading)=><th key={heading} className="pb-3 pr-3">{heading}</th>)}</tr></thead><tbody>{performance.map((row)=><tr key={row.id} className="border-t border-[#eef0ee]"><td className="py-3 pr-3">{row.period_start}</td><td className="pr-3">{row.impressions.toLocaleString()}</td><td className="pr-3">{row.clicks.toLocaleString()}</td><td className="pr-3">{row.orders}</td><td className="pr-3">{row.currency} {Number(row.revenue).toLocaleString()}</td></tr>)}</tbody></table></div>:<div className="flex min-h-[260px] flex-col items-center justify-center text-center"><ChartNoAxesCombined className="mb-3 text-[#168B56]"/><p className="text-xs font-semibold">No snapshots yet</p><p className="mt-1 text-[11px] text-[#929992]">Your saved records will appear here.</p></div>}</div></div></>}
          {section === "Growth Plan" && <div className="max-w-3xl"><div className="mb-7"><p className="text-xs font-bold text-[#168B56]">YOUR ACTION LIST</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Small steps, saved progress.</h2><p className="mt-2 text-sm text-[#777d77]">Mark tasks complete as you work. Your progress is saved to your account.</p></div><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-7">{tasks.map((task)=><div key={task.id} className="flex items-start gap-3 border-b border-[#eef0ee] py-4 last:border-0"><input type="checkbox" checked={task.status==="completed"} onChange={()=>toggleTask(task)} className="mt-1 h-4 w-4 accent-[#1DBF73]"/><div><p className={task.status==="completed"?"text-sm text-[#9aa19a] line-through":"text-sm font-semibold"}>{task.title}</p><p className="mt-1 text-xs leading-5 text-[#777d77]">{task.description}</p><p className="mt-2 text-[10px] uppercase tracking-wide text-[#929992]">{task.priority} priority · {task.status.replace("_"," ")}</p></div></div>)}</div></div>}
          {section === "Gig Analyzer" && <><div className="mb-7"><p className="text-xs font-bold text-[#168B56]">GIG QUALITY REVIEW</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Make your offer easier to choose.</h2><p className="mt-2 text-sm text-[#777d77]">A basic checklist, not an official Fiverr score or ranking prediction.</p></div><div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><div className="space-y-4 rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><label className="block"><span className="mb-2 block text-xs font-semibold">Choose a saved gig</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisGig} onChange={(e)=>{const gig=gigs.find((item)=>item.id===e.target.value);setAnalysisGig(e.target.value);if(gig)setAnalysisText({title:gig.title,description:gig.description,tags:gig.tags.join(", ")});setAnalysisDone(false);}}><option value="">Enter details manually</option>{gigs.map((gig)=><option key={gig.id} value={gig.id}>{gig.title}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-semibold">Gig title</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisText.title} onChange={(e)=>{setAnalysisText((old)=>({...old,title:e.target.value}));setAnalysisDone(false);}}/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Description</span><textarea className="min-h-[170px] w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisText.description} onChange={(e)=>{setAnalysisText((old)=>({...old,description:e.target.value}));setAnalysisDone(false);}} placeholder="Paste your gig description"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Tags (comma-separated)</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisText.tags} onChange={(e)=>{setAnalysisText((old)=>({...old,tags:e.target.value}));setAnalysisDone(false);}} placeholder="brand identity, logo design, ..."/></label><button onClick={runAiAnalysis} disabled={!analysisGig || aiLoading} className="rounded-lg bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-40">{aiLoading?"Analysing…":"Run AI review"}</button><p className="text-[11px] text-[#929992]">AI reviews the saved gig details. Save any edits to My Gigs first.</p></div><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><p className="text-xs font-bold text-[#777d77]">YOUR REVIEW</p>{analysisDone?<><p className="mt-5 text-xs font-bold text-[#168B56]">AI GIG REVIEW</p><div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#4b514c]">{aiResult}</div><p className="mt-5 rounded-lg bg-[#f0faf3] p-3 text-[10px] leading-5 text-[#4C6658]">AI guidance is based on the details you saved. Suggestions are hypotheses, not Fiverr ranking or search-volume data.</p></>:<div className="flex min-h-[300px] flex-col items-center justify-center text-center"><FileSearch size={25} className="mb-3 text-[#168B56]"/><p className="text-sm font-semibold">Your AI review will appear here</p><p className="mt-2 max-w-xs text-xs text-[#929992]">Select one of your saved gigs and run an AI review.</p></div>}</div></div></>}
          {section === "AI Growth Coach" && <div className="ai-studio-shell w-full p-4 md:p-7">
            <div className="mb-5 flex flex-col justify-between gap-3 border-b border-[#e4e7e4] pb-5 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold text-[#62646a]">AI Growth Coach</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-[#222325]">Get help growing your freelance business</h2><p className="mt-1 text-sm text-[#74767a]">Ask a question, share a file or continue a previous conversation.</p></div><button onClick={startNewCoachChat} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#dadbdd] bg-white px-4 text-sm font-semibold text-[#404145] hover:bg-[#f7f7f7]"><Plus size={15}/> New chat</button></div>
            <div className="grid min-h-[650px] gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="ai-studio-history flex flex-col overflow-hidden rounded-2xl">
                <div className="border-b border-[#e4e5e7] p-4"><p className="text-sm font-semibold text-[#404145]">Recent chats</p><p className="mt-1 text-xs text-[#74767a]">Only you can see these</p></div>
                <div className="flex-1 space-y-1 overflow-y-auto p-3">
                  {chatHistoryLoading && <p className="p-3 text-xs text-[#929992]">Loading history…</p>}
                  {!chatHistoryLoading && !coachHistory.length && <p className="p-4 text-xs leading-6 text-[#929992]">Your saved AI conversations will appear here.</p>}
                  {coachHistory.map((chat)=><div key={chat.id} className={`group flex items-center gap-1 rounded-xl ${activeConversationId===chat.id?"bg-[#eaf8ef]":"hover:bg-[#f5f7f5]"}`}><button onClick={()=>openCoachChat(chat.id)} className="min-w-0 flex-1 px-3 py-3 text-left"><span className="block truncate text-xs font-bold text-[#343b35]">{chat.title}</span><span className="mt-1 block text-[10px] text-[#929992]">{new Date(chat.updatedAt).toLocaleDateString()}</span></button><button onClick={()=>deleteCoachChat(chat.id)} title="Delete conversation" className="mr-2 rounded-lg p-2 text-[#9aa29b] opacity-0 hover:bg-white hover:text-red-600 group-hover:opacity-100"><Trash2 size={14}/></button></div>)}
                </div>
              </aside>
              <section className="ai-studio-chat flex min-w-0 flex-col overflow-hidden rounded-2xl">
                <div className="ai-studio-topline flex items-center justify-between border-b px-5 py-4 md:px-7"><div className="flex items-center gap-3"><div className="ai-studio-primary flex h-11 w-11 items-center justify-center rounded-xl"><Bot size={21}/></div><div><p className="text-sm font-extrabold">Growth Coach</p><p className="mt-1 text-[10px] text-[#a9b8ab]">Your business assistant</p></div></div><span className="text-xs text-[#74767a]">Private conversation</span></div>
                <div className="min-h-[390px] flex-1 space-y-5 overflow-y-auto p-5 md:p-8">
                  {!coachMessages.length && <div className="flex min-h-[330px] flex-col items-center justify-center text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-[#d9e76b]"><Bot size={28}/></div><h3 className="text-xl font-extrabold tracking-tight">What can I help you with?</h3><p className="mt-2 max-w-md text-xs leading-6 text-[#929992]">Ask about your services, pricing, clients or performance. You can also attach a document or image.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={()=>setCoachInput("Review my gig positioning and tell me what to improve.")} className="ai-studio-suggestion rounded-full px-4 py-2 text-[11px] font-semibold">Review my gig</button><button onClick={()=>setCoachInput("Help me understand my Fiverr performance.")} className="ai-studio-suggestion rounded-full px-4 py-2 text-[11px] font-semibold">Understand my metrics</button></div></div>}
                  {coachMessages.map((item,index)=><div key={index} className={item.role==="user"?"ai-studio-user ml-auto max-w-[88%] rounded-2xl rounded-br-md p-4 md:p-5":"ai-studio-assistant mr-auto max-w-[94%] rounded-2xl rounded-bl-md p-4 md:p-5"}><p className="mb-2 text-xs font-semibold text-[#62646a]">{item.role==="user"?"You":"Growth Coach"}</p><div className="whitespace-pre-wrap text-sm leading-7 text-[#404145]">{item.content}</div>{item.attachments?.length ? <div className="mt-3 flex flex-wrap gap-2">{item.attachments.map((file,i)=><a key={i} href={file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#dfe7e1] bg-white/80 px-3 py-2 text-[11px] font-semibold text-[#4f5a51]"><FileSearch size={13}/>{file.name}</a>)}</div> : null}</div>)}
                  {coachLoading && <div className="flex items-center gap-3 text-xs text-[#929992]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#1DBF73]"/>{uploadingAttachments?"Uploading your files…":"Your coach is thinking…"}</div>}
                </div>
                <form onSubmit={sendCoachMessage} className="ai-studio-compose border-t p-4 md:p-6">
                  {coachAttachments.length>0 && <div className="mb-3 flex flex-wrap gap-2">{coachAttachments.map((file,index)=><div key={index} className="flex max-w-full items-center gap-2 rounded-xl border border-[#e3e9e4] bg-[#f8faf8] px-3 py-2 text-xs"><FileSearch size={15}/><span className="max-w-[180px] truncate">{file.name}</span><button type="button" onClick={()=>setCoachAttachments(old=>old.filter((_,i)=>i!==index))} className="text-[#929992] hover:text-red-600"><X size={14}/></button></div>)}</div>}
                  <div className="rounded-[26px] border border-[#dfe5e9] bg-white px-4 py-3 shadow-sm transition focus-within:border-[#a9d7bb] focus-within:shadow-[0_0_0_3px_rgba(29,191,115,0.08)]"><textarea value={coachInput} onChange={(event)=>setCoachInput(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();if(!coachLoading&&(coachInput.trim()||coachAttachments.length))void sendCoachMessage();}}} maxLength={2000} rows={2} placeholder="Message your Growth Coach" className="max-h-40 min-h-[54px] w-full resize-none bg-transparent py-1 text-sm leading-6 text-[#222325] outline-none placeholder:text-[#9ca3af]"/>
                  <div className="mt-3 flex items-center gap-2">
                     <label title="Attach files" aria-label="Attach files" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#f1f3f1] hover:text-[#168B56]">
                       <Paperclip size={19}/>
                       <input type="file" multiple accept=".pdf,.txt,.md,.csv,.json,.jpg,.jpeg,.png,.webp,.gif" className="hidden" onChange={(event)=>{const files=Array.from(event.target.files??[]);const valid=files.filter(file=>file.size<=10*1024*1024);if(files.length!==valid.length)setNotice("Each file must be 10 MB or smaller.");setCoachAttachments(old=>[...old,...valid].slice(0,5));event.target.value="";}}/>
                     </label>
                     {voiceRecording ? <button type="button" onClick={stopVoiceRecording} title="Stop recording" aria-label="Stop recording" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"><Square size={16}/></button> : <button type="button" onClick={startVoiceRecording} disabled={voiceBusy||coachLoading} title="Record voice note" aria-label="Record voice note" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#f1f3f1] hover:text-[#168B56] disabled:opacity-40"><Mic size={19}/></button>}
                     <span className="mr-auto text-[11px] text-[#929992]">{voiceRecording?"Recording "+Math.floor(voiceSeconds/60)+":"+String(voiceSeconds%60).padStart(2,"0"):voiceBusy?"Processing voice note…":"Attach or record"}</span>
                     {voicePreviewUrl && <><button type="button" onClick={transcribeVoiceNote} disabled={voiceBusy||coachLoading} title="Transcribe and send" aria-label="Transcribe and send" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f1f3f1] disabled:opacity-40"><AudioLines size={18}/></button><button type="button" onClick={sendVoiceAudioToCoach} disabled={voiceBusy||coachLoading} title="Send audio" aria-label="Send audio" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1DBF73] text-white hover:bg-[#15965b] disabled:opacity-40"><Send size={17}/></button><button type="button" onClick={clearVoicePreview} title="Discard recording" aria-label="Discard recording" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#929992] hover:bg-red-50 hover:text-red-600"><X size={17}/></button></>}
                     {!voicePreviewUrl && <button type="submit" disabled={coachLoading||(!coachInput.trim()&&!coachAttachments.length)} title="Send message" aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1DBF73] text-white transition hover:bg-[#15965b] disabled:cursor-not-allowed disabled:opacity-40">{coachLoading?<LoaderCircle size={18} className="animate-spin"/>:<Send size={17}/>}</button>}
                   </div>
                   <p className="mt-2 px-2 text-center text-[10px] text-[#9aa19a]">Enter to send · Shift + Enter for a new line</p>
                </form>
              </section>
            </div>
          </div>}
          {section === "Keyword Research" && <KeywordResearch />}
          {section === "Competitor Research" && <CompetitorResearch />}
        </>}
        <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-[#e9ece9] py-5 text-[10px] text-[#929992] sm:flex-row"><span>MILE · Freelancer workspace</span><span>Guidance, not guarantees of rankings or orders.</span></footer>
      </div>
    </section>
  </main>;
}
