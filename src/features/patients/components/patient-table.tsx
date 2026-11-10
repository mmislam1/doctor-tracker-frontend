"use client";

import Link from "next/link";
import { CalendarDays, Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/feedback";
import { useGetDoctorsQuery } from "@/features/doctors/api/doctorsApi";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Appointment, Patient } from "@/types/api";

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const colors: Record<Appointment["status"], string> = {
    upcoming: "border-sky-200 bg-sky-50 text-sky-800",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
    incomplete: "border-amber-200 bg-amber-50 text-amber-800",
    rescheduled: "border-violet-200 bg-violet-50 text-violet-800",
    cancelled: "border-rose-200 bg-rose-50 text-rose-800",
    unknown: "border-slate-300 bg-slate-50 text-slate-700",
  };
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${colors[status]}`}>{status}</span>;
}

function formatCompactAppointmentDateTime(value?: string) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Not scheduled";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function AppointmentDetails({ patient, appointment, doctorName, doctorSpecialization, variant, onEdit }: {
  patient: Patient; appointment: Appointment; doctorName: string; doctorSpecialization: string; variant: "card" | "row"; onEdit?: (patient: Patient, appointment: Appointment) => void;
}) {
  if (variant === "row") return <div className="grid min-w-[440px] grid-cols-[minmax(125px,1fr)_minmax(125px,1fr)_auto_auto] items-center gap-3 py-2.5">
    <span title={formatDateTime(appointment.appointmentAt)} className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-700"><Clock3 className="size-3.5 shrink-0 text-slate-500" aria-hidden="true" />{formatCompactAppointmentDateTime(appointment.appointmentAt)}</span>
    <div className="min-w-0">
      <Link title={`Doctor ID ${appointment.doctorId}`} href={`/doctors/${appointment.doctorId}`} className="block truncate text-xs font-medium text-teal-800 no-underline hover:text-teal-950 hover:no-underline">Dr. {doctorName}</Link>
      <p className="mt-0.5 truncate text-[11px] text-slate-500">{doctorSpecialization}</p>
    </div>
    <StatusBadge status={appointment.status} />
    {onEdit && <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" aria-label={`Edit appointment for ${patient.name}`} title="Edit appointment" onClick={() => onEdit(patient, appointment)}><Pencil className="mr-1 size-3.5" aria-hidden="true" />Edit</Button>}
  </div>;

  return <div className="rounded-xl border border-slate-300 bg-white p-4">
    <div className="flex min-w-0 items-center justify-between gap-2">
      <span title={formatDateTime(appointment.appointmentAt)} className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-xs text-slate-700"><Clock3 className="size-3.5 shrink-0 text-slate-500" aria-hidden="true" />{formatCompactAppointmentDateTime(appointment.appointmentAt)}</span>
      <span className="shrink-0"><StatusBadge status={appointment.status} /></span>
    </div>
    <div className="mt-3">
      <Link title={`Doctor ID ${appointment.doctorId}`} href={`/doctors/${appointment.doctorId}`} className="inline-block max-w-full break-words text-sm font-medium text-teal-800 no-underline hover:text-teal-950 hover:no-underline">Dr. {doctorName}</Link>
      <p className="mt-0.5 break-words text-xs text-slate-500">{doctorSpecialization}</p>
    </div>
    {onEdit && <div className="mt-3 flex justify-end border-t border-slate-200 pt-2"><Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" aria-label={`Edit appointment for ${patient.name}`} title="Edit appointment" onClick={() => onEdit(patient, appointment)}><Pencil className="mr-1 size-3.5" aria-hidden="true" />Edit visit</Button></div>}
  </div>;
}

export function PatientTable({ patients, onEdit, onAddAppointment, onEditAppointment, onDelete }: {
  patients: Patient[];
  onEdit?: (patient: Patient) => void;
  onAddAppointment?: (patient: Patient) => void;
  onEditAppointment?: (patient: Patient, appointment: Appointment) => void;
  onDelete: (patient: Patient) => void;
}) {
  const { data: doctorsData } = useGetDoctorsQuery({ page: 1, pageSize: 100 });
  const doctorsById = new Map(doctorsData?.data.map((doctor) => [doctor._id, { name: doctor.name, specialization: doctor.specialization }]) ?? []);
  if (patients.length === 0) return <EmptyState title="No patients found" description="No patient records match these filters. Adjust your search or use Add patient to create a record." />;

  return <>
    <div className="space-y-3 p-3 lg:hidden">
      {patients.map((patient) => <article key={patient._id} className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-semibold text-sky-800">{patient.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}</span>
          <div className="min-w-0 flex-1"><h3 className="break-words font-medium text-slate-900">{patient.name}</h3><span className="mt-2 inline-flex max-w-full rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800"><span className="break-words">{patient.condition}</span></span></div>
        </div>
        <div className="mt-5 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Appointments ({patient.appointments.length})</p>
          {patient.appointments.length ? patient.appointments.map((appointment) => {
            const doctor = doctorsById.get(appointment.doctorId);
            return <AppointmentDetails key={appointment._id} patient={patient} appointment={appointment} doctorName={appointment.doctorName || doctor?.name || "Unknown doctor"} doctorSpecialization={appointment.doctorSpecialization || doctor?.specialization || "Unknown specialization"} variant="card" onEdit={onEditAppointment} />;
          }) : <p className="text-xs text-slate-500">No appointments scheduled.</p>}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="size-3.5" aria-hidden="true" />Added {formatDate(patient.createdAt)}</span>
          <div className="flex gap-1">
            {onAddAppointment && <Button type="button" variant="ghost" size="icon-sm" aria-label={`Add appointment for ${patient.name}`} title="Add appointment" onClick={() => onAddAppointment(patient)}><Plus className="size-4" aria-hidden="true" /></Button>}
            {onEdit && <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${patient.name}`} title="Edit patient" onClick={() => onEdit(patient)}><Pencil className="size-4" aria-hidden="true" /></Button>}
            <Button type="button" variant="ghost" size="icon-sm" className="text-rose-700 hover:bg-rose-50 hover:text-rose-800" aria-label={`Delete ${patient.name}`} title="Delete patient" onClick={() => onDelete(patient)}><Trash2 className="size-4" aria-hidden="true" /></Button>
          </div>
        </div>
      </article>)}
    </div>
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-3.5">Patient</th><th className="px-4 py-3.5">Condition</th><th className="px-4 py-3.5">Appointments</th><th className="px-4 py-3.5">Added</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead>
        <tbody className="divide-y divide-slate-200">
          {patients.map((patient) => <tr key={patient._id} className="align-top transition-colors hover:bg-slate-50/70">
            <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-semibold text-sky-800">{patient.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}</span><span className="font-medium text-slate-900">{patient.name}</span></div></td>
            <td className="px-4 py-4"><span className="inline-flex rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800">{patient.condition}</span></td>
            <td className="px-4 py-2"><div className="min-w-[440px] divide-y divide-slate-200">{patient.appointments.length ? patient.appointments.map((appointment) => {
              const doctor = doctorsById.get(appointment.doctorId);
              return <AppointmentDetails key={appointment._id} patient={patient} appointment={appointment} doctorName={appointment.doctorName || doctor?.name || "Unknown doctor"} doctorSpecialization={appointment.doctorSpecialization || doctor?.specialization || "Unknown specialization"} variant="row" onEdit={onEditAppointment} />;
            }) : <span className="text-xs text-slate-500">No appointments scheduled.</span>}</div></td>
            <td className="px-4 py-4"><span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-500"><CalendarDays className="size-3.5" aria-hidden="true" />{formatDate(patient.createdAt)}</span></td>
            <td className="px-5 py-4"><div className="flex justify-end gap-1">
              {onAddAppointment && <Button type="button" variant="ghost" size="icon-sm" aria-label={`Add appointment for ${patient.name}`} title="Add appointment" onClick={() => onAddAppointment(patient)}><Plus className="size-4" aria-hidden="true" /></Button>}
              {onEdit && <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${patient.name}`} title="Edit patient" onClick={() => onEdit(patient)}><Pencil className="size-4" aria-hidden="true" /></Button>}
              <Button type="button" variant="ghost" size="icon-sm" className="text-rose-700 hover:bg-rose-50 hover:text-rose-800" aria-label={`Delete ${patient.name}`} title="Delete patient" onClick={() => onDelete(patient)}><Trash2 className="size-4" aria-hidden="true" /></Button>
            </div></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </>;
}
