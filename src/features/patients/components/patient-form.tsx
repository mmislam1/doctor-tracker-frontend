"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormInput, inputClass } from "@/components/shared/form-input";
import { useGetDoctorsQuery } from "@/features/doctors/api/doctorsApi";
import { appointmentStatuses, type AppointmentStatus, type Patient } from "@/types/api";
import { useCreatePatientMutation, useUpdatePatientMutation } from "@/features/patients/api/patientsApi";
import { getApiErrorMessage } from "@/lib/api-error";

const patientSchema = z.object({
  doctorId: z.string().optional(),
  name: z.string().trim().min(2, "Enter the patient's name").max(120),
  condition: z.string().trim().min(2, "Enter a condition").max(120),
  appointmentAt: z.string().optional().refine((value) => !value || !Number.isNaN(new Date(value).valueOf()), "Enter a valid appointment date and time"),
  status: z.enum(appointmentStatuses).optional(),
});
type PatientValues = z.infer<typeof patientSchema>;
type FormMode =
  | { kind: "create"; doctorId?: string; doctorName?: string }
  | { kind: "edit"; patient: Patient };

export function PatientForm({ mode, onCancel, onSaved }: { mode: FormMode; onCancel: () => void; onSaved: () => void }) {
  const needsDoctorSelection = mode.kind === "create" && !mode.doctorId;
  const { data: doctorsData, isLoading: doctorsLoading, error: doctorsError } = useGetDoctorsQuery(
    { page: 1, pageSize: 100 },
    { skip: !needsDoctorSelection },
  );
  const [createPatient, createState] = useCreatePatientMutation();
  const [updatePatient, updateState] = useUpdatePatientMutation();
  const isEdit = mode.kind === "edit";
  const isLoading = createState.isLoading || updateState.isLoading;
  const error = isEdit ? updateState.error : createState.error;
  const doctors = doctorsData?.data ?? [];
  const { register, handleSubmit, setError, formState: { errors } } = useForm<PatientValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      doctorId: mode.kind === "create" ? mode.doctorId ?? "" : "",
      name: mode.kind === "edit" ? mode.patient.name : "",
      condition: mode.kind === "edit" ? mode.patient.condition : "",
      appointmentAt: "",
      status: "upcoming",
    },
  });

  async function submit(values: PatientValues) {
    try {
      if (mode.kind === "create") {
        const doctorId = mode.doctorId ?? values.doctorId;
        if (!doctorId) {
          setError("doctorId", { type: "required", message: "Choose a doctor" });
          return;
        }
        if (!values.appointmentAt) {
          setError("appointmentAt", { type: "required", message: "Choose an appointment date and time" });
          return;
        }
        await createPatient({
          name: values.name,
          condition: values.condition,
          doctorId,
          appointmentAt: new Date(values.appointmentAt).toISOString(),
          status: values.status as AppointmentStatus,
        }).unwrap();
      } else {
        await updatePatient({ patientId: mode.patient._id, body: { name: values.name, condition: values.condition } }).unwrap();
      }
      onSaved();
    } catch {
      // RTK Query exposes the API message below.
    }
  }

  return <form onSubmit={handleSubmit(submit)} noValidate className="rounded-2xl p-5 sm:p-6">
    <div className="mb-5 pr-10">
      <h2 className="font-semibold text-slate-900">{isEdit ? "Edit patient" : "Add patient"}</h2>
      <p className="mt-1 text-sm text-slate-500">{isEdit ? "Update the patient's profile details." : "Add a patient profile and schedule an appointment."}</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {mode.kind === "create" && (mode.doctorId
        ? <div className="rounded-xl border border-slate-300 bg-white px-3 py-2.5">
          <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">Doctor</span>
          <span className="mt-1 block text-sm font-medium text-slate-900">{mode.doctorName || "Selected doctor"}</span>
        </div>
        : <div>
          <label htmlFor="doctorId" className="mb-1.5 block text-sm font-medium text-slate-700">Doctor</label>
          <select id="doctorId" {...register("doctorId")} disabled={doctorsLoading || Boolean(doctorsError) || doctors.length === 0} aria-invalid={Boolean(errors.doctorId)} aria-describedby={errors.doctorId ? "doctorId-error" : undefined} className={inputClass}>
            <option value="">{doctorsLoading ? "Loading doctors…" : doctors.length ? "Choose a doctor" : "No doctors available"}</option>
            {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name} · {doctor.specialization}</option>)}
          </select>
          {errors.doctorId?.message && <p id="doctorId-error" className="mt-1 text-xs text-rose-700">{errors.doctorId.message}</p>}
          {doctorsError && <p role="alert" className="mt-1 text-xs text-rose-700">{getApiErrorMessage(doctorsError, "Could not load doctors. Try again.")}</p>}
          {!doctorsLoading && !doctorsError && doctors.length === 0 && <p className="mt-1 text-xs text-slate-600">Add a doctor before creating a patient record.</p>}
        </div>)}
      <FormInput label="Patient name" placeholder="Patient name" autoComplete="off" registration={register("name")} error={errors.name} />
      <FormInput label="Condition" placeholder="Condition" autoComplete="off" registration={register("condition")} error={errors.condition} />
      {mode.kind === "create" && <>
        <FormInput label="Appointment date and time" type="datetime-local" required registration={register("appointmentAt")} error={errors.appointmentAt} />
        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-slate-700">Appointment status</label>
          <select id="status" {...register("status")} className={inputClass}>
            {appointmentStatuses.filter((status) => status !== "unknown").map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
          </select>
        </div>
      </>}
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">{getApiErrorMessage(error, `Could not ${isEdit ? "update" : "add"} this patient. Please try again.`)}</p>}
    <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
      <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      <Button type="submit" disabled={isLoading || (needsDoctorSelection && (doctorsLoading || Boolean(doctorsError) || doctors.length === 0))}>{isLoading ? "Saving…" : isEdit ? "Save changes" : "Add patient"}</Button>
    </div>
  </form>;
}
