"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { StatusBadge } from "@/components/status-badge"
import { PriorityBadge } from "@/components/priority-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, ArrowLeft, Clock, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  getAgendamentoByCodigo, 
  getAgendamentosByCpf, 
  updateAgendamentoStatus,
  type Agendamento 
} from "@/lib/supabase-actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function formatCpfInput(value: string): string {
  const clean = value.replace(/\D/g, "")
  if (clean.length <= 3) return clean
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
}

function maskCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, "")
  if (clean.length !== 11) return cpf
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
}

function canCancelAppointment(apt: Agendamento): boolean {
  if (["cancelado", "atendido", "falta"].includes(apt.status)) return false
  
  const appointmentDateTime = new Date(apt.data_hora)
  const now = new Date()
  const minutesUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60)
  return minutesUntil > 30
}

function ConsultaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchCode, setSearchCode] = useState("")
  const [searchCpf, setSearchCpf] = useState("")
  const [results, setResults] = useState<Agendamento[]>([])
  const [searched, setSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Agendamento | null>(null)

  useEffect(() => {
    const codigo = searchParams.get("codigo")
    if (codigo) {
      setSearchCode(codigo)
      handleSearchWithValue(codigo, "")
    }
  }, [searchParams])

  const handleSearchWithValue = async (code: string, cpf: string) => {
    setIsLoading(true)
    setSearched(true)
    
    try {
      let found: Agendamento[] = []
      
      if (code && code.trim()) {
        const result = await getAgendamentoByCodigo(code.trim())
        if (result) {
          found = [result]
        }
      } else if (cpf && cpf.trim()) {
        found = await getAgendamentosByCpf(cpf)
      }
      
      setResults(found)
    } catch (err) {
      console.error("[v0] Error searching appointments:", err)
      toast.error("Erro ao buscar agendamentos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchCode && !searchCpf) return
    handleSearchWithValue(searchCode, searchCpf)
  }

  const handleCpfChange = (value: string) => {
    setSearchCpf(formatCpfInput(value))
  }

  const handleConfirm = async (apt: Agendamento) => {
    setIsLoading(true)
    
    try {
      const success = await updateAgendamentoStatus(apt.id, "confirmado")
      if (success) {
        setResults(prev => prev.map(a => 
          a.id === apt.id ? { ...a, status: "confirmado" } : a
        ))
        toast.success("Presenca confirmada com sucesso!")
      } else {
        toast.error("Erro ao confirmar presenca")
      }
    } catch (err) {
      toast.error("Erro ao confirmar presenca")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedAppointment) return
    
    setShowCancelDialog(false)
    setIsLoading(true)
    
    try {
      const success = await updateAgendamentoStatus(selectedAppointment.id, "cancelado")
      if (success) {
        setResults(prev => prev.map(a => 
          a.id === selectedAppointment.id ? { ...a, status: "cancelado" } : a
        ))
        toast.success("Consulta cancelada")
      } else {
        toast.error("Erro ao cancelar consulta")
      }
    } catch (err) {
      toast.error("Erro ao cancelar consulta")
    } finally {
      setSelectedAppointment(null)
      setIsLoading(false)
    }
  }

  const renderAppointmentCard = (apt: Agendamento) => {
    const canCancel = canCancelAppointment(apt)
    const isFinalStatus = ["cancelado", "atendido", "falta"].includes(apt.status)
    const dateTime = new Date(apt.data_hora)
    const formattedDate = format(dateTime, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    const formattedTime = format(dateTime, "HH:mm")

    return (
      <div key={apt.id} className="bg-card border border-border rounded-xl p-5">
        {/* Status Badge */}
        <div className="flex justify-center mb-4">
          <StatusBadge status={apt.status} size="lg" />
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Codigo</span>
            <span className="text-sm font-bold text-primary">{apt.codigo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Medico(a)</span>
            <span className="text-sm font-medium text-foreground">{apt.medico_nome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Especialidade</span>
            <span className="text-sm font-medium text-foreground">{apt.especialidade}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Data</span>
            <span className="text-sm font-medium text-foreground">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Horario</span>
            <span className="text-sm font-medium text-foreground">{formattedTime}</span>
          </div>
          {apt.prioridade !== "normal" && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Prioridade</span>
              <PriorityBadge priority={apt.prioridade} />
            </div>
          )}
          {apt.paciente && (
            <>
              <hr className="border-border" />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Paciente</span>
                <span className="text-sm font-medium text-foreground">{apt.paciente.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">CPF</span>
                <span className="text-sm font-medium text-foreground">{maskCpf(apt.paciente.cpf)}</span>
              </div>
            </>
          )}
        </div>

        {/* Reminder Notice */}
        {!isFinalStatus && (
          <div className="bg-primary/10 rounded-lg p-3 mb-4 flex items-start gap-2">
            <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              Lembrete programado para 24h antes da sua consulta via WhatsApp
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!isFinalStatus && (
          <div className="space-y-2">
            {apt.status === "aguardando" && (
              <Button
                onClick={() => handleConfirm(apt)}
                disabled={isLoading}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                <Check className="mr-2 h-4 w-4" />
                Confirmar Presenca
              </Button>
            )}
            
            {canCancel ? (
              <Button
                onClick={() => {
                  setSelectedAppointment(apt)
                  setShowCancelDialog(true)
                }}
                disabled={isLoading}
                variant="outline"
                className="w-full h-11 border-destructive text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar Consulta
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Prazo para cancelamento encerrado (menos de 30min para consulta)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Final Status Message */}
        {isFinalStatus && (
          <div className={`rounded-lg p-3 text-center ${
            apt.status === "atendido" ? "bg-[#4A90D9]/20 text-[#4A90D9]" :
            apt.status === "cancelado" ? "bg-destructive/20 text-destructive" :
            "bg-muted text-muted-foreground"
          }`}>
            <p className="text-sm font-medium">
              {apt.status === "atendido" && "Consulta realizada"}
              {apt.status === "cancelado" && "Consulta cancelada"}
              {apt.status === "falta" && "Paciente nao compareceu"}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-card border-b border-border flex items-center justify-between px-4 py-3">
        <Link href="/" className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} className="text-foreground" />
        </Link>
        <span className="font-semibold text-base text-foreground">Acompanhar Consulta</span>
        <div className="w-9" />
      </nav>

      {/* Header with Logo */}
      <div className="bg-primary p-4 pb-6">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Image src="/logo.png" alt="VidaPlena" width={80} height={80} className="rounded-lg" />
          <div>
            <h2 className="text-xl font-bold text-primary-foreground">FilaJusta</h2>
            <p className="text-sm text-primary-foreground/80">VidaPlena</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        {/* Search by Code */}
        <div className="mb-4">
          <Label htmlFor="code" className="text-foreground mb-2 block">Codigo do agendamento</Label>
          <Input
            id="code"
            placeholder="Digite seu codigo VPL-XXXX"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
            className="h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <hr className="flex-1 border-border" />
          <span className="text-sm text-muted-foreground">ou</span>
          <hr className="flex-1 border-border" />
        </div>

        {/* Search by CPF */}
        <div className="mb-6">
          <Label htmlFor="cpf" className="text-foreground mb-2 block">Busque pelo seu CPF</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            value={searchCpf}
            onChange={(e) => handleCpfChange(e.target.value)}
            maxLength={14}
            className="h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={isLoading || (!searchCode && !searchCpf)}
          className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl mb-6"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Buscando...
            </span>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Buscar
            </>
          )}
        </Button>

        {/* Results */}
        {searched && !isLoading && (
          <>
            {results.length > 0 && (
              <div className="space-y-4">
                {results.length > 1 && (
                  <p className="text-sm text-muted-foreground">{results.length} consulta(s) encontrada(s)</p>
                )}
                {results.map(apt => renderAppointmentCard(apt))}
              </div>
            )}
            
            {results.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma consulta encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  Nenhuma consulta encontrada para este CPF ou codigo.
                </p>
              </div>
            )}
          </>
        )}

        {/* Cancel Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="bg-popover border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Tem certeza que deseja cancelar esta consulta? Esta acao nao pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-secondary text-foreground hover:bg-secondary/80">
                Voltar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancel}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  )
}

export default function ConsultaPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    }>
      <ConsultaContent />
    </Suspense>
  )
}
