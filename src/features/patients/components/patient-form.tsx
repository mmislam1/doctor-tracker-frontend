"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/form-input";
import { useCreateDoctorPatientMutation, useUpdatePatientMutation } from "@/features/patients/api/patientsApi";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Patient } from "@/types/api";

const patientSchema = z.object({
  name: z.string().trim().min(2, "Enter the patient's name").max(120),
  condition: z.string().trim().min(2, "Enter a condition").max(120),
});
type PatientValues = z.infer<typeof patientSchema>;
type FormMode = { kind: "create"; doctorId: string } | { kind: "edit"; patient: Patient };

export function PatientForm({ mode, onCancel, onSaved }: { mode: FormMode; onCancel: () => void; onSaved: () => void }) {
  const [createPatient, createState] = useCreateDoctorPatientMutation();
  const [updatePatient, updateState] = useUpdatePatientMutation();
  const isEdit = mode.kind === "edit";
  const isLoading = createState.isLoading || updateState.isLoading;
  const error = isEdit ? updateState.error : createState.error;
  const { register, handleSubmit, formState: { errors } } = useForm<PatientValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: isEdit ? { name: mode.patient.name, condition: mode.patient.condition } : { name: "", condition: "" },
  });

  async function submit(values: PatientValues) {
    try {
      if (mode.kind === "create") await createPatient({ doctorId: mode.doctorId, body: values }).unwrap();
      else await updatePatient({ patientId: mode.patient._id, body: values }).unwrap();
      onSaved();
    } catch {
      // RTK Query exposes the API message below.
    }
  }

  return <form onSubmit={handleSubmit(submit)} noValidate className="rounded-2xl border border-teal-100 bg-teal-50/50 p-5 sm:p-6">
    <div className="mb-5"><h2 className="font-semibold text-slate-900">{isEdit ? "Edit patient" : "Add patient"}</h2><p className="mt-1 text-sm text-slate-500">{isEdit ? "Update the patient's name or condition." : "Patient records contain only a name and condition."}</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <FormInput label="Patient name" placeholder="Patient name" autoComplete="off" registration={register("name")} error={errors.name} />
      <FormInput label="Condition" placeholder="Condition" autoComplete="off" registration={register("condition")} error={errors.condition} />
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">{getApiErrorMessage(error, `Could not ${isEdit ? "update" : "add"} the patient. Please try again.`)}</p>}
    <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
      <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      <Button type="submit" disabled={isLoading}>{isLoading ? "Saving…" : isEdit ? "Save changes" : "Add patient"}</Button>
    </div>
  </form>;
}
