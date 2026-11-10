"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Activity, LayoutDashboard, LogOut, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/auth-client";
import { api } from "@/lib/redux/services/api";
import { useAppDispatch } from "@/lib/redux/hooks";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function signOut() {
    setSigningOut(true);
    setSignOutError("");
    const result = await authClient.signOut();
    if (result.error) {
      setSignOutError("Could not sign out. Please try again.");
      setSigningOut(false);
      return;
    }
    dispatch(api.util.resetApiState());
    router.replace("/login");
  }

  return <div className="min-h-screen bg-[#f5f7f8] lg:flex">
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-[#132d3b] px-4 py-6 text-white lg:flex">
      <Link href="/" className="mb-10 flex items-center gap-3 px-3" aria-label="Doctor Tracker dashboard">
        <span className="flex size-10 items-center justify-center rounded-xl bg-teal-400 text-[#113341]"><Activity className="size-5" aria-hidden="true" /></span>
        <span><span className="block text-sm font-semibold tracking-wide">DOCTOR TRACKER</span><span className="mt-0.5 block text-[11px] text-slate-300">Admin workspace</span></span>
      </Link>
      <nav aria-label="Main navigation" className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-white/12 font-medium text-white" : "text-slate-300 hover:bg-white/7 hover:text-white"}`}>
            <Icon className="size-4" aria-hidden="true" />{label}
          </Link>;
        })}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-5">
        <div className="mb-4 flex items-center gap-3 px-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-teal-300/20 text-sm font-semibold text-teal-100">{session?.user.name?.slice(0, 1).toUpperCase() || "A"}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-medium">{session?.user.name || "Administrator"}</span><span className="block truncate text-xs text-slate-400">{session?.user.email}</span></span>
        </div>
        {signOutError && <p role="alert" className="mb-2 px-2 text-xs text-rose-200">{signOutError}</p>}
        <Button type="button" variant="ghost" className="w-full justify-start gap-3 text-slate-200 hover:bg-white/10 hover:text-white" disabled={signingOut} onClick={signOut}>
          <LogOut className="size-4" aria-hidden="true" />{signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-7 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold text-slate-900"><span className="flex size-8 items-center justify-center rounded-lg bg-teal-100 text-teal-800"><Activity className="size-4" /></span>Doctor Tracker</Link>
          <Button type="button" variant="ghost" size="sm" disabled={signingOut} onClick={signOut}><LogOut className="size-4" aria-hidden="true" /><span className="sr-only">Sign out</span></Button>
        </div>
        <nav aria-label="Main navigation" className="mt-3 flex gap-1 overflow-x-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${active ? "bg-teal-50 text-teal-800" : "text-slate-500 hover:bg-slate-50"}`}>
              <Icon className="size-3.5" aria-hidden="true" />{label}
            </Link>;
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-7 sm:py-8 xl:px-10">
        {signOutError && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 lg:hidden">{signOutError}</p>}
        {children}
      </main>
    </div>
  </div>;
}
