"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowRight,Check,ChevronLeft,ChevronRight,ChartNoAxesCombined,Target,FileSearch,ShieldCheck,Menu,X,Pause,Play} from "lucide-react";

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

  <section id="main-content" className="hero-shell relative isolate min-h-[690px] overflow-hidden bg-[#202522] text-white md:min-h-[760px]">
   <div className="hero-backgrounds" aria-hidden="true">
    {slides.map((item,i)=><div key={item.image} className={`hero-background ${active===i?"is-active":""}`} style={{backgroundImage:`url("${item.image}")`}}/>)}
   </div>
   <div className="hero-shade" aria-hidden="true"/>
   <div className="hero-grain" aria-hidden="true"/>
   <div className="relative z-10 mx-auto flex min-h-[690px] max-w-[1320px] flex-col justify-center px-5 pb-28 pt-20 md:min-h-[760px] md:px-8 md:pb-32">
    <div className="hero-copy max-w-[680px]" key={active}>
     <p className="mb-7 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[.22em] text-[#75e0aa]"><span className="h-px w-8 bg-[#1DBF73]"/>{slide.eyebrow}</p>
     <h1 className="max-w-[720px] text-[48px] font-semibold leading-[1.04] tracking-[-.06em] text-white sm:text-[66px] lg:text-[78px]">{slide.title}<br/><span className="text-[#6ed99f]">{slide.accent}</span></h1>
     <p className="mt-7 max-w-[510px] text-[14px] leading-[1.9] text-white/85 md:text-[16px]">{slide.body}</p>
     <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/signup" className="hero-primary inline-flex items-center justify-center gap-3 self-start rounded-full bg-[#1DBF73] px-7 py-4 text-[12px] font-extrabold text-white">Create your free account <ArrowRight size={15}/></Link><a href="#how-it-works" className="inline-flex items-center justify-center self-start rounded-full border border-white/45 bg-white/10 px-7 py-4 text-[12px] font-bold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/20">See how it works</a></div>
     <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-semibold text-white/75"><span className="flex items-center gap-2"><Check size={13} className="text-[#75e0aa]"/> Freelancer community</span><span className="flex items-center gap-2"><Check size={13} className="text-[#75e0aa]"/> Practical tools</span></div>
    </div>
    <div className="hero-slideshow-controls absolute bottom-9 left-5 right-5 z-20 flex items-center justify-between md:bottom-12 md:left-8 md:right-8">
     <div className="flex items-center gap-2.5"><span className="text-[10px] font-bold tracking-[.16em] text-white/75">0{active+1}</span><div className="flex items-center gap-2">{slides.map((item,i)=><button key={item.eyebrow} aria-label={`Show slide ${i+1}`} aria-current={active===i?"true":undefined} onClick={()=>setActive(i)} className={`hero-progress ${active===i?"active":""}`}/>)}</div><span className="text-[10px] font-bold tracking-[.16em] text-white/55">0{slides.length}</span></div>
     <div className="flex items-center gap-2"><button aria-label="Previous slide" onClick={()=>move(-1)} className="hero-control"><ChevronLeft size={17}/></button><button aria-label="Next slide" onClick={()=>move(1)} className="hero-control"><ChevronRight size={17}/></button><button aria-label={paused?"Play slideshow":"Pause slideshow"} onClick={()=>setPaused(v=>!v)} className="hero-control">{paused?<Play size={14}/>:<Pause size={14}/>}</button></div>
    </div>
   </div>
   <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/25 to-transparent"/>
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
      <p className="founder-kicker"><span/> A NOTE FROM THE FOUNDER</p>
      <h2 className="founder-heading">I built this because <em>freelancing shouldn't mean building everything alone.</em></h2>
      <div className="founder-rule"/>
      <p className="founder-lead">Freelancing can be exciting. But the bigger your ambition becomes, the more often you need the right people, opportunities and practical support around you.</p>
      <p className="founder-body">Who can help me deliver this project? Where can I find my next opportunity? What should I do when I have more work than I can handle? And how do I keep improving while I am busy doing the work?</p>
      <p className="founder-body">I wanted to create a place where freelancers can find people, opportunities and practical tools in the same ecosystem — whether they work on Fiverr, Upwork, independently, or somewhere else.</p>
      <p className="founder-body">That is the thinking behind MILE: progress is rarely one giant leap. It is the right connection, the right opportunity, the right decision — one step at a time.</p>
      <div className="founder-signoff"><span className="founder-signoff-name">Akinpelumi Moses Temitope</span><span className="founder-signoff-role">Founder, MILE</span></div>
     </div>
    </div>
    <div className="mt-16 border-t border-[#dfe8e0] pt-9">
     <p className="section-kicker">The problems MILE is built to make easier</p>
     <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
      <article className="problem-card"><span>01</span><h3>Finding the right people</h3><p>Discovering freelancers with the skills you need instead of searching through disconnected communities.</p></article>
      <article className="problem-card"><span>02</span><h3>Finding better opportunities</h3><p>Giving freelancers a place to share work, discover projects and turn useful connections into real opportunities.</p></article>
      <article className="problem-card"><span>03</span><h3>Handling more work</h3><p>When a project is too much for one person, find collaborators instead of turning good opportunities away.</p></article>
      <article className="problem-card"><span>04</span><h3>Knowing what to improve</h3><p>Use practical tools and insights to make better decisions about your freelance business and next move.</p></article>
     </div>
    </div>
    <p className="mt-10 max-w-3xl text-[12px] leading-7 text-[#7b857d]">A clear note: MILE is a freelancer network and practical work platform. Its tools can support your decisions, but they do not guarantee rankings, clients, orders or income.</p>
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
