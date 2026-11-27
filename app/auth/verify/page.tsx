"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { resendVerification } from "@/app/auth/actions";

type Props = { searchParams: Promise<{ email?: string; mode?: string; next?: string; error?: string; sent?: string }> };

export default function VerifyPage({ searchParams }: Props) {
  const params = use(searchParams);
  const email = params.email || "";
  const next = params.next || "/dashboard";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verify() {
    if (!email || !/^\d{6}$/.test(code)) { setError("Enter the 6-digit code from your email."); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    if (error) { setError("That code is invalid or has expired. Request a new one and try again."); setLoading(false); return; }
    window.location.href = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  }

  return <main className="mile-auth-page"><section className="mile-auth-aside"><Link href="/" className="mile-auth-logo"><img src="/mile-logo.png" alt="MILE" /></Link><div className="mile-auth-story"><span className="mile-auth-kicker">ONE SMALL STEP</span><h1>Verify your<br /><em>account.</em></h1><p>We sent a six-digit code to your email. Enter it here to continue.</p><div className="mile-auth-manifesto"><span>03</span><div><strong>Verify your email.</strong><br /><strong>Keep your account yours.</strong></div></div></div><span className="mile-auth-footer">EVERY STEP HAS A PURPOSE <i /> MILE COMMUNITY</span></section><section className="mile-auth-main"><Link href="/login" className="mile-auth-back"><ArrowLeft size={15}/> Back to sign in</Link><div className="mile-auth-form-wrap"><p className="mile-auth-eyebrow">EMAIL VERIFICATION</p><h2>Enter your code.</h2><p className="mile-auth-subtitle">We sent a 6-digit code to <strong>{email || "your email address"}</strong>.</p>{(params.error === "resend" || error) && <p role="alert" className="mile-auth-alert error">{error || "We couldn’t send a new code. Please try again."}</p>}{params.sent === "1" && <p role="status" className="mile-auth-alert success">A new verification code has been sent.</p>}<div className="mile-auth-form"><label htmlFor="code">Verification code</label><input className="mile-auth-input mile-otp-input" id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0,6))} placeholder="000000" /><button className="mile-auth-submit" type="button" onClick={verify} disabled={loading}>{loading ? "Verifying..." : "Verify email"} <ArrowRight size={17}/></button></div><form action={resendVerification} className="mile-auth-resend"><input type="hidden" name="email" value={email}/><button type="submit"><RefreshCw size={14}/> Send a new code</button></form><p className="mile-auth-switch">Wrong email? <Link href="/signup">Create a new account</Link></p></div></section></main>;
}