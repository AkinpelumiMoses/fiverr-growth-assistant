"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { signUp } from "@/app/auth/actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default function SignupPage({ searchParams }: Props) {
  const params = use(searchParams);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="mile-auth-page mile-auth-signup">
      <section className="mile-auth-aside">
        <Link href="/" className="mile-auth-logo"><img src="/mile-logo.png" alt="MILE" /></Link>
        <div className="mile-auth-story">
          <span className="mile-auth-kicker">MAKE ROOM FOR WHAT’S NEXT</span>
          <h1>Good work<br />grows <em>together.</em></h1>
          <p>Meet people who understand the work. Share what you know. Find the right support for the next opportunity.</p>
          <div className="mile-auth-manifesto"><span>02</span><div><strong>Find your people.</strong><br /><strong>Move further together.</strong></div></div>
        </div>
        <span className="mile-auth-footer">EVERY STEP HAS A PURPOSE <i /> MILE COMMUNITY</span>
        <div className="mile-auth-decoration" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className="mile-auth-main">
        <Link href="/" className="mile-auth-back"><ArrowLeft size={15}/> Back to homepage</Link>
        <div className="mile-auth-form-wrap">
          <span className="mile-auth-mobile-logo"><img src="/mile-logo.png" alt="MILE" /></span>
          <p className="mile-auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
          <h2>Join the network.</h2>
          <p className="mile-auth-subtitle">Create your MILE account and find your place in the community.</p>

          {params.error && <p role="alert" className="mile-auth-alert error">We couldn’t create your account. Check your details and try again. Your password must be at least 8 characters.</p>}

          <form action={signUp} className="mile-auth-form">
            <label htmlFor="fullName">Full name</label>
            <input className="mile-auth-input" id="fullName" name="fullName" type="text" required minLength={2} autoComplete="name" placeholder="How should we call you?" />
            <label htmlFor="email">Email address</label>
            <input className="mile-auth-input" id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            <label htmlFor="password">Create password</label>
            <div className="mile-auth-password">
              <input className="mile-auth-input" id="password" name="password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
              <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
            <button className="mile-auth-submit" type="submit">Create account <ArrowRight size={17}/></button>
            <p className="mile-auth-terms">By creating an account, you agree to use accurate information and treat other members with respect.</p>
          </form>
          <p className="mile-auth-switch">Already part of MILE? <Link href="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
