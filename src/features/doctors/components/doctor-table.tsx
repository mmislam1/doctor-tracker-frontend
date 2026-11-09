"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, Phone, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/feedback";
import { formatDate } from "@/lib/format";
import type { Doctor } from "@/types/api";

export function DoctorTable({ doctors }: { doctors: Doctor[] }) {
  if (doctors.length === 0) return <EmptyState title="No doctors found" description="Try adjusting your filters, or add a doctor to start building your directory." />;

  return <div className="overflow-x-auto">
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
  </div>;
}
