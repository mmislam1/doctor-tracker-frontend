import type { DoctorSpecialization } from "@/features/doctors/specializations";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PageResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface SingleResponse<T> {
  data: T;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  _id: string;
  doctorId: string;
  name: string;
  condition: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totals: { doctors: number; patients: number };
  patientsPerDoctor: Array<{
    doctorId: string;
    name: string;
    specialization: string;
    hospital: string;
    patientCount: number;
  }>;
  dailyStats: Array<{
    date: string;
    patientsCreated: number;
    doctorsCreated: number;
  }>;
}

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  from?: string;
  to?: string;
  condition?: string;
  doctorId?: string;
  specialization?: string;
  hospital?: string;
}

export interface DoctorInput {
  name: string;
  specialization: DoctorSpecialization;
  hospital: string;
  phone: string;
  email: string;
}

export interface PatientInput {
  name: string;
  condition: string;
}
