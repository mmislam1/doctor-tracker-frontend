import { api } from "@/lib/redux/services/api";
import type { Doctor, DoctorInput, ListQuery, PageResponse, SingleResponse } from "@/types/api";

export const doctorsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDoctors: build.query<PageResponse<Doctor>, ListQuery>({
      query: (params) => ({ url: "/doctors", params }),
      providesTags: (result) => [
        { type: "Doctor", id: "LIST" },
        ...(result?.data.map(({ _id }) => ({ type: "Doctor" as const, id: _id })) ?? []),
      ],
    }),
    createDoctor: build.mutation<SingleResponse<Doctor>, DoctorInput>({
      query: (body) => ({ url: "/doctors", method: "POST", body }),
      invalidatesTags: ["Doctor", "Dashboard"],
    }),
  }),
});

export const { useGetDoctorsQuery, useCreateDoctorMutation } = doctorsApi;
