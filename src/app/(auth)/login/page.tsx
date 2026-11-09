"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail, Stethoscope } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/auth-client";

const loginSchema = z.object({
  email: z.email("Enter a valid email address").trim(),
  password: z.string().min(1, "Enter your password").max(128, "Password is too long"),
});
type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (session) router.replace("/");
  }, [router, session]);

  async function onSubmit(values: LoginValues) {
    setServerError("");
    const result = await authClient.signIn.email(values);
    if (result.error) {
      setServerError("Email or password was not accepted. Check your details and try again.");
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
    router.refresh();
  }

  if (isPending || session) return <div className="text-sm text-slate-500">Opening your workspace…</div>;

  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
    <div>
      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
      <div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input id="email" type="email" autoComplete="username" {...register("email")} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" placeholder="admin@example.com" />
      </div>
      {errors.email && <p id="email-error" className="mt-1 text-xs text-rose-700">{errors.email.message}</p>}
    </div>
    <div>
      <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
      <div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input id="password" type="password" autoComplete="current-password" {...register("password")} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" placeholder="Enter your password" />
      </div>
      {errors.password && <p id="password-error" className="mt-1 text-xs text-rose-700">{errors.password.message}</p>}
    </div>
    {serverError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">{serverError}</p>}
    <Button type="submit" className="h-11 w-full rounded-xl bg-[#167e7a] text-white hover:bg-[#116a67]" disabled={isSubmitting}>
      {isSubmitting ? "Signing in…" : "Sign in to dashboard"}
    </Button>
    <p className="text-center text-xs leading-5 text-slate-500">Access is provisioned by your system administrator. Public registration is disabled.</p>
  </form>;
}

export default function LoginPage() {
  return <main className="grid min-h-screen bg-[#f5f7f8] lg:grid-cols-[1.1fr_0.9fr]">
    <section className="relative hidden overflow-hidden bg-[#132d3b] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-16">
      <div className="absolute -right-28 -top-24 size-[520px] rounded-full border border-white/10" />
      <div className="absolute -right-5 -top-1 size-[360px] rounded-full border border-white/10" />
      <div className="relative flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-teal-300 text-[#113341]"><Stethoscope className="size-5" /></span><span className="text-sm font-semibold tracking-[0.12em]">DOCTOR TRACKER</span></div>
      <div className="relative max-w-xl pb-10">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">Care, clearly organized</p>
        <h1 className="text-balance text-4xl font-semibold leading-[1.15] tracking-tight xl:text-5xl">A calmer way to manage your care network.</h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">Keep doctor records, patient lists and essential activity in one focused workspace.</p>
        <div className="mt-12 flex items-center gap-3 text-sm text-slate-300"><span className="flex -space-x-2"><span className="size-8 rounded-full border-2 border-[#132d3b] bg-teal-200"/><span className="size-8 rounded-full border-2 border-[#132d3b] bg-sky-200"/><span className="size-8 rounded-full border-2 border-[#132d3b] bg-amber-200"/></span><span>Private administrator access</span></div>
      </div>
      <p className="relative text-xs text-slate-400">Doctor Tracker · Admin portal</p>
    </section>
    <section className="flex items-center justify-center px-5 py-12 sm:px-8">
      <div className="w-full max-w-md">
        <div className="mb-9 flex items-center gap-3 lg:hidden"><span className="flex size-10 items-center justify-center rounded-xl bg-[#167e7a] text-white"><Stethoscope className="size-5" /></span><span className="text-sm font-semibold tracking-wide text-slate-800">DOCTOR TRACKER</span></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-42px_rgba(17,48,61,0.3)] sm:p-9">
          <div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#167e7a]">Administrator sign in</p><h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h2><p className="mt-2 text-sm leading-6 text-slate-500">Sign in with the administrator account provisioned for you.</p></div>
          <Suspense fallback={<div className="py-3 text-center text-sm text-slate-500">Opening sign in…</div>}><LoginForm /></Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">Your session is managed securely by Doctor Tracker.</p>
      </div>
    </section>
  </main>;
}
