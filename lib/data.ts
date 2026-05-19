// Specialties and their emojis
export const SPECIALTIES = [
  { id: 'clinico-geral', name: 'Clínico Geral', emoji: '🩺' },
  { id: 'cardiologista', name: 'Cardiologia', emoji: '❤️' },
  { id: 'neurologia', name: 'Neurologia', emoji: '🧠' },
  { id: 'pediatria', name: 'Pediatria', emoji: '👶' },
  { id: 'ortopedia', name: 'Ortopedia', emoji: '🦴' },
  { id: 'oftalmologia', name: 'Oftalmologia', emoji: '👁️' },
  { id: 'dermatologia', name: 'Dermatologia', emoji: '🧴' },
  { id: 'ginecologia', name: 'Ginecologia', emoji: '🧑‍⚕️' },
  { id: 'odontologia', name: 'Odontologia', emoji: '🦷' },
  { id: 'pneumologia', name: 'Pneumologia', emoji: '🫁' },
] as const

export type SpecialtyId = (typeof SPECIALTIES)[number]['id']

// Doctors data - 20 professionals
export const DOCTORS = [
  // Clínico Geral
  { id: 'dr-joao-almeida', name: 'Dr. João Almeida', crm: 'CRM-AM 12345', specialty: 'clinico-geral' },
  { id: 'dra-mariana-costa', name: 'Dra. Mariana Costa', crm: 'CRM-AM 12346', specialty: 'clinico-geral' },
  // Cardiologia
  { id: 'dr-ricardo-fernandes', name: 'Dr. Ricardo Fernandes', crm: 'CRM-AM 22301', specialty: 'cardiologia' },
  { id: 'dra-paula-nogueira', name: 'Dra. Paula Nogueira', crm: 'CRM-AM 22302', specialty: 'cardiologia' },
  // Neurologia
  { id: 'dr-felipe-andrade', name: 'Dr. Felipe Andrade', crm: 'CRM-AM 33401', specialty: 'neurologia' },
  { id: 'dra-camila-barros', name: 'Dra. Camila Barros', crm: 'CRM-AM 33402', specialty: 'neurologia' },
  // Pediatria
  { id: 'dra-juliana-martins', name: 'Dra. Juliana Martins', crm: 'CRM-AM 44501', specialty: 'pediatria' },
  { id: 'dr-lucas-ribeiro', name: 'Dr. Lucas Ribeiro', crm: 'CRM-AM 44502', specialty: 'pediatria' },
  // Ortopedia
  { id: 'dr-eduardo-carvalho', name: 'Dr. Eduardo Carvalho', crm: 'CRM-AM 55601', specialty: 'ortopedia' },
  { id: 'dr-bruno-teixeira', name: 'Dr. Bruno Teixeira', crm: 'CRM-AM 55602', specialty: 'ortopedia' },
  // Oftalmologia
  { id: 'dra-renata-gomes', name: 'Dra. Renata Gomes', crm: 'CRM-AM 66701', specialty: 'oftalmologia' },
  { id: 'dr-andre-batista', name: 'Dr. André Batista', crm: 'CRM-AM 66702', specialty: 'oftalmologia' },
  // Dermatologia
  { id: 'dra-aline-rocha', name: 'Dra. Aline Rocha', crm: 'CRM-AM 77801', specialty: 'dermatologia' },
  { id: 'dr-marcelo-pires', name: 'Dr. Marcelo Pires', crm: 'CRM-AM 77802', specialty: 'dermatologia' },
  // Ginecologia
  { id: 'dra-fernanda-lopes', name: 'Dra. Fernanda Lopes', crm: 'CRM-AM 88901', specialty: 'ginecologia' },
  { id: 'dra-patricia-souza', name: 'Dra. Patrícia Souza', crm: 'CRM-AM 88902', specialty: 'ginecologia' },
  // Odontologia
  { id: 'dra-carla-mendes', name: 'Dra. Carla Mendes', crm: 'CRO-AM 99001', specialty: 'odontologia' },
  { id: 'dr-rafael-oliveira', name: 'Dr. Rafael Oliveira', crm: 'CRO-AM 99002', specialty: 'odontologia' },
  // Pneumologia
  { id: 'dr-gustavo-freitas', name: 'Dr. Gustavo Freitas', crm: 'CRM-AM 10101', specialty: 'pneumologia' },
  { id: 'dra-daniela-vieira', name: 'Dra. Daniela Vieira', crm: 'CRM-AM 10102', specialty: 'pneumologia' },
] as const

