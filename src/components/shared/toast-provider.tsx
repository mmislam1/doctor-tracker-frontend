"use client";

import { Toast } from "@base-ui/react/toast";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { toastManager } from "@/lib/toast";

export function ToastProvider({ children }: { children: ReactNode }) {
  return <Toast.Provider toastManager={toastManager}>
    {children}
    <Toast.Portal>
      <Toast.Viewport className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 outline-none sm:right-6 sm:top-6">
        <ToastList />
      </Toast.Viewport>
    </Toast.Portal>
  </Toast.Provider>;
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => <Toast.Root key={toast.id} toast={toast} className="rounded-xl border border-slate-300 bg-white text-slate-900 shadow-lg outline-none data-[type=success]:border-emerald-300 data-[type=error]:border-rose-300 data-ending-style:translate-x-4 data-ending-style:opacity-0 data-starting-style:translate-x-4 data-starting-style:opacity-0 transition duration-200">
    <Toast.Content className="flex items-start gap-3 p-4">
      <div className="min-w-0 flex-1">
        <Toast.Title className="text-sm font-semibold" />
        <Toast.Description className="mt-0.5 text-sm text-slate-600" />
      </div>
      <Toast.Close aria-label="Dismiss notification" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700">
        <X className="size-4" aria-hidden="true" />
      </Toast.Close>
    </Toast.Content>
  </Toast.Root>);
}
