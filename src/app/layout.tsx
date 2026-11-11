import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreProvider } from "./StoreProvider";
import { ToastProvider } from "@/components/shared/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doctor Tracker | Admin",
  description: "Manage doctors and patient records.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<div className="min-h-screen bg-[#f5f7f8]" aria-busy="true" />}>
          <StoreProvider><ToastProvider>{children}</ToastProvider></StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}
