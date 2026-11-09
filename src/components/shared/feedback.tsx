import type { ReactNode } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingPanel({ label = "Loading your workspace" }: { label?: string }) {
  return <div className="flex min-h-52 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
    <LoaderCircle className="size-4 animate-spin text-primary" aria-hidden="true" /> {label}
  </div>;
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="flex flex-col items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><p>{message}</p></div>
    {onRetry && <Button type="button" size="sm" variant="outline" onClick={onRetry}>Try again</Button>}
  </div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-52 flex-col items-center justify-center px-6 py-12 text-center">
    <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><span className="text-xl">—</span></div>
    <h3 className="font-medium text-slate-900">{title}</h3>
    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>;
}
