"use client";

import { Activity, CalendarDays, Stethoscope, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorPanel, LoadingPanel } from "@/components/shared/feedback";
import { useGetDashboardSummaryQuery } from "@/features/dashboard/api/dashboardApi";
import { getApiErrorMessage } from "@/lib/api-error";

const numberFormat = new Intl.NumberFormat();

function MetricCard({ label, value, note, icon: Icon, tone }: {
  label: string;
  value: number;
  note: string;
  icon: typeof Users;
  tone: "teal" | "blue" | "amber" | "violet";
}) {
  const colors = {
    teal: "bg-teal-50 text-teal-800",
    blue: "bg-blue-50 text-blue-800",
    amber: "bg-amber-50 text-amber-800",
    violet: "bg-violet-50 text-violet-800",
  };
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{numberFormat.format(value)}</p></div><span className={`flex size-11 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="size-5" aria-hidden="true" /></span></div>
    <p className="mt-3 text-xs text-slate-500">{note}</p>
  </article>;
}

export function DashboardScreen() {
  const { data: response, isLoading, error, refetch } = useGetDashboardSummaryQuery();
  if (isLoading) return <><PageHeader eyebrow="Overview" title="Dashboard" description="A live view of doctors, patients and recent activity." /><LoadingPanel label="Loading dashboard metrics" /></>;
  if (error || !response) return <><PageHeader eyebrow="Overview" title="Dashboard" description="A live view of doctors, patients and recent activity." /><ErrorPanel message={getApiErrorMessage(error, "Could not load dashboard metrics.")} onRetry={() => { void refetch(); }} /></>;

  const summary = response.data;
  const last30Doctors = summary.dailyStats.reduce((total, item) => total + item.doctorsCreated, 0);
  const last30Patients = summary.dailyStats.reduce((total, item) => total + item.patientsCreated, 0);
  const doctors = summary.patientsPerDoctor.slice(0, 8);
  const chartData = summary.dailyStats.map((item) => ({ ...item, day: item.date.slice(5) }));

  return <>
    <PageHeader eyebrow="Overview" title="Dashboard" description="A live view of doctors, patients and recent activity." />
    <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total doctors" value={summary.totals.doctors} note="In your doctor directory" icon={Stethoscope} tone="teal" />
      <MetricCard label="Total patients" value={summary.totals.patients} note="Across all doctors" icon={Users} tone="blue" />
      <MetricCard label="Doctors added" value={last30Doctors} note="During the last 30 days" icon={CalendarDays} tone="violet" />
      <MetricCard label="Patients added" value={last30Patients} note="During the last 30 days" icon={Activity} tone="amber" />
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5"><h2 className="font-semibold text-slate-900">Records over time</h2><p className="mt-1 text-xs text-slate-500">New doctor and patient records by day · last 30 days</p></div>
        {chartData.length > 0 ? <div className="h-[290px] w-full" role="img" aria-label="Line chart showing new doctor and patient records per day">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="#e9eef1" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#84929a", fontSize: 11 }} minTickGap={20} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#84929a", fontSize: 11 }} />
              <Tooltip labelFormatter={(label) => `Date: ${label}`} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Line type="monotone" dataKey="patientsCreated" name="Patients" stroke="#16837e" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="doctorsCreated" name="Doctors" stroke="#7284cc" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div> : <EmptyState title="No activity yet" description="New doctor and patient records will appear here as they are added." />}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5"><h2 className="font-semibold text-slate-900">Patients per doctor</h2><p className="mt-1 text-xs text-slate-500">Patient records grouped by doctor</p></div>
        {doctors.length > 0 ? <div className="h-[290px] w-full" role="img" aria-label="Bar chart showing the patient count for each doctor">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={doctors} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#e9eef1" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#84929a", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={104} tickLine={false} axisLine={false} tick={{ fill: "#53636d", fontSize: 11 }} tickFormatter={(name: string) => name.length > 15 ? `${name.slice(0, 14)}…` : name} />
              <Tooltip formatter={(value) => [numberFormat.format(Number(value)), "Patients"]} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }} />
              <Bar dataKey="patientCount" name="Patients" fill="#16837e" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div> : <EmptyState title="No doctors yet" description="Add doctors to see how patient records are distributed across your care team." />}
      </section>
    </div>
    {summary.patientsPerDoctor.length > doctors.length && <p className="mt-3 text-right text-xs text-slate-400">Showing the 8 doctors with the most patients.</p>}
  </>;
}
