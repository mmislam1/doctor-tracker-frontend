import { DoctorPatientsScreen } from "@/features/patients/doctor-patients-screen";

export default async function DoctorPatientsPage({ params, searchParams }: {
  params: Promise<{ doctorId: string }>;
  searchParams: Promise<{ name?: string | string[] }>;
}) {
  const [{ doctorId }, query] = await Promise.all([params, searchParams]);
  const doctorName = typeof query.name === "string" ? query.name : undefined;
  return <DoctorPatientsScreen doctorId={doctorId} doctorName={doctorName} />;
}
