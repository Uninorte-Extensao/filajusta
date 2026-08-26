'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { format, addDays } from 'date-fns'

// Types
export type SpecialtyId = 'clinico-geral' | 'cardiologia' | 'neurologia' | 'pediatria' | 'ortopedia' | 'oftalmologia' | 'dermatologia' | 'ginecologia' | 'odontologia' | 'pneumologia'
export type AppointmentStatus = 'aguardando' | 'confirmado' | 'cancelado' | 'atendido' | 'falta'
export type PriorityType = 'normal' | 'idoso' | 'pcd' | 'gestante'

export interface Doctor {
  id: string
  nome: string
  crm: string
}

export interface Specialty {
  id: SpecialtyId
  nome: string
  emoji: string
  medicos: Doctor[]
}

export interface Appointment {
  id: string
  codigo: string
  pacienteNome: string
  cpf: string
  telefone: string
  dataNascimento?: string
  cartaoSus?: string
  medico: string
  medicoNome: string
  especialidade: string
  dataHora: string
  prioridade: PriorityType
  tipoDeficiencia?: string | null
  descricaoDeficiencia?: string | null
  documentoFrente?: string | null
  documentoVerso?: string | null
  status: AppointmentStatus
  criadoEm: string
  observacoes: Array<{ id: string; texto: string; autor: string; criadoEm: string }>
}

export interface BookingState {
  step: number
  especialidade: SpecialtyId | null
  especialidadeNome: string
  medico: string | null
  medicoNome: string
  medicoCrm: string
  data: string | null
  horario: string | null
  nome: string
  cpf: string
  telefone: string
  dataNascimento: string
  cartaoSus: string
  prioridade: PriorityType
  tipoDeficiencia: string
  descricaoDeficiencia: string
  documentoFrente: File | null
  documentoVerso: File | null
}

export interface AdminUser {
  id: string
  nome: string
  email: string
  cpf: string
  cargo: string
  setor: "recepcao" | "administracao"
  passwordHash: string
  criadoEm: string
}

export interface AdminSession {
  userId: string
  nome: string
  cargo: string
  setor: "recepcao" | "administracao"
  expiresAt: number
}

// Especialidades com 20 profissionais
export const ESPECIALIDADES: Specialty[] = [
  {
    id: 'clinico-geral', nome: 'Clinico Geral', emoji: '🩺',
    medicos: [
      { id: 'm01', nome: 'Dr. Joao Almeida', crm: 'CRM-AM 12345' },
      { id: 'm02', nome: 'Dra. Mariana Costa', crm: 'CRM-AM 12346' },
    ]
  },
  {
    id: 'cardiologia', nome: 'Cardiologia', emoji: '❤️',
    medicos: [
      { id: 'm03', nome: 'Dr. Ricardo Fernandes', crm: 'CRM-AM 22301' },
      { id: 'm04', nome: 'Dra. Paula Nogueira', crm: 'CRM-AM 22302' },
    ]
  },
  {
    id: 'neurologia', nome: 'Neurologia', emoji: '🧠',
    medicos: [
      { id: 'm05', nome: 'Dr. Felipe Andrade', crm: 'CRM-AM 33401' },
      { id: 'm06', nome: 'Dra. Camila Barros', crm: 'CRM-AM 33402' },
    ]
  },
  {
    id: 'pediatria', nome: 'Pediatria', emoji: '👶',
    medicos: [
      { id: 'm07', nome: 'Dra. Juliana Martins', crm: 'CRM-AM 44501' },
      { id: 'm08', nome: 'Dr. Lucas Ribeiro', crm: 'CRM-AM 44502' },
    ]
  },
  {
    id: 'ortopedia', nome: 'Ortopedia', emoji: '🦴',
    medicos: [
      { id: 'm09', nome: 'Dr. Eduardo Carvalho', crm: 'CRM-AM 55601' },
      { id: 'm10', nome: 'Dr. Bruno Teixeira', crm: 'CRM-AM 55602' },
    ]
  },
  {
    id: 'oftalmologia', nome: 'Oftalmologia', emoji: '👁️',
    medicos: [
      { id: 'm11', nome: 'Dra. Renata Gomes', crm: 'CRM-AM 66701' },
      { id: 'm12', nome: 'Dr. Andre Batista', crm: 'CRM-AM 66702' },
    ]
  },
  {
    id: 'dermatologia', nome: 'Dermatologia', emoji: '🧴',
    medicos: [
      { id: 'm13', nome: 'Dra. Aline Rocha', crm: 'CRM-AM 77801' },
      { id: 'm14', nome: 'Dr. Marcelo Pires', crm: 'CRM-AM 77802' },
    ]
  },
  {
    id: 'ginecologia', nome: 'Ginecologia', emoji: '🧑‍⚕️',
    medicos: [
      { id: 'm15', nome: 'Dra. Fernanda Lopes', crm: 'CRM-AM 88901' },
      { id: 'm16', nome: 'Dra. Patricia Souza', crm: 'CRM-AM 88902' },
    ]
  },
  {
    id: 'odontologia', nome: 'Odontologia', emoji: '🦷',
    medicos: [
      { id: 'm17', nome: 'Dra. Carla Mendes', crm: 'CRO-AM 99001' },
      { id: 'm18', nome: 'Dr. Rafael Oliveira', crm: 'CRO-AM 99002' },
    ]
  },
  {
    id: 'pneumologia', nome: 'Pneumologia', emoji: '🫁',
    medicos: [
      { id: 'm19', nome: 'Dr. Gustavo Freitas', crm: 'CRM-AM 10101' },
      { id: 'm20', nome: 'Dra. Daniela Vieira', crm: 'CRM-AM 10102' },
    ]
  },
]

