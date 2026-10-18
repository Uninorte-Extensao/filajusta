'use client'

import { useRouter } from 'next/navigation'
import { useApp, type PriorityType } from '@/contexts/app-context'
import { StepProgress } from '@/components/step-progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User, CreditCard, Calendar, Phone, FileText, Upload, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { differenceInYears } from 'date-fns'

const STEP_LABELS = ['Especialidade', 'Médico', 'Data e Horário', 'Seus Dados', 'Confirmar']

const PRIORITY_TYPES = [
  { id: 'normal' as PriorityType, name: 'Normal', icon: '👤', description: 'Atendimento regular' },
  { id: 'idoso' as PriorityType, name: 'Idoso (60+)', icon: '👴', description: 'Atendimento prioritário', law: 'Lei 10.741/2003' },
  { id: 'pcd' as PriorityType, name: 'PCD', icon: '♿', description: 'Pessoa com deficiência', law: 'Lei 10.098/2000' },
  { id: 'gestante' as PriorityType, name: 'Gestante', icon: '🤰', description: 'Gestantes e lactantes', law: 'Lei 10.048/2000' },
]

interface FormErrors {
  nome?: string
  cpf?: string
  dataNascimento?: string
  telefone?: string
  descricaoDeficiencia?: string
}

function formatCpf(value: string): string {
  const clean = value.replace(/\D/g, '')
  if (clean.length <= 3) return clean
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
}

