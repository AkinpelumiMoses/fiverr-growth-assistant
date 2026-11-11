"use client";
import Link from "next/link";
import {ArrowRight,Check,ChartNoAxesCombined,Target,FileSearch,ShieldCheck,Menu,X} from "lucide-react";
import {useState} from "react";

const benefits=[
 {n:"01",title:"Understand your performance",body:"See what your impressions, clicks and orders are telling you, without getting lost in complicated reports."},
 {n:"02",title:"Make every gig clearer",body:"Review your titles, descriptions, tags and offers with practical guidance you can actually use."},
 {n:"03",title:"Know what to work on next",body:"Turn your numbers and goals into focused actions instead of guessing what might help."}
];
export default function Home(){
 const [menu,setMenu]=useState(false);
 return <main className="min-h-screen bg-white text-[#20242c]">
  <header className="sticky top-0 z-40 border-b border-[#edf0f2] bg-white/95 backdrop-blur">
   <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 md:px-8">
    <Link href="/" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#263e55] text-sm font-bold text-white">F</span><span className="text-[14px] font-bold tracking-[-.03em]">Fiverr Growth Assistant</span></Link>
    <nav className="hidden items-center gap-9 text-[12px] font-semibold text-[#66717c] md:flex"><a href="#how-it-works" className="hover:text-[#263e55]">How it works</a><a href="#features" className="hover:text-[#263e55]">What you can do</a><a href="#why" className="hover:text-[#263e55]">Our approach</a></nav>
    <div className="hidden items-center gap-5 md:flex"><Link href="/login" className="text-[12px] font-semibold text-[#475563] hover:text-[#172b3d]">Log in</Link><Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-[#263e55] px-4 py-3 text-[11px] font-bold text-white transition hover:bg-[#1b3045]">Get started <ArrowRight size={14}/></Link></div>
    <button aria-label="Toggle menu" onClick={()=>setMenu(v=>!v)} className="rounded-lg border border-[#e7ebef] p-2 md:hidden">{menu?<X size={18}/>:<Menu size={18}/>}</button>
   </div>
   {menu&&<div className="border-t border-[#edf0f2] bg-white px-5 py-5 md:hidden"><nav className="flex flex-col gap-5 text-sm font-semibold text-[#53606c]"><a onClick={()=>setMenu(false)} href="#how-it-works">How it works</a><a onClick={()=>setMenu(false)} href="#features">What you can do</a><a onClick={()=>setMenu(false)} href="#why">Our approach</a><Link href="/login">Log in</Link><Link className="font-bold text-[#263e55]" href="/signup">Get started <ArrowRight className="inline" size={14}/></Link></nav></div>}
  </header>

  <section className="relative overflow-hidden bg-[#f5f7f8]">
   <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.02fr_.98fr]">
    <div className="relative z-10 max-w-[590px]">
     <p className="mb-6 text-[10px] font-bold uppercase tracking-[.22em] text-[#647d91]">A clearer way to grow on Fiverr</p>
     <h1 className="text-[42px] font-semibold leading-[1.12] tracking-[-.055em] text-[#1e2d3a] sm:text-[54px] lg:text-[62px]">Stop guessing.<br/><span className="text-[#71879a]">Start growing</span><br/>with a plan.</h1>
     <p className="mt-7 max-w-[490px] text-[14px] leading-7 text-[#66727e] md:text-[15px]">Fiverr Growth Assistant helps you understand your seller performance, improve your gigs and decide what to focus on next — with practical guidance, not empty promises.</p>
     <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/signup" className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#263e55] px-6 py-4 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#1b3045]">Create your free account <ArrowRight size={15}/></Link><a href="#how-it-works" className="inline-flex items-center justify-center rounded-lg border border-[#dce2e7] bg-white px-6 py-4 text-[12px] font-bold text-[#425466] hover:border-[#aebbc6]">Explore how it works</a></div>
     <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-medium text-[#788590]"><span className="flex items-center gap-2"><Check size={13} className="text-[#54735e]"/> Clear, practical guidance</span><span className="flex items-center gap-2"><Check size={13} className="text-[#54735e]"/> Built around your data</span></div>
    </div>
    <div className="relative mx-auto w-full max-w-[570px]">
     <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#dce5eb] blur-3xl"/>
     <div className="relative overflow-hidden rounded-[22px] bg-[#d9e0e5] shadow-[0_24px_70px_rgba(35,54,70,.14)]">
      <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85" alt="Independent professionals working together around a table" className="h-[390px] w-full object-cover sm:h-[470px]"/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#172a3b]/75 via-transparent to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/70">Built for independent sellers</p><p className="mt-3 max-w-sm text-[23px] font-semibold leading-tight tracking-[-.035em] sm:text-[28px]">Better decisions begin with a clearer picture.</p></div>
     </div>
     <div className="absolute -bottom-5 -left-3 rounded-xl border border-[#e9edf0] bg-white px-4 py-3 shadow-lg sm:-left-7"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#87939d]">Your next step</p><p className="mt-1 text-[12px] font-bold text-[#273b4d]">Find what to improve</p></div>
    </div>
   </div>
  </section>

  <section id="features" className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
   <div className="max-w-[650px]"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#71879a]">A practical growth workspace</p><h2 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-.045em] text-[#233342] sm:text-[42px]">Your Fiverr business deserves more than guesswork.</h2><p className="mt-5 text-[14px] leading-7 text-[#75808a]">Growing as a seller can feel confusing. You have numbers, gigs and plenty of advice — but knowing what those things mean and what to do next is another matter.</p></div>
   <div className="mt-14 grid gap-10 border-t border-[#e9edf0] pt-9 md:grid-cols-3">{benefits.map((b,i)=><article key={b.n} className="max-w-sm"><p className="text-[11px] font-semibold tracking-[.12em] text-[#8b9ba8]">{b.n}</p><h3 className="mt-7 text-[18px] font-semibold tracking-[-.025em] text-[#263746]">{b.title}</h3><p className="mt-3 text-[13px] leading-7 text-[#78838d]">{b.body}</p></article>)}</div>
  </section>

  <section id="how-it-works" className="bg-[#f5f7f8]">
   <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[.9fr_1.1fr]">
    <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#71879a]">Simple by design</p><h2 className="mt-4 max-w-md text-[34px] font-semibold leading-tight tracking-[-.045em] text-[#233342]">A more useful way to work on your growth.</h2><p className="mt-5 max-w-md text-[13px] leading-7 text-[#75808a]">You do not need another complicated tool. You need a place that helps you see where you are, understand what matters and take the next sensible step.</p><Link href="/signup" className="mt-8 inline-flex items-center gap-3 rounded-lg bg-[#263e55] px-5 py-4 text-[11px] font-bold text-white hover:bg-[#1b3045]">Get started <ArrowRight size={14}/></Link></div>
    <div className="grid gap-4 sm:grid-cols-2">
     <div className="rounded-2xl bg-white p-6"><ChartNoAxesCombined className="text-[#607b91]" size={22}/><p className="mt-7 text-[14px] font-semibold text-[#293b4b]">1. See your numbers</p><p className="mt-2 text-[12px] leading-6 text-[#7d8790]">Record impressions, clicks, orders and revenue in one simple view.</p></div>
     <div className="rounded-2xl bg-white p-6"><FileSearch className="text-[#607b91]" size={22}/><p className="mt-7 text-[14px] font-semibold text-[#293b4b]">2. Review your gigs</p><p className="mt-2 text-[12px] leading-6 text-[#7d8790]">Check how clearly your service is presented to potential buyers.</p></div>
     <div className="rounded-2xl bg-white p-6"><Target className="text-[#607b91]" size={22}/><p className="mt-7 text-[14px] font-semibold text-[#293b4b]">3. Choose a priority</p><p className="mt-2 text-[12px] leading-6 text-[#7d8790]">Focus on one meaningful improvement at a time.</p></div>
     <div className="rounded-2xl bg-white p-6"><ShieldCheck className="text-[#607b91]" size={22}/><p className="mt-7 text-[14px] font-semibold text-[#293b4b]">4. Learn as you go</p><p className="mt-2 text-[12px] leading-6 text-[#7d8790]">Understand the reasoning behind recommendations and experiments.</p></div>
    </div>
   </div>
  </section>

  <section id="why" className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-2">
   <div className="overflow-hidden rounded-[20px] bg-[#e6ebef]"><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85" alt="Bright, calm workspace with a large shared desk" className="h-[330px] w-full object-cover sm:h-[410px]"/></div>
   <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#71879a]">Our approach</p><h2 className="mt-4 text-[34px] font-semibold leading-tight tracking-[-.045em] text-[#233342]">Useful insight. Honest expectations. Real progress.</h2><p className="mt-5 text-[13px] leading-7 text-[#75808a]">There is no magic formula for success on Fiverr. Search visibility, buyer decisions and sales are influenced by many factors. Our goal is to help you understand the information you have, improve what you can control and make more deliberate decisions.</p><p className="mt-4 text-[13px] leading-7 text-[#75808a]">We do not promise first-page rankings or guaranteed orders. We give you a clearer way to work towards better outcomes.</p></div>
  </section>

  <section className="bg-[#263e55]"><div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center md:px-8 md:py-20"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/60">Make your next move count</p><h2 className="mt-4 max-w-xl text-[32px] font-semibold leading-tight tracking-[-.04em] text-white sm:text-[40px]">Build your Fiverr growth around better decisions.</h2></div><Link href="/signup" className="inline-flex shrink-0 items-center gap-3 rounded-lg bg-white px-6 py-4 text-[12px] font-bold text-[#263e55] hover:bg-[#eef2f5]">Create your account <ArrowRight size={15}/></Link></div></section>
  <footer className="bg-white"><div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-8 text-[10px] text-[#89939c] md:flex-row md:items-center md:justify-between md:px-8"><span className="font-bold text-[#415466]">Fiverr Growth Assistant</span><span>Independent seller guidance. Not affiliated with or endorsed by Fiverr.</span><span>© {new Date().getFullYear()} Fiverr Growth Assistant</span></div></footer>
 </main>
}