const INITIAL_BOOKING_STATE: BookingState = {
  step: 1,
  especialidade: null,
  especialidadeNome: '',
  medico: null,
  medicoNome: '',
  medicoCrm: '',
  data: null,
  horario: null,
  nome: '',
  cpf: '',
  telefone: '',
  dataNascimento: '',
  cartaoSus: '',
  prioridade: 'normal',
  tipoDeficiencia: '',
  descricaoDeficiencia: '',
  documentoFrente: null,
  documentoVerso: null,
}

// Mock appointments for seeding
const getMockAppointments = (): Appointment[] => {
  const today = format(new Date(), 'yyyy-MM-dd')
  return [
    { id: crypto.randomUUID(), codigo: 'VPL-1001', pacienteNome: 'Ana Lima', cpf: '11111111111', telefone: '92991111111', medico: 'm01', medicoNome: 'Dr. Joao Almeida', especialidade: 'Clinico Geral', dataHora: `${today} 07:30`, prioridade: 'idoso', status: 'aguardando', criadoEm: new Date().toISOString(), observacoes: [] },
    { id: crypto.randomUUID(), codigo: 'VPL-1002', pacienteNome: 'Carlos Mendes', cpf: '22222222222', telefone: '92992222222', medico: 'm03', medicoNome: 'Dra. Paula Nogueira', especialidade: 'Cardiologia', dataHora: `${today} 08:00`, prioridade: 'pcd', tipoDeficiencia: 'fisica', status: 'confirmado', criadoEm: new Date().toISOString(), observacoes: [] },
    { id: crypto.randomUUID(), codigo: 'VPL-1003', pacienteNome: 'Beatriz Ramos', cpf: '33333333333', telefone: '92993333333', medico: 'm07', medicoNome: 'Dra. Juliana Martins', especialidade: 'Pediatria', dataHora: `${today} 08:30`, prioridade: 'normal', status: 'aguardando', criadoEm: new Date().toISOString(), observacoes: [] },
    { id: crypto.randomUUID(), codigo: 'VPL-1004', pacienteNome: 'Jose Santos', cpf: '44444444444', telefone: '92994444444', medico: 'm03', medicoNome: 'Dr. Ricardo Fernandes', especialidade: 'Cardiologia', dataHora: `${today} 09:00`, prioridade: 'normal', status: 'atendido', criadoEm: new Date().toISOString(), observacoes: [] },
    { id: crypto.randomUUID(), codigo: 'VPL-1005', pacienteNome: 'Fernanda Dias', cpf: '55555555555', telefone: '92995555555', medico: 'm06', medicoNome: 'Dra. Camila Barros', especialidade: 'Neurologia', dataHora: `${today} 09:30`, prioridade: 'gestante', status: 'confirmado', criadoEm: new Date().toISOString(), observacoes: [] },
    { id: crypto.randomUUID(), codigo: 'VPL-1006', pacienteNome: 'Roberto Alves', cpf: '66666666666', telefone: '92996666666', medico: 'm09', medicoNome: 'Dr. Eduardo Carvalho', especialidade: 'Ortopedia', dataHora: `${today} 10:00`, prioridade: 'idoso', status: 'aguardando', criadoEm: new Date().toISOString(), observacoes: [] },
    { id: crypto.randomUUID(), codigo: 'VPL-1007', pacienteNome: 'Marcia Souza', cpf: '77777777777', telefone: '92997777777', medico: 'm11', medicoNome: 'Dra. Renata Gomes', especialidade: 'Oftalmologia', dataHora: `${today} 10:30`, prioridade: 'normal', status: 'cancelado', criadoEm: new Date().toISOString(), observacoes: [] },
    { id: crypto.randomUUID(), codigo: 'VPL-1008', pacienteNome: 'Paulo Ferreira', cpf: '88888888888', telefone: '92998888888', medico: 'm05', medicoNome: 'Dr. Felipe Andrade', especialidade: 'Neurologia', dataHora: `${today} 11:00`, prioridade: 'normal', status: 'falta', criadoEm: new Date().toISOString(), observacoes: [] },
  ]
}

