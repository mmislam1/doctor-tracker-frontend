"use client";

import { Suspense, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorPanel, LoadingPanel } from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { DoctorForm } from "@/features/doctors/components/doctor-form";
import { DoctorTable } from "@/features/doctors/components/doctor-table";
import { useGetDoctorsQuery } from "@/features/doctors/api/doctorsApi";
import { getApiErrorMessage } from "@/lib/api-error";
import { inputClass } from "@/components/shared/form-input";

interface DoctorFilters { search: string; specialization: string; hospital: string; from: string; to: string }

function DoctorFiltersForm({ initial, onApply, onClear }: { initial: DoctorFilters; onApply: (filters: DoctorFilters) => void; onClear: () => void }) {
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
  return <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Doctor filters">
    <form onSubmit={submit}>
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><SlidersHorizontal className="size-3.5" aria-hidden="true" />Search and filters</div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_auto]">
        <label className="relative"><span className="sr-only">Search doctors</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input value={draft.search} onChange={(event) => setDraft({ ...draft, search: event.target.value })} className={`${inputClass} pl-9`} placeholder="Search name or email" /></label>
        <label><span className="sr-only">Specialization</span><input value={draft.specialization} onChange={(event) => setDraft({ ...draft, specialization: event.target.value })} className={inputClass} placeholder="Specialization" /></label>
        <label><span className="sr-only">Hospital or clinic</span><input value={draft.hospital} onChange={(event) => setDraft({ ...draft, hospital: event.target.value })} className={inputClass} placeholder="Hospital / clinic" /></label>
        <label><span className="sr-only">Added from date</span><input type="date" value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} className={inputClass} aria-label="Added from date" /></label>
        <label><span className="sr-only">Added to date</span><input type="date" value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} className={inputClass} aria-label="Added to date" /></label>
        <div className="flex gap-2"><Button type="submit" className="flex-1 sm:flex-none">Apply</Button><Button type="button" variant="outline" title="Clear filters" aria-label="Clear filters" onClick={onClear}><X className="size-4" aria-hidden="true" /></Button></div>
      </div>
      {dateError && <p role="alert" className="mt-2 text-xs text-rose-700">{dateError}</p>}
    </form>
  </section>;
}

function DoctorsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const key = params.toString();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, isFetching, error, refetch } = useGetDoctorsQuery({
    page,
    pageSize: 10,
    search: params.get("search") || undefined,
    specialization: params.get("specialization") || undefined,
    hospital: params.get("hospital") || undefined,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
  });

  function applyFilters(draft: DoctorFilters) {
    const next = new URLSearchParams();
    for (const [name, value] of Object.entries(draft)) if (value.trim()) next.set(name, value.trim());
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(key);
    if (nextPage > 1) next.set("page", String(nextPage)); else next.delete("page");
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  }

  return <>
    <PageHeader eyebrow="Directory" title="Doctors" description="Maintain your care team directory and open a doctor's patient list." action={
      <Button type="button" onClick={() => setShowForm((value) => !value)}><Plus className="size-4" aria-hidden="true" />{showForm ? "Close form" : "Add doctor"}</Button>
    } />

    {showForm && <div className="mb-6"><DoctorForm onCancel={() => setShowForm(false)} onCreated={() => { setShowForm(false); router.replace("/doctors"); }} /></div>}

    <DoctorFiltersForm key={key} initial={{
      search: params.get("search") ?? "", specialization: params.get("specialization") ?? "",
      hospital: params.get("hospital") ?? "", from: params.get("from") ?? "", to: params.get("to") ?? "",
    }} onApply={applyFilters} onClear={() => router.replace(pathname)} />

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div><h2 className="font-semibold text-slate-900">Doctor directory</h2><p className="mt-0.5 text-xs text-slate-500">{data?.pagination.total ?? 0} records</p></div>
        {isFetching && !isLoading && <span className="text-xs text-slate-400">Updating…</span>}
      </div>
      {isLoading ? <div className="p-4"><LoadingPanel label="Loading doctors" /></div>
        : error ? <div className="p-4"><ErrorPanel message={getApiErrorMessage(error, "Could not load doctors. Check your connection and try again.")} onRetry={() => { void refetch(); }} /></div>
        : <><DoctorTable doctors={data?.data ?? []} />{data && data.data.length > 0 && <Pagination pagination={data.pagination} onPageChange={goToPage} />}</>}
    </section>
  </>;
}

export function DoctorsScreen() {
  return <Suspense fallback={<LoadingPanel label="Loading doctor directory" />}><DoctorsContent /></Suspense>;
}
