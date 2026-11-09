import { api } from "@/lib/redux/services/api";
import type { ListQuery, PageResponse, Patient, PatientInput, SingleResponse } from "@/types/api";

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
    createDoctorPatient: build.mutation<SingleResponse<Patient>, { doctorId: string; body: PatientInput }>({
      query: ({ doctorId, body }) => ({ url: `/doctors/${encodeURIComponent(doctorId)}/patients`, method: "POST", body }),
      invalidatesTags: (_result, _error, { doctorId }) => ["Patient", "Dashboard", { type: "Patient", id: `DOCTOR-${doctorId}` }],
    }),
    updatePatient: build.mutation<SingleResponse<Patient>, { patientId: string; body: PatientInput }>({
      query: ({ patientId, body }) => ({ url: `/patients/${encodeURIComponent(patientId)}`, method: "PATCH", body }),
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
  useCreateDoctorPatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientsApi;
