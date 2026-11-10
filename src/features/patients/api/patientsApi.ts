import { api } from "@/lib/redux/services/api";
import type { Appointment, AppointmentInput, AppointmentUpdateInput, ListQuery, PageResponse, Patient, PatientInput, PatientUpdateInput, SingleResponse } from "@/types/api";

export const patientsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPatients: build.query<PageResponse<Patient>, ListQuery>({
      query: (params) => ({ url: "/patients", params }),
      providesTags: (result) => [
        { type: "Patient", id: "LIST" },
        ...(result?.data.map(({ _id }) => ({ type: "Patient" as const, id: _id })) ?? []),
      ],
    }),
    getDoctorPatients: build.query<PageResponse<Patient>, ListQuery & { doctorId: string }>({
      query: ({ doctorId, ...params }) => ({ url: `/doctors/${encodeURIComponent(doctorId)}/patients`, params }),
      providesTags: (result, _error, { doctorId }) => [
        { type: "Patient", id: `DOCTOR-${doctorId}` },
        ...(result?.data.map(({ _id }) => ({ type: "Patient" as const, id: _id })) ?? []),
      ],
    }),
    createPatient: build.mutation<SingleResponse<Patient>, PatientInput>({
      query: (body) => ({ url: "/patients", method: "POST", body }),
      invalidatesTags: ["Patient", "Dashboard"],
    }),
    addPatientAppointment: build.mutation<SingleResponse<Appointment>, { patientId: string; body: AppointmentInput }>({
      query: ({ patientId, body }) => ({ url: `/patients/${encodeURIComponent(patientId)}/appointments`, method: "POST", body }),
      invalidatesTags: (_result, _error, { patientId }) => ["Patient", "Dashboard", { type: "Patient", id: patientId }],
    }),
    updatePatient: build.mutation<SingleResponse<Patient>, { patientId: string; body: PatientUpdateInput }>({
      query: ({ patientId, body }) => ({ url: `/patients/${encodeURIComponent(patientId)}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { patientId }) => ["Patient", "Dashboard", { type: "Patient", id: patientId }],
    }),
    updatePatientAppointment: build.mutation<SingleResponse<Appointment>, { patientId: string; appointmentId: string; body: AppointmentUpdateInput }>({
      query: ({ patientId, appointmentId, body }) => ({ url: `/patients/${encodeURIComponent(patientId)}/appointments/${encodeURIComponent(appointmentId)}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { patientId }) => ["Patient", "Dashboard", { type: "Patient", id: patientId }],
    }),
    deletePatient: build.mutation<void, { patientId: string; doctorId?: string }>({
      query: ({ patientId }) => ({ url: `/patients/${encodeURIComponent(patientId)}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { patientId, doctorId }) => [
        "Patient", "Dashboard", { type: "Patient", id: patientId },
        ...(doctorId ? [{ type: "Patient" as const, id: `DOCTOR-${doctorId}` }] : []),
      ],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetDoctorPatientsQuery,
  useCreatePatientMutation,
  useAddPatientAppointmentMutation,
  useUpdatePatientMutation,
  useUpdatePatientAppointmentMutation,
  useDeletePatientMutation,
} = patientsApi;
