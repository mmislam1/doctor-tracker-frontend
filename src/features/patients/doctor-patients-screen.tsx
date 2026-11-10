"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormModal } from "@/components/shared/form-modal";
import { ErrorPanel, LoadingPanel } from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { inputClass } from "@/components/shared/form-input";
import { PatientForm } from "@/features/patients/components/patient-form";
import { AppointmentForm } from "@/features/patients/components/appointment-form";
import { PatientTable } from "@/features/patients/components/patient-table";
import { useDeletePatientMutation, useGetDoctorPatientsQuery } from "@/features/patients/api/patientsApi";
import { getApiErrorMessage } from "@/lib/api-error";
import { shortId } from "@/lib/format";
import { appointmentStatuses, type Appointment, type AppointmentStatus, type Patient } from "@/types/api";

interface Filters { search: string; condition: string; status: string; from: string; to: string }

function DoctorPatientFiltersForm({ initial, onApply, onClear }: { initial: Filters; onApply: (filters: Filters) => void; onClear: () => void }) {
  const [search, setSearch] = useState(initial.search);
  const [condition, setCondition] = useState(initial.condition);
  const [status, setStatus] = useState(initial.status);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [dateError, setDateError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (from && to && from > to) {
      setDateError("The start date must be on or before the end date.");
      return;
    }
    setDateError("");
    onApply({ search, condition, status, from, to });
  }
  return <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Patient filters">
    <form onSubmit={submit}>
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><SlidersHorizontal className="size-3.5" aria-hidden="true" />Filter this list</div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
        <label className="relative"><span className="sr-only">Search patients</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClass} pl-9`} placeholder="Search name or condition" /></label>
        <label><span className="sr-only">Condition</span><input value={condition} onChange={(event) => setCondition(event.target.value)} className={inputClass} placeholder="Condition" /></label>
        <label><span className="sr-only">Appointment status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}><option value="">Any appointment status</option>{appointmentStatuses.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
        <label><span className="sr-only">Created from</span><input type="date" aria-label="Created from" value={from} onChange={(event) => setFrom(event.target.value)} className={inputClass} /></label>
        <label><span className="sr-only">Created to</span><input type="date" aria-label="Created to" value={to} onChange={(event) => setTo(event.target.value)} className={inputClass} /></label>
        <div className="flex gap-2"><Button type="submit" className="flex-1 sm:flex-none">Apply</Button><Button type="button" variant="outline" title="Clear filters" aria-label="Clear filters" onClick={onClear}><X className="size-4" aria-hidden="true" /></Button></div>
      </div>
      {dateError && <p role="alert" className="mt-2 text-xs text-rose-700">{dateError}</p>}
    </form>
  </section>;
}

function DoctorPatientsContent({ doctorId, doctorName }: { doctorId: string; doctorName?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const key = params.toString();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [showForm, setShowForm] = useState(false);
  const [patientForAppointment, setPatientForAppointment] = useState<Patient | null>(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState<{ patient: Patient; appointment: Appointment } | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deletePatient, deleteState] = useDeletePatientMutation();

  const { data, isLoading, isFetching, error, refetch } = useGetDoctorPatientsQuery({
    doctorId, page, pageSize: 10,
    search: params.get("search") || undefined,
    condition: params.get("condition") || undefined,
    status: (params.get("status") || undefined) as AppointmentStatus | undefined,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
  });

  function applyFilters(filters: Filters) {
    const next = new URLSearchParams();
    const doctorName = params.get("name");
    if (doctorName) next.set("name", doctorName);
    for (const [name, value] of Object.entries(filters)) if (value.trim()) next.set(name, value.trim());
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(key);
    if (nextPage > 1) next.set("page", String(nextPage)); else next.delete("page");
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  }

  async function confirmDelete() {
    if (!patientToDelete) return;
    setDeleteError("");
    try {
      await deletePatient({ patientId: patientToDelete._id }).unwrap();
      setPatientToDelete(null);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, "Could not delete this patient. Please try again."));
    }
  }

  return <>
    <div className="mb-5"><Link href="/doctors" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-800"><ArrowLeft className="size-3.5" aria-hidden="true" />Back to doctors</Link></div>
    <PageHeader eyebrow="Doctor patient list" title={doctorName || `Doctor ${shortId(doctorId)}`} description="Review this doctor's patient records, add a patient, or remove an existing record." action={<Button type="button" aria-haspopup="dialog" onClick={() => setShowForm(true)}><Plus className="size-4" aria-hidden="true" />Add patient</Button>} />
    <FormModal open={showForm} title="Add patient" onOpenChange={setShowForm}>
      <PatientForm mode={{ kind: "create", doctorId, doctorName }} onCancel={() => setShowForm(false)} onSaved={() => setShowForm(false)} />
    </FormModal>
    <FormModal open={patientForAppointment !== null} title="Add appointment" onOpenChange={(open) => { if (!open) setPatientForAppointment(null); }}>
      {patientForAppointment && <AppointmentForm mode={{ kind: "create", patient: patientForAppointment, doctorId, doctorName }} onCancel={() => setPatientForAppointment(null)} onSaved={() => setPatientForAppointment(null)} />}
    </FormModal>
    <FormModal open={appointmentToEdit !== null} title="Edit appointment" onOpenChange={(open) => { if (!open) setAppointmentToEdit(null); }}>
      {appointmentToEdit && <AppointmentForm mode={{ kind: "edit", ...appointmentToEdit }} onCancel={() => setAppointmentToEdit(null)} onSaved={() => setAppointmentToEdit(null)} />}
    </FormModal>
    <DoctorPatientFiltersForm key={key} initial={{
      search: params.get("search") ?? "", condition: params.get("condition") ?? "", status: params.get("status") ?? "",
      from: params.get("from") ?? "", to: params.get("to") ?? "",
    }} onApply={applyFilters} onClear={() => {
      const name = params.get("name");
      router.replace(name ? `${pathname}?name=${encodeURIComponent(name)}` : pathname);
    }} />
    {deleteError && <div className="mb-4"><ErrorPanel message={deleteError} /></div>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-slate-900">Patients assigned to {doctorName || `Doctor ${shortId(doctorId)}`}</h2><p className="mt-0.5 text-xs text-slate-500">{data?.pagination.total ?? 0} records</p></div>{isFetching && !isLoading && <span className="text-xs text-slate-400">Updating…</span>}</div>
      {isLoading ? <div className="p-4"><LoadingPanel label="Loading doctor's patients" /></div>
        : error ? <div className="p-4"><ErrorPanel message={getApiErrorMessage(error, "Could not load this doctor's patient list.")} onRetry={() => { void refetch(); }} /></div>
        : <><PatientTable patients={data?.data ?? []} onAddAppointment={setPatientForAppointment} onEditAppointment={(patient, appointment) => setAppointmentToEdit({ patient, appointment })} onDelete={setPatientToDelete} />{data && data.data.length > 0 && <Pagination pagination={data.pagination} onPageChange={goToPage} />}</>}
    </section>
    {patientToDelete && <ConfirmDialog title="Remove this patient?" description={`This will permanently remove ${patientToDelete.name} from this doctor's patient list.`} busy={deleteState.isLoading} onCancel={() => setPatientToDelete(null)} onConfirm={() => void confirmDelete()} />}
  </>;
}

export function DoctorPatientsScreen({ doctorId, doctorName }: { doctorId: string; doctorName?: string }) {
  return <Suspense fallback={<LoadingPanel label="Loading patient list" />}><DoctorPatientsContent doctorId={doctorId} doctorName={doctorName} /></Suspense>;
}
