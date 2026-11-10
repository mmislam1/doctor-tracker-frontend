"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function FormModal({ open, title, onOpenChange, children }: {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return <Dialog.Root open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}>
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[1px]" />
      <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-300 bg-white shadow-2xl outline-none">
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        <Dialog.Close aria-label="Close dialog" title="Close" className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
          <X className="size-5" aria-hidden="true" />
        </Dialog.Close>
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
