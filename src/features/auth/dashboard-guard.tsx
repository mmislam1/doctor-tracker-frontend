"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/features/auth/auth-client";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingPanel } from "@/components/shared/feedback";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isPending, pathname, router, session]);

  if (isPending || !session) return <div className="min-h-screen bg-[#f5f7f8] p-5 sm:p-8"><LoadingPanel label="Checking your session" /></div>;
  return <AppShell>{children}</AppShell>;
}