export type DoctorId = (typeof DOCTORS)[number]['id']

// Priority types
export const PRIORITY_TYPES = [
  { id: 'normal', name: 'Normal', description: 'Atendimento padrão', icon: '🏥', law: null },
  { id: 'idoso', name: 'Idoso (60+ anos)', description: 'Prioridade por lei', icon: '👴', law: 'Lei 10.741/2003' },
  { id: 'pcd', name: 'PCD', description: 'Pessoa com Deficiência', icon: '♿', law: 'Lei 13.146/2015' },
  { id: 'gestante', name: 'Gestante', description: 'Atendimento prioritário', icon: '🤰', law: 'Lei 11.634/2007' },
] as const

export type PriorityType = (typeof PRIORITY_TYPES)[number]['id']

// Appointment status
export type AppointmentStatus = 'aguardando' | 'confirmado' | 'cancelado' | 'atendido' | 'falta'

export const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bgColor: string }> = {
  aguardando: { label: 'Aguardando Confirmação', color: '#F5A623', bgColor: 'bg-[#F5A623]' },
  confirmado: { label: 'Confirmado', color: '#00E96A', bgColor: 'bg-[#00E96A]' },
  cancelado: { label: 'Cancelado', color: '#E94040', bgColor: 'bg-[#E94040]' },
  atendido: { label: 'Atendido', color: '#4A90D9', bgColor: 'bg-[#4A90D9]' },
  falta: { label: 'Falta', color: '#888888', bgColor: 'bg-[#888888]' },
}

export const PRIORITY_BADGE_COLORS: Record<PriorityType, string> = {
  normal: '',
  idoso: 'bg-[#FF8C00]',
  pcd: 'bg-[#4A90D9]',
  gestante: 'bg-[#D966A8]',
}

// Time slots
export const TIME_SLOTS = {
  morning: ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  afternoon: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
}

// Appointment interface
export interface Appointment {
  id: string
  code: string // VPL-XXXX
  patientName: string
  patientCpf: string
  patientPhone: string
  patientBirthDate: string
  patientSusCard?: string
  specialtyId: SpecialtyId
  doctorId: DoctorId
  date: string // YYYY-MM-DD
  time: string // HH:mm
  priority: PriorityType
  status: AppointmentStatus
  documentFront?: string
  documentBack?: string
  createdAt: string
  notes: AppointmentNote[]
  statusHistory: StatusChange[]
}

export interface AppointmentNote {
  id: string
  text: string
  author: string
  createdAt: string
}

export interface StatusChange {
  from: AppointmentStatus | null
  to: AppointmentStatus
  changedAt: string
  changedBy?: string
}

// Booking flow state
export interface BookingState {
  step: number
  specialtyId: SpecialtyId | null
  doctorId: DoctorId | null
  date: string | null
  time: string | null
  patientName: string
  patientCpf: string
  patientPhone: string
  patientBirthDate: string
  patientSusCard: string
  priority: PriorityType
  documentFront: File | null
  documentBack: File | null
}

// Admin/Reception
export interface AdminUser {
  id: string
  name: string
  email: string
  cpf: string
  role: 'recepcao' | 'coordenacao' | 'administracao'
}

// Walk-in patient
export interface WalkInPatient {
  id: string
  name: string
  cpf: string
  phone: string
  specialtyId: SpecialtyId
  priority: PriorityType
  arrivalTime: string
  status: 'waiting' | 'assigned' | 'removed'
}

// Helper functions
export function getSpecialty(id: SpecialtyId) {
  return SPECIALTIES.find(s => s.id === id)
}

export function getDoctor(id: DoctorId) {
  return DOCTORS.find(d => d.id === id)
}

export function getDoctorsBySpecialty(specialtyId: SpecialtyId) {
  return DOCTORS.filter(d => d.specialty === specialtyId)
}

export function generateAppointmentCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `VPL-${digits}`
}

export function maskCpf(cpf: string): string {
  if (!cpf || cpf.length < 11) return cpf
  const clean = cpf.replace(/\D/g, '')
  return `***.***.***.${clean.slice(-2)}`
}

export function formatCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length <= 3) return clean
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length <= 2) return clean
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`
}

// CPF validation with check digit algorithm
export function validateCpf(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')

  if (clean.length !== 11) return false

  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(clean)) return false

  // First check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(clean[9])) return false

  // Second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(clean[10])) return false

  return true
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(dateStr: string, time: string): string {
  return `${formatDate(dateStr)} às ${time}`
}
