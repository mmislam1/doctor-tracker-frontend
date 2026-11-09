import { Suspense } from "react";
import { LoadingPanel } from "@/components/shared/feedback";
import { DashboardGuard } from "@/features/auth/dashboard-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-[#f5f7f8] p-5 sm:p-8"><LoadingPanel label="Checking your session" /></div>}>
    <DashboardGuard>{children}</DashboardGuard>
  </Suspense>;
}