function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, '')
  if (clean.length <= 2) return clean
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`
}

function validateCpf(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return false
  if (/^(\d)\1+$/.test(clean)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i)
  }
  let d1 = (sum * 10) % 11
  if (d1 === 10) d1 = 0
  if (d1 !== parseInt(clean[9])) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i]) * (11 - i)
  }
  let d2 = (sum * 10) % 11
  if (d2 === 10) d2 = 0
  if (d2 !== parseInt(clean[10])) return false
  
  return true
}

export default function DadosPage() {
  const router = useRouter()
  const { booking, updateBooking, appointments } = useApp()
  const [errors, setErrors] = useState<FormErrors>({})
  const [documentFrontName, setDocumentFrontName] = useState<string>('')
  const [documentBackName, setDocumentBackName] = useState<string>('')
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!booking.especialidade || !booking.medico || !booking.data || !booking.horario) {
      router.push('/agendar/especialidade')
    }
  }, [booking, router])

  const hasActiveAppointmentToday = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '')
    const today = new Date().toISOString().split('T')[0]
    return appointments.some(
      apt => apt.cpf.replace(/\D/g, '') === cleanCpf && 
             apt.dataHora.startsWith(today) && 
             !['cancelado', 'falta'].includes(apt.status)
    )
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!booking.nome.trim()) {
      newErrors.nome = 'Nome e obrigatório'
    }

    if (!booking.cpf) {
      newErrors.cpf = 'CPF e obrigatório'
    } else if (!validateCpf(booking.cpf)) {
      newErrors.cpf = 'CPF inválido'
    } else if (hasActiveAppointmentToday(booking.cpf)) {
      newErrors.cpf = 'Você já possui uma consulta neste dia'
    }

    if (!booking.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento e obrigatória'
    } else {
      const age = differenceInYears(new Date(), new Date(booking.dataNascimento))
      if (booking.prioridade === 'idoso' && age < 60) {
        newErrors.dataNascimento = 'Idade mínima para atendimento prioritrio: 60 anos'
      }
    }

    if (!booking.telefone) {
      newErrors.telefone = 'Celular e obrigatório'
    } else if (booking.telefone.replace(/\D/g, '').length < 11) {
      newErrors.telefone = 'Celular inválido'
    }

    // ← CHANGED: descrição obrigatória quando PCD selecionado
    if (booking.prioridade === 'pcd' && !booking.descricaoDeficiencia?.trim()) {
      newErrors.descricaoDeficiencia = 'Descrição da deficiência e obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCpfChange = (value: string) => {
    const formatted = formatCpf(value)
    updateBooking({ cpf: formatted })
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    updateBooking({ telefone: formatted })
  }

  const handlePriorityChange = (priority: PriorityType) => {
    // ← CHANGED: limpa só descricaoDeficiencia (sem tipoDeficiencia)
    updateBooking({ prioridade: priority, descricaoDeficiencia: '' })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Maximo 10MB.')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato invalido. Use JPG, PNG ou PDF.')
      return
    }

    if (type === 'front') {
      updateBooking({ documentoFrente: file })
      setDocumentFrontName(file.name)
    } else {
      updateBooking({ documentoVerso: file })
      setDocumentBackName(file.name)
    }
  }

  const removeFile = (type: 'front' | 'back') => {
    if (type === 'front') {
      updateBooking({ documentoFrente: null })
      setDocumentFrontName('')
      if (frontInputRef.current) frontInputRef.current.value = ''
    } else {
      updateBooking({ documentoVerso: null })
      setDocumentBackName('')
      if (backInputRef.current) backInputRef.current.value = ''
    }
  }

  const handleNext = () => {
    if (validateForm()) {
      updateBooking({ step: 5 })
      router.push('/agendar/confirmacao')
    }
  }

  const handleBack = () => {
    router.push('/agendar/horario')
  }

  if (!booking.especialidade || !booking.medico || !booking.data || !booking.horario) return null

  return (
    <main className="min-h-screen bg-background pb-8">
      {/* Navbar */}
      <nav className="bg-card border-b border-border flex items-center justify-between px-4 py-3">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <span className="font-semibold text-base text-foreground">Seus Dados</span>
        <div className="w-9" />
      </nav>

      {/* Header */}
      <div className="bg-primary p-4 pb-6">
        <div className="max-w-md mx-auto">
          <StepProgress currentStep={4} totalSteps={5} labels={STEP_LABELS} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-6">
          Preencha seus dados
        </h1>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          {/* Nome */}
          <div>
            <Label htmlFor="name" className="text-foreground mb-2 block">Nome completo *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={booking.nome}
                onChange={(e) => updateBooking({ nome: e.target.value })}
                className={cn(
                  'pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground',
                  errors.nome && 'border-destructive'
                )}
              />
            </div>
            {errors.nome && <p className="text-destructive text-sm mt-1">{errors.nome}</p>}
          </div>

          {/* CPF */}
          <div>
            <Label htmlFor="cpf" className="text-foreground mb-2 block">CPF *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={booking.cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                maxLength={14}
                className={cn(
                  'pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground',
                  errors.cpf && 'border-destructive'
                )}
              />
            </div>
            {errors.cpf && <p className="text-destructive text-sm mt-1">{errors.cpf}</p>}
          </div>

          {/* Data de Nascimento */}
          <div>
            <Label htmlFor="birthDate" className="text-foreground mb-2 block">Data de nascimento *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="birthDate"
                type="date"
                value={booking.dataNascimento}
                onChange={(e) => updateBooking({ dataNascimento: e.target.value })}
                className={cn(
                  'pl-10 h-12 rounded-xl bg-input text-foreground',
                  errors.dataNascimento && 'border-destructive'
                )}
              />
            </div>
            {errors.dataNascimento && <p className="text-destructive text-sm mt-1">{errors.dataNascimento}</p>}
          </div>

          {/* Celular */}
          <div>
            <Label htmlFor="phone" className="text-foreground mb-2 block">Celular/WhatsApp *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={booking.telefone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={15}
                className={cn(
                  'pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground',
                  errors.telefone && 'border-destructive'
                )}
              />
            </div>
            {errors.telefone && <p className="text-destructive text-sm mt-1">{errors.telefone}</p>}
          </div>

          {/* Cartao SUS */}
          <div>
            <Label htmlFor="susCard" className="text-foreground mb-2 block">Cartão SUS (opcional)</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="susCard"
                placeholder="Numero do Cartao SUS"
                value={booking.cartaoSus}
                onChange={(e) => updateBooking({ cartaoSus: e.target.value })}
                className="pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Priority Type */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Tipo de Atendimento</h2>
          <div className="space-y-2">
            {PRIORITY_TYPES.map((priority) => (
              <button
                key={priority.id}
                onClick={() => handlePriorityChange(priority.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                  booking.prioridade === priority.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <span className="text-2xl">{priority.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{priority.name}</p>
                  <p className="text-sm text-muted-foreground">{priority.description}</p>
                  {priority.law && (
                    <p className="text-xs text-primary mt-1">{priority.law}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ← CHANGED: PCD — somente campo de descrição obrigatório */}
        {booking.prioridade === 'pcd' && (
          <div className="mb-6 animate-fade-in">
            <Label className="text-foreground mb-2 block">
              Descrição da deficiência *
            </Label>
            <textarea
              placeholder="Descreva sua deficiência (ex: cadeirante)"
              value={booking.descricaoDeficiencia}
              onChange={(e) => updateBooking({ descricaoDeficiencia: e.target.value })}
              maxLength={300}
              rows={3}
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-input text-foreground placeholder:text-muted-foreground resize-none text-base',
                errors.descricaoDeficiencia ? 'border-destructive' : 'border-border'
              )}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.descricaoDeficiencia
                ? <p className="text-destructive text-sm">{errors.descricaoDeficiencia}</p>
                : <p className="text-xs text-muted-foreground">Conforme Lei 13.146/2015</p>
              }
              <p className="text-xs text-muted-foreground">
                {booking.descricaoDeficiencia?.length || 0}/300
              </p>
            </div>
          </div>
        )}

        {/* Document Upload - OPTIONAL */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Documento de Identificação (opcional)</h2>
          
          {/* LGPD Warning */}
          <div className="bg-[#F5A623]/20 border border-[#F5A623] rounded-xl p-3 mb-4 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-[#F5A623] shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Seus dados sao usados somente para agendamento, conforme a LGPD. Não serão compartilhados.
            </p>
          </div>

          {/* Front Document */}
          <div className="mb-3">
            <Label className="text-foreground mb-2 block">Frente do documento</Label>
            <p className="text-xs text-muted-foreground mb-2">RG, CNH, Cartão SUS ou Passaporte</p>
            
            {documentFrontName ? (
              <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground truncate max-w-[200px]">{documentFrontName}</span>
                </div>
                <button onClick={() => removeFile('front')} className="text-destructive hover:text-destructive/80">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary rounded-xl cursor-pointer transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Clique para enviar</span>
                <span className="text-xs text-muted-foreground mt-1">JPG, PNG ou PDF (max 10MB)</span>
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => handleFileChange(e, 'front')}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Back Document */}
          <div>
            <Label className="text-foreground mb-2 block">Verso do documento (opcional)</Label>
            
            {documentBackName ? (
              <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground truncate max-w-[200px]">{documentBackName}</span>
                </div>
                <button onClick={() => removeFile('back')} className="text-destructive hover:text-destructive/80">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary rounded-xl cursor-pointer transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Clique para enviar</span>
                <span className="text-xs text-muted-foreground mt-1">JPG, PNG ou PDF (max 10MB)</span>
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => handleFileChange(e, 'back')}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
        >
          Próximo
        </Button>
      </div>
    </main>
  )
}