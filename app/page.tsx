"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowRight,Check,ChevronLeft,ChevronRight,ChartNoAxesCombined,Target,FileSearch,ShieldCheck,Menu,X,Pause,Play} from "lucide-react";

const slides=[
 {eyebrow:"A clearer way to grow on Fiverr",title:"Stop guessing.",accent:"Start growing.",body:"Understand your seller performance, improve your gigs and make your next move with more confidence.",image:"https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=88",alt:"Independent professionals collaborating around a table",tag:"Make your next move count"},
 {eyebrow:"Make your numbers make sense",title:"Know what’s",accent:"really happening.",body:"Bring your impressions, clicks, orders and revenue into one clear view. See the story behind the numbers.",image:"https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=88",alt:"Small business team reviewing their work together",tag:"Clarity before action"},
 {eyebrow:"Build better gigs, one step at a time",title:"Turn insight",accent:"into action.",body:"Review how your services are presented and focus on practical improvements that are within your control.",image:"https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=88",alt:"Creative professionals sharing ideas at a workspace",tag:"A practical path forward"}
];
const benefits=[
 {n:"01",title:"Understand your performance",body:"See what your impressions, clicks and orders are telling you, without getting lost in complicated reports."},
 {n:"02",title:"Make every gig clearer",body:"Review your titles, descriptions, tags and offers with practical guidance you can actually use."},
 {n:"03",title:"Know what to work on next",body:"Turn your numbers and goals into focused actions instead of guessing what might help."}
];
const nav=[["How it works","#how-it-works"],["What you can do","#features"],["Our approach","#why"]];
export default function Home(){
 const [menu,setMenu]=useState(false),[active,setActive]=useState(0),[paused,setPaused]=useState(false);
 useEffect(()=>{if(paused)return;const timer=window.setInterval(()=>setActive(v=>(v+1)%slides.length),6500);return()=>window.clearInterval(timer)},[paused]);
 const slide=slides[active];
 const move=(direction:number)=>setActive(v=>(v+direction+slides.length)%slides.length);
 return <main className="min-h-screen overflow-hidden bg-white text-[#222325]">
  <a href="#main-content" className="skip-link">Skip to content</a>
  <header className="site-nav sticky top-0 z-50 border-b border-[#e9ece9] bg-white/90 backdrop-blur-xl">
   <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-8">
    <Link href="/" aria-label="Fiverr Growth Assistant home" className="group flex items-center gap-3">
     <span className="brand-mark flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#1DBF73] text-lg font-extrabold text-white">f</span>
     <span className="flex flex-col"><span className="text-[13px] font-extrabold tracking-[-.035em] text-[#222325]">Fiverr Growth Assistant</span><span className="mt-0.5 text-[9px] font-medium tracking-[.08em] text-[#858b86]">SELL WITH MORE CLARITY</span></span>
    </Link>
    <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">{nav.map(([label,href])=><a key={href} href={href} className="nav-link rounded-full px-4 py-3 text-[11px] font-semibold text-[#62646A]">{label}</a>)}</nav>
    <div className="hidden items-center gap-5 md:flex"><Link href="/login" className="text-[11px] font-bold text-[#404145] transition hover:text-[#15965A]">Log in</Link><Link href="/signup" className="nav-cta inline-flex items-center gap-2 rounded-full bg-[#222325] px-5 py-3.5 text-[11px] font-bold text-white">Get started <ArrowRight size={14}/></Link></div>
    <button aria-label={menu?"Close navigation menu":"Open navigation menu"} aria-expanded={menu} onClick={()=>setMenu(v=>!v)} className="rounded-full border border-[#e6e9e6] p-2.5 text-[#333] md:hidden">{menu?<X size={18}/>:<Menu size={18}/>}</button>
   </div>
   {menu&&<div className="mobile-nav border-t border-[#edf0f2] bg-white px-5 py-6 md:hidden"><nav aria-label="Mobile navigation" className="flex flex-col gap-1">{nav.map(([label,href])=><a key={href} onClick={()=>setMenu(false)} href={href} className="rounded-lg px-3 py-3 text-sm font-semibold text-[#4f5651] hover:bg-[#f1f8f3]">{label}</a>)}<div className="my-3 border-t border-[#edf0f2]"/><Link onClick={()=>setMenu(false)} href="/login" className="px-3 py-3 text-sm font-semibold text-[#404145]">Log in</Link><Link onClick={()=>setMenu(false)} href="/signup" className="mx-3 mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#222325] px-5 py-3.5 text-sm font-bold text-white">Get started <ArrowRight size={15}/></Link></nav></div>}
  </header>

  <section id="main-content" className="hero-shell relative bg-[#f5f7f5]">
   <div className="hero-orb hero-orb-one"/><div className="hero-orb hero-orb-two"/>
   <div className="relative mx-auto grid min-h-[650px] max-w-[1320px] items-center gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[.92fr_1.08fr]">
    <div className="hero-copy relative z-10 max-w-[590px]" key={active}>
     <p className="mb-6 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#15965A]"><span className="h-[2px] w-7 bg-[#1DBF73]"/>{slide.eyebrow}</p>
     <h1 className="text-[44px] font-semibold leading-[1.06] tracking-[-.065em] text-[#222325] sm:text-[58px] lg:text-[68px]">{slide.title}<br/><span className="text-[#1DBF73]">{slide.accent}</span></h1>
     <p className="mt-7 max-w-[465px] text-[14px] leading-[1.9] text-[#626a64] md:text-[15px]">{slide.body}</p>
     <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/signup" className="hero-primary inline-flex items-center justify-center gap-3 rounded-full bg-[#1DBF73] px-7 py-4 text-[12px] font-extrabold text-white">Create your free account <ArrowRight size={15}/></Link><a href="#how-it-works" className="inline-flex items-center justify-center rounded-full border border-[#dce3dd] bg-white/80 px-7 py-4 text-[12px] font-bold text-[#404145] transition hover:border-[#1DBF73]">See how it works</a></div>
     <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-semibold text-[#727b74]"><span className="flex items-center gap-2"><Check size={13} className="text-[#15965A]"/> Practical seller guidance</span><span className="flex items-center gap-2"><Check size={13} className="text-[#15965A]"/> Built around your data</span></div>
    </div>
    <div className="hero-visual relative mx-auto w-full max-w-[660px]">
     <div className="hero-image-frame relative overflow-hidden rounded-[26px] bg-[#dce4de] shadow-[0_30px_90px_rgba(29,49,37,.17)]">
      <img key={slide.image} src={slide.image} alt={slide.alt} className="hero-slide-image h-[390px] w-full object-cover sm:h-[510px] lg:h-[540px]"/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#101b14]/65 via-transparent to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-6 text-white sm:p-8"><div><p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-white/70">Fiverr Growth Assistant</p><p className="mt-2 text-[19px] font-semibold tracking-[-.035em] sm:text-[23px]">{slide.tag}</p></div><span className="rounded-full border border-white/35 bg-white/10 px-3 py-2 text-[10px] font-semibold backdrop-blur-md">0{active+1} / 0{slides.length}</span></div>
     </div>
     <div className="hero-floating-card absolute -bottom-6 -left-3 rounded-2xl border border-[#edf0ed] bg-white px-5 py-4 shadow-[0_15px_45px_rgba(27,40,31,.12)] sm:-left-8"><p className="text-[9px] font-extrabold uppercase tracking-[.15em] text-[#929a94]">Your next step</p><p className="mt-1.5 text-[12px] font-extrabold text-[#222325]">Find what to improve</p><div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-[#e9f4ec]"><div className="h-full w-2/3 rounded-full bg-[#1DBF73]"/></div></div>
     <div className="hero-controls absolute -bottom-[76px] right-0 flex items-center gap-2 sm:bottom-5 sm:right-5">
      <button aria-label="Previous slide" onClick={()=>move(-1)} className="carousel-arrow"><ChevronLeft size={17}/></button>
      <div className="flex items-center gap-1.5 rounded-full border border-white/50 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">{slides.map((s,i)=><button key={s.eyebrow} aria-label={`Show slide ${i+1}`} aria-current={active===i?"true":undefined} onClick={()=>setActive(i)} className={`carousel-dot ${active===i?"active":""}`}/>)}</div>
      <button aria-label="Next slide" onClick={()=>move(1)} className="carousel-arrow"><ChevronRight size={17}/></button>
      <button aria-label={paused?"Play slideshow":"Pause slideshow"} onClick={()=>setPaused(v=>!v)} className="carousel-arrow hidden sm:flex">{paused?<Play size={14}/>:<Pause size={14}/>}</button>
     </div>
    </div>
   </div>
   <div className="hero-bottom-line"/>
  </section>

  <section className="mx-auto max-w-[1320px] px-5 py-20 md:px-8 md:py-28">
   <div className="reveal max-w-[680px]"><p className="section-kicker">A practical growth workspace</p><h2 className="section-heading mt-4">Your Fiverr business deserves more than guesswork.</h2><p className="mt-5 max-w-[580px] text-[14px] leading-8 text-[#727b74]">Growing as a seller can feel confusing. You have numbers, gigs and plenty of advice — but knowing what those things mean and what to do next is another matter.</p></div>
   <div id="features" className="mt-14 grid gap-8 border-t border-[#e9eee9] pt-9 md:grid-cols-3">{benefits.map((b,i)=><article key={b.n} className="feature-card reveal" style={{animationDelay:`${i*110}ms`}}><p className="text-[11px] font-extrabold tracking-[.12em] text-[#1DBF73]">{b.n}</p><h3 className="mt-7 text-[18px] font-bold tracking-[-.025em] text-[#222325]">{b.title}</h3><p className="mt-3 text-[13px] leading-7 text-[#727b74]">{b.body}</p></article>)}</div>
  </section>

  <section id="how-it-works" className="bg-[#f5f8f5]">
   <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[.9fr_1.1fr]">
    <div className="reveal"><p className="section-kicker">Simple by design</p><h2 className="section-heading mt-4 max-w-md">A more useful way to work on your growth.</h2><p className="mt-5 max-w-md text-[13px] leading-8 text-[#727b74]">You do not need another complicated tool. You need a place that helps you see where you are, understand what matters and take the next sensible step.</p><Link href="/signup" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#222325] px-6 py-4 text-[11px] font-extrabold text-white transition hover:bg-[#404145]">Get started <ArrowRight size={14}/></Link></div>
    <div className="grid gap-4 sm:grid-cols-2">
     <div className="process-card reveal"><ChartNoAxesCombined className="text-[#1DBF73]" size={22}/><p className="mt-7 text-[14px] font-bold text-[#222325]">1. See your numbers</p><p className="mt-2 text-[12px] leading-6 text-[#727b74]">Record impressions, clicks, orders and revenue in one simple view.</p></div>
     <div className="process-card reveal" style={{animationDelay:"90ms"}}><FileSearch className="text-[#1DBF73]" size={22}/><p className="mt-7 text-[14px] font-bold text-[#222325]">2. Review your gigs</p><p className="mt-2 text-[12px] leading-6 text-[#727b74]">Check how clearly your service is presented to potential buyers.</p></div>
     <div className="process-card reveal" style={{animationDelay:"180ms"}}><Target className="text-[#1DBF73]" size={22}/><p className="mt-7 text-[14px] font-bold text-[#222325]">3. Choose a priority</p><p className="mt-2 text-[12px] leading-6 text-[#727b74]">Focus on one meaningful improvement at a time.</p></div>
     <div className="process-card reveal" style={{animationDelay:"270ms"}}><ShieldCheck className="text-[#1DBF73]" size={22}/><p className="mt-7 text-[14px] font-bold text-[#222325]">4. Learn as you go</p><p className="mt-2 text-[12px] leading-6 text-[#727b74]">Understand the reasoning behind recommendations and experiments.</p></div>
    </div>
   </div>
  </section>

  <section id="why" className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-2">
   <div className="reveal overflow-hidden rounded-[24px] bg-[#e6ece7]"><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=88" alt="Bright, calm workspace with a large shared desk" className="h-[330px] w-full object-cover sm:h-[430px]"/></div>
   <div className="reveal"><p className="section-kicker">Our approach</p><h2 className="section-heading mt-4">Useful insight. Honest expectations. Real progress.</h2><p className="mt-5 text-[13px] leading-8 text-[#727b74]">There is no magic formula for success on Fiverr. Search visibility, buyer decisions and sales are influenced by many factors. Our goal is to help you understand the information you have, improve what you can control and make more deliberate decisions.</p><p className="mt-4 text-[13px] leading-8 text-[#727b74]">We do not promise first-page rankings or guaranteed orders. We give you a clearer way to work towards better outcomes.</p></div>
  </section>

  <section className="cta-band bg-[#222325]"><div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center md:px-8 md:py-20"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#1DBF73]">Make your next move count</p><h2 className="mt-4 max-w-xl text-[32px] font-semibold leading-tight tracking-[-.04em] text-white sm:text-[40px]">Build your Fiverr growth around better decisions.</h2></div><Link href="/signup" className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#1DBF73] px-7 py-4 text-[12px] font-extrabold text-white transition hover:bg-[#15965A]">Create your account <ArrowRight size={15}/></Link></div></section>
  <footer className="bg-white"><div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-8 text-[10px] text-[#89938c] md:flex-row md:items-center md:justify-between md:px-8"><Link href="/" className="font-extrabold text-[#343A40]">Fiverr Growth Assistant</Link><span>Independent seller guidance. Not affiliated with or endorsed by Fiverr.</span><span>© {new Date().getFullYear()} Fiverr Growth Assistant</span></div></footer>
 </main>
}
