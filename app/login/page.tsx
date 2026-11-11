import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { signIn } from "@/app/auth/actions";

type Props = { searchParams: Promise<{ error?: string; message?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return <main className="flex min-h-screen bg-[#f5f7f8]">
    <div className="hidden w-1/2 flex-col justify-between bg-[#222325] p-12 text-white lg:flex">
      <Link href="/" className="text-sm font-bold">Fiverr Growth Assistant</Link>
      <div className="max-w-lg"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/60">Welcome back</p><h1 className="mt-5 text-5xl font-semibold leading-tight tracking-[-.05em]">Your next move starts with clarity.</h1><p className="mt-6 text-sm leading-7 text-white/70">Return to your workspace, review your progress and keep building with intention.</p></div>
      <p className="text-[10px] text-white/50">Guidance, not guarantees.</p>
    </div>
    <div className="flex flex-1 items-center justify-center px-5 py-12"><div className="w-full max-w-[410px]">
      <Link href="/" className="mb-12 inline-flex items-center gap-2 text-xs font-semibold text-[#667583]"><ArrowLeft size={14}/> Back to homepage</Link>
      <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1DBF73] text-white"><LockKeyhole size={19}/></div>
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#168B56]">Your workspace</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#222222]">Log in</h2><p className="mt-3 text-sm leading-6 text-[#7a858e]">Sign in to continue working on your Fiverr growth.</p>
      {params.message === "confirm" && <p role="status" className="mt-5 rounded-lg bg-[#eaf8ef] p-3 text-xs leading-5 text-[#246642]">Account created. Check your email to confirm your address, then log in.</p>}
      {params.error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700">{params.error === "credentials" ? "Email or password is incorrect. Please try again." : "Please check your details and try again."}</p>}
      <form action={signIn} className="mt-9 space-y-5">
        <input type="hidden" name="next" value={params.next || "/dashboard"}/>
        <div><label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#343A40]">Email address</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="w-full rounded-lg border border-[#dfe5e9] bg-white px-4 py-3.5 text-sm text-[#222222] outline-none focus:border-[#168B56]"/></div>
        <div><label htmlFor="password" className="mb-2 block text-xs font-semibold text-[#343A40]">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Enter your password" className="w-full rounded-lg border border-[#dfe5e9] bg-white px-4 py-3.5 text-sm text-[#222222] outline-none focus:border-[#168B56]"/></div>
        <button type="submit" className="w-full rounded-lg bg-[#222325] px-5 py-4 text-xs font-bold text-white transition hover:bg-[#404145]">Sign in</button>
      </form>
      <p className="mt-7 text-center text-xs text-[#7b8791]">New here? <Link href="/signup" className="font-bold text-[#168B56]">Create an account</Link></p>
    </div></div>
  </main>;
}
