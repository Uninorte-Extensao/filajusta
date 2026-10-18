'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/contexts/app-context'
import { Logo } from '@/components/logo'
import { PriorityBadge } from '@/components/priority-badge'
import { 
  SPECIALTIES,
  PRIORITY_TYPES,
  formatCpf,
  formatPhone,
  validateCpf,
  getSpecialty,
  type SpecialtyId,
  type PriorityType,
} from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Plus, 
  User, 
  CreditCard, 
  Phone,
  Clock,
  X,
  UserPlus,
  LogOut,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function FilaEsperaPage() {
  const router = useRouter()
  const { adminUser, logout, walkInQueue, addWalkIn, removeWalkIn } = useApp()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState<SpecialtyId | ''>('')
  const [priority, setPriority] = useState<PriorityType>('normal')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!adminUser) {
      router.push('/admin/login')
    }
  }, [adminUser, router])

  if (!adminUser) return null

  const waitingPatients = walkInQueue.filter(p => p.status === 'waiting')

  const resetForm = () => {
    setName('')
    setCpf('')
    setPhone('')
    setSpecialty('')
    setPriority('normal')
  }

  const handleAddPatient = async () => {
    if (!name.trim() || !cpf || !phone || !specialty) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!validateCpf(cpf)) {
      toast.error('CPF inválido')
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    addWalkIn({
      name: name.trim(),
      cpf: cpf.replace(/\D/g, ''),
      phone: phone.replace(/\D/g, ''),
      specialtyId: specialty,
      priority,
    })

    setIsLoading(false)
    setShowAddModal(false)
    resetForm()
    toast.success('Paciente adicionado à fila de espera')
  }

  const handleRemove = (id: string) => {
    removeWalkIn(id)
    toast.success('Paciente removido da fila')
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="bg-secondary border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="bg-primary rounded-lg p-2">
            <Logo size="small" />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">
                  {adminUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline">{adminUser.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Back Link */}
        <Link href="/recepcao" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Agenda</span>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Fila de Espera — Encaixe</h1>
            <p className="text-sm text-muted-foreground">
              {waitingPatients.length} paciente(s) aguardando
            </p>
          </div>
          
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Adicionar à Fila de Espera</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <Label htmlFor="name" className="text-foreground mb-2 block">Nome completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Nome do paciente"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-input text-[#333333] placeholder:text-[#888888]"
                    />
                  </div>
                </div>

                {/* CPF */}
                <div>
                  <Label htmlFor="cpf" className="text-foreground mb-2 block">CPF *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatCpf(e.target.value))}
                      maxLength={14}
                      className="pl-10 h-12 rounded-xl bg-input text-[#333333] placeholder:text-[#888888]"
                    />
                  </div>
                </div>

                {/* Celular */}
                <div>
                  <Label htmlFor="phone" className="text-foreground mb-2 block">Celular *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      maxLength={15}
                      className="pl-10 h-12 rounded-xl bg-input text-[#333333] placeholder:text-[#888888]"
                    />
                  </div>
                </div>

                {/* Especialidade */}
                <div>
                  <Label className="text-foreground mb-2 block">Especialidade *</Label>
                  <Select value={specialty} onValueChange={(value) => setSpecialty(value as SpecialtyId)}>
                    <SelectTrigger className="h-12 rounded-xl bg-input text-[#333333]">
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {SPECIALTIES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.emoji} {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prioridade */}
                <div>
                  <Label className="text-foreground mb-2 block">Tipo de Atendimento</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIORITY_TYPES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPriority(p.id)}
                        className={cn(
                          'p-3 rounded-xl border-2 text-left transition-all',
                          priority === p.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-secondary hover:border-primary/50'
                        )}
                      >
                        <span className="text-lg">{p.icon}</span>
                        <p className="text-sm font-medium text-foreground">{p.name.split(' ')[0]}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddPatient}
                    disabled={isLoading}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Adicionando...
                      </span>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Waiting List */}
        {waitingPatients.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Fila vazia</h3>
            <p className="text-sm text-muted-foreground">
              Nenhum paciente aguardando encaixe no momento
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitingPatients.map((patient, index) => {
              const specialtyData = getSpecialty(patient.specialtyId)
              
              return (
                <div
                  key={patient.id}
                  className="bg-secondary rounded-xl p-4 flex items-center gap-4"
                >
                  {/* Position */}
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary-foreground">{index + 1}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground truncate">{patient.name}</p>
                      {patient.priority !== 'normal' && (
                        <PriorityBadge priority={patient.priority} size="sm" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {specialtyData?.emoji} {specialtyData?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Chegou às {format(new Date(patient.arrivalTime), 'HH:mm')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => toast.info('Funcionalidade de encaixe em desenvolvimento')}
                    >
                      Encaixar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(patient.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
