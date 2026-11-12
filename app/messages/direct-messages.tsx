"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ArrowUpRight, MessageCircle, Send, UserRound, Mic, Square, X, AudioLines } from "lucide-react";

type Conversation = { id: string; updated_at: string; otherId: string; name: string; avatar: string | null; preview: string; unread: number };
type Message = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string; read_at: string | null; media_path?: string | null; media_type?: string | null; duration_seconds?: number | null; audio_url?: string | null };

export default function DirectMessages() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [userId,setUserId] = useState("");
  const [conversations,setConversations] = useState<Conversation[]>([]);
  const [activeId,setActiveId] = useState("");
  const [messages,setMessages] = useState<Message[]>([]);
  const [draft,setDraft] = useState("");
  const [loading,setLoading] = useState(true);
  const [sending,setSending] = useState(false);
  const [error,setError] = useState("");
  const [recording,setRecording]=useState(false);
  const [recordedBlob,setRecordedBlob]=useState<Blob|null>(null);
  const [recordedDuration,setRecordedDuration]=useState(0);
  const [recordingSeconds,setRecordingSeconds]=useState(0);
  const [voiceSending,setVoiceSending]=useState(false);
  const recorderRef=useRef<MediaRecorder|null>(null);
  const chunksRef=useRef<Blob[]>([]);
  const recordingStartedRef=useRef(0);
  const recordingTimerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async (currentUser:string) => {
    const {data: memberships,error:membershipError}=await supabase.from("direct_conversation_participants").select("conversation_id").eq("user_id",currentUser);
    if(membershipError) { setError(membershipError.message); return; }
    const ids=(memberships??[]).map(row=>row.conversation_id);
    if(!ids.length) { setConversations([]); return; }
    const [{data: rows,error:conversationError},{data: people,error:peopleError},{data: allMessages,error:messageError},{data: notifications,error:notificationError}] = await Promise.all([
      supabase.from("direct_conversations").select("id,updated_at").in("id",ids).order("updated_at",{ascending:false}),
      supabase.from("direct_conversation_participants").select("conversation_id,user_id").in("conversation_id",ids).neq("user_id",currentUser),
      supabase.from("direct_messages").select("id,conversation_id,sender_id,body,created_at,read_at,media_path,media_type,duration_seconds").in("conversation_id",ids).order("created_at",{ascending:false}),
      supabase.from("direct_message_notifications").select("conversation_id").eq("recipient_id",currentUser).is("read_at",null)
    ]);
    const failure=conversationError||peopleError||messageError||notificationError;
    if(failure) {setError(failure.message);return;}
    const otherIds=[...new Set((people??[]).map(p=>p.user_id))];
    const {data:profiles, error:profileError}=await supabase.from("profiles").select("id,display_name,avatar_url").in("id",otherIds);
    if(profileError) {setError(profileError.message);return;}
    const profileMap=new Map((profiles??[]).map(p=>[p.id,p]));
    const latest=new Map<string,Message>();
    for(const message of allMessages??[]) if(!latest.has(message.conversation_id)) latest.set(message.conversation_id,message as Message);
    const unreadMap=new Map<string,number>();
    for(const item of notifications??[]) unreadMap.set(item.conversation_id,(unreadMap.get(item.conversation_id)||0)+1);
    setConversations((rows??[]).map(row=>{
      const other=(people??[]).find(p=>p.conversation_id===row.id);
      const person=other?profileMap.get(other.user_id):null;
      return {id:row.id,updated_at:row.updated_at,otherId:other?.user_id??"",name:person?.display_name||"MILE member",avatar:person?.avatar_url??null,preview:latest.get(row.id)?.media_path?"🎙 Voice note":latest.get(row.id)?.body??"Start your conversation",unread:unreadMap.get(row.id)||0};
    }));
  },[supabase]);

  const openConversation=useCallback(async(id:string)=>{
    setActiveId(id);
    const {data,error:loadError}=await supabase.from("direct_messages").select("id,conversation_id,sender_id,body,created_at,read_at").eq("conversation_id",id).order("created_at",{ascending:true}).limit(300);
    if(loadError){setError(loadError.message);return;}
    setMessages(await Promise.all((data??[]).map(async(item)=>{const message=item as Message;if(!message.media_path)return message;const {data:signed}=await supabase.storage.from("message-voice-notes").createSignedUrl(message.media_path,3600);return {...message,audio_url:signed?.signedUrl??null};})));
    const now=new Date().toISOString();
    await supabase.from("direct_messages").update({read_at:now}).eq("conversation_id",id).neq("sender_id",userId).is("read_at",null);
    await supabase.from("direct_message_notifications").update({read_at:now}).eq("conversation_id",id).eq("recipient_id",userId).is("read_at",null);
    setConversations(old=>old.map(item=>item.id===id?{...item,unread:0}:item));
  },[supabase,userId]);

  useEffect(()=>{
    let alive=true;
    (async()=>{
      const {data:{user}}=await supabase.auth.getUser();
      if(!alive)return;
      if(!user){setError("Please sign in to use MILE messages.");setLoading(false);return;}
      setUserId(user.id);
      const params=new URLSearchParams(window.location.search);
      const target=params.get("user");
      if(target && target!==user.id){
        const {data:conversationId,error:startError}=await supabase.rpc("start_direct_conversation",{target_user:target});
        if(startError){setError(startError.message);setLoading(false);return;}
        await loadConversations(user.id);
        setActiveId(conversationId);
        const {data:history}=await supabase.from("direct_messages").select("id,conversation_id,sender_id,body,created_at,read_at").eq("conversation_id",conversationId).order("created_at",{ascending:true}).limit(300);
        if(alive)setMessages(await Promise.all((history??[]).map(async(item)=>{const message=item as Message;if(!message.media_path)return message;const {data:signed}=await supabase.storage.from("message-voice-notes").createSignedUrl(message.media_path,3600);return {...message,audio_url:signed?.signedUrl??null};})));
        router.replace("/messages");
      } else {
        await loadConversations(user.id);
      }
      if(alive)setLoading(false);
    })();
    return()=>{alive=false;};
  },[loadConversations,router,supabase]);

  useEffect(()=>{
    if(!userId)return;
    const channel=supabase.channel("mile-message-inbox-"+userId)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"direct_messages"},async payload=>{
        const message=payload.new as Message;
        if(message.sender_id===userId)return;
        if(message.conversation_id===activeId){
          let hydrated=message;
          if(message.media_path){const {data:signed}=await supabase.storage.from("message-voice-notes").createSignedUrl(message.media_path,3600);hydrated={...message,audio_url:signed?.signedUrl??null};}
          setMessages(old=>old.some(item=>item.id===message.id)?old:[...old,hydrated]);
          const now=new Date().toISOString();
          void supabase.from("direct_messages").update({read_at:now}).eq("id",message.id);
          void supabase.from("direct_message_notifications").update({read_at:now}).eq("message_id",message.id).eq("recipient_id",userId);
        }
        void loadConversations(userId);
      })
      .subscribe();
    return()=>{void supabase.removeChannel(channel);};
  },[supabase,userId,activeId,loadConversations]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  async function sendMessage(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    const body=draft.trim();
    if(!body||!activeId||sending)return;
    setSending(true);setError("");
    const {data,error:sendError}=await supabase.from("direct_messages").insert({conversation_id:activeId,sender_id:userId,body}).select("id,conversation_id,sender_id,body,created_at,read_at,media_path,media_type,duration_seconds").single();
    if(sendError)setError(sendError.message);
    else {setMessages(old=>[...old,data as Message]);setDraft("");void loadConversations(userId);}
    setSending(false);
  }

  async function startRecording(){
    setError("");setRecordedBlob(null);setRecordedDuration(0);setRecordingSeconds(0);
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){setError("Voice recording is not supported in this browser. Try an updated Chrome or Safari browser.");return;}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mimeType=["audio/webm;codecs=opus","audio/mp4","audio/ogg;codecs=opus","audio/webm"].find(type=>MediaRecorder.isTypeSupported(type));
      const recorder=new MediaRecorder(stream,mimeType?{mimeType}:undefined);
      recorderRef.current=recorder;chunksRef.current=[];recordingStartedRef.current=Date.now();
      recorder.ondataavailable=(event)=>{if(event.data.size)chunksRef.current.push(event.data);};
      recorder.onstop=()=>{const blob=new Blob(chunksRef.current,{type:recorder.mimeType||"audio/webm"});setRecordedBlob(blob);setRecordedDuration(Math.max(1,Math.round((Date.now()-recordingStartedRef.current)/1000)));stream.getTracks().forEach(track=>track.stop());if(recordingTimerRef.current)clearInterval(recordingTimerRef.current);setRecording(false);setRecordingSeconds(0);};
      recorder.start(250);setRecording(true);
      recordingTimerRef.current=setInterval(()=>{const elapsed=Math.floor((Date.now()-recordingStartedRef.current)/1000);setRecordingSeconds(elapsed);if(elapsed>=120&&recorderRef.current?.state==="recording")recorderRef.current.stop();},500);
    }catch(e){setError(e instanceof Error&&e.name==="NotAllowedError"?"Microphone access was denied. Allow microphone access in your browser settings.":"Could not start recording. Check your microphone and try again.");}
  }
  function stopRecording(){if(recorderRef.current?.state==="recording")recorderRef.current.stop();}
  function cancelRecording(){if(recorderRef.current?.state==="recording")recorderRef.current.stop();setRecordedBlob(null);setRecordedDuration(0);}
  async function sendVoiceNote(){
    if(!recordedBlob||!activeId||voiceSending)return;
    setVoiceSending(true);setError("");
    const extension=recordedBlob.type.includes("mp4")?"m4a":recordedBlob.type.includes("ogg")?"ogg":"webm";
    const path=`${activeId}/${userId}/${crypto.randomUUID()}.${extension}`;
    try{
      const {error:uploadError}=await supabase.storage.from("message-voice-notes").upload(path,recordedBlob,{contentType:recordedBlob.type||"audio/webm",upsert:false});
      if(uploadError)throw uploadError;
      const {data,error:insertError}=await supabase.from("direct_messages").insert({conversation_id:activeId,sender_id:userId,body:"",media_path:path,media_type:recordedBlob.type||"audio/webm",duration_seconds:recordedDuration}).select("id,conversation_id,sender_id,body,created_at,read_at,media_path,media_type,duration_seconds").single();
      if(insertError){await supabase.storage.from("message-voice-notes").remove([path]);throw insertError;}
      const {data:signed}=await supabase.storage.from("message-voice-notes").createSignedUrl(path,3600);
      setMessages(old=>[...old,{...(data as Message),audio_url:signed?.signedUrl??null}]);
      setRecordedBlob(null);setRecordedDuration(0);void loadConversations(userId);
    }catch(e){setError(e instanceof Error?e.message:"Could not send your voice note.");}
    finally{setVoiceSending(false);}
  }
  const active=conversations.find(item=>item.id===activeId);
  const unreadTotal=conversations.reduce((sum,item)=>sum+item.unread,0);

  return <main className="messages-page min-h-screen bg-[#f3f5f1] px-4 py-6 text-[#17231b] md:px-8 md:py-10">
    <div className="mx-auto max-w-6xl">
      <button onClick={()=>router.push("/dashboard")} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#69736c] hover:text-[#168B56]"><ArrowLeft size={15}/> Back to workspace</button>
      <div className="mb-6 flex items-end justify-between gap-3"><div><p className="text-[11px] font-bold tracking-[.16em] text-[#168B56]">MILE COMMUNITY</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Messages</h1><p className="mt-2 text-sm text-[#7b837c]">Build relationships. Share ideas. Move work forward.</p></div>{unreadTotal>0&&<span className="rounded-full bg-[#eaf8ef] px-3 py-2 text-xs font-bold text-[#168B56]">{unreadTotal} unread</span>}</div>
      {error&&<p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      <div className="grid min-h-[650px] overflow-hidden rounded-2xl border border-[#e6ebe7] bg-white shadow-[0_10px_35px_rgba(25,45,30,.04)] md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={activeId?"hidden border-r border-[#edf0ed] md:block":"border-r border-[#edf0ed]"}>
          <div className="border-b border-[#edf0ed] p-5"><h2 className="text-sm font-extrabold">Your conversations</h2><p className="mt-1 text-[11px] text-[#929992]">Private conversations between members</p></div>
          <div className="max-h-[590px] overflow-y-auto p-2">{loading?<p className="p-5 text-xs text-[#929992]">Loading messages…</p>:conversations.length?conversations.map(item=><button key={item.id} onClick={()=>void openConversation(item.id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-[#f5f8f5] ${activeId===item.id?"bg-[#eaf8ef]":""}`}><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaf8ef] text-sm font-bold text-[#168B56]">{item.avatar?<img src={item.avatar} alt="" className="h-full w-full object-cover"/>:<UserRound size={18}/>}</div><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{item.name}</span><span className="mt-1 block truncate text-[11px] text-[#929992]">{item.preview}</span></span>{item.unread>0&&<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#168B56] px-1 text-[10px] font-bold text-white">{item.unread}</span>}</button>):<div className="p-7 text-center"><MessageCircle size={25} className="mx-auto mb-3 text-[#168B56]"/><p className="text-xs font-bold">No conversations yet</p><p className="mt-2 text-[11px] leading-5 text-[#929992]">Visit the community directory and message a freelancer to start a conversation.</p><button onClick={()=>router.push("/dashboard")} className="mt-4 text-xs font-bold text-[#168B56]">Explore MILE</button></div>}</div>
        </aside>
        <section className={activeId?"flex min-w-0 flex-col":"hidden min-w-0 flex-col md:flex"}>
          {active?<><header className="flex items-center gap-3 border-b border-[#edf0ed] px-4 py-4 md:px-6"><button onClick={()=>setActiveId("")} className="rounded-lg p-2 hover:bg-[#f3f6f3] md:hidden" aria-label="Back to conversations"><ArrowLeft size={17}/></button><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#eaf8ef] text-[#168B56]">{active.avatar?<img src={active.avatar} alt="" className="h-full w-full object-cover"/>:<UserRound size={18}/>}</div><div><p className="text-sm font-extrabold">{active.name}</p><p className="mt-1 text-[10px] text-[#929992]">MILE member · Private conversation</p></div></header>
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#fcfdfc] p-4 md:p-6">{messages.map(message=><div key={message.id} className={message.sender_id===userId?"ml-auto max-w-[85%]":"mr-auto max-w-[85%]"}><div className={message.sender_id===userId?"rounded-2xl rounded-br-md bg-[#168B56] px-4 py-3 text-white":"rounded-2xl rounded-bl-md border border-[#e8ede9] bg-white px-4 py-3 text-[#343b35]"}>{message.media_path?<div className="flex min-w-[220px] items-center gap-3"><AudioLines size={19}/>{message.audio_url?<audio controls preload="none" src={message.audio_url} className="h-9 max-w-[250px]"/>:<span className="text-xs">Voice note unavailable</span>}<span className="text-[10px] opacity-75">{Math.floor((message.duration_seconds??0)/60)}:{String((message.duration_seconds??0)%60).padStart(2,"0")}</span></div>:<p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>}</div><p className={message.sender_id===userId?"mt-1 text-right text-[9px] text-[#929992]":"mt-1 text-[9px] text-[#929992]"}>{new Date(message.created_at).toLocaleString([], {dateStyle:"medium",timeStyle:"short"})}{message.sender_id===userId&&message.read_at?" · Read":""}</p></div>)}<div ref={bottomRef}/></div>
            <form onSubmit={sendMessage} className="border-t border-[#edf0ed] bg-white p-4 md:p-5">
              {recording&&<div className="mb-3 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3"><span className="flex items-center gap-2 text-xs font-semibold text-red-700"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500"/> Recording · {Math.floor(recordingSeconds/60)}:{String(recordingSeconds%60).padStart(2,"0")} / 2:00</span><button type="button" onClick={stopRecording} className="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-bold text-white"><Square size={12} className="mr-1 inline"/> Stop</button></div>}
              {recordedBlob&&<div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfe8df] bg-[#f5f9f4] p-3"><div className="flex items-center gap-2 text-xs font-semibold text-[#304b36]"><AudioLines size={17}/> Voice note ready · {recordedDuration}s</div><div className="flex items-center gap-2"><audio controls src={URL.createObjectURL(recordedBlob)} className="h-9 max-w-[180px]"/><button type="button" onClick={cancelRecording} aria-label="Discard recording" className="rounded-lg p-2 text-[#7d8980] hover:bg-white"><X size={15}/></button><button type="button" onClick={sendVoiceNote} disabled={voiceSending} className="rounded-lg bg-[#168B56] px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">{voiceSending?"Sending…":"Send voice note"}</button></div></div>}
              <div className="flex items-end gap-2"><textarea value={draft} onChange={e=>setDraft(e.target.value)} maxLength={5000} rows={2} placeholder="Write a message…" className="max-h-36 min-h-12 flex-1 resize-y rounded-xl border border-[#dfe5e9] px-4 py-3 text-sm outline-none focus:border-[#168B56]"/><button type="button" onClick={startRecording} disabled={recording||!!recordedBlob||voiceSending} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#dfe5e9] bg-white text-[#168B56] hover:bg-[#f3f8f3] disabled:opacity-40" aria-label="Record voice note" title="Record voice note"><Mic size={17}/></button><button disabled={!draft.trim()||sending} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#168B56] text-white hover:bg-[#117447] disabled:opacity-40" aria-label="Send message">{sending?<span className="text-xs">…</span>:<Send size={17}/>}</button></div><p className="mt-2 text-[9px] text-[#a0a7a1]">Use the microphone to record a voice note (up to 2 minutes). Keep conversations professional.</p></form>
          </>:<div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf8ef] text-[#168B56]"><MessageCircle size={27}/></div><h2 className="text-lg font-extrabold">Your next collaboration could start here.</h2><p className="mt-2 max-w-sm text-xs leading-6 text-[#929992]">Choose a conversation or visit the community to connect with another freelancer.</p><button onClick={()=>router.push("/dashboard")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#222325] px-4 py-3 text-xs font-bold text-white">Explore freelancers <ArrowUpRight size={14}/></button></div>}
        </section>
      </div>
    </div>
  </main>;
}
