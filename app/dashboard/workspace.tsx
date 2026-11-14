"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CommunityDirectory from "@/app/community/community-directory";
import CommunityFeed from "@/app/community/community-feed";
import KeywordResearch from "@/app/dashboard/keyword-research";
import CompetitorResearch from "@/app/dashboard/competitor-research";
import { signOut } from "@/app/auth/actions";
import {
  Activity, ArrowUpRight, Bot, BriefcaseBusiness, ChartNoAxesCombined, Users, Bell,
  CheckCircle2, FileSearch, LayoutDashboard, Lightbulb, LogOut, Menu,
  Plus, Search, Settings, ShieldCheck, Target, TrendingUp, X, Mic, Square, Play,
  UserRound, Trash2, ExternalLink, MessageCircle, Paperclip, Send, AudioLines, LoaderCircle, Compass, Handshake, Inbox, Bookmark, CircleHelp, Camera
} from "lucide-react";

type Section = "Overview" | "Community" | "My Gigs" | "Gig Analyzer" | "Performance" | "Growth Plan" | "Profile" | "AI Growth Coach" | "Keyword Research" | "Competitor Research";
type Profile = { availability_status: "open" | "limited" | "unavailable"; services_offered: string | null; looking_for: string | null; collaboration_interests: string[] | null; preferred_project_types: string[] | null; id: string; display_name: string | null; fiverr_username: string | null; seller_level: string | null; primary_niche: string | null; website_url: string | null; avatar_url: string | null; cover_image_url: string | null; bio: string | null; fiverr_profile_url: string | null; skills: string | null; experience_years: number | null; community_discoverable: boolean | null; onboarding_completed: boolean; work_platforms: string[] | null; upwork_profile_url: string | null; linkedin_url: string | null; other_work_url: string | null };
type Gig = { id: string; title: string; description: string; tags: string[]; category: string | null; subcategory: string | null; starting_price: number | null; currency: string; status: "draft" | "active" | "paused"; gig_url: string | null };
type Performance = { id: string; period_start: string; period_end: string; impressions: number; clicks: number; orders: number; revenue: number; currency: string; gig_id: string | null };
type Task = { id: string; title: string; description: string; category: string; priority: "low" | "medium" | "high"; status: "pending" | "in_progress" | "completed" };

