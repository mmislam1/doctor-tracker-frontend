import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreProvider } from "./StoreProvider";
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
          <StoreProvider>{children}</StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}
