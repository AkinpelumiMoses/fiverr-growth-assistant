"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowRight,Check,ChevronLeft,ChevronRight,Users,BriefcaseBusiness,Target,ShieldCheck,Menu,X,Pause,Play,Globe2} from "lucide-react";

const slides=[
 {eyebrow:"A network built for independent work",title:"Your next opportunity",accent:"could be one connection away.",body:"MILE brings freelancers together to discover work, find collaborators, solve problems and keep moving forward — wherever they work online.",image:"https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=88",alt:"Independent professionals collaborating around a table",tag:"Make your next move count"},
 {eyebrow:"When work gets bigger",title:"Find the right person.",accent:"Share the opportunity.",body:"Post the work you need help with, discover freelancers with the skills you need, and turn overflow into collaboration.",image:"https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=88",alt:"Small business team reviewing their work together",tag:"Clarity before action"},
 {eyebrow:"Tools are still part of the journey",title:"Grow your freelance",accent:"business with intention.",body:"Use practical tools for Fiverr and other parts of your freelance workflow — without losing sight of the people and opportunities around you.",image:"https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=88",alt:"Creative professionals sharing ideas at a workspace",tag:"A practical path forward"}
];
const benefits=[
 {n:"01",title:"Connect with the right freelancers",body:"Discover people by niche, skills and experience when you need another person to make the work happen."},
 {n:"02",title:"Find and share opportunities",body:"Post work you need help with or discover projects shared by freelancers who need the right support."},
 {n:"03",title:"Keep growing with useful tools",body:"Use practical growth, research and AI tools — including Fiverr-focused tools — alongside the community."}
];
const nav=[["Why MILE","#why-it-exists"],["How it works","#how-it-works"],["What you can do","#features"],["Our approach","#why"]];
export default function Home(){
 const [menu,setMenu]=useState(false),[active,setActive]=useState(0),[paused,setPaused]=useState(false);
 useEffect(()=>{if(paused)return;const timer=window.setInterval(()=>setActive(v=>(v+1)%slides.length),6500);return()=>window.clearInterval(timer)},[paused]);
 const slide=slides[active];
 const move=(direction:number)=>setActive(v=>(v+direction+slides.length)%slides.length);
 return <main className="min-h-screen overflow-hidden bg-white text-[#222325]">
  <header className="site-nav sticky top-0 z-50 border-b border-[#e9ece9] bg-white/90 backdrop-blur-xl">
   <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-8">
    <Link href="/" aria-label="MILE home" className="group flex items-center gap-3">
     <span className="brand-mark flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#1DBF73] text-lg font-extrabold text-white">M</span>
     <span className="flex flex-col"><span className="text-[13px] font-extrabold tracking-[-.035em] text-[#222325]">MILE</span><span className="mt-0.5 text-[9px] font-medium tracking-[.08em] text-[#858b86]">EVERY STEP HAS A PURPOSE</span></span>
    </Link>
    <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">{nav.map(([label,href])=><a key={href} href={href} className="nav-link rounded-full px-4 py-3 text-[11px] font-semibold text-[#62646A]">{label}</a>)}</nav>
    <div className="hidden items-center gap-5 md:flex"><Link href="/login" className="text-[11px] font-bold text-[#404145] transition hover:text-[#15965A]">Log in</Link><Link href="/signup" className="nav-cta inline-flex items-center gap-2 rounded-full bg-[#222325] px-5 py-3.5 text-[11px] font-bold text-white">Get started <ArrowRight size={14}/></Link></div>
    <button aria-label={menu?"Close navigation menu":"Open navigation menu"} aria-expanded={menu} onClick={()=>setMenu(v=>!v)} className="rounded-full border border-[#e6e9e6] p-2.5 text-[#333] md:hidden">{menu?<X size={18}/>:<Menu size={18}/>}</button>
   </div>
   {menu&&<div className="mobile-nav border-t border-[#edf0f2] bg-white px-5 py-6 md:hidden"><nav aria-label="Mobile navigation" className="flex flex-col gap-1">{nav.map(([label,href])=><a key={href} onClick={()=>setMenu(false)} href={href} className="rounded-lg px-3 py-3 text-sm font-semibold text-[#4f5651] hover:bg-[#f1f8f3]">{label}</a>)}<div className="my-3 border-t border-[#edf0f2]"/><Link onClick={()=>setMenu(false)} href="/login" className="px-3 py-3 text-sm font-semibold text-[#404145]">Log in</Link><Link onClick={()=>setMenu(false)} href="/signup" className="mx-3 mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#222325] px-5 py-3.5 text-sm font-bold text-white">Get started <ArrowRight size={15}/></Link></nav></div>}
  </header>

  <section id="main-content" className="hero-shell relative isolate min-h-[720px] overflow-hidden bg-[#111614] text-white md:min-h-[790px]">
   <div className="hero-backgrounds" aria-hidden="true">{slides.map((item,i)=><div key={item.image} className={`hero-background transition-transform duration-[1200ms] ${active===i?"is-active scale-105":"scale-100"}`} style={{backgroundImage:`url("${item.image}")`}}/>)}</div>
   <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_75%_35%,rgba(29,191,115,.22),transparent_32%),linear-gradient(90deg,rgba(8,12,10,.92)_0%,rgba(8,12,10,.72)_48%,rgba(8,12,10,.38)_100%)]"/>
   <div className="absolute inset-0 z-[1] opacity-30 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:52px_52px]"/>
   <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[1320px] items-center px-5 py-24 md:min-h-[790px] md:px-8">
    <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
     <div className="hero-copy max-w-[720px]" key={active}>
      <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[9px] font-extrabold uppercase tracking-[.2em] text-[#8ce6b6] backdrop-blur-md">{slide.eyebrow}</div>
      <h1 className="max-w-[760px] text-[50px] font-semibold leading-[.98] tracking-[-.065em] text-white sm:text-[68px] lg:text-[82px]">{slide.title}<br/><span className="text-[#71dfa3]">{slide.accent}</span></h1>
      <p className="mt-7 max-w-[590px] text-[15px] leading-[1.85] text-white/78 md:text-[17px]">{slide.body}</p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/signup" className="hero-primary group inline-flex items-center justify-center gap-3 rounded-full bg-[#1DBF73] px-7 py-4 text-[12px] font-extrabold text-white shadow-[0_16px_40px_rgba(29,191,115,.22)] transition duration-300 hover:-translate-y-1 hover:bg-[#20c97b]">Join MILE <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1"/></Link><a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-[12px] font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/15">See how it works</a></div>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-semibold text-white/65"><span className="flex items-center gap-2"><Check size={13} className="text-[#75e0aa]"/> Find people</span><span className="flex items-center gap-2"><Check size={13} className="text-[#75e0aa]"/> Find opportunities</span><span className="flex items-center gap-2"><Check size={13} className="text-[#75e0aa]"/> Keep moving</span></div>
     </div>
     <div className="hidden lg:block">
      <div className="relative mx-auto h-[420px] w-full max-w-[470px]">
       <div className="absolute right-0 top-4 h-72 w-72 rounded-full bg-[#1DBF73]/15 blur-3xl"/>
       <div className="absolute inset-x-8 top-10 rounded-[28px] border border-white/15 bg-[#18201c]/80 p-6 shadow-2xl backdrop-blur-xl transition duration-700 hover:-translate-y-2">
        <div className="flex items-center justify-between"><div><p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-[#79dfa8]">MILE NETWORK</p><p className="mt-2 text-xl font-semibold tracking-[-.03em]">Every step has a purpose.</p></div><div className="rounded-full bg-[#1DBF73]/15 p-3 text-[#71dfa3]"><Globe2 size={20}/></div></div>
        <div className="mt-8 space-y-3">
         <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-3"><span className="rounded-xl bg-[#1DBF73]/15 p-2 text-[#71dfa3]"><Users size={16}/></span><div className="flex-1"><p className="text-xs font-bold">Find a collaborator</p><p className="mt-0.5 text-[10px] text-white/45">Design · Development · Marketing</p></div><ArrowRight size={14} className="text-white/40"/></div>
         <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-3"><span className="rounded-xl bg-[#1DBF73]/15 p-2 text-[#71dfa3]"><BriefcaseBusiness size={16}/></span><div className="flex-1"><p className="text-xs font-bold">Discover an opportunity</p><p className="mt-0.5 text-[10px] text-white/45">Work shared by freelancers</p></div><ArrowRight size={14} className="text-white/40"/></div>
         <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-3"><span className="rounded-xl bg-[#1DBF73]/15 p-2 text-[#71dfa3]"><Target size={16}/></span><div className="flex-1"><p className="text-xs font-bold">Move your work forward</p><p className="mt-0.5 text-[10px] text-white/45">Tools for the journey</p></div><ArrowRight size={14} className="text-white/40"/></div>
        </div>
       </div>
       <div className="absolute -bottom-1 left-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl"><p className="text-[9px] uppercase tracking-[.16em] text-white/45">THE IDEA</p><p className="mt-1 text-xs font-bold">Connection creates movement.</p></div>
      </div>
     </div>
    </div>
    <div className="absolute bottom-8 left-5 right-5 z-20 flex items-center justify-between md:left-8 md:right-8">
     <div className="flex items-center gap-3"><span className="text-[10px] font-bold tracking-[.16em] text-white/70">0{active+1}</span><div className="flex items-center gap-2">{slides.map((item,i)=><button key={item.eyebrow} aria-label={`Show slide ${i+1}`} aria-current={active===i?"true":undefined} onClick={()=>setActive(i)} className={`h-1 rounded-full transition-all duration-500 ${active===i?"w-12 bg-[#1DBF73]":"w-5 bg-white/30 hover:bg-white/60"}`}/>)}</div><span className="text-[10px] font-bold tracking-[.16em] text-white/40">0{slides.length}</span></div>
     <div className="flex items-center gap-2"><button aria-label="Previous slide" onClick={()=>move(-1)} className="hero-control transition hover:scale-105"><ChevronLeft size={17}/></button><button aria-label="Next slide" onClick={()=>move(1)} className="hero-control transition hover:scale-105"><ChevronRight size={17}/></button><button aria-label={paused?"Play slideshow":"Pause slideshow"} onClick={()=>setPaused(v=>!v)} className="hero-control transition hover:scale-105">{paused?<Play size={14}/>:<Pause size={14}/>}</button></div>
    </div>
   </div>
  </section>

  <section id="why-it-exists" className="bg-[#f5f8f5]">
   <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-8 md:py-28">
    <div className="founder-editorial reveal">
     <div className="founder-portrait-wrap">
      <img src="https://myportfolio.creatiftechnologies.com.ng/images/A2S_5186c.jpg%20(1).jpeg" alt="MILE founder, Akinpelumi Moses Temitope" className="founder-portrait"/>
      <div className="founder-photo-caption"><span className="founder-caption-line"/><span>THE PERSON BEHIND THE PLATFORM</span></div>
      <div className="founder-photo-index">01 <span>/ FOUNDER</span></div>
     </div>
     <div className="founder-copy">
      <p className="founder-kicker"><span/> A NOTE FROM THE BUILDER</p>
      <h2 className="founder-heading">MILE was born from a simple idea: <em>the journey is easier when people don't have to walk it alone.</em></h2>
      <div className="founder-rule"/>
      <p className="founder-lead">The name MILE is inspired by the story of Moses — a journey of leadership, direction and helping people move from where they are toward where they need to be.</p>
      <p className="founder-body">That story stayed with me because freelancing has its own kind of journey. It can look independent from the outside, but the reality is different. You face difficult projects, dry periods, too much work, unfamiliar problems and moments when you simply need someone with the right skill beside you.</p>
      <p className="founder-body">I have experienced the uncertainty that comes with building in this space. I have seen how much easier a problem can become when the right person is available, how one opportunity can create another, and how much further we can go when freelancers stop seeing one another only as competitors.</p>
      <p className="founder-body">So MILE is being built as more than a collection of freelance tools. It is a place to meet people, share opportunities, find help, collaborate on work and keep developing — whether your work comes through Fiverr, Upwork, direct clients or somewhere else.</p>
      <p className="founder-body">The tools matter. But the people are the foundation. That is why the idea behind MILE is simple: <strong>every step has a purpose.</strong></p>
      <div className="founder-signoff"><span className="founder-signoff-name">Akinpelumi Moses Temitope</span><span className="founder-signoff-role">Builder &amp; Founder, MILE</span></div>
     </div>    </div>
    <div className="mt-16 border-t border-[#dfe8e0] pt-9">
     <p className="section-kicker">What MILE is here to make easier</p>
     <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <article className="problem-card transition duration-300 hover:-translate-y-1"><span>01</span><h3>Find the right people</h3><p>Discover freelancers with the skills you need instead of searching through disconnected communities.</p></article>
      <article className="problem-card transition duration-300 hover:-translate-y-1"><span>02</span><h3>Find better opportunities</h3><p>Share work, discover projects and turn useful connections into real opportunities.</p></article>
      <article className="problem-card transition duration-300 hover:-translate-y-1"><span>03</span><h3>Handle more work</h3><p>When a project is too much for one person, find collaborators instead of turning good work away.</p></article>
      <article className="problem-card transition duration-300 hover:-translate-y-1"><span>04</span><h3>Keep getting better</h3><p>Use practical tools and insights to make better decisions about your freelance business and next move.</p></article>
     </div>
    </div>
    <p className="mt-10 max-w-3xl text-[12px] leading-7 text-[#7b857d]">MILE does not promise clients, rankings, orders or guaranteed income. It gives freelancers a place to connect, discover opportunities and use practical tools to take better steps.</p>
    </div>
  </section>

  <section className="mx-auto max-w-[1320px] px-5 py-20 md:px-8 md:py-28">
   <div className="reveal max-w-[680px]"><p className="section-kicker">One platform. More possibilities.</p><h2 className="section-heading mt-4">The people are the foundation. The tools help you move.</h2><p className="mt-5 max-w-[580px] text-[14px] leading-8 text-[#727b74]">MILE starts with connection. Then it gives freelancers the tools to turn those connections into opportunities, better work and steady progress.</p></div>
   <div id="features" className="mt-14 grid gap-8 border-t border-[#e9eee9] pt-9 md:grid-cols-3">{benefits.map((b,i)=><article key={b.n} className="feature-card reveal" style={{animationDelay:`${i*110}ms`}}><p className="text-[11px] font-extrabold tracking-[.12em] text-[#1DBF73]">{b.n}</p><h3 className="mt-7 text-[18px] font-bold tracking-[-.025em] text-[#222325]">{b.title}</h3><p className="mt-3 text-[13px] leading-7 text-[#727b74]">{b.body}</p></article>)}</div>
  </section>

  <section id="how-it-works" className="bg-[#f5f8f5]">
   <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[.9fr_1.1fr]">
    <div className="reveal"><p className="section-kicker">How MILE works</p><h2 className="section-heading mt-4 max-w-md">From “I need someone” to “I found them.”</h2><p className="mt-5 max-w-md text-[13px] leading-8 text-[#727b74]">MILE is designed around a simple loop: show what you do, discover who is around you, share opportunities and use the right tools to keep moving.</p><Link href="/signup" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#222325] px-6 py-4 text-[11px] font-extrabold text-white transition hover:bg-[#404145]">Get started <ArrowRight size={14}/></Link></div>
    <div className="grid gap-4 sm:grid-cols-2">
     <div className="process-card reveal"><Users className="text-[#1DBF73]" size={22}/><p className="mt-7 text-[14px] font-bold text-[#222325]">1. Build your profile</p><p className="mt-2 text-[12px] leading-6 text-[#727b74]">Show your niche, skills, experience and the kind of work you can help with.</p></div>
     <div className="process-card reveal" style={{animationDelay:"90ms"}}><BriefcaseBusiness className="text-[#1DBF73]" size={22}/><p className="mt-7 text-[14px] font-bold text-[#222325]">2. Discover opportunities</p><p className="mt-2 text-[12px] leading-6 text-[#727b74]">Find work shared by freelancers or post what you need help delivering.</p></div>
     <div className="process-card reveal" style={{animationDelay:"180ms"}}><Target className="text-[#1DBF73]" size={22}/><p className="mt-7 text-[14px] font-bold text-[#222325]">3. Connect and collaborate</p><p className="mt-2 text-[12px] leading-6 text-[#727b74]">Find the right person and turn a simple connection into useful work.</p></div>
     <div className="process-card reveal" style={{animationDelay:"270ms"}}><ShieldCheck className="text-[#1DBF73]" size={22}/><p className="mt-7 text-[14px] font-bold text-[#222325]">4. Keep moving</p><p className="mt-2 text-[12px] leading-6 text-[#727b74]">Use MILE's practical tools to improve your work and make your next step clearer.</p></div>
    </div>
   </div>
  </section>

  <section id="why" className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-2">
   <div className="reveal overflow-hidden rounded-[24px] bg-[#e6ece7]"><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=88" alt="Bright, calm workspace with a large shared desk" className="h-[330px] w-full object-cover sm:h-[430px]"/></div>
   <div className="reveal"><p className="section-kicker">Our approach</p><h2 className="section-heading mt-4">People first. Progress always.</h2><p className="mt-5 text-[13px] leading-8 text-[#727b74]">Freelancing can be independent without being isolated. MILE is built around the belief that the right person can unlock the right opportunity, and the right tool can help you deliver it better.</p><p className="mt-4 text-[13px] leading-8 text-[#727b74]">We do not promise clients, rankings or guaranteed income. We create the environment, connections and tools that help freelancers take better steps.</p></div>
  </section>

  <section className="cta-band bg-[#222325]"><div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center md:px-8 md:py-20"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#1DBF73]">Every step has a purpose</p><h2 className="mt-4 max-w-xl text-[32px] font-semibold leading-tight tracking-[-.04em] text-white sm:text-[40px]">Your next connection could become your next opportunity.</h2></div><Link href="/signup" className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#1DBF73] px-7 py-4 text-[12px] font-extrabold text-white transition hover:bg-[#15965A]">Create your account <ArrowRight size={15}/></Link></div></section>
  <footer className="bg-white"><div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-8 text-[10px] text-[#89938c] md:flex-row md:items-center md:justify-between md:px-8"><Link href="/" className="font-extrabold text-[#343A40]">MILE</Link><span>A freelancer platform built for connection, opportunity and progress. Fiverr is one of the platforms MILE can support.</span><span>© {new Date().getFullYear()} MILE</span></div></footer>
 </main>
}
