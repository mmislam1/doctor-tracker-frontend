import { api } from "@/lib/redux/services/api";
import type { DashboardSummary, SingleResponse } from "@/types/api";

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: build.query<SingleResponse<DashboardSummary>, void>({
      query: () => "/dashboard/summary",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
