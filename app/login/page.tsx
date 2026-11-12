"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/app/auth/actions";

type Props = { searchParams: Promise<{ error?: string; message?: string; next?: string }> };

export default function LoginPage({ searchParams }: Props) {
  const params = use(searchParams);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="mile-auth-page">
      <section className="mile-auth-aside">
        <Link href="/" className="mile-auth-logo"><img src="/mile-logo.svg" alt="MILE" /></Link>
        <div className="mile-auth-story">
          <span className="mile-auth-kicker">GOOD TO HAVE YOU BACK</span>
          <h1>Your next step<br /><em>starts here.</em></h1>
          <p>Pick up where you left off. Reconnect with your people, find new opportunities and keep good work moving.</p>
          <div className="mile-auth-manifesto"><span>01</span><div><strong>Independent in your work.</strong><br /><strong>Connected in your journey.</strong></div></div>
        </div>
        <span className="mile-auth-footer">EVERY STEP HAS A PURPOSE <i /> MILE COMMUNITY</span>
        <div className="mile-auth-decoration" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className="mile-auth-main">
        <Link href="/" className="mile-auth-back"><ArrowLeft size={15}/> Back to homepage</Link>
        <div className="mile-auth-form-wrap">
          <span className="mile-auth-mobile-logo"><img src="/mile-logo.svg" alt="MILE" /></span>
          <p className="mile-auth-eyebrow">YOUR COMMUNITY IS WAITING</p>
          <h2>Welcome back.</h2>
          <p className="mile-auth-subtitle">Sign in to continue your journey with MILE.</p>

          {params.message === "confirm" && <p role="status" className="mile-auth-alert success">Your account is ready. Confirm your email address, then sign in.</p>}
          {params.error && <p role="alert" className="mile-auth-alert error">{params.error === "credentials" ? "That email and password combination doesn’t match. Please try again." : "We couldn’t sign you in. Please check your details and try again."}</p>}

          <form action={signIn} className="mile-auth-form">
            <input type="hidden" name="next" value={params.next || "/dashboard"} />
            <label htmlFor="email">Email address</label>
            <input className="mile-auth-input" id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            <div className="mile-auth-label-row"><label htmlFor="password">Password</label></div>
            <div className="mile-auth-password">
              <input className="mile-auth-input" id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
            <button className="mile-auth-submit" type="submit">Sign in <ArrowRight size={17}/></button>
          </form>
          <p className="mile-auth-switch">New to MILE? <Link href="/signup">Create an account</Link></p>
          <p className="mile-auth-legal">By continuing, you agree to keep your account information safe and use the community respectfully.</p>
        </div>
      </section>
    </main>
  );
}
