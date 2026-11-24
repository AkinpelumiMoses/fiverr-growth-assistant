"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MessageCircle, Heart, Send, ImagePlus, BriefcaseBusiness, Handshake, MessageSquareText, Trophy, Users, MoreHorizontal, Trash2, ExternalLink } from "lucide-react";

type PostType = "showcase" | "opportunity" | "collaboration" | "discussion" | "milestone";
type Post = {
  id: string; author_id: string; post_type: PostType; content: string; link_url: string | null; created_at: string;
  author?: { display_name: string | null; avatar_url: string | null; primary_niche: string | null };
};
type Comment = { id: string; post_id: string; author_id: string; content: string; created_at: string; author?: { display_name: string | null; avatar_url: string | null } };
const categories: { id: PostType | "all"; label: string; icon: typeof MessageSquareText }[] = [
  { id: "all", label: "For you", icon: Users }, { id: "showcase", label: "Showcase", icon: ImagePlus },
  { id: "opportunity", label: "Opportunity", icon: BriefcaseBusiness }, { id: "collaboration", label: "Collaboration", icon: Handshake },
  { id: "discussion", label: "Discussion", icon: MessageSquareText }, { id: "milestone", label: "Milestones", icon: Trophy },
];
const categoryLabel: Record<PostType,string> = { showcase: "Project showcase", opportunity: "Opportunity", collaboration: "Collaboration", discussion: "Discussion", milestone: "Milestone" };
const categoryTone: Record<PostType,string> = { showcase: "bg-[#F0F5E8] text-[#315B2A]", opportunity: "bg-[#F8F5E6] text-[#78621A]", collaboration: "bg-[#EAF3E9] text-[#315B2A]", discussion: "bg-[#F0F2EF] text-[#59645A]", milestone: "bg-[#EAF4D2] text-[#40551D]" };
const initials = (name?: string | null) => (name || "MILE Member").split(/\s+/).map(s=>s[0]).slice(0,2).join("").toUpperCase();

