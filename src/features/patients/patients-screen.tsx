"use client";

import { Suspense, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormModal } from "@/components/shared/form-modal";
import { ErrorPanel, LoadingPanel } from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { PatientForm } from "@/features/patients/components/patient-form";
import { AppointmentForm } from "@/features/patients/components/appointment-form";
import { PatientTable } from "@/features/patients/components/patient-table";
import { useDeletePatientMutation, useGetPatientsQuery } from "@/features/patients/api/patientsApi";
import { getApiErrorMessage } from "@/lib/api-error";
import { inputClass } from "@/components/shared/form-input";
import { appointmentStatuses, type Appointment, type AppointmentStatus, type Patient } from "@/types/api";

interface PatientFilters { search: string; condition: string; status: string; from: string; to: string }

function PatientFiltersForm({ initial, onApply, onClear }: { initial: PatientFilters; onApply: (filters: PatientFilters) => void; onClear: () => void }) {
  const [draft, setDraft] = useState(initial);
  const [dateError, setDateError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.from && draft.to && draft.from > draft.to) {
      setDateError("The start date must be on or before the end date.");
      return;
    }
    setDateError("");
    onApply(draft);
  }
  return <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Patient filters">
    <form onSubmit={submit}>
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><SlidersHorizontal className="size-3.5" aria-hidden="true" />Search and filters</div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
        <label className="relative"><span className="sr-only">Search patients</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input value={draft.search} onChange={(event) => setDraft({ ...draft, search: event.target.value })} className={`${inputClass} pl-9`} placeholder="Search patient or condition" /></label>
        <label><span className="sr-only">Condition filter</span><input value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: event.target.value })} className={inputClass} placeholder="Filter by condition" /></label>
        <label><span className="sr-only">Appointment status</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })} className={inputClass}><option value="">Any appointment status</option>{appointmentStatuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label>
        <label className="relative"><span className="sr-only">Created from</span><CalendarRange className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input type="date" aria-label="Created from" value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} className={`${inputClass} pl-9`} /></label>
        <label className="relative"><span className="sr-only">Created to</span><CalendarRange className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input type="date" aria-label="Created to" value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} className={`${inputClass} pl-9`} /></label>
        <div className="flex gap-2"><Button type="submit" className="flex-1 sm:flex-none">Apply</Button><Button type="button" variant="outline" title="Clear filters" aria-label="Clear filters" onClick={onClear}><X className="size-4" aria-hidden="true" /></Button></div>
      </div>
      {dateError && <p role="alert" className="mt-2 text-xs text-rose-700">{dateError}</p>}
    </form>
  </section>;
}

function PatientsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const key = params.toString();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [patientForAppointment, setPatientForAppointment] = useState<Patient | null>(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState<{ patient: Patient; appointment: Appointment } | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deletePatient, deleteState] = useDeletePatientMutation();

  const query = {
    page,
    pageSize: 10,
    search: params.get("search") || undefined,
    condition: params.get("condition") || undefined,
    status: (params.get("status") || undefined) as AppointmentStatus | undefined,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
  };
  const { data, isLoading, isFetching, error, refetch } = useGetPatientsQuery(query);

  function updateFilters(draft: PatientFilters) {
    const next = new URLSearchParams();
    for (const [name, value] of Object.entries(draft)) if (value.trim()) next.set(name, value.trim());
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
    <PageHeader eyebrow="Patient records" title="Patients" description="Search and manage patient records across your doctor network." action={<Button type="button" aria-haspopup="dialog" onClick={() => setShowCreatePatient(true)}><Plus className="size-4" aria-hidden="true" />Add patient</Button>} />
    <FormModal open={showCreatePatient} title="Add patient" onOpenChange={setShowCreatePatient}>
      <PatientForm mode={{ kind: "create" }} onCancel={() => setShowCreatePatient(false)} onSaved={() => setShowCreatePatient(false)} />
    </FormModal>
    <FormModal open={editingPatient !== null} title="Edit patient" onOpenChange={(open) => { if (!open) setEditingPatient(null); }}>
      {editingPatient && <PatientForm mode={{ kind: "edit", patient: editingPatient }} onCancel={() => setEditingPatient(null)} onSaved={() => setEditingPatient(null)} />}
    </FormModal>
    <FormModal open={patientForAppointment !== null} title="Add appointment" onOpenChange={(open) => { if (!open) setPatientForAppointment(null); }}>
      {patientForAppointment && <AppointmentForm mode={{ kind: "create", patient: patientForAppointment }} onCancel={() => setPatientForAppointment(null)} onSaved={() => setPatientForAppointment(null)} />}
    </FormModal>
    <FormModal open={appointmentToEdit !== null} title="Edit appointment" onOpenChange={(open) => { if (!open) setAppointmentToEdit(null); }}>
      {appointmentToEdit && <AppointmentForm mode={{ kind: "edit", ...appointmentToEdit }} onCancel={() => setAppointmentToEdit(null)} onSaved={() => setAppointmentToEdit(null)} />}
    </FormModal>

    <PatientFiltersForm key={key} initial={{
      search: params.get("search") ?? "", condition: params.get("condition") ?? "", status: params.get("status") ?? "",
      from: params.get("from") ?? "", to: params.get("to") ?? "",
    }} onApply={updateFilters} onClear={() => router.replace(pathname)} />

    {deleteError && <div className="mb-4"><ErrorPanel message={deleteError} /></div>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-slate-900">All patients</h2><p className="mt-0.5 text-xs text-slate-500">{data?.pagination.total ?? 0} records</p></div>{isFetching && !isLoading && <span className="text-xs text-slate-400">Updating…</span>}</div>
      {isLoading ? <div className="p-4"><LoadingPanel label="Loading patients" /></div>
        : error ? <div className="p-4"><ErrorPanel message={getApiErrorMessage(error, "Could not load patients. Check your connection and try again.")} onRetry={() => { void refetch(); }} /></div>
        : <><PatientTable patients={data?.data ?? []} onEdit={setEditingPatient} onAddAppointment={setPatientForAppointment} onEditAppointment={(patient, appointment) => setAppointmentToEdit({ patient, appointment })} onDelete={setPatientToDelete} />{data && data.data.length > 0 && <Pagination pagination={data.pagination} onPageChange={goToPage} />}</>}
    </section>
    {patientToDelete && <ConfirmDialog title="Delete this patient?" description={`This will permanently remove ${patientToDelete.name} from the patient records.`} busy={deleteState.isLoading} onCancel={() => setPatientToDelete(null)} onConfirm={() => void confirmDelete()} />}
  </>;
}

export function PatientsScreen() {
  return <Suspense fallback={<LoadingPanel label="Loading patient records" />}><PatientsContent /></Suspense>;
}
