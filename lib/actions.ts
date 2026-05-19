"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Types
export type Specialty = {
  id: string
  name: string
  emoji: string
  active: boolean
}

export type Doctor = {
  id: string
  name: string
  crm: string
  specialty_id: string
  phone: string | null
  email: string | null
  active: boolean
  specialty?: Specialty
}

export type Appointment = {
  id: string
  code: string
  patient_name: string
  patient_cpf: string
  patient_phone: string
  patient_birth_date: string
  patient_sus_card: string | null
  specialty_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  priority: "normal" | "idoso" | "pcd" | "gestante"
  status: "aguardando" | "confirmado" | "cancelado" | "atendido" | "falta"
  created_at: string
  specialty?: Specialty
  doctor?: Doctor
}

export type WaitingListItem = {
  id: string
  name: string
  cpf: string
  phone: string
  specialty_id: string
  priority: "normal" | "idoso" | "pcd" | "gestante"
  arrival_time: string
  status: "waiting" | "assigned" | "removed"
  specialty?: Specialty
}

// Specialties
export async function getSpecialties() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("specialties")
    .select("*")
    .eq("active", true)
    .order("name")
  
  if (error) throw error
  return data as Specialty[]
}

export async function getSpecialtyById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("specialties")
    .select("*")
    .eq("id", id)
    .single()
  
  if (error) return null
  return data as Specialty
}

// Doctors
export async function getDoctors() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .select("*, specialty:specialties(*)")
    .eq("active", true)
    .order("name")
  
  if (error) throw error
  return data as Doctor[]
}

export async function getDoctorsBySpecialtyId(specialtyId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .select("*, specialty:specialties(*)")
    .eq("specialty_id", specialtyId)
    .eq("active", true)
    .order("name")
  
  if (error) throw error
  return data as Doctor[]
}

export async function getDoctorById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .select("*, specialty:specialties(*)")
    .eq("id", id)
    .single()
  
  if (error) return null
  return data as Doctor
}

export async function createDoctor(doctor: {
  name: string
  crm: string
  specialty_id: string
  phone?: string
  email?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .insert(doctor)
    .select()
    .single()
  
  if (error) throw error
  revalidatePath("/recepcao/medicos")
  revalidatePath("/admin/medicos")
  return data as Doctor
}

export async function updateDoctor(id: string, doctor: Partial<Doctor>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("doctors")
    .update({ ...doctor, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  
  if (error) throw error
  revalidatePath("/recepcao/medicos")
  revalidatePath("/admin/medicos")
  return data as Doctor
}

export async function deleteDoctor(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("doctors")
    .update({ active: false })
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/recepcao/medicos")
  revalidatePath("/admin/medicos")
}

// Appointments
export async function createAppointment(appointment: {
  patient_name: string
  patient_cpf: string
  patient_phone: string
  patient_birth_date: string
  patient_sus_card?: string
  specialty_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  priority: "normal" | "idoso" | "pcd" | "gestante"
}) {
  const supabase = await createClient()
  
  // Generate unique code
  const code = `VPL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  
  const { data, error } = await supabase
    .from("appointments")
    .insert({ ...appointment, code })
    .select()
    .single()
  
  if (error) throw error
  
  // Add status history
  await supabase.from("appointment_status_history").insert({
    appointment_id: data.id,
    from_status: null,
    to_status: "aguardando",
    changed_by: "Sistema"
  })
  
  revalidatePath("/recepcao")
  return data as Appointment
}

export async function getAppointmentsByDate(date: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, specialty:specialties(*), doctor:doctors(*)")
    .eq("appointment_date", date)
    .order("appointment_time")
  
  if (error) throw error
  return data as Appointment[]
}

export async function getAppointmentByCode(code: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, specialty:specialties(*), doctor:doctors(*)")
    .eq("code", code)
    .single()
  
  if (error) return null
  return data as Appointment
}

export async function getAppointmentsByCpf(cpf: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, specialty:specialties(*), doctor:doctors(*)")
    .eq("patient_cpf", cpf)
    .order("appointment_date", { ascending: false })
  
  if (error) throw error
  return data as Appointment[]
}

export async function updateAppointmentStatus(
  id: string,
  status: "aguardando" | "confirmado" | "cancelado" | "atendido" | "falta",
  changedBy: string = "Recepção"
) {
  const supabase = await createClient()
  
  // Get current status
  const { data: current } = await supabase
    .from("appointments")
    .select("status")
    .eq("id", id)
    .single()
  
  // Update status
  const { error } = await supabase
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
  
  if (error) throw error
  
  // Add status history
  await supabase.from("appointment_status_history").insert({
    appointment_id: id,
    from_status: current?.status,
    to_status: status,
    changed_by: changedBy
  })
  
  revalidatePath("/recepcao")
}

export async function getAppointmentStatusHistory(appointmentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointment_status_history")
    .select("*")
    .eq("appointment_id", appointmentId)
    .order("changed_at", { ascending: false })
  
  if (error) throw error
  return data
}

export async function addAppointmentNote(appointmentId: string, text: string, author: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("appointment_notes")
    .insert({ appointment_id: appointmentId, text, author })
  
  if (error) throw error
  revalidatePath("/recepcao")
}

export async function getAppointmentNotes(appointmentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointment_notes")
    .select("*")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false })
  
  if (error) throw error
  return data
}

// Waiting List
export async function addToWaitingList(item: {
  name: string
  cpf: string
  phone: string
  specialty_id: string
  priority: "normal" | "idoso" | "pcd" | "gestante"
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("waiting_list")
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  revalidatePath("/recepcao/fila-espera")
  return data as WaitingListItem
}

export async function getWaitingList() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("waiting_list")
    .select("*, specialty:specialties(*)")
    .eq("status", "waiting")
    .order("arrival_time")
  
  if (error) throw error
  return data as WaitingListItem[]
}

export async function removeFromWaitingList(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("waiting_list")
    .update({ status: "removed" })
    .eq("id", id)
  
  if (error) throw error
  revalidatePath("/recepcao/fila-espera")
}

// Admin Users
export async function createAdminUser(user: {
  name: string
  email: string
  cpf: string
  password_hash: string
  role: "recepcao" | "coordenacao" | "administracao"
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_users")
    .insert(user)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getAdminUserByEmail(email: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .eq("active", true)
    .single()
  
  if (error) return null
  return data
}

export async function updateAdminUserFailedAttempts(id: string, failedAttempts: number, lockedUntil?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("admin_users")
    .update({ 
      failed_attempts: failedAttempts,
      locked_until: lockedUntil || null
    })
    .eq("id", id)
  
  if (error) throw error
}