export default function CommunityFeed() {
  const supabase = useMemo(() => createClient(), []);
  const [userId,setUserId] = useState<string|null>(null);
  const [profile,setProfile] = useState<{display_name:string|null;avatar_url:string|null;primary_niche:string|null}>({display_name:"",avatar_url:null,primary_niche:null});
  const [posts,setPosts] = useState<Post[]>([]);
  const [likes,setLikes] = useState<Record<string,{count:number;liked:boolean}>>({});
  const [comments,setComments] = useState<Record<string,Comment[]>>({});
  const [commentDrafts,setCommentDrafts] = useState<Record<string,string>>({});
  const [expanded,setExpanded] = useState<string|null>(null);
  const [filter,setFilter] = useState<PostType|"all">("all");
  const [composerOpen,setComposerOpen] = useState(false);
  const [postType,setPostType] = useState<PostType>("discussion");
  const [draft,setDraft] = useState("");
  const [link,setLink] = useState("");
  const [loading,setLoading] = useState(true);
  const [posting,setPosting] = useState(false);
  const [notice,setNotice] = useState("");
  const [menuPost,setMenuPost] = useState<string|null>(null);

  const loadFeed = useCallback(async (uid:string) => {
    setLoading(true); setNotice("");
    const {data,error} = await supabase.from("community_posts")
      .select("id,author_id,post_type,content,link_url,created_at")
      .order("created_at",{ascending:false}).limit(60);
    if(error){setNotice("We couldn't load the feed. "+error.message);setLoading(false);return;}
    const rows=(data??[]) as Post[];
    const authorIds=[...new Set(rows.map(p=>p.author_id))];
    const [profilesResult,likesResult,commentsResult] = await Promise.all([
      authorIds.length ? supabase.from("profiles").select("id,display_name,avatar_url,primary_niche").in("id",authorIds) : Promise.resolve({data:[],error:null}),
      rows.length ? supabase.from("community_post_likes").select("post_id,user_id").in("post_id",rows.map(p=>p.id)) : Promise.resolve({data:[],error:null}),
      rows.length ? supabase.from("community_post_comments").select("id,post_id,author_id,content,created_at").in("post_id",rows.map(p=>p.id)).order("created_at",{ascending:true}) : Promise.resolve({data:[],error:null})
    ]);
    const profileMap=new Map((profilesResult.data??[]).map((p:any)=>[p.id,p]));
    const hydrated=rows.map(p=>({...p,author:profileMap.get(p.author_id) as Post["author"]}));
    const likeMap:Record<string,{count:number;liked:boolean}>={};
    for(const p of rows){const list=(likesResult.data??[]).filter((x:any)=>x.post_id===p.id);likeMap[p.id]={count:list.length,liked:list.some((x:any)=>x.user_id===uid)};}
    const commentRows=(commentsResult.data??[]) as Comment[];
    const commentAuthorIds=[...new Set(commentRows.map(c=>c.author_id))];
    const commentProfiles=commentAuthorIds.length ? await supabase.from("profiles").select("id,display_name,avatar_url").in("id",commentAuthorIds) : {data:[]};
    const commentMapProfiles=new Map((commentProfiles.data??[]).map((p:any)=>[p.id,p]));
    const commentMap:Record<string,Comment[]>={};
    for(const c of commentRows){(commentMap[c.post_id]??=[]).push({...c,author:commentMapProfiles.get(c.author_id) as Comment["author"]});}
    setPosts(hydrated);setLikes(likeMap);setComments(commentMap);setLoading(false);
  },[supabase]);

  useEffect(()=>{let active=true;(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!active)return;if(!user){setNotice("Please sign in to join the MILE community.");setLoading(false);return;}setUserId(user.id);const {data}=await supabase.from("profiles").select("display_name,avatar_url,primary_niche").eq("id",user.id).maybeSingle();if(data)setProfile(data);await loadFeed(user.id);})();return()=>{active=false;};},[supabase,loadFeed]);

  const visiblePosts = useMemo(()=>filter==="all"?posts:posts.filter(p=>p.post_type===filter),[posts,filter]);
  async function publishPost(){
    if(!userId||!draft.trim()||posting)return;
    setPosting(true);setNotice("");
    const safeLink=link.trim();
    if(safeLink && !/^https?:\/\//i.test(safeLink)){setNotice("Add a complete link starting with https://");setPosting(false);return;}
    const {error}=await supabase.from("community_posts").insert({author_id:userId,post_type:postType,content:draft.trim(),link_url:safeLink||null});
    if(error)setNotice("Your post couldn't be published. "+error.message);
    else{setDraft("");setLink("");setComposerOpen(false);await loadFeed(userId);}
    setPosting(false);
  }
  async function toggleLike(postId:string){
    if(!userId)return;const current=likes[postId]??{count:0,liked:false};
    setLikes(old=>({...old,[postId]:{count:old[postId]?.count??0,liked:!current.liked}}));
    if(current.liked){const {error}=await supabase.from("community_post_likes").delete().eq("post_id",postId).eq("user_id",userId);if(error){setNotice(error.message);setLikes(old=>({...old,[postId]:current}));}else setLikes(old=>({...old,[postId]:{count:Math.max(0,(old[postId]?.count??1)-1),liked:false}}));}
    else{const {error}=await supabase.from("community_post_likes").insert({post_id:postId,user_id:userId});if(error){setNotice(error.message);setLikes(old=>({...old,[postId]:current}));}else setLikes(old=>({...old,[postId]:{count:(old[postId]?.count??0)+1,liked:true}}));}
  }
  async function addComment(postId:string){
    const value=(commentDrafts[postId]??"").trim();if(!value||!userId)return;
    const {data,error}=await supabase.from("community_post_comments").insert({post_id:postId,author_id:userId,content:value}).select("id,post_id,author_id,content,created_at").single();
    if(error){setNotice("Couldn't add your comment. "+error.message);return;}
    const item:Comment={...data,author:{display_name:profile.display_name,avatar_url:profile.avatar_url}};
    setComments(old=>({...old,[postId]:[...(old[postId]??[]),item]}));setCommentDrafts(old=>({...old,[postId]:""}));
  }
  async function deletePost(postId:string){
    if(!userId)return;const {error}=await supabase.from("community_posts").delete().eq("id",postId).eq("author_id",userId);
    if(error)setNotice("Couldn't delete this post. "+error.message);else setPosts(old=>old.filter(p=>p.id!==postId));setMenuPost(null);
  }

  return <div className="mx-auto max-w-[1380px]">
    <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#166534]">MILE COMMUNITY</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#17231b] md:text-4xl">Good work moves further together.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#68736A]">Share what you're building, learn from other freelancers and find people to move the next project forward.</p></div>
      <button onClick={()=>setComposerOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D7F36A] px-5 text-sm font-extrabold text-[#111A14] transition hover:bg-[#C8E65A]"><ImagePlus size={16}/> Create a post</button>
    </div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">{categories.map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>setFilter(item.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition ${filter===item.id?"border-[#111A14] bg-[#111A14] text-[#D7F36A]":"border-[#DCE5D9] bg-white text-[#59645c] hover:border-[#b8cdbb]"}`}><Icon size={14}/>{item.label}</button>;})}</div>
        {notice&&<div role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">{notice}</div>}
        {composerOpen&&<div className="mb-5 rounded-2xl border border-[#dce7de] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-extrabold text-[#172019]">Start a conversation</h3><button onClick={()=>setComposerOpen(false)} className="text-xs font-semibold text-[#778278]">Cancel</button></div>
          <div className="mb-3 flex flex-wrap gap-2">{categories.filter(c=>c.id!=="all").map(c=><button key={c.id} onClick={()=>setPostType(c.id as PostType)} className={`rounded-full border px-3 py-2 text-[11px] font-bold ${postType===c.id?"border-[#166534] bg-[#F0F5E8] text-[#166534]":"border-[#E3E9E1] text-[#69736c]"}`}>{c.label}</button>)}</div>
          <textarea value={draft} onChange={e=>setDraft(e.target.value)} maxLength={3000} rows={5} placeholder="What are you working on, learning, looking for or celebrating?" className="w-full resize-y rounded-xl border border-[#DCE5D9] bg-[#F8FAF6] p-4 text-sm leading-6 text-[#253128] outline-none focus:border-[#166534]"/>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row"><input value={link} onChange={e=>setLink(e.target.value)} placeholder="Add a project or resource link (optional)" className="min-w-0 flex-1 rounded-xl border border-[#DCE5D9] px-4 py-3 text-xs outline-none focus:border-[#166534]"/><button onClick={publishPost} disabled={!draft.trim()||posting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D7F36A] px-5 py-3 text-xs font-extrabold text-[#111A14] disabled:opacity-50"><Send size={14}/>{posting?"Publishing…":"Publish post"}</button></div>
          <p className="mt-2 text-[10px] text-[#899389]">Keep it useful, respectful and relevant to the freelance community.</p>
        </div>}
        {loading&&<div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-48 animate-pulse rounded-2xl border border-[#E3E9E1] bg-white"/>)}</div>}
        {!loading&&visiblePosts.length===0&&<div className="rounded-2xl border border-[#26352A] bg-[#111A14] px-6 py-16 text-center"><Users size={30} className="mx-auto mb-4 text-[#D7F36A]"/><h3 className="text-lg font-extrabold text-white">{filter==="all"?"The community starts with a conversation.":"Nothing here yet."}</h3><p className="mx-auto mt-2 max-w-md text-xs leading-6 text-white/80">{filter==="all"?"Be one of the first to share a project, ask a question or put an opportunity on the table.":"Try another category or start the first post in this space."}</p><button onClick={()=>setComposerOpen(true)} className="mt-5 rounded-full bg-[#D7F36A] px-5 py-3 text-xs font-extrabold text-[#111A14]">Create the first post</button></div>}
        <div className="space-y-4">{visiblePosts.map(post=><article key={post.id} className="rounded-2xl border border-[#E3E9E1] bg-white p-5 shadow-[0_6px_24px_rgba(25,45,30,.035)] md:p-6">
          <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F0F5E8] text-xs font-extrabold text-[#166534]">{post.author?.avatar_url?<img src={post.author.avatar_url} alt="" className="h-full w-full object-cover"/>:initials(post.author?.display_name)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><Link href={`/community/${post.author_id}`} className="text-sm font-extrabold text-[#172019] hover:text-[#166534]">{post.author?.display_name||"MILE Member"}</Link><span className="text-[10px] text-[#899389]">· {new Date(post.created_at).toLocaleString()}</span></div><p className="mt-0.5 text-[11px] text-[#778278]">{post.author?.primary_niche||"Community member"}</p><div className="mt-2 flex flex-wrap gap-2">{post.author_id!==userId&&<Link href={`/messages?user=${post.author_id}`} className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE5D9] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#166534] hover:bg-[#f1f8f2]"><MessageSquareText size={12}/> Message</Link>}<Link href={`/community/${post.author_id}`} className="text-[10px] font-semibold text-[#778278] hover:text-[#166534]">View profile</Link></div></div><div className="relative"><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${categoryTone[post.post_type]}`}>{categoryLabel[post.post_type]}</span>{post.author_id===userId&&<button onClick={()=>setMenuPost(menuPost===post.id?null:post.id)} aria-label="Post options" className="ml-2 rounded-lg p-1.5 text-[#8b958d] hover:bg-[#f1f5f1]"><MoreHorizontal size={17}/></button>}{menuPost===post.id&&<div className="absolute right-0 z-10 mt-1 w-36 rounded-xl border border-[#E3E9E1] bg-white p-1 shadow-lg"><button onClick={()=>deletePost(post.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 size={13}/> Delete post</button></div>}</div></div>
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#354137]">{post.content}</p>
          {post.link_url&&<a href={post.link_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-[#E3E9E1] bg-[#F7F9F5] px-3 py-2.5 text-xs font-semibold text-[#166534] hover:bg-[#f1f8f2]"><ExternalLink size={14}/><span className="truncate">{post.link_url}</span></a>}
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#E8EDE6] pt-4"><button onClick={()=>toggleLike(post.id)} className={`inline-flex items-center gap-2 text-xs font-bold ${likes[post.id]?.liked?"text-rose-600":"text-[#68736A] hover:text-rose-600"}`}><Heart size={16} fill={likes[post.id]?.liked?"currentColor":"none"}/>{likes[post.id]?.count??0} likes</button><button onClick={()=>setExpanded(expanded===post.id?null:post.id)} className="inline-flex items-center gap-2 text-xs font-bold text-[#68736A] hover:text-[#166534]"><MessageCircle size={16}/>{comments[post.id]?.length??0} comments</button>{post.author_id!==userId&&<Link href={`/messages?user=${post.author_id}`} className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#F0F5E8] px-3 py-2 text-[11px] font-bold text-[#166534] hover:bg-[#e3f3e7]"><MessageSquareText size={14}/> Start a conversation</Link>}</div>
          {expanded===post.id&&<div className="mt-4 border-t border-[#E8EDE6] pt-4"><div className="space-y-3">{(comments[post.id]??[]).map(comment=><div key={comment.id} className="flex gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F0F5E8] text-[9px] font-bold text-[#166534]">{comment.author?.avatar_url?<img src={comment.author.avatar_url} alt="" className="h-full w-full object-cover"/>:initials(comment.author?.display_name)}</div><div className="min-w-0 flex-1 rounded-xl bg-[#F5F7F3] px-3 py-2.5"><p className="text-[11px] font-bold text-[#263329]">{comment.author?.display_name||"MILE Member"} <span className="ml-1 font-normal text-[#9aa39b]">{new Date(comment.created_at).toLocaleString()}</span></p><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#58635A]">{comment.content}</p></div></div>)}</div><form onSubmit={e=>{e.preventDefault();void addComment(post.id);}} className="mt-4 flex gap-2"><input value={commentDrafts[post.id]??""} onChange={e=>setCommentDrafts(old=>({...old,[post.id]:e.target.value}))} maxLength={1200} placeholder="Write a thoughtful comment…" className="min-w-0 flex-1 rounded-full border border-[#DCE5D9] px-4 py-2.5 text-xs outline-none focus:border-[#166534]"/><button disabled={!(commentDrafts[post.id]??"").trim()} className="rounded-full bg-[#D7F36A] px-4 text-xs font-extrabold text-[#111A14] disabled:opacity-40">Reply</button></form></div>}
        </article>)}</div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl bg-[#111A14] p-5 text-white"><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#D7F36A]">A better network</p><h3 className="mt-3 text-xl font-extrabold leading-7 text-white">Your next opportunity could start with a conversation.</h3><p className="mt-2 text-xs leading-6 text-[#c1ccc3]">Show your work. Share what you know. Find people who bring a different strength to the table.</p><Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#D7F36A]">Explore your workspace <ExternalLink size={13}/></Link></div>
        <div className="rounded-2xl border border-[#E3E9E1] bg-white p-5"><h3 className="text-sm font-extrabold text-[#172019]">Community guidelines</h3><ul className="mt-3 space-y-3 text-xs leading-5 text-[#68736A]"><li>Share real work and useful lessons.</li><li>Be clear when you're hiring or seeking collaboration.</li><li>Give feedback that helps people improve.</li><li>Respect members and their work.</li></ul></div>
        <div className="rounded-2xl border border-[#E3E9E1] bg-white p-5"><h3 className="text-sm font-extrabold text-[#172019]">Make your profile count</h3><p className="mt-2 text-xs leading-5 text-[#778278]">A clear profile helps other members understand what you do and how to work with you.</p><Link href="/dashboard" className="mt-3 inline-flex text-xs font-bold text-[#166534]">Update your profile →</Link></div>
      </aside>
    </div>
  </div>;
}
