"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, Phone, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/feedback";
import { formatDate } from "@/lib/format";
import type { Doctor } from "@/types/api";

export function DoctorTable({ doctors }: { doctors: Doctor[] }) {
  if (doctors.length === 0) return <EmptyState title="No doctors found" description="Try adjusting your filters, or add a doctor to start building your directory." />;

  return <>
    <div className="space-y-3 p-2 sm:p-3 lg:hidden">
      {doctors.map((doctor) => <article key={doctor._id} className="rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-800">{doctor.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-medium text-slate-900">{doctor.name}</h3>
            <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700"><Stethoscope className="size-3.5 shrink-0 text-teal-700" aria-hidden="true" /><span className="break-words">{doctor.specialization}</span></span>
          </div>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Hospital / clinic</dt><dd className="mt-0.5 break-words text-slate-700">{doctor.hospital}</dd></div>
          <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Contact</dt><dd className="mt-1 space-y-1.5">
            <a className="flex min-w-0 items-start gap-2 text-slate-600 hover:text-teal-800" href={`mailto:${doctor.email}`}><Mail className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /><span className="break-all">{doctor.email}</span></a>
            <a className="flex min-w-0 items-start gap-2 text-slate-600 hover:text-teal-800" href={`tel:${doctor.phone}`}><Phone className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /><span className="break-words">{doctor.phone}</span></a>
          </dd></div>
          <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Added</dt><dd className="mt-0.5 text-slate-600">{formatDate(doctor.createdAt)}</dd></div>
        </dl>
        <div className="mt-3 flex justify-end border-t border-slate-100 pt-2"><Button render={<Link href={`/doctors/${doctor._id}?name=${encodeURIComponent(doctor.name)}`} />} variant="ghost" size="sm" className="gap-1.5 text-teal-800">View patient list <ArrowUpRight className="size-3.5" aria-hidden="true" /></Button></div>
      </article>)}
    </div>
    <div className="hidden overflow-x-auto lg:block">
    <table className="w-full min-w-[830px] text-left text-sm">
      <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr>
        <th className="px-6 py-3.5">Doctor</th><th className="px-4 py-3.5">Specialization</th><th className="px-4 py-3.5">Hospital / clinic</th><th className="px-4 py-3.5">Contact</th><th className="px-4 py-3.5">Added</th><th className="px-5 py-3.5 text-right">Patients</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-100">
        {doctors.map((doctor) => <tr key={doctor._id} className="transition-colors hover:bg-slate-50/70">
          <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-800">{doctor.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}</span><span className="font-medium text-slate-900">{doctor.name}</span></div></td>
          <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700"><Stethoscope className="size-3.5 text-teal-700" aria-hidden="true" />{doctor.specialization}</span></td>
          <td className="px-4 py-4 text-slate-600">{doctor.hospital}</td>
          <td className="px-4 py-4"><div className="space-y-1 text-xs text-slate-600"><a className="flex items-center gap-1.5 hover:text-teal-800" href={`mailto:${doctor.email}`}><Mail className="size-3.5" aria-hidden="true" />{doctor.email}</a><a className="flex items-center gap-1.5 hover:text-teal-800" href={`tel:${doctor.phone}`}><Phone className="size-3.5" aria-hidden="true" />{doctor.phone}</a></div></td>
          <td className="px-4 py-4 text-xs text-slate-500">{formatDate(doctor.createdAt)}</td>
          <td className="px-5 py-4 text-right"><Button render={<Link href={`/doctors/${doctor._id}?name=${encodeURIComponent(doctor.name)}`} />} variant="ghost" size="sm" className="gap-1.5 text-teal-800">View list <ArrowUpRight className="size-3.5" aria-hidden="true" /></Button></td>
        </tr>)}
      </tbody>
    </table>
    </div>
  </>;
}
