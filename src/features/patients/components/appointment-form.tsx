"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormInput, inputClass } from "@/components/shared/form-input";
import { useGetDoctorsQuery } from "@/features/doctors/api/doctorsApi";
import { useAddPatientAppointmentMutation, useUpdatePatientAppointmentMutation } from "@/features/patients/api/patientsApi";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Appointment, AppointmentStatus, Patient } from "@/types/api";

const appointmentSchema = z.object({
  doctorId: z.string().optional(),
  appointmentAt: z.string().min(1, "Choose an appointment date and time").refine((value) => !Number.isNaN(new Date(value).valueOf()), "Enter a valid appointment date and time"),
  status: z.enum(["upcoming", "completed", "incomplete", "rescheduled", "cancelled", "unknown"]),
});
type Values = z.infer<typeof appointmentSchema>;
type Mode =
  | { kind: "create"; patient: Patient; doctorId?: string; doctorName?: string }
  | { kind: "edit"; patient: Patient; appointment: Appointment };

function toLocalDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function AppointmentForm({ mode, onCancel, onSaved }: { mode: Mode; onCancel: () => void; onSaved: () => void }) {
  const needsDoctorSelection = mode.kind === "create" && !mode.doctorId;
  const { data: doctorsData, isLoading: doctorsLoading, error: doctorsError } = useGetDoctorsQuery({ page: 1, pageSize: 100 }, { skip: !needsDoctorSelection });
  const [addAppointment, addState] = useAddPatientAppointmentMutation();
  const [updateAppointment, updateState] = useUpdatePatientAppointmentMutation();
  const isEdit = mode.kind === "edit";
  const isLoading = addState.isLoading || updateState.isLoading;
  const error = isEdit ? updateState.error : addState.error;
  const doctors = doctorsData?.data ?? [];
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: mode.kind === "create" ? mode.doctorId ?? "" : mode.appointment.doctorId,
      appointmentAt: mode.kind === "edit" ? toLocalDateTime(mode.appointment.appointmentAt) : "",
      status: mode.kind === "edit" ? mode.appointment.status : "upcoming",
    },
  });

  async function submit(values: Values) {
    try {
      if (mode.kind === "create") {
        const doctorId = mode.doctorId ?? values.doctorId;
        if (!doctorId) {
          setError("doctorId", { type: "required", message: "Choose a doctor" });
          return;
        }
        await addAppointment({ patientId: mode.patient._id, body: { doctorId, appointmentAt: new Date(values.appointmentAt).toISOString(), status: values.status as AppointmentStatus } }).unwrap();
      } else {
        await updateAppointment({ patientId: mode.patient._id, appointmentId: mode.appointment._id, body: { appointmentAt: new Date(values.appointmentAt).toISOString(), status: values.status as AppointmentStatus } }).unwrap();
      }
      onSaved();
    } catch {
      // RTK Query exposes the API message below.
    }
  }

  return <form onSubmit={handleSubmit(submit)} noValidate className="rounded-2xl p-5 sm:p-6">
    <div className="mb-5 pr-10"><h2 className="font-semibold text-slate-900">{isEdit ? "Edit appointment" : "Add appointment"}</h2><p className="mt-1 text-sm text-slate-500">{mode.patient.name} · associate this visit with a doctor and appointment status.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      {mode.kind === "create" && (mode.doctorId
        ? <div className="rounded-xl border border-slate-300 bg-white px-3 py-2.5"><span className="block text-xs font-medium uppercase tracking-wide text-slate-500">Doctor</span><span className="mt-1 block text-sm font-medium text-slate-900">{mode.doctorName || "Selected doctor"}</span></div>
        : <div><label htmlFor="appointment-doctorId" className="mb-1.5 block text-sm font-medium text-slate-700">Doctor</label><select id="appointment-doctorId" {...register("doctorId")} disabled={doctorsLoading || Boolean(doctorsError) || doctors.length === 0} aria-invalid={Boolean(errors.doctorId)} className={inputClass}><option value="">{doctorsLoading ? "Loading doctors…" : doctors.length ? "Choose a doctor" : "No doctors available"}</option>{doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name} · {doctor.specialization}</option>)}</select>{errors.doctorId?.message && <p className="mt-1 text-xs text-rose-700">{errors.doctorId.message}</p>}{doctorsError && <p role="alert" className="mt-1 text-xs text-rose-700">{getApiErrorMessage(doctorsError, "Could not load doctors. Try again.")}</p>}</div>)}
      <FormInput label="Appointment date and time" type="datetime-local" required registration={register("appointmentAt")} error={errors.appointmentAt} />
      {mode.kind === "edit" && <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"><span className="block text-xs font-medium uppercase tracking-wide text-slate-500">Doctor</span><span className="mt-1 block break-all text-sm text-slate-800">Doctor {mode.appointment.doctorId}</span></div>}
      <div><label htmlFor="appointment-status" className="mb-1.5 block text-sm font-medium text-slate-700">Appointment status</label><select id="appointment-status" {...register("status")} className={inputClass}>{["upcoming", "completed", "incomplete", "rescheduled", "cancelled", "unknown"].map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></div>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">{getApiErrorMessage(error, `Could not ${isEdit ? "update" : "add"} this appointment. Please try again.`)}</p>}
    <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={isLoading || (needsDoctorSelection && (doctorsLoading || Boolean(doctorsError) || doctors.length === 0))}>{isLoading ? "Saving…" : isEdit ? "Save changes" : "Add appointment"}</Button></div>
  </form>;
}