const navigationGroups: { title: string; items: { label: Section; icon: typeof LayoutDashboard }[] }[] = [
  { title: "Workspace", items: [{ label: "Overview", icon: LayoutDashboard }, { label: "My Gigs", icon: BriefcaseBusiness }, { label: "Performance", icon: ChartNoAxesCombined }, { label: "Profile", icon: UserRound }] },
  { title: "Discover & connect", items: [{ label: "Community", icon: Users }] },
  { title: "Grow your business", items: [{ label: "Growth Plan", icon: Target }, { label: "AI Growth Coach", icon: Bot }, { label: "Gig Analyzer", icon: FileSearch }, { label: "Keyword Research", icon: Search }, { label: "Competitor Research", icon: Activity }] },
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
  const [headerSearch, setHeaderSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverCropFile, setCoverCropFile] = useState<File | null>(null);
  const [coverCropImage, setCoverCropImage] = useState<HTMLImageElement | null>(null);
  const [coverCropSource, setCoverCropSource] = useState("");
  const [coverCropZoom, setCoverCropZoom] = useState(1);
  const [coverCropOffset, setCoverCropOffset] = useState({ x: 0, y: 0 });
  const [coverCropDragging, setCoverCropDragging] = useState(false);
  const coverCropDragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropImage, setCropImage] = useState<HTMLImageElement | null>(null);
  const [cropSource, setCropSource] = useState("");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropDragging, setCropDragging] = useState(false);
  const cropDragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [ownOnline, setOwnOnline] = useState(false);
  const [profileForm, setProfileForm] = useState({ display_name: "", work_platforms: [] as string[], fiverr_username: "", seller_level: "", primary_niche: "", website_url: "", upwork_profile_url: "", linkedin_url: "", other_work_url: "", bio: "", fiverr_profile_url: "", skills: "", experience_years: "", ideal_client: "", community_discoverable: false, availability_status: "open" as "open" | "limited" | "unavailable", services_offered: "", looking_for: "", collaboration_interests: [] as string[], preferred_project_types: [] as string[] });
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
    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;

    async function joinOwnPresence() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;

      // Show the local online state immediately while Realtime establishes the presence.
      setOwnOnline(true);

      presenceChannel = supabase.channel("mile-online-members", {
        config: { presence: { key: user.id } },
      });

      presenceChannel
        .on("presence", { event: "sync" }, () => {
          if (!active) return;
          const state = presenceChannel?.presenceState() ?? {};
          setOwnOnline(Object.prototype.hasOwnProperty.call(state, user.id));
        })
        .subscribe(async status => {
          if (!active) return;

          if (status === "SUBSCRIBED") {
            await presenceChannel!.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
            if (active) setOwnOnline(true);
          }

          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setOwnOnline(false);
          }
        });
    }

    void joinOwnPresence();

    return () => {
      active = false;
      setOwnOnline(false);
      if (presenceChannel) void supabase.removeChannel(presenceChannel);
    };
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
        supabase.from("profiles").select("id,display_name,fiverr_username,seller_level,primary_niche,website_url,avatar_url,cover_image_url,bio,fiverr_profile_url,skills,experience_years,community_discoverable,onboarding_completed,work_platforms,upwork_profile_url,linkedin_url,other_work_url,availability_status,services_offered,looking_for,collaboration_interests,preferred_project_types").eq("id", user.id).maybeSingle(),
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
        availability_status: p?.availability_status ?? "open",
        services_offered: p?.services_offered ?? "",
        looking_for: p?.looking_for ?? "",
        collaboration_interests: p?.collaboration_interests ?? [],
        preferred_project_types: p?.preferred_project_types ?? [],
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
    const nextMessages = [...coachMessages, { role: "user" as const, content: message || "Please review the attached files.", attachments: queuedFiles.map((file) => ({ name: file.name, mimeType: file.type, size: file.size })) }];
    setCoachMessages(nextMessages); setCoachInput(""); setCoachAttachments([]);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Please sign in again before sending a message.");
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
      if (!response.ok) throw new Error([result.error, result.detail].filter(Boolean).join(" — ") || "The coach could not respond.");
      if (typeof result.answer !== "string" || !result.answer.trim()) throw new Error("The coach returned an empty reply. Please try again.");
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

  async function convertVoiceToWav(blob: Blob): Promise<Blob> {
    const audioContext = new AudioContext();
    try {
      const decoded = await audioContext.decodeAudioData(await blob.arrayBuffer());
      const sampleRate = 16000;
      const frameCount = Math.ceil(decoded.duration * sampleRate);
      const offline = new OfflineAudioContext(1, frameCount, sampleRate);
      const source = offline.createBufferSource();
      source.buffer = decoded;
      source.connect(offline.destination);
      const rendered = await offline.startRendering();
      const samples = rendered.getChannelData(0);
      const wavBuffer = new ArrayBuffer(44 + samples.length * 2);
      const view = new DataView(wavBuffer);
      const writeText = (offset: number, value: string) => {
        for (let index = 0; index < value.length; index++) view.setUint8(offset + index, value.charCodeAt(index));
      };
      writeText(0, "RIFF");
      view.setUint32(4, 36 + samples.length * 2, true);
      writeText(8, "WAVE");
      writeText(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeText(36, "data");
      view.setUint32(40, samples.length * 2, true);
      for (let index = 0; index < samples.length; index++) {
        const sample = Math.max(-1, Math.min(1, samples[index]));
        view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      }
      return new Blob([wavBuffer], { type: "audio/wav" });
    } finally {
      await audioContext.close().catch(() => undefined);
    }
  }

  async function transcribeVoiceNote() {
    if (!voiceBlob || voiceBusy || coachLoading) return;
    setVoiceBusy(true); setNotice("");
    try {
      const compatibleAudio = await convertVoiceToWav(voiceBlob);
      const bytes = new Uint8Array(await compatibleAudio.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      const audioBase64 = btoa(binary);
      const response = await fetch("/api/ai/transcribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64, mimeType: "audio/wav" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your voice note could not be transcribed.");
      const transcript = typeof result.transcript === "string" ? result.transcript.trim() : "";
      if (!transcript) throw new Error("I couldn't hear clear speech in that recording. Please try again.");
      // Never send an AI-generated transcript without letting the user verify it.
      // Put the transcript in the composer so it can be corrected before submission.
      setCoachInput(transcript);
      clearVoicePreview();
      setNotice("Transcript ready. Review the text, correct anything that is wrong, then press Send.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to process this voice note.");
    } finally { setVoiceBusy(false); }
  }

  async function sendVoiceAudioToCoach() {
    if (!voiceBlob || voiceBusy || coachLoading) return;
    // Send voice through the same text-based coach path after reliable transcription.
    // This avoids the extra failure point of asking the final coach response to process audio.
    await transcribeVoiceNote();
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
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setNotice("Choose a JPG, PNG or WebP image."); return; }
    if (file.size > 5 * 1024 * 1024) { setNotice("Your profile picture must be 5 MB or smaller."); return; }
    const source = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { setCropFile(file); setCropImage(image); setCropSource(source); setCropZoom(1); setCropOffset({ x: 0, y: 0 }); setNotice(""); };
    image.onerror = () => { URL.revokeObjectURL(source); setNotice("That image could not be opened. Please choose another file."); };
    image.src = source;
  }

  function closeAvatarCropper() {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource(""); setCropImage(null); setCropFile(null); setCropZoom(1); setCropOffset({ x: 0, y: 0 }); setCropDragging(false); cropDragStart.current = null;
  }

  async function saveCroppedAvatar() {
    if (!cropImage || !cropFile || avatarUploading) return;
    const outputSize = 720, stageSize = 280;
    const baseScale = Math.max(outputSize / cropImage.naturalWidth, outputSize / cropImage.naturalHeight);
    const drawWidth = cropImage.naturalWidth * baseScale * cropZoom;
    const drawHeight = cropImage.naturalHeight * baseScale * cropZoom;
    const scaleFactor = outputSize / stageSize;
    const canvas = document.createElement("canvas"); canvas.width = outputSize; canvas.height = outputSize;
    const context = canvas.getContext("2d");
    if (!context) return setNotice("Your browser could not prepare this image. Please try again.");
    context.imageSmoothingQuality = "high";
    context.drawImage(cropImage, (outputSize-drawWidth)/2 + cropOffset.x*scaleFactor, (outputSize-drawHeight)/2 + cropOffset.y*scaleFactor, drawWidth, drawHeight);
    setAvatarUploading(true); setNotice("");
    try {
      const blob = await new Promise<Blob>((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(new Error("The cropped image could not be prepared.")),"image/jpeg",0.92));
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in again before changing your picture.");
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path,blob,{contentType:"image/jpeg",cacheControl:"3600",upsert:false});
      if (uploadError) throw new Error(uploadError.message);
      const { data: publicFile } = supabase.storage.from("avatars").getPublicUrl(path);
      const { data,error } = await supabase.from("profiles").upsert({
        id:user.id,display_name:profileForm.display_name.trim()||null,fiverr_username:profileForm.fiverr_username.trim()||null,
        seller_level:profileForm.seller_level||null,primary_niche:profileForm.primary_niche.trim()||null,
        website_url:profileForm.website_url.trim()||null,avatar_url:publicFile.publicUrl,onboarding_completed:true,updated_at:new Date().toISOString(),
      }).select("*").single();
      if(error){await supabase.storage.from("avatars").remove([path]);throw new Error(error.message);}
      setProfile(data as Profile); setNotice("Profile picture updated."); closeAvatarCropper();
    } catch(error) { setNotice(error instanceof Error ? error.message : "Your profile picture could not be saved."); }
    finally { setAvatarUploading(false); }
  }

  function uploadCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setNotice("Choose a JPG, PNG or WebP cover image."); return; }
    if (file.size > 5 * 1024 * 1024) { setNotice("Your cover image must be 5 MB or smaller."); return; }
    const source = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { setCoverCropFile(file); setCoverCropImage(image); setCoverCropSource(source); setCoverCropZoom(1); setCoverCropOffset({ x: 0, y: 0 }); setNotice(""); };
    image.onerror = () => { URL.revokeObjectURL(source); setNotice("That cover image could not be opened. Please choose another file."); };
    image.src = source;
  }

  function closeCoverCropper() {
    if (coverCropSource) URL.revokeObjectURL(coverCropSource);
    setCoverCropSource(""); setCoverCropImage(null); setCoverCropFile(null); setCoverCropZoom(1); setCoverCropOffset({ x: 0, y: 0 }); setCoverCropDragging(false); coverCropDragStart.current = null;
  }

  async function saveCroppedCover() {
    if (!coverCropImage || !coverCropFile || coverUploading) return;
    const outputWidth = 1600, outputHeight = 500, stageWidth = 480, stageHeight = 150;
    const baseScale = Math.max(outputWidth / coverCropImage.naturalWidth, outputHeight / coverCropImage.naturalHeight);
    const drawWidth = coverCropImage.naturalWidth * baseScale * coverCropZoom;
    const drawHeight = coverCropImage.naturalHeight * baseScale * coverCropZoom;
    const scaleFactor = outputWidth / stageWidth;
    const canvas = document.createElement("canvas"); canvas.width = outputWidth; canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) return setNotice("Your browser could not prepare this cover image. Please try again.");
    context.imageSmoothingQuality = "high";
    context.drawImage(coverCropImage, (outputWidth-drawWidth)/2 + coverCropOffset.x*scaleFactor, (outputHeight-drawHeight)/2 + coverCropOffset.y*scaleFactor, drawWidth, drawHeight);
    setCoverUploading(true); setNotice("");
    let uploadedPath = "";
    try {
      const blob = await new Promise<Blob>((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(new Error("The cover image could not be prepared.")),"image/jpeg",0.92));
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in again before changing your cover image.");
      uploadedPath = `${user.id}/covers/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(uploadedPath,blob,{contentType:"image/jpeg",cacheControl:"3600",upsert:false});
      if (uploadError) throw new Error(uploadError.message);
      const { data: publicFile } = supabase.storage.from("avatars").getPublicUrl(uploadedPath);
      const { data,error } = await supabase.from("profiles").update({cover_image_url:publicFile.publicUrl,updated_at:new Date().toISOString()}).eq("id",user.id).select("*").single();
      if (error) throw new Error(error.message);
      setProfile(data as Profile); setNotice("Your cover banner has been updated."); closeCoverCropper();
    } catch(error) {
      if (uploadedPath) await supabase.storage.from("avatars").remove([uploadedPath]);
      setNotice(error instanceof Error ? error.message : "Your cover banner could not be saved.");
    } finally { setCoverUploading(false); }
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
      availability_status: profileForm.availability_status,
      services_offered: profileForm.services_offered.trim() || null,
      looking_for: profileForm.looking_for.trim() || null,
      collaboration_interests: profileForm.collaboration_interests,
      preferred_project_types: profileForm.preferred_project_types,
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
  const profileCompletionFields = [profileForm.display_name, profileForm.primary_niche, profileForm.bio, profileForm.skills, profileForm.website_url, profileForm.work_platforms.length ? "yes" : "", profile?.avatar_url || "", profileForm.services_offered, profileForm.looking_for, profileForm.collaboration_interests.length ? "yes" : ""];
  const profileCompletion = Math.round(profileCompletionFields.filter((value) => Boolean(String(value).trim())).length / profileCompletionFields.length * 100);
  const activeGigs = gigs.filter((gig) => gig.status === "active").length;
  const clickThroughRate = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;
  const revenueByCurrency = performance.reduce((groups, entry) => { groups[entry.currency] = (groups[entry.currency] || 0) + Number(entry.revenue || 0); return groups; }, {} as Record<string, number>);
  const revenueDisplay = Object.entries(revenueByCurrency).length ? Object.entries(revenueByCurrency).map(([currency, amount]) => `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`).join(" · ") : "—";
  const initials = (profileForm.display_name || userEmail || "FG").split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FG";

  function go(next: Section) { setSection(next); setMobileOpen(false); setNotice(""); }

  return <main className="workspace-shell min-h-screen bg-[#f7f8f7] text-[#222325]">
    <aside aria-label="Quick navigation rail" className="workspace-quick-rail fixed inset-y-0 left-0 z-30 hidden w-[68px] flex-col items-center border-r border-[#29322C] bg-[#111512] py-4 lg:flex">
      <button onClick={()=>setSidebarCollapsed(false)} aria-label="Open navigation" title="Open navigation" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#354139] bg-[#1B241E] text-[#E7EFE9] transition hover:border-[#D7F36A] hover:bg-[#26342A]"><Menu size={19}/></button>
      <button onClick={()=>go("Overview")} title="MILE overview" className="mt-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D7F36A] text-[#142019]"><TrendingUp size={19}/></button>
      <div className="mt-5 flex flex-1 flex-col items-center gap-2">
        {navigationGroups.flatMap(group=>group.items).slice(0,6).map(item=>{const Icon=item.icon;return <button key={item.label} onClick={()=>go(item.label)} title={item.label} aria-label={item.label} className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${section===item.label?"bg-[#D7F36A] text-[#111512]":"text-[#B8C3BA] hover:bg-[#202A23] hover:text-white"}`}><Icon size={18}/></button>})}
      </div>
      <button onClick={()=>go("Profile")} title="Profile and settings" aria-label="Open profile and settings" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#435047] bg-[#26342A] text-xs font-bold text-[#E4EEE6] transition hover:border-[#D7F36A]">
        {profile?.avatar_url ? <img src={profile.avatar_url} alt={profileForm.display_name || "Your profile photo"} className="h-full w-full object-cover" /> : initials}
      </button>
    </aside>
    {(!sidebarCollapsed || mobileOpen) && <button aria-label="Close navigation panel" onClick={()=>{setSidebarCollapsed(true);setMobileOpen(false)}} className="fixed inset-0 z-30 bg-[#080B09]/45 backdrop-blur-[1px]"/>}
