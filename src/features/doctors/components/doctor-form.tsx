"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/form-input";
import { useCreateDoctorMutation } from "@/features/doctors/api/doctorsApi";
import { getApiErrorMessage } from "@/lib/api-error";
import { doctorSpecializations } from "@/features/doctors/specializations";
import { showToast } from "@/lib/toast";

const doctorSchema = z.object({
  name: z.string().trim().min(2, "Enter the doctor's name").max(120),
  specialization: z.enum(doctorSpecializations, { error: "Choose a specialization" }),
  hospital: z.string().trim().min(2, "Enter a hospital or clinic").max(150),
  phone: z.string().trim().min(5, "Enter a phone number").max(40),
  email: z.email("Enter a valid email address").trim().max(254),
});
type DoctorValues = z.infer<typeof doctorSchema>;

export function DoctorForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const [createDoctor, { isLoading, error: apiError }] = useCreateDoctorMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<DoctorValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: { name: "", hospital: "", phone: "", email: "" },
  });

  async function submit(values: DoctorValues) {
    try {
      await createDoctor(values).unwrap();
      showToast("success", "Doctor added", "The doctor was added successfully.");
      onCreated();
    } catch (error) {
      showToast("error", "Doctor not added", getApiErrorMessage(error, "Could not create this doctor. Please try again."));
      // RTK Query exposes the API message below.
    }
  }

  return <form onSubmit={handleSubmit(submit)} noValidate className="rounded-2xl p-5 sm:p-6">
    <div className="mb-5 pr-10"><h2 className="font-semibold text-slate-900">Add a doctor</h2><p className="mt-1 text-sm text-slate-500">Add the contact and practice details for this doctor.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <FormInput label="Full name" placeholder="Dr. Maya Rahman" autoComplete="name" registration={register("name")} error={errors.name} />
      <div>
        <label htmlFor="specialization" className="mb-1.5 block text-sm font-medium text-slate-700">Specialization</label>
        <select id="specialization" defaultValue="" {...register("specialization")} aria-invalid={Boolean(errors.specialization)} aria-describedby={errors.specialization ? "specialization-error" : undefined} className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10">
          <option value="">Choose a specialization</option>
          {doctorSpecializations.map((specialization) => <option key={specialization} value={specialization}>{specialization}</option>)}
        </select>
        {errors.specialization?.message && <p id="specialization-error" className="mt-1 text-xs text-rose-700">{errors.specialization.message}</p>}
      </div>
      <FormInput label="Hospital or clinic" placeholder="Central Medical Center" registration={register("hospital")} error={errors.hospital} />
      <FormInput label="Phone" type="tel" placeholder="+880 1XXX-XXXXXX" autoComplete="tel" registration={register("phone")} error={errors.phone} />
      <FormInput label="Email" type="email" placeholder="doctor@example.com" autoComplete="email" registration={register("email")} error={errors.email} />
    </div>
    {apiError && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">{getApiErrorMessage(apiError, "Could not create this doctor. Please try again.")}</p>}
    <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
      <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      <Button type="submit" disabled={isLoading}>{isLoading ? "Saving doctor…" : "Save doctor"}</Button>
    </div>
  </form>;
}
