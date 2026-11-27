"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mile-v1.vercel.app";

function passwordIsStrong(password: string) {
  return password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}

function safeNext(value: string | null) {
  const next = value || "/dashboard";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signUp(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullName || fullName.length < 2 || !email || !passwordIsStrong(password)) {
    redirect("/signup?error=invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${SITE_URL}/auth/callback?next=/dashboard`,
    },
  });

  if (error) redirect("/signup?error=signup");
  redirect(`/auth/verify?email=${encodeURIComponent(email)}&mode=signup`);
}

export async function sendLoginOtp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(String(formData.get("next") ?? "/dashboard"));
  if (!email) redirect("/login?error=invalid_email");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) redirect("/login?error=otp");
  redirect(`/auth/verify?email=${encodeURIComponent(email)}&mode=login&next=${encodeURIComponent(next)}`);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/dashboard"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect("/login?error=credentials");
  redirect(next);
}

export async function resendVerification(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/login?error=invalid_email");

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) redirect(`/auth/verify?email=${encodeURIComponent(email)}&mode=signup&error=resend`);
  redirect(`/auth/verify?email=${encodeURIComponent(email)}&mode=signup&sent=1`);
}

export async function forgotPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/forgot-password?error=invalid_email");

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/update-password`,
  });

  if (error) redirect("/forgot-password?error=send");
  redirect("/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!passwordIsStrong(password) || password !== confirm) {
    redirect("/auth/update-password?error=invalid");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=session");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/auth/update-password?error=update");

  await supabase.auth.signOut();
  redirect("/login?message=password_reset");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