<aside style={{ width: 280 }} className={`workspace-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#29322C] bg-[#111512] px-3 py-5 transition-transform duration-200 ease-out ${(!sidebarCollapsed || mobileOpen) ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-7 flex min-h-11 items-center justify-between px-1">
        <button onClick={()=>go("Overview")} className="flex min-w-0 items-center gap-3 rounded-lg text-left" aria-label="MILE home">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D7F36A] text-[#142019]"><TrendingUp size={21} strokeWidth={2.4}/></span>
          <span className="min-w-0"><span className="block text-[17px] font-black tracking-[.12em] text-white">MILE</span><span className="mt-0.5 block whitespace-nowrap text-[8px] font-bold tracking-[.17em] text-[#B8C3BA]">EVERY STEP HAS A PURPOSE</span></span>
        </button>
        <div className="ml-2 flex items-center">
          <button onClick={()=>setSidebarCollapsed(true)} className="hidden h-8 w-8 items-center justify-center rounded-lg border border-[#354139] bg-[#1B241E] text-[#C5D0C8] transition hover:border-[#73866F] hover:bg-[#26342A] lg:flex" aria-label="Close navigation panel" title="Close navigation panel"><Menu size={15}/></button>
          <button onClick={()=>setMobileOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#C5D0C8] hover:bg-[#26342A] lg:hidden" aria-label="Close navigation"><X size={18}/></button>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-[#303C33] bg-[#1A241D] px-3.5 py-3"><p className="text-[9px] font-extrabold uppercase tracking-[.15em] text-[#A7B6AA]">Your workspace</p><p className="mt-1 text-[12px] font-semibold text-white">Make your next move.</p></div>

      <nav aria-label="Main navigation" className="workspace-nav-scroll min-h-0 flex-1 space-y-6 overflow-y-auto pb-3">
        {navigationGroups.map(group=><div key={group.title}>
          <p className="mb-2.5 px-3 text-[9px] font-extrabold uppercase tracking-[.16em] text-[#87958A]">{group.title}</p>
          <div className="space-y-1">{group.items.map(item=>{const Icon=item.icon;const active=section===item.label;return <button key={item.label} title={undefined} aria-label={item.label} aria-current={active?"page":undefined} onClick={()=>go(item.label)} className={`mile-sidebar-link group relative flex min-h-[43px] w-full items-center gap-3 px-3 rounded-lg text-left text-[12px] font-semibold transition-colors duration-150 ${active?"mile-sidebar-active text-[#111512]":"text-[#C1CCC3] hover:bg-[#202A23] hover:text-white"}`}><Icon size={17} strokeWidth={1.9} className={active?"text-[#111512]":"text-[#B8C3BA] group-hover:text-white"}/><><span className="min-w-0 flex-1">{item.label}</span>{item.label==="AI Growth Coach"&&<span className="rounded-md border border-[#D7F36A] bg-[#D7F36A] px-1.5 py-0.5 text-[9px] font-extrabold text-[#111512]">AI</span>}</></button>})}</div>
        </div>)}
        <div className="border-t border-[#303B33] pt-4">
          <p className="mb-2.5 px-3 text-[9px] font-extrabold uppercase tracking-[.16em] text-[#87958A]">Your network</p>
          {[{label:"Messages",href:"/messages",icon:MessageCircle},{label:"Opportunities",href:"/community/jobs",icon:Handshake},{label:"Notifications",href:"/community/notifications",icon:Bell}].map(item=>{const Icon=item.icon;return <a key={item.label} href={item.href} title={sidebarCollapsed?item.label:undefined} className={`mile-sidebar-link flex min-h-[43px] items-center gap-3 px-3 rounded-lg text-[12px] font-semibold text-[#C1CCC3] transition-colors hover:bg-[#202A23] hover:text-white`}><Icon size={17} strokeWidth={1.9} className="text-[#B8C3BA]"/>{item.label}</a>})}
        </div>
      </nav>

      <div className="mt-4 space-y-2 border-t border-[#303B33] pt-4">
        <div className="rounded-xl border border-[#39472F] bg-[#202C21] p-3.5"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D7F36A] text-[#17231A]"><Lightbulb size={15}/></span><p className="text-[11px] font-bold text-white">Grow with clarity</p></div><p className="mt-2 text-[10px] leading-[1.6] text-[#C0CDC2]">Understand your numbers. Improve your offer. Make deliberate moves.</p></div>
        <button onClick={()=>go("Profile")} title="Profile & settings" className={`flex min-h-[42px] w-full items-center ${sidebarCollapsed?"justify-center":"gap-3 px-3"} rounded-lg text-[12px] font-semibold text-[#C1CCC3] transition hover:bg-[#202A23] hover:text-white`}><UserRound size={17}/>Profile & settings</button>
        <form action={signOut}><button type="submit" title="Log out" className={`flex min-h-[42px] w-full items-center ${sidebarCollapsed?"justify-center":"gap-3 px-3"} rounded-lg text-[12px] font-semibold text-[#AEB9B0] transition hover:bg-[#342322] hover:text-white`}><LogOut size={17}/>Log out</button></form>
      </div>
    </aside>
    <section className="workspace-main min-h-screen lg:pl-[68px]">
      <header className="workspace-topbar sticky top-0 z-20 border-b border-[#e9ece9] bg-white/95 backdrop-blur">
        <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-[#f3f5f3] lg:hidden" aria-label="Open navigation"><Menu size={20}/></button><div className="min-w-0"><p className="hidden text-[10px] font-semibold uppercase tracking-[.12em] text-[#929992] sm:block">MILE workspace</p><h1 className="truncate text-lg font-bold tracking-tight text-[#202820]">{section}</h1></div></div>
          <form onSubmit={event=>{event.preventDefault();go("Community");}} role="search" className="hidden min-w-[220px] max-w-[680px] flex-1 items-center md:flex">
            <div className="group relative flex h-12 w-full items-center overflow-hidden rounded-full border border-[#d9e2da] bg-[#f7f9f7] shadow-[0_2px_8px_rgba(22,48,30,.04)] transition-all duration-200 focus-within:border-[#168B56] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,139,86,.09)] hover:border-[#b8cdbb]">
              <div className="flex h-full shrink-0 items-center gap-2 border-r border-[#e3e9e3] px-4 text-[12px] font-semibold text-[#3e4b41]"><Search size={16} className="text-[#25215C]"/> <span>Search MILE</span></div>
              <input value={headerSearch} onChange={event=>setHeaderSearch(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"){event.preventDefault();go("Community");}}} aria-label="Search freelancers, skills and opportunities" placeholder="Freelancers, skills, services, opportunities..." className="h-full min-w-0 flex-1 bg-transparent py-0 pl-4 pr-3 text-[13px] text-[#263329] outline-none placeholder:text-[#89948b]"/>
              <button type="submit" aria-label="Search MILE" className="flex h-full w-14 shrink-0 items-center justify-center rounded-none rounded-r-full border-l border-[#076c3b] bg-[#087A43] text-white transition hover:bg-[#075f35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"><Search size={18}/></button>
            </div>
          </form>
          <div className="flex shrink-0 items-center gap-1.5"><button onClick={()=>go("Community")} title="Find freelancers" aria-label="Find freelancers" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#555d56] hover:bg-[#f4f7f4] hover:text-[#087a35] md:hidden"><Search size={18}/></button><a href="/messages" title="Messages" aria-label="Messages" className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#555d56] hover:bg-[#f4f7f4] hover:text-[#087a35]"><Inbox size={18}/></a><a href="/community/notifications" title="Notifications" aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#555d56] hover:bg-[#f4f7f4] hover:text-[#087a35]"><Bell size={18}/></a><span className="mx-1 hidden h-7 border-l border-[#e8ece8] sm:block"/><button onClick={()=>go("Profile")} className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-[#f4f7f4]"><span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#202820] text-[11px] font-bold text-white">{profile?.avatar_url?<img src={profile.avatar_url} alt="Your profile" className="h-full w-full object-cover"/>:initials}</span><span className="hidden max-w-[130px] lg:block"><span className="block truncate text-xs font-semibold text-[#303a32]">{profileForm.display_name||"Your profile"}</span><span className="block truncate text-[10px] text-[#929992]">{userEmail}</span></span></button><form action={signOut} className="hidden xl:block"><button type="submit" title="Log out" className="ml-1 flex h-9 items-center gap-2 rounded-lg border border-[#e5e9e5] px-3 text-[11px] font-semibold text-[#555d56] hover:bg-[#f5f7f5]"><LogOut size={14}/>Log out</button></form></div>
        </div>
        <div className="px-4 pb-3 md:hidden"><button onClick={()=>go("Community")} className="flex h-10 w-full items-center gap-2 rounded-lg border border-[#e5e9e5] bg-[#f8faf8] px-3 text-xs text-[#929992]"><Search size={15}/>Find freelancers, skills and collaborators</button></div>
      </header>
      <div className="workspace-content mx-auto max-w-[1760px] px-4 py-6 sm:px-6 md:px-8 md:py-8 2xl:px-10">
        {notice && <div role="status" className="mb-5 rounded-lg border border-[#d8eadf] bg-[#f0faf3] px-4 py-3 text-xs text-[#246642]">{notice}</div>}
        {loading ? <div className="py-24 text-center text-sm text-[#777d77]">Loading your workspace…</div> : <>
          {section === "Community" && <CommunityFeed /> }
          {section === "Overview" && <div className="mile-overview space-y-7">
            <section className="mile-welcome relative overflow-hidden rounded-[22px] bg-[#123D2B] text-white">
              <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[42px] border-white/[.045]"/>
              <div className="pointer-events-none absolute right-28 top-24 h-40 w-40 rounded-full bg-[#D7F36A]/10 blur-3xl"/>
              <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-end lg:p-10">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.08] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#E5F2E9]"><span className="h-2 w-2 rounded-full bg-[#D7F36A]"/> YOUR FREELANCE HQ</div>
                  <h2 className="mt-5 text-3xl font-bold leading-[1.08] tracking-[-.045em] text-white sm:text-4xl lg:text-[46px]">Make your next move count{profileForm.display_name ? `, ${profileForm.display_name.split(" ")[0]}` : ""}.</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#D3E2D8] sm:text-[15px]">Your work, your network and your next opportunity come together here. Pick up where you left off and keep moving forward.</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button onClick={()=>go("Community")} className="inline-flex items-center gap-2 rounded-lg bg-[#D7F36A] px-4 py-3 text-xs font-extrabold text-[#183522] transition hover:bg-[#E5FA91]"><Search size={15}/> Discover people</button>
                    <a href="/community/jobs" className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/[.06] px-4 py-3 text-xs font-bold text-white transition hover:bg-white/[.12]"><Compass size={15}/> Explore opportunities</a>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-[#204D39] p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-white">Your profile strength</p><p className="mt-1 text-[11px] leading-5 text-[#C6D9CC]">A stronger profile makes better introductions possible.</p></div><span className="rounded-lg bg-[#D7F36A] px-2.5 py-1.5 text-sm font-extrabold text-[#183522]">{profileCompletion}%</span></div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#102F21]"><div className="h-full rounded-full bg-[#D7F36A] transition-all" style={{width:profileCompletion+"%"}}/></div>
                  <button onClick={()=>go("Profile")} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#E4F0E7] hover:text-[#25215C]">Complete your profile <ArrowUpRight size={14}/></button>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#68756B]">At a glance</p><h3 className="mt-1 text-lg font-bold tracking-tight text-[#202722]">Your business snapshot</h3></div><button onClick={()=>go("Performance")} className="text-xs font-bold text-[#25215C] hover:text-[#065F35]">View insights <ArrowUpRight className="ml-1 inline" size={14}/></button></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[{label:"Active services",value:activeGigs.toString(),detail:`${gigs.length} saved in total`,icon:BriefcaseBusiness,action:()=>go("My Gigs"),tone:"green"},{label:"Impressions",value:totals.impressions.toLocaleString(),detail:"Across your saved snapshots",icon:Activity,action:()=>go("Performance"),tone:"white"},{label:"Click-through rate",value:clickThroughRate.toFixed(1)+"%",detail:`${totals.clicks.toLocaleString()} recorded clicks`,icon:ArrowUpRight,action:()=>go("Performance"),tone:"yellow"},{label:"Orders recorded",value:totals.orders.toLocaleString(),detail:"From your saved snapshots",icon:TrendingUp,action:()=>go("Performance"),tone:"ink"}].map(item=>{const Icon=item.icon;return <button key={item.label} onClick={item.action} className={`mile-stat mile-stat-${item.tone} group rounded-2xl p-5 text-left transition duration-200 hover:-translate-y-0.5`}><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold">{item.label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl"><Icon size={17}/></span></div><p className="mt-5 text-[30px] font-extrabold tracking-[-.04em]">{item.value}</p><div className="mt-1 flex items-center justify-between gap-2"><span className="text-[11px]">{item.detail}</span><ArrowUpRight size={14} className="shrink-0 opacity-0 transition group-hover:opacity-100"/></div></button>})}
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
              <div className="mile-panel rounded-2xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#68756B]">What you're offering</p><h3 className="mt-1 text-lg font-bold text-[#202722]">Your services</h3><p className="mt-1 text-xs text-[#59665D]">Keep your offers organised and ready to improve.</p></div><button onClick={()=>go("My Gigs")} className="shrink-0 rounded-lg border border-[#C9D5CC] bg-white px-3 py-2 text-xs font-bold text-[#174C32] hover:bg-[#F2F8F3]">Manage all <ArrowUpRight className="ml-1 inline" size={13}/></button></div>
                {gigs.length ? <div className="mt-4 divide-y divide-[#E4EAE5]">{gigs.slice(0,4).map(gig=><div key={gig.id} className="flex items-center gap-3 py-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F3E9] text-[#25215C]"><BriefcaseBusiness size={17}/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#202722]">{gig.title}</p><p className="mt-1 text-xs text-[#59665D]">{gig.category||"Service"} · {gig.tags.length} tags</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${gig.status==="active"?"bg-[#E3F4E8] text-[#25215C]":gig.status==="paused"?"bg-[#EEF0ED] text-[#4F5A51]":"bg-[#FFF1D1] text-[#79500B]"}`}>{gig.status}</span><button onClick={()=>{setAnalysisGig(gig.id);setAnalysisText({title:gig.title,description:gig.description,tags:gig.tags.join(", ")});go("Gig Analyzer")}} className="rounded-lg border border-[#C9D5CC] px-3 py-2 text-[11px] font-bold text-[#34463A] hover:bg-[#F4F8F4]">Review</button></div>)}</div> : <div className="mt-5 rounded-xl border border-dashed border-[#BACABD] bg-[#F7FAF7] px-5 py-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4F2E7] text-[#25215C]"><BriefcaseBusiness size={22}/></div><p className="mt-3 text-sm font-bold text-[#202722]">Your services start here</p><p className="mx-auto mt-1 max-w-sm text-xs leading-6 text-[#59665D]">Save the services you offer on Fiverr or other platforms to organise and review them in MILE.</p><button onClick={()=>go("My Gigs")} className="mt-4 rounded-lg bg-[#087A43] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#066536]">Add your first service</button></div>}
              </div>
              <div className="mile-panel rounded-2xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#68756B]">Keep the momentum</p><h3 className="mt-1 text-lg font-bold text-[#202722]">Your next steps</h3><p className="mt-1 text-xs text-[#59665D]">A few focused actions to move forward.</p></div><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F3E9] text-[#25215C]"><ShieldCheck size={19}/></span></div>
                <div className="mt-4 space-y-1">{tasks.slice(0,5).map((task,index)=><label key={task.id} className="flex cursor-pointer items-start gap-3 rounded-xl px-2.5 py-3 transition hover:bg-[#F3F7F3]"><input type="checkbox" checked={task.status==="completed"} onChange={()=>toggleTask(task)} className="mt-0.5 h-4 w-4 accent-[#087A43]"/><span className={task.status==="completed"?"text-xs leading-5 text-[#69766D] line-through":"text-xs font-semibold leading-5 text-[#344238]"}>{task.title}</span></label>)}</div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E6ECE7]"><div className="h-full rounded-full bg-[#087A43]" style={{width:(tasks.length?completedTasks/tasks.length*100:0)+"%"}}/></div><div className="mt-2 flex justify-between text-[11px] text-[#59665D]"><span>{completedTasks} of {tasks.length} completed</span><button onClick={()=>go("Growth Plan")} className="font-bold text-[#25215C]">View plan</button></div>
              </div>
            </section>

            <section>
              <div className="mb-3"><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#68756B]">Your next move</p><h3 className="mt-1 text-lg font-bold text-[#202722]">Make something happen</h3></div>
              <div className="grid gap-3 md:grid-cols-3">
                <button onClick={()=>go("Community")} className="mile-action-card group rounded-2xl p-5 text-left transition hover:-translate-y-0.5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDF1E2] text-[#25215C]"><Users size={20}/></span><h3 className="mt-4 text-sm font-extrabold text-[#202722]">Meet your next collaborator</h3><p className="mt-2 text-xs leading-6 text-[#59665D]">Find freelancers with complementary skills and different perspectives.</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-[#25215C]">Explore the community <ArrowUpRight size={14}/></span></button>
                <a href="/community/jobs" className="mile-action-card group rounded-2xl p-5 transition hover:-translate-y-0.5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0C7] text-[#79500B]"><Compass size={20}/></span><h3 className="mt-4 text-sm font-extrabold text-[#202722]">Find an opportunity</h3><p className="mt-2 text-xs leading-6 text-[#59665D]">Explore projects, referrals and collaboration opportunities shared by the network.</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-[#25215C]">Browse opportunities <ArrowUpRight size={14}/></span></a>
                <a href="/messages" className="mile-action-card group rounded-2xl p-5 transition hover:-translate-y-0.5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EAF8] text-[#454B87]"><MessageCircle size={20}/></span><h3 className="mt-4 text-sm font-extrabold text-[#202722]">Continue a conversation</h3><p className="mt-2 text-xs leading-6 text-[#59665D]">Keep your connections moving with direct conversations.</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-[#25215C]">Open messages <ArrowUpRight size={14}/></span></a>
              </div>
            </section>
          </div>}

          {section === "Profile" && <><div className="mb-7"><p className="text-xs font-bold text-[#25215C]">YOUR ACCOUNT</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Seller profile</h2><p className="mt-2 text-sm text-[#777d77]">Keep your details up to date. Your profile helps us tailor future guidance.</p></div><div className="max-w-5xl rounded-2xl border border-[#e9ece9] bg-white p-5 shadow-sm md:p-8"><div className="mb-6 rounded-xl bg-[#f5faf6] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#27352b]">Profile strength</p><p className="mt-1 text-[11px] text-[#78847a]">A complete profile helps other freelancers understand your work.</p></div><strong className="text-xl text-[#00851e]">{profileCompletion}%</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e2ebe3]"><div className="h-full rounded-full bg-[#00A525] transition-all" style={{width:profileCompletion+"%"}}/></div></div><div className="mb-8 overflow-hidden rounded-2xl border border-[#e3e7f0] bg-[#111318]">
              <div className="relative h-[112px] sm:h-[150px]">
                {profile?.cover_image_url ? <img src={profile.cover_image_url} alt="Your profile cover banner" className="h-full w-full object-cover"/> : <div className="relative flex h-full items-center justify-between overflow-hidden px-5 sm:px-8"><div className="relative z-10"><p className="text-[9px] font-bold tracking-[.2em] text-[#D7F36A]">MILE MEMBER PROFILE</p><p className="mt-2 text-sm font-extrabold tracking-[.12em] text-white sm:text-base">EVERY STEP HAS A PURPOSE</p></div><div className="absolute -right-5 -top-16 h-52 w-52 rounded-full border-[22px] border-white/[.06]"/><div className="absolute right-24 -bottom-24 h-48 w-48 rounded-full border border-[#D7F36A]/20"/></div>}
                <label title="Change cover banner" aria-label="Change cover banner" className="absolute bottom-3 right-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#111318] bg-[#D7F36A] text-[#111318] shadow-lg transition hover:bg-[#e5ff8a]">{coverUploading?<LoaderCircle size={16} className="animate-spin"/>:<Camera size={16}/>}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={coverUploading} onChange={uploadCover}/></label>
              </div>
              <div className="flex items-center justify-between gap-3 bg-[#171A20] px-4 py-2.5"><p className="text-[10px] font-semibold text-[#C3C6CE]">Profile cover · JPG, PNG or WebP · up to 5 MB</p><span className="text-[9px] font-bold tracking-wide text-[#D7F36A]">1600 × 500</span></div>
            </div>
            <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-[#e3ebe5] bg-[#f8fbf8] p-5 sm:flex-row sm:items-center sm:p-7">
              <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36"><div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-[#eaf8ef] text-3xl font-bold text-[#25215C] shadow-[0_8px_26px_rgba(24,52,34,.13)]">{profile?.avatar_url ? <img src={profile.avatar_url} alt="Your profile picture" className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center">{initials}</div>}</div><span className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-[3px] border-white shadow-sm ${ownOnline?"bg-[#D7F36A]":"bg-[#aab4ad]"}`} title={ownOnline?"Online now":"Offline"} aria-label={ownOnline?"Online now":"Offline"}/><label title="Change profile photo" aria-label="Change profile photo" className="absolute bottom-1 left-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#D7F36A] text-[#111512] shadow-md transition hover:bg-[#e2ff7b]">{avatarUploading?<LoaderCircle size={15} className="animate-spin"/>:<UserRound size={15}/>}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={avatarUploading} onChange={uploadAvatar}/></label></div>
              <div className="min-w-0 flex-1"><p className="text-lg font-extrabold tracking-tight text-[#202722]">{profileForm.display_name || "Your name"}</p><p className="mt-1 text-sm text-[#78847a]">{userEmail}</p><p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#526258]"><span className={`h-2 w-2 rounded-full ${ownOnline?"bg-[#D7F36A]":"bg-[#aab4ad]"}`}/>{ownOnline?"Online now":"Currently offline"}</p><div className="mt-4 flex items-center gap-3"><span className="text-[11px] text-[#78847a]">JPG, PNG or WebP · up to 5 MB</span></div></div>
            </div><div className="grid gap-4 sm:grid-cols-2">
              {[{label:"Full name",key:"display_name",placeholder:"Your name"},{label:"Primary niche",key:"primary_niche",placeholder:"e.g. Brand identity design"},{label:"Portfolio / website",key:"website_url",placeholder:"https://yourportfolio.com"},{label:"Upwork profile link",key:"upwork_profile_url",placeholder:"https://www.upwork.com/freelancers/..."},{label:"LinkedIn profile",key:"linkedin_url",placeholder:"https://www.linkedin.com/in/..."},{label:"Other work profile",key:"other_work_url",placeholder:"https://..."},{label:"Skills / services",key:"skills",placeholder:"Brand identity, logo design, packaging"}].map((field)=> <label key={field.key} className="block"><span className="mb-2 block text-xs font-semibold">{field.label}</span><input className="w-full rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm[field.key as "display_name" | "primary_niche" | "website_url" | "upwork_profile_url" | "linkedin_url" | "other_work_url" | "skills"]} placeholder={field.placeholder} onChange={(event)=>setProfileForm((old)=>({...old,[field.key]:event.target.value}))}/></label>)}
              <div className="sm:col-span-2"><p className="mb-3 text-xs font-semibold">Where do you work?</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{["Fiverr","Upwork","Freelancer.com","Contra","Direct clients","Other"].map((platform)=><label key={platform} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-xs font-medium transition ${profileForm.work_platforms.includes(platform)?"border-[#00A525] bg-[#f0faf2] text-[#087a27]":"border-[#e1e7e1] bg-white text-[#59635b]"}`}><input type="checkbox" checked={profileForm.work_platforms.includes(platform)} onChange={(event)=>setProfileForm((old)=>({...old,work_platforms:event.target.checked?[...old.work_platforms,platform]:old.work_platforms.filter((item)=>item!==platform)}))} className="h-3.5 w-3.5 accent-[#00A525]"/>{platform}</label>)}</div><p className="mt-2 text-[10px] text-[#929992]">Choose every platform you currently use. MILE supports independent work across different channels.</p></div>{profileForm.work_platforms.includes("Fiverr") && <><label className="block"><span className="mb-2 block text-xs font-semibold">Fiverr username</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.fiverr_username} placeholder="Your Fiverr username" onChange={(event)=>setProfileForm((old)=>({...old,fiverr_username:event.target.value}))}/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Fiverr profile link</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.fiverr_profile_url} placeholder="https://www.fiverr.com/yourusername" onChange={(event)=>setProfileForm((old)=>({...old,fiverr_profile_url:event.target.value}))}/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Fiverr seller level</span><select className="w-full rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.seller_level} onChange={(event)=>setProfileForm((old)=>({...old,seller_level:event.target.value}))}><option value="">Select your level</option><option value="New Seller">New Seller</option><option value="Level 1">Level 1</option><option value="Level 2">Level 2</option><option value="Top Rated Seller">Top Rated Seller</option><option value="Pro">Pro</option></select></label></>}
              <label className="block"><span className="mb-2 block text-xs font-semibold">Years of experience</span><input type="number" min="0" max="60" className="w-full rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.experience_years} placeholder="e.g. 2" onChange={(event)=>setProfileForm((old)=>({...old,experience_years:event.target.value}))}/></label>
              <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-semibold">About you</span><textarea maxLength={1000} rows={4} className="w-full resize-y rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.bio} placeholder="Describe your experience, approach and the value you bring to buyers." onChange={(event)=>setProfileForm((old)=>({...old,bio:event.target.value}))}/><span className="mt-1 block text-right text-[10px] text-[#929992]">{profileForm.bio.length}/1000</span></label>
              <div className="sm:col-span-2 mt-3 border-t border-[#edf0ed] pt-5"><p className="text-sm font-extrabold text-[#303a32]">Make your profile collaboration-ready</p><p className="mt-1 text-xs leading-5 text-[#78847a]">Show other freelancers what you bring to a team and the connections you want to make.</p></div>
<label className="block"><span className="mb-2 block text-xs font-semibold">Availability for new work</span><select className="w-full rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm" value={profileForm.availability_status} onChange={(event)=>setProfileForm((old)=>({...old,availability_status:event.target.value as "open" | "limited" | "unavailable"}))}><option value="open">Open to opportunities</option><option value="limited">Limited availability</option><option value="unavailable">Not available right now</option></select></label>
<label className="block"><span className="mb-2 block text-xs font-semibold">Services you can contribute</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm" value={profileForm.services_offered} onChange={(event)=>setProfileForm((old)=>({...old,services_offered:event.target.value}))} placeholder="e.g. Brand identity, web design, copywriting"/></label>
<label className="block sm:col-span-2"><span className="mb-2 block text-xs font-semibold">What are you looking for?</span><textarea maxLength={500} rows={2} className="w-full resize-y rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm" value={profileForm.looking_for} onChange={(event)=>setProfileForm((old)=>({...old,looking_for:event.target.value}))} placeholder="e.g. A reliable web developer to collaborate on client projects."/></label>
<div className="sm:col-span-2"><p className="mb-2 text-xs font-semibold">Collaboration interests</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{["Project collaboration","Referrals","Building a team","Co-delivery","Mentorship","Skill exchange"].map((item)=><label key={item} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-xs ${profileForm.collaboration_interests.includes(item)?"border-[#00A525] bg-[#f0faf2] text-[#087a27]":"border-[#e1e7e1] bg-white text-[#59635b]"}`}><input type="checkbox" checked={profileForm.collaboration_interests.includes(item)} onChange={(event)=>setProfileForm((old)=>({...old,collaboration_interests:event.target.checked?[...old.collaboration_interests,item]:old.collaboration_interests.filter(value=>value!==item)}))} className="h-3.5 w-3.5 accent-[#00A525]"/>{item}</label>)}</div></div>
<div className="sm:col-span-2"><p className="mb-2 text-xs font-semibold">Project types you're interested in</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{["Client projects","Startup projects","Agency partnerships","Long-term contracts","One-off projects","Community projects"].map((item)=><label key={item} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-xs ${profileForm.preferred_project_types.includes(item)?"border-[#00A525] bg-[#f0faf2] text-[#087a27]":"border-[#e1e7e1] bg-white text-[#59635b]"}`}><input type="checkbox" checked={profileForm.preferred_project_types.includes(item)} onChange={(event)=>setProfileForm((old)=>({...old,preferred_project_types:event.target.checked?[...old.preferred_project_types,item]:old.preferred_project_types.filter(value=>value!==item)}))} className="h-3.5 w-3.5 accent-[#00A525]"/>{item}</label>)}</div></div><label className="block sm:col-span-2"><span className="mb-2 block text-xs font-semibold">Who do you help?</span><textarea maxLength={500} rows={2} className="w-full resize-y rounded-lg border border-[#dfe5e9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={profileForm.ideal_client} placeholder="e.g. Startups and small businesses building a distinctive brand." onChange={(event)=>setProfileForm((old)=>({...old,ideal_client:event.target.value}))}/></label>
              <div className="sm:col-span-2 rounded-xl border border-[#e5eae6] bg-[#f8fbf8] p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={profileForm.community_discoverable} onChange={(event)=>setProfileForm((old)=>({...old,community_discoverable:event.target.checked}))} className="mt-1 h-4 w-4 accent-[#1DBF73]"/>
                  <span><span className="block text-xs font-bold text-[#343b35]">Make my profile discoverable in the freelancer community</span><span className="mt-1 block text-[11px] leading-5 text-[#777d77]">When the community launches, other members may find your public professional profile. Your email address and private account details will not be displayed.</span></span>
                </label>
              </div>
            </div><button onClick={saveProfile} disabled={saving} className="mt-6 rounded-lg bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{saving?"Saving…":"Save profile"}</button></div>{cropImage && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101712]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="avatar-crop-title"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h3 id="avatar-crop-title" className="text-lg font-extrabold text-[#202722]">Adjust your profile photo</h3><p className="mt-1 text-xs leading-5 text-[#78847a]">Drag to reposition. Use the slider to zoom in or out.</p></div><button type="button" onClick={closeAvatarCropper} disabled={avatarUploading} className="rounded-lg p-2 text-[#68756b] hover:bg-[#f1f5f1]" aria-label="Close crop editor"><X size={18}/></button></div><div className="relative mx-auto mt-5 h-[280px] w-[280px] max-w-full touch-none overflow-hidden rounded-full bg-[#e8eee9] ring-1 ring-[#dce5de]" onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);cropDragStart.current={x:event.clientX,y:event.clientY,offsetX:cropOffset.x,offsetY:cropOffset.y};setCropDragging(true);}} onPointerMove={event=>{if(!cropDragStart.current)return;setCropOffset({x:cropDragStart.current.offsetX+event.clientX-cropDragStart.current.x,y:cropDragStart.current.offsetY+event.clientY-cropDragStart.current.y});}} onPointerUp={()=>{cropDragStart.current=null;setCropDragging(false);}} onPointerCancel={()=>{cropDragStart.current=null;setCropDragging(false);}}><img src={cropSource} alt="Crop preview" draggable={false} className={`absolute left-1/2 top-1/2 max-w-none select-none ${cropDragging?"cursor-grabbing":"cursor-grab"}`} style={{width: "100%", height: "100%", objectFit: "cover", transformOrigin: "center", transform:`translate(-50%, -50%) translate(${cropOffset.x}px,${cropOffset.y}px) scale(${cropZoom})`}}/></div><div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#465249]"><label htmlFor="avatar-zoom">Zoom</label><span>{Math.round(cropZoom*100)}%</span></div><input id="avatar-zoom" type="range" min="1" max="3" step="0.01" value={cropZoom} onChange={event=>setCropZoom(Number(event.target.value))} className="w-full accent-[#087A43]"/></div><p className="mt-2 text-[10px] text-[#929992]">The circular frame shows how your photo will appear. It will be saved as a square image.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={closeAvatarCropper} disabled={avatarUploading} className="rounded-lg border border-[#dfe7e1] px-4 py-2.5 text-xs font-bold text-[#526258]">Cancel</button><button type="button" onClick={saveCroppedAvatar} disabled={avatarUploading} className="rounded-lg bg-[#087A43] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{avatarUploading?"Saving…":"Save photo"}</button></div></div></div>}
            {coverCropImage && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#101712]/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cover-crop-title"><div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h3 id="cover-crop-title" className="text-lg font-extrabold text-[#202722]">Adjust your cover banner</h3><p className="mt-1 text-xs leading-5 text-[#78847a]">Drag the image to position it. Use the slider to zoom.</p></div><button type="button" onClick={closeCoverCropper} disabled={coverUploading} className="rounded-lg p-2 text-[#68756b] hover:bg-[#f1f5f1]" aria-label="Close cover editor"><X size={18}/></button></div><div className="relative mx-auto mt-5 aspect-[16/5] w-full max-w-[480px] touch-none overflow-hidden rounded-xl bg-[#e8eee9] ring-1 ring-[#dce5de]" onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);coverCropDragStart.current={x:event.clientX,y:event.clientY,offsetX:coverCropOffset.x,offsetY:coverCropOffset.y};setCoverCropDragging(true);}} onPointerMove={event=>{if(!coverCropDragStart.current)return;setCoverCropOffset({x:coverCropDragStart.current.offsetX+event.clientX-coverCropDragStart.current.x,y:coverCropDragStart.current.offsetY+event.clientY-coverCropDragStart.current.y});}} onPointerUp={()=>{coverCropDragStart.current=null;setCoverCropDragging(false);}} onPointerCancel={()=>{coverCropDragStart.current=null;setCoverCropDragging(false);}}><img src={coverCropSource} alt="Cover banner crop preview" draggable={false} className={`absolute left-1/2 top-1/2 max-w-none select-none ${coverCropDragging?"cursor-grabbing":"cursor-grab"}`} style={{width:"100%",height:"100%",objectFit:"cover",transformOrigin:"center",transform:`translate(-50%,-50%) translate(${coverCropOffset.x}px,${coverCropOffset.y}px) scale(${coverCropZoom})`}}/></div><div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#465249]"><label htmlFor="cover-zoom">Zoom</label><span>{Math.round(coverCropZoom*100)}%</span></div><input id="cover-zoom" type="range" min="1" max="3" step="0.01" value={coverCropZoom} onChange={event=>setCoverCropZoom(Number(event.target.value))} className="w-full accent-[#25215C]"/></div><p className="mt-2 text-[10px] text-[#929992]">Your banner will be saved in a wide 1600 × 500 format.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={closeCoverCropper} disabled={coverUploading} className="rounded-lg border border-[#dfe7e1] px-4 py-2.5 text-xs font-bold text-[#526258]">Cancel</button><button type="button" onClick={saveCroppedCover} disabled={coverUploading} className="rounded-lg bg-[#D7F36A] px-4 py-2.5 text-xs font-bold text-[#111512] disabled:opacity-50">{coverUploading?"Saving…":"Save banner"}</button></div></div></div>}
          </>}
          {section === "My Gigs" && <><div className="mb-7"><p className="text-xs font-bold text-[#25215C]">YOUR SERVICES</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">My gigs</h2><p className="mt-2 text-sm text-[#777d77]">Save your public Fiverr gig links and details in one place.</p></div><div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><form onSubmit={saveGig} className="space-y-4 rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><h3 className="text-sm font-bold">Add a gig</h3><label className="block"><span className="mb-2 block text-xs font-semibold">Gig title *</span><input required className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.title} onChange={(e)=>setGigForm((old)=>({...old,title:e.target.value}))} placeholder="I will design a brand identity"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Public Fiverr gig URL</span><input type="url" className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.gig_url} onChange={(e)=>setGigForm((old)=>({...old,gig_url:e.target.value}))} placeholder="https://www.fiverr.com/username/gig-name"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Description</span><textarea className="min-h-[115px] w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.description} onChange={(e)=>setGigForm((old)=>({...old,description:e.target.value}))} placeholder="Paste your gig description"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Tags (comma-separated)</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.tags} onChange={(e)=>setGigForm((old)=>({...old,tags:e.target.value}))} placeholder="logo design, branding, brand identity"/></label><div className="grid grid-cols-2 gap-3"><label><span className="mb-2 block text-xs font-semibold">Category</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.category} onChange={(e)=>setGigForm((old)=>({...old,category:e.target.value}))} placeholder="Graphics & Design"/></label><label><span className="mb-2 block text-xs font-semibold">Starting price (USD)</span><input type="number" min="0" step="0.01" className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.starting_price} onChange={(e)=>setGigForm((old)=>({...old,starting_price:e.target.value}))} placeholder="25"/></label></div><label className="block"><span className="mb-2 block text-xs font-semibold">Status</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3.5 py-3 text-sm outline-none focus:border-[#168B56]" value={gigForm.status} onChange={(e)=>setGigForm((old)=>({...old,status:e.target.value as typeof old.status}))}><option value="active">Active</option><option value="paused">Paused</option><option value="draft">Draft</option></select></label><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-50"><Plus size={15}/>{saving?"Saving…":"Save gig"}</button></form><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold">Saved gigs</h3><p className="mt-1 text-xs text-[#929992]">{gigs.length} gig{gigs.length===1?"":"s"} in your workspace</p></div></div>{gigs.length ? <div className="mt-4 divide-y divide-[#eef0ee]">{gigs.map((gig)=><div key={gig.id} className="py-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold">{gig.title}</p><p className="mt-1 text-[11px] capitalize text-[#929992]">{gig.status}{gig.starting_price!==null? ` · $ ${gig.starting_price}`:""}</p>{gig.tags.length>0&&<p className="mt-2 text-[11px] text-[#777d77]">{gig.tags.join(" · ")}</p>}</div><button onClick={()=>deleteGig(gig.id)} className="rounded-md p-2 text-[#929992] hover:bg-red-50 hover:text-red-600" aria-label="Delete gig"><Trash2 size={16}/></button></div>{gig.gig_url&&<a href={gig.gig_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#25215C]">Open Fiverr gig <ExternalLink size={12}/></a>}<button onClick={()=>{setAnalysisGig(gig.id);setAnalysisText({title:gig.title,description:gig.description,tags:gig.tags.join(", ")});go("Gig Analyzer")}} className="ml-4 text-[11px] font-semibold text-[#62646A]">Review details</button></div>)}</div> : <div className="flex min-h-[280px] flex-col items-center justify-center text-center"><BriefcaseBusiness size={25} className="mb-3 text-[#25215C]"/><p className="text-xs font-semibold">Your saved gigs will appear here</p><p className="mt-1 text-[11px] text-[#929992]">Add a gig using the form.</p></div>}</div></div></>}
          {section === "Performance" && <><div className="mb-7"><p className="text-xs font-bold text-[#25215C]">SELLER ANALYTICS</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Track what is changing.</h2><p className="mt-2 text-sm text-[#777d77]">Enter figures from your Fiverr analytics. We do not fetch private Fiverr account metrics.</p></div><div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><form onSubmit={saveMetrics} className="space-y-3 rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><h3 className="text-sm font-bold">Add performance snapshot</h3><label className="block"><span className="mb-1 block text-xs font-semibold">Date</span><input type="date" required className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm.date} onChange={(e)=>setMetricForm((old)=>({...old,date:e.target.value}))}/></label>{[{label:"Impressions",key:"impressions"},{label:"Clicks",key:"clicks"},{label:"Orders",key:"orders"},{label:`Revenue (${metricForm.currency})`,key:"revenue"}].map((field)=><label key={field.key} className="block"><span className="mb-1 block text-xs font-semibold">{field.label}</span><input type="number" min="0" step={field.key==="revenue"?"0.01":"1"} required className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm[field.key as keyof typeof metricForm]} onChange={(e)=>setMetricForm((old)=>({...old,[field.key]:e.target.value}))}/></label>)}<label className="block"><span className="mb-1 block text-xs font-semibold">Link to gig (optional)</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm.gig_id} onChange={(e)=>setMetricForm((old)=>({...old,gig_id:e.target.value}))}><option value="">All gigs / not specified</option>{gigs.map((gig)=><option key={gig.id} value={gig.id}>{gig.title}</option>)}</select></label><label className="block"><span className="mb-1 block text-xs font-semibold">Revenue currency</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={metricForm.currency} onChange={(e)=>setMetricForm((old)=>({...old,currency:e.target.value}))}><option value="USD">USD — US Dollar</option><option value="NGN">NGN — Nigerian Naira</option><option value="GBP">GBP — British Pound</option><option value="EUR">EUR — Euro</option><option value="CAD">CAD — Canadian Dollar</option><option value="AUD">AUD — Australian Dollar</option></select></label><button disabled={saving} className="w-full rounded-lg bg-[#222325] px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{saving?"Saving…":"Save snapshot"}</button></form><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><h3 className="text-sm font-bold">Saved performance</h3>{performance.length?<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[460px] text-left text-xs"><thead className="text-[10px] text-[#929992]"><tr>{["DATE","IMPRESSIONS","CLICKS","ORDERS","REVENUE"].map((heading)=><th key={heading} className="pb-3 pr-3">{heading}</th>)}</tr></thead><tbody>{performance.map((row)=><tr key={row.id} className="border-t border-[#eef0ee]"><td className="py-3 pr-3">{row.period_start}</td><td className="pr-3">{row.impressions.toLocaleString()}</td><td className="pr-3">{row.clicks.toLocaleString()}</td><td className="pr-3">{row.orders}</td><td className="pr-3">{row.currency} {Number(row.revenue).toLocaleString()}</td></tr>)}</tbody></table></div>:<div className="flex min-h-[260px] flex-col items-center justify-center text-center"><ChartNoAxesCombined className="mb-3 text-[#25215C]"/><p className="text-xs font-semibold">No snapshots yet</p><p className="mt-1 text-[11px] text-[#929992]">Your saved records will appear here.</p></div>}</div></div></>}
          {section === "Growth Plan" && <div className="max-w-3xl"><div className="mb-7"><p className="text-xs font-bold text-[#25215C]">YOUR ACTION LIST</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Small steps, saved progress.</h2><p className="mt-2 text-sm text-[#777d77]">Mark tasks complete as you work. Your progress is saved to your account.</p></div><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-7">{tasks.map((task)=><div key={task.id} className="flex items-start gap-3 border-b border-[#eef0ee] py-4 last:border-0"><input type="checkbox" checked={task.status==="completed"} onChange={()=>toggleTask(task)} className="mt-1 h-4 w-4 accent-[#1DBF73]"/><div><p className={task.status==="completed"?"text-sm text-[#9aa19a] line-through":"text-sm font-semibold"}>{task.title}</p><p className="mt-1 text-xs leading-5 text-[#777d77]">{task.description}</p><p className="mt-2 text-[10px] uppercase tracking-wide text-[#929992]">{task.priority} priority · {task.status.replace("_"," ")}</p></div></div>)}</div></div>}
          {section === "Gig Analyzer" && <><div className="mb-7"><p className="text-xs font-bold text-[#25215C]">GIG QUALITY REVIEW</p><h2 className="workspace-page-title mt-2 text-4xl font-extrabold md:text-5xl">Make your offer easier to choose.</h2><p className="mt-2 text-sm text-[#777d77]">A basic checklist, not an official Fiverr score or ranking prediction.</p></div><div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><div className="space-y-4 rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><label className="block"><span className="mb-2 block text-xs font-semibold">Choose a saved gig</span><select className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisGig} onChange={(e)=>{const gig=gigs.find((item)=>item.id===e.target.value);setAnalysisGig(e.target.value);if(gig)setAnalysisText({title:gig.title,description:gig.description,tags:gig.tags.join(", ")});setAnalysisDone(false);}}><option value="">Enter details manually</option>{gigs.map((gig)=><option key={gig.id} value={gig.id}>{gig.title}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-semibold">Gig title</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisText.title} onChange={(e)=>{setAnalysisText((old)=>({...old,title:e.target.value}));setAnalysisDone(false);}}/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Description</span><textarea className="min-h-[170px] w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisText.description} onChange={(e)=>{setAnalysisText((old)=>({...old,description:e.target.value}));setAnalysisDone(false);}} placeholder="Paste your gig description"/></label><label className="block"><span className="mb-2 block text-xs font-semibold">Tags (comma-separated)</span><input className="w-full rounded-lg border border-[#dfe5e9] px-3 py-3 text-sm" value={analysisText.tags} onChange={(e)=>{setAnalysisText((old)=>({...old,tags:e.target.value}));setAnalysisDone(false);}} placeholder="brand identity, logo design, ..."/></label><button onClick={runAiAnalysis} disabled={!analysisGig || aiLoading} className="rounded-lg bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-40">{aiLoading?"Analysing…":"Run AI review"}</button><p className="text-[11px] text-[#929992]">AI reviews the saved gig details. Save any edits to My Gigs first.</p></div><div className="rounded-xl border border-[#e9ece9] bg-white p-5 md:p-6"><p className="text-xs font-bold text-[#777d77]">YOUR REVIEW</p>{analysisDone?<><p className="mt-5 text-xs font-bold text-[#25215C]">AI GIG REVIEW</p><div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#4b514c]">{aiResult}</div><p className="mt-5 rounded-lg bg-[#f0faf3] p-3 text-[10px] leading-5 text-[#4C6658]">AI guidance is based on the details you saved. Suggestions are hypotheses, not Fiverr ranking or search-volume data.</p></>:<div className="flex min-h-[300px] flex-col items-center justify-center text-center"><FileSearch size={25} className="mb-3 text-[#25215C]"/><p className="text-sm font-semibold">Your AI review will appear here</p><p className="mt-2 max-w-xs text-xs text-[#929992]">Select one of your saved gigs and run an AI review.</p></div>}</div></div></>}
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
  {coachAttachments.length > 0 && (
    <div className="mb-3 flex flex-wrap gap-2">
      {coachAttachments.map((file, index) => (
        <div key={`${file.name}-${index}`} className="flex max-w-full items-center gap-2 rounded-xl border border-[#e3e9e4] bg-[#f8faf8] px-3 py-2 text-xs">
          <FileSearch size={15} />
          <span className="max-w-[180px] truncate">{file.name}</span>
          <button type="button" title="Remove attachment" aria-label="Remove attachment" onClick={() => setCoachAttachments(old => old.filter((_, i) => i !== index))} className="text-[#929992] hover:text-red-600"><X size={14} /></button>
        </div>
      ))}
    </div>
  )}
  <div className="rounded-[26px] border border-[#dfe5e9] bg-white px-4 py-3 shadow-sm transition focus-within:border-[#a9d7bb] focus-within:shadow-[0_0_0_3px_rgba(29,191,115,0.08)]">
    <textarea
      value={coachInput}
      onChange={(event) => setCoachInput(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (!coachLoading && (coachInput.trim() || coachAttachments.length)) void sendCoachMessage();
        }
      }}
      maxLength={2000}
      rows={2}
      placeholder="Message your Growth Coach"
      className="max-h-40 min-h-[54px] w-full resize-none bg-transparent py-1 text-sm leading-6 text-[#222325] outline-none placeholder:text-[#9ca3af]"
    />
    {voicePreviewUrl && <audio controls src={voicePreviewUrl} className="mt-2 h-9 w-full max-w-[280px]" /> }
    <div className="mt-3 flex items-center gap-2">
      <label title="Attach files" aria-label="Attach files" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#f1f3f1] hover:text-[#25215C]">
        <Paperclip size={19} />
        <input type="file" multiple accept=".pdf,.txt,.md,.csv,.json,.jpg,.jpeg,.png,.webp,.gif" className="hidden" onChange={(event) => { const files = Array.from(event.target.files ?? []); const valid = files.filter(file => file.size <= 10 * 1024 * 1024); if (files.length !== valid.length) setNotice("Each file must be 10 MB or smaller."); setCoachAttachments(old => [...old, ...valid].slice(0, 5)); event.target.value = ""; }} />
      </label>
      {voiceRecording ? (
        <button type="button" onClick={stopVoiceRecording} title="Stop recording" aria-label="Stop recording" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"><Square size={16} /></button>
      ) : (
        <button type="button" onClick={startVoiceRecording} disabled={voiceBusy || coachLoading} title="Record voice note" aria-label="Record voice note" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#f1f3f1] hover:text-[#25215C] disabled:opacity-40"><Mic size={19} /></button>
      )}
      <span className="mr-auto text-[11px] text-[#929992]">{voiceRecording ? `Recording ${Math.floor(voiceSeconds / 60)}:${String(voiceSeconds % 60).padStart(2, "0")}` : voiceBusy ? "Processing voice note…" : "Attach or record"}</span>
      {voicePreviewUrl ? (
        <>
          <button type="button" onClick={transcribeVoiceNote} disabled={voiceBusy || coachLoading} title="Transcribe and send" aria-label="Transcribe and send" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f1f3f1] disabled:opacity-40"><AudioLines size={18} /></button>
          <button type="button" onClick={sendVoiceAudioToCoach} disabled={voiceBusy || coachLoading} title="Send voice note" aria-label="Send voice note" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1DBF73] text-white hover:bg-[#15965b] disabled:opacity-40"><Send size={17} /></button>
          <button type="button" onClick={clearVoicePreview} title="Discard recording" aria-label="Discard recording" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#929992] hover:bg-red-50 hover:text-red-600"><X size={17} /></button>
        </>
      ) : (
        <button type="submit" disabled={coachLoading || (!coachInput.trim() && !coachAttachments.length)} title="Send message" aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1DBF73] text-white transition hover:bg-[#15965b] disabled:cursor-not-allowed disabled:opacity-40">{coachLoading ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={17} />}</button>
      )}
    </div>
    <p className="mt-2 px-2 text-center text-[10px] text-[#9aa19a]">Enter to send · Shift + Enter for a new line</p>
  </div>
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
