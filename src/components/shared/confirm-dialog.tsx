"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({ title, description, confirmLabel = "Delete", busy, onCancel, onConfirm }: {
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
      <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">{title}</h2>
      <p id="confirm-description" className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancel</Button>
        <Button type="button" variant="destructive" disabled={busy} onClick={onConfirm}>{busy ? "Deleting…" : confirmLabel}</Button>
      </div>
    </div>
  </div>;
}
