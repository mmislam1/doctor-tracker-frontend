"use client";

import { CalendarDays, Clock3, Pencil } from "lucide-react";
import { useState } from "react";
import { FormModal } from "@/components/shared/form-modal";
import { ErrorPanel, LoadingPanel } from "@/components/shared/feedback";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { useGetPatientAppointmentsQuery } from "@/features/patients/api/patientsApi";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Appointment, Patient } from "@/types/api";

const statusColors: Record<Appointment["status"], string> = {
  upcoming: "border-sky-200 bg-sky-50 text-sky-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  incomplete: "border-amber-200 bg-amber-50 text-amber-800",
  rescheduled: "border-violet-200 bg-violet-50 text-violet-800",
  cancelled: "border-rose-200 bg-rose-50 text-rose-800",
  unknown: "border-slate-300 bg-slate-50 text-slate-700",
};

export function PatientDetailsModal({ patient, onOpenChange, onEditAppointment }: {
  patient: Patient | null;
  onOpenChange: (open: boolean) => void;
  onEditAppointment: (patient: Patient, appointment: Appointment) => void;
}) {
  const [page, setPage] = useState(1);
  const { currentData, isLoading, isFetching, error, refetch } = useGetPatientAppointmentsQuery(
    { patientId: patient?._id ?? "", page, pageSize: 5 },
    { skip: !patient },
  );

  return <FormModal open={patient !== null} title="Patient details" onOpenChange={onOpenChange}>
    {patient && <div className="p-5 sm:p-6">
      <div className="mb-5 pr-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Patient details</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">{patient.name}</h2>
      </div>
      <dl className="grid gap-3 rounded-xl border border-slate-300 bg-white p-4 sm:grid-cols-2">
        <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</dt><dd className="mt-1 break-all text-sm text-slate-900">{patient.phone || "Phone not provided"}</dd></div>
        <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Condition</dt><dd className="mt-1 break-words text-sm text-slate-900">{patient.condition}</dd></div>
        <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Patient since</dt><dd className="mt-1 flex items-center gap-1.5 text-sm text-slate-700"><CalendarDays className="size-3.5" aria-hidden="true" />{formatDate(patient.createdAt)}</dd></div>
        <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last updated</dt><dd className="mt-1 text-sm text-slate-700">{formatDate(patient.updatedAt)}</dd></div>
      </dl>

      <section className="mt-6" aria-label="Patient appointments">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div><h3 className="font-semibold text-slate-900">Appointments</h3><p className="mt-0.5 text-xs text-slate-500">All visits for this patient</p></div>
          {isFetching && !isLoading && <span className="text-xs text-slate-400">Updating…</span>}
        </div>
        {isLoading ? <LoadingPanel label="Loading appointments" />
          : error ? <ErrorPanel message={getApiErrorMessage(error, "Could not load this patient's appointments.")} onRetry={() => { void refetch(); }} />
          : currentData?.data.length ? <>
            <div className="space-y-3">
              {currentData.data.map((appointment) => <article key={appointment._id} className="rounded-xl border border-slate-300 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900"><Clock3 className="size-4 shrink-0 text-slate-500" aria-hidden="true" />{formatDateTime(appointment.appointmentAt)}</p>
                    <p className="mt-2 break-words text-sm font-medium text-teal-800">Dr. {appointment.doctorName || "Unknown doctor"}</p>
                    <p className="mt-0.5 break-words text-xs text-slate-500">{appointment.doctorSpecialization || "Unknown specialization"}</p>
                  </div>
                  <span className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${statusColors[appointment.status]}`}>{appointment.status}</span>
                </div>
                <div className="mt-3 flex justify-end border-t border-slate-200 pt-2">
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" aria-label={`Edit appointment for ${patient.name}`} onClick={() => onEditAppointment(patient, appointment)}><Pencil className="mr-1 size-3.5" aria-hidden="true" />Edit visit</Button>
                </div>
              </article>)}
            </div>
            {currentData.pagination.totalPages > 1 && <div className="mt-3"><Pagination pagination={currentData.pagination} onPageChange={setPage} /></div>}
          </> : <p className="rounded-xl border border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">No appointments recorded yet.</p>}
      </section>
    </div>}
  </FormModal>;
}
