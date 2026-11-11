"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCheck, Settings2 } from "lucide-react";

type Notice = {
  id: string;
  job_id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

const niches = [
  "Graphic Design",
  "Branding & Brand Identity",
  "Web Development",
  "WordPress",
  "UI/UX Design",
  "Video Editing",
  "Digital Marketing",
  "Writing & Translation",
  "Other",
];

export default function CommunityNotifications() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState<Notice[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("Please sign in to view your community notifications.");
      setLoading(false);
      return;
    }
    setUserId(user.id);
    const [prefResult, noticeResult] = await Promise.all([
      supabase.from("community_notification_preferences").select("niches,enabled").eq("user_id", user.id).maybeSingle(),
      supabase.from("community_notifications").select("id,job_id,title,body,read_at,created_at").eq("recipient_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);
    if (prefResult.error) setError(prefResult.error.message);
    else {
      setSelected(prefResult.data?.niches ?? []);
      setEnabled(prefResult.data?.enabled ?? true);
    }
    if (noticeResult.error) setError(noticeResult.error.message);
    else setItems((noticeResult.data ?? []) as Notice[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("community-notifications-" + userId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_notifications", filter: "recipient_id=eq." + userId }, (payload) => {
        setItems((current) => [payload.new as Notice, ...current].slice(0, 50));
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [supabase, userId]);

  async function savePreferences() {
    if (!userId || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    const { error: saveError } = await supabase.from("community_notification_preferences").upsert({
      user_id: userId,
      niches: selected,
      enabled,
      updated_at: new Date().toISOString(),
    });
    if (saveError) setError(saveError.message);
    else setMessage("Your notification preferences have been saved.");
    setSaving(false);
  }

  async function markRead(id: string) {
    const { error: updateError } = await supabase.from("community_notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("recipient_id", userId);
    if (updateError) setError(updateError.message);
    else setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item));
  }

  async function markAllRead() {
    if (!items.some((item) => !item.read_at)) return;
    const now = new Date().toISOString();
    const { error: updateError } = await supabase.from("community_notifications").update({ read_at: now }).eq("recipient_id", userId).is("read_at", null);
    if (updateError) setError(updateError.message);
    else setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? now })));
  }

  const unreadCount = items.filter((item) => !item.read_at).length;

  return <div className="mx-auto max-w-[1000px]">
    <div className="mb-7">
      <p className="text-xs font-bold text-[#168B56]">STAY IN THE LOOP</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Community notifications</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777d77]">Choose the kinds of work you want to hear about. We’ll notify you when a member posts an opportunity in a matching niche.</p>
    </div>

    <div className="mb-5 flex flex-wrap items-center gap-3">
      <Link href="/community/jobs" className="text-xs font-semibold text-[#168B56]">← Job opportunities</Link>
      <span className="text-xs text-[#929992]">{unreadCount} unread</span>
      {unreadCount > 0 && <button onClick={markAllRead} className="ml-auto inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"><CheckCheck size={14}/> Mark all as read</button>}
    </div>

    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}

    <section className="mb-7 rounded-2xl border border-[#e8ece8] bg-white p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2"><Settings2 size={17} className="text-[#168B56]"/><h2 className="text-sm font-extrabold">Your opportunity interests</h2></div>
      <label className="mb-4 flex items-start gap-3 rounded-xl bg-[#f7faf7] p-3">
        <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#168B56]"/>
        <span><span className="block text-xs font-bold">Receive opportunity notifications</span><span className="mt-1 block text-[11px] text-[#777d77]">Turn this off whenever you want a break.</span></span>
      </label>
      <p className="mb-3 text-xs font-semibold">Select the niches you want to hear about</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {niches.map((niche) => <label key={niche} className="flex items-center gap-2 rounded-lg border border-[#edf0ed] p-3 text-xs">
          <input type="checkbox" checked={selected.includes(niche)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, niche] : current.filter((item) => item !== niche))} className="h-4 w-4 accent-[#168B56]"/>
          {niche}
        </label>)}
      </div>
      <p className="mt-3 text-[10px] leading-5 text-[#929992]">You’ll only receive in-app alerts for the niches you select. Your choices are private to your account.</p>
      <button onClick={savePreferences} disabled={saving || loading} className="mt-4 rounded-xl bg-[#222325] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save interests"}</button>
    </section>

    <section className="rounded-2xl border border-[#e8ece8] bg-white p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2"><Bell size={17} className="text-[#168B56]"/><h2 className="text-sm font-extrabold">Recent alerts</h2></div>
      {loading ? <p className="py-10 text-center text-xs text-[#888]">Loading notifications…</p> : items.length === 0 ? <div className="py-10 text-center"><Bell size={25} className="mx-auto mb-3 text-[#168B56]"/><p className="text-sm font-bold">No notifications yet</p><p className="mt-2 text-xs text-[#888]">Choose your interests above. Matching opportunities will appear here.</p></div> : <div className="divide-y divide-[#eef0ee]">
        {items.map((item) => <article key={item.id} className={`flex items-start justify-between gap-3 py-4 ${item.read_at ? "" : "bg-[#f7fbf7]"}`}>
          <div className="min-w-0"><p className="text-xs font-bold">{item.title}</p><p className="mt-1 text-xs leading-5 text-[#68736b]">{item.body}</p><p className="mt-2 text-[10px] text-[#929992]">{new Date(item.created_at).toLocaleString()}</p><Link href="/community/jobs" className="mt-2 inline-block text-[11px] font-bold text-[#168B56]">View opportunities →</Link></div>
          {!item.read_at && <button onClick={() => markRead(item.id)} className="shrink-0 rounded-lg border px-3 py-2 text-[10px] font-semibold">Mark read</button>}
        </article>)}
      </div>}
    </section>
  </div>;
}