interface AppContextType {
  // Appointments
  appointments: Appointment[]
  addAppointment: (appointment: Omit<Appointment, 'id' | 'codigo' | 'criadoEm' | 'observacoes'>) => string
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void
  findAppointmentByCode: (code: string) => Appointment | undefined
  findAppointmentsByCpf: (cpf: string) => Appointment[]
  getAppointmentsByDate: (date: string) => Appointment[]
  canCancelAppointment: (appointment: Appointment) => boolean
  
  // Booking flow
  booking: BookingState
  updateBooking: (data: Partial<BookingState>) => void
  resetBooking: () => void
  
  // Admin auth
  session: AdminSession | null
  loginAttempts: number
  lockoutUntil: number | null
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (data: { nome: string; email: string; cpf: string; cargo: string; setor: "recepcao" | "administracao"; senha: string }) => { success: boolean; error?: string }
  checkSession: () => boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [booking, setBooking] = useState<BookingState>(INITIAL_BOOKING_STATE)
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Load appointments
    const storedAppointments = localStorage.getItem('filajusta_appointments')
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments))
    } else {
      // Seed with mock data
      const mockData = getMockAppointments()
      localStorage.setItem('filajusta_appointments', JSON.stringify(mockData))
      setAppointments(mockData)
    }
    
    // Load session
    const storedSession = localStorage.getItem('filajusta_session')
    if (storedSession) {
      const parsed = JSON.parse(storedSession) as AdminSession
      if (Date.now() < parsed.expiresAt) {
        setSession(parsed)
      } else {
        localStorage.removeItem('filajusta_session')
      }
    }
    
    // Load login attempts
    const storedAttempts = localStorage.getItem('filajusta_login_attempts')
    if (storedAttempts) {
      const { attempts, lockout } = JSON.parse(storedAttempts)
      setLoginAttempts(attempts)
      if (lockout && Date.now() < lockout) {
        setLockoutUntil(lockout)
      }
    }
    
    setIsInitialized(true)
  }, [])

  // Persist appointments to localStorage
  useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem('filajusta_appointments', JSON.stringify(appointments))
  }, [appointments, isInitialized])

  const addAppointment = useCallback((data: Omit<Appointment, 'id' | 'codigo' | 'criadoEm' | 'observacoes'>) => {
    const codigo = `VPL-${Math.floor(1000 + Math.random() * 9000)}`
    
    const newAppointment: Appointment = {
      ...data,
      id: crypto.randomUUID(),
      codigo,
      criadoEm: new Date().toISOString(),
      observacoes: [],
    }
    
    // Update state
    setAppointments(prev => {
      const updated = [...prev, newAppointment]
      // Also save to localStorage immediately
      localStorage.setItem('filajusta_appointments', JSON.stringify(updated))
      return updated
    })
    
    // Save last booking code
    localStorage.setItem('filajusta_last_booking', codigo)
    
    return codigo
  }, [])

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setAppointments(prev => {
      const updated = prev.map(apt => apt.id === id ? { ...apt, status } : apt)
      localStorage.setItem('filajusta_appointments', JSON.stringify(updated))
      return updated
    })
  }, [])

  const findAppointmentByCode = useCallback((code: string) => {
    return appointments.find(apt => apt.codigo.toUpperCase() === code.trim().toUpperCase())
  }, [appointments])

  const findAppointmentsByCpf = useCallback((cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) return []
    return appointments.filter(apt => apt.cpf.replace(/\D/g, '') === cleanCpf)
  }, [appointments])

  const getAppointmentsByDate = useCallback((date: string) => {
    return appointments.filter(apt => apt.dataHora.startsWith(date))
  }, [appointments])

  const canCancelAppointment = useCallback((appointment: Appointment) => {
    if (['cancelado', 'atendido', 'falta'].includes(appointment.status)) return false
    
    const [datePart, timePart] = appointment.dataHora.split(' ')
    const appointmentDateTime = new Date(`${datePart}T${timePart}:00`)
    const now = new Date()
    const diffMinutes = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60)
    
    return diffMinutes > 30
  }, [])

  const updateBooking = useCallback((data: Partial<BookingState>) => {
    setBooking(prev => ({ ...prev, ...data }))
  }, [])

  const resetBooking = useCallback(() => {
    setBooking(INITIAL_BOOKING_STATE)
  }, [])

  const login = useCallback(
    async (
      email: string,
      senha: string
    ): Promise<{ success: boolean; error?: string }> => {
      // Check lockout
      if (lockoutUntil && Date.now() < lockoutUntil) {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000)

        return {
          success: false,
          error: `Conta bloqueada. Tente novamente em ${remaining} minutos.`,
        }
      }

      try {
        // Login feito somente pela API Express
        const { loginFuncionario } = await import('@/lib/api-actions')

        const apiSession = await loginFuncionario(
          email.trim().toLowerCase(),
          senha
        )

        const newSession: AdminSession = {
          userId: apiSession.userId || apiSession.email,
          nome: apiSession.nome,
          cargo: apiSession.cargo,
          setor: apiSession.setor,
          expiresAt: apiSession.expiresAt,
        }

        setSession(newSession)
        setLoginAttempts(0)
        setLockoutUntil(null)

        localStorage.setItem(
          'filajusta_session',
          JSON.stringify(newSession)
        )

        localStorage.setItem(
          'filajusta_login_attempts',
          JSON.stringify({
            attempts: 0,
            lockout: null,
          })
        )

        return { success: true }
      } catch (error) {
        console.error('[AppContext] Erro no login:', error)

        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)

        if (newAttempts >= 5) {
          const lockout = Date.now() + 15 * 60 * 1000

          setLockoutUntil(lockout)

          localStorage.setItem(
            'filajusta_login_attempts',
            JSON.stringify({
              attempts: newAttempts,
              lockout,
            })
          )

          return {
            success: false,
            error: 'Conta bloqueada por 15 minutos apos 5 tentativas.',
          }
        }

        localStorage.setItem(
          'filajusta_login_attempts',
          JSON.stringify({
            attempts: newAttempts,
            lockout: null,
          })
        )

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Credenciais incorretas. Verifique e-mail e senha.',
        }
      }
    },
    [loginAttempts, lockoutUntil]
  )

  const logout = useCallback(() => {
    setSession(null)
    localStorage.removeItem('filajusta_session')
    localStorage.removeItem('filajusta_token')
  }, [])

  const register = useCallback((data: { nome: string; email: string; cpf: string; cargo: string; setor: "recepcao" | "administracao"; senha: string }): { success: boolean; error?: string } => {
    const existing: AdminUser[] = JSON.parse(localStorage.getItem('filajusta_admins') || '[]')
    
    // Check if email or CPF already exists
    if (existing.some(u => u.email.toLowerCase() === data.email.toLowerCase().trim())) {
      return { success: false, error: 'Este e-mail ja esta cadastrado.' }
    }
    
    if (existing.some(u => u.cpf.replace(/\D/g, '') === data.cpf.replace(/\D/g, ''))) {
      return { success: false, error: 'Este CPF ja esta cadastrado.' }
    }
    
    const newUser: AdminUser = {
      id: crypto.randomUUID(),
      nome: data.nome,
      email: data.email.toLowerCase().trim(),
      cpf: data.cpf.replace(/\D/g, ''),
      cargo: data.cargo,
      setor: data.setor,
      passwordHash: data.senha,
      criadoEm: new Date().toISOString(),
    }
    
    existing.push(newUser)
    localStorage.setItem('filajusta_admins', JSON.stringify(existing))
    
    return { success: true }
  }, [])

  const checkSession = useCallback(() => {
    const stored = localStorage.getItem('filajusta_session')
    if (!stored) return false
    
    const parsed = JSON.parse(stored) as AdminSession
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem('filajusta_session')
      setSession(null)
      return false
    }
    
    return true
  }, [])

  return (
    <AppContext.Provider
      value={{
        appointments,
        addAppointment,
        updateAppointmentStatus,
        findAppointmentByCode,
        findAppointmentsByCpf,
        getAppointmentsByDate,
        canCancelAppointment,
        booking,
        updateBooking,
        resetBooking,
        session,
        loginAttempts,
        lockoutUntil,
        login,
        logout,
        register,
        checkSession,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
