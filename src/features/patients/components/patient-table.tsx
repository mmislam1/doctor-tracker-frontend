"use client";

import Link from "next/link";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/feedback";
import { formatDate, shortId } from "@/lib/format";
import type { Patient } from "@/types/api";

export function PatientTable({ patients, showDoctor = true, onEdit, onDelete }: {
  patients: Patient[];
  showDoctor?: boolean;
  onEdit?: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}) {
  if (patients.length === 0) return <EmptyState title="No patients found" description="No patient records match these filters. Adjust your search or add a patient from a doctor's patient list." />;

  return <>
    <div className="space-y-3 p-3 lg:hidden">
      {patients.map((patient) => <article key={patient._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-semibold text-sky-800">{patient.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-medium text-slate-900">{patient.name}</h3>
            <span className="mt-2 inline-flex max-w-full rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800"><span className="break-words">{patient.condition}</span></span>
          </div>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          {showDoctor && <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Doctor</dt><dd className="mt-0.5"><Link title={`Doctor ID ${patient.doctorId}`} href={`/doctors/${patient.doctorId}`} className="break-words text-xs font-medium text-teal-800 underline decoration-teal-200 underline-offset-4 hover:text-teal-950">Doctor {shortId(patient.doctorId)}</Link></dd></div>}
          <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Added</dt><dd className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />{formatDate(patient.createdAt)}</dd></div>
        </dl>
        <div className="mt-3 flex justify-end gap-1 border-t border-slate-100 pt-2">
          {onEdit && <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${patient.name}`} title="Edit patient" onClick={() => onEdit(patient)}><Pencil className="size-4" aria-hidden="true" /></Button>}
          <Button type="button" variant="ghost" size="icon-sm" className="text-rose-700 hover:bg-rose-50 hover:text-rose-800" aria-label={`Delete ${patient.name}`} title="Delete patient" onClick={() => onDelete(patient)}><Trash2 className="size-4" aria-hidden="true" /></Button>
        </div>
      </article>)}
    </div>
    <div className="hidden overflow-x-auto lg:block">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr>
        <th className="px-6 py-3.5">Patient</th><th className="px-4 py-3.5">Condition</th>{showDoctor && <th className="px-4 py-3.5">Doctor</th>}<th className="px-4 py-3.5">Added</th><th className="px-5 py-3.5 text-right">Actions</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-100">
        {patients.map((patient) => <tr key={patient._id} className="transition-colors hover:bg-slate-50/70">
          <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-semibold text-sky-800">{patient.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}</span><span className="font-medium text-slate-900">{patient.name}</span></div></td>
          <td className="px-4 py-4"><span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800">{patient.condition}</span></td>
          {showDoctor && <td className="px-4 py-4"><Link title={`Doctor ID ${patient.doctorId}`} href={`/doctors/${patient.doctorId}`} className="text-xs font-medium text-teal-800 underline decoration-teal-200 underline-offset-4 hover:text-teal-950">Doctor {shortId(patient.doctorId)}</Link></td>}
          <td className="px-4 py-4"><span className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="size-3.5" aria-hidden="true" />{formatDate(patient.createdAt)}</span></td>
          <td className="px-5 py-4"><div className="flex justify-end gap-1">
            {onEdit && <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${patient.name}`} title="Edit patient" onClick={() => onEdit(patient)}><Pencil className="size-4" aria-hidden="true" /></Button>}
            <Button type="button" variant="ghost" size="icon-sm" className="text-rose-700 hover:bg-rose-50 hover:text-rose-800" aria-label={`Delete ${patient.name}`} title="Delete patient" onClick={() => onDelete(patient)}><Trash2 className="size-4" aria-hidden="true" /></Button>
          </div></td>
        </tr>)}
      </tbody>
    </table>
    </div>
  </>;
}
