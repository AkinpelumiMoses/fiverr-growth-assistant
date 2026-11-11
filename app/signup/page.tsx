"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { signUp } from "@/app/auth/actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams;
  return <SignupForm params={params} />;
}

function SignupForm({ params }: { params: { error?: string } }) {
  const [showPassword, setShowPassword] = useState(false);

  return <main className="flex min-h-screen bg-[#f5f7f8]">
    <div className="hidden w-1/2 flex-col justify-between bg-[#222325] p-12 text-white lg:flex">
      <Link href="/" className="text-sm font-bold">Fiverr Growth Assistant</Link>
      <div className="max-w-lg"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/60">A more deliberate way to grow</p><h1 className="mt-5 text-5xl font-semibold leading-tight tracking-[-.05em]">Make sense of your numbers. Move with purpose.</h1><p className="mt-6 text-sm leading-7 text-white/70">Create a space for your goals, your gigs and the decisions that move your seller business forward.</p></div>
      <p className="text-[10px] text-white/50">Guidance, not guarantees.</p>
    </div>
    <div className="flex flex-1 items-center justify-center px-5 py-12"><div className="w-full max-w-[410px]">
      <Link href="/" className="mb-12 inline-flex items-center gap-2 text-xs font-semibold text-[#667583]"><ArrowLeft size={14}/> Back to homepage</Link>
      <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1DBF73] text-white"><UserRoundPlus size={19}/></div>
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#168B56]">Get started</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#222222]">Create your account</h2><p className="mt-3 text-sm leading-6 text-[#7a858e]">A clearer view of your Fiverr growth starts here.</p>
      {params.error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700">Please enter your name, a valid email and a password of at least 8 characters. If the details are correct, try again.</p>}
      <form action={signUp} className="mt-9 space-y-5">
        <div><label htmlFor="fullName" className="mb-2 block text-xs font-semibold text-[#343A40]">Full name</label><input id="fullName" name="fullName" type="text" required minLength={2} autoComplete="name" placeholder="Your name" className="w-full rounded-lg border border-[#dfe5e9] bg-white px-4 py-3.5 text-sm text-[#222222] outline-none focus:border-[#168B56]"/></div>
        <div><label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#343A40]">Email address</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="w-full rounded-lg border border-[#dfe5e9] bg-white px-4 py-3.5 text-sm text-[#222222] outline-none focus:border-[#168B56]"/></div>
        <div><label htmlFor="password" className="mb-2 block text-xs font-semibold text-[#343A40]">Create password</label><div className="relative"><input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className="w-full rounded-lg border border-[#dfe5e9] bg-white px-4 py-3.5 pr-12 text-sm text-[#222222] outline-none focus:border-[#168B56]"/><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#667583] transition hover:bg-[#f0f3f4] hover:text-[#222325]">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>
        <button type="submit" className="w-full rounded-lg bg-[#222325] px-5 py-4 text-xs font-bold text-white transition hover:bg-[#404145]">Create account</button>
        <p className="text-[10px] leading-5 text-[#89939b]">By creating an account, you agree to use accurate information and keep your sign-in details secure.</p>
      </form>
      <p className="mt-7 text-center text-xs text-[#7b8791]">Already have an account? <Link href="/login" className="font-bold text-[#168B56]">Log in</Link></p>
    </div></div>
  </main>;
}
