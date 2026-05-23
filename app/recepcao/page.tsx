"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/status-badge"
import { PriorityBadge } from "@/components/priority-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  CalendarDays, 
  Clock, 
  Users, 
  CheckCircle2, 
  Search, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  FileText,
  X,
  Check,
  Bell,
  UserX,
  Stethoscope,
  Sun,
  Moon,
  Loader2,
  UserCog,
} from "lucide-react"
import { format, addDays, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTheme } from "@/hooks/use-theme"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { 
  getAgendamentosByDate,
  getAllAgendamentos,
  updateAgendamentoStatus,
  type Agendamento 
} from "@/lib/api-actions"

type AppointmentStatus = "aguardando" | "confirmado" | "atendido" | "cancelado" | "falta"

function formatCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, "")
  if (clean.length !== 11) return cpf
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export default function RecepcaoPage() {
  const router = useRouter()
  const { theme, toggleTheme, mounted } = useTheme()
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "todos">("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<Agendamento | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [appointments, setAppointments] = useState<Agendamento[]>([])
  const [allAppointments, setAllAppointments] = useState<Agendamento[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [session, setSession] = useState<any>(null)

  const { getSession } = useAuthGuard()

  useEffect(() => {
    const s = getSession()
    if (s) setSession(s)
  }, [])

  // Load appointments when date changes
  useEffect(() => {
    if (!session) return
    loadAppointments()
    loadAllAppointments()
  }, [selectedDate, session])

  const loadAppointments = async () => {
    setLoadingData(true)
    try {
      const data = await getAgendamentosByDate(selectedDate)
      const sorted = [...data].sort((a, b) => {
        const aPriority = a.prioridade !== "normal" ? 0 : 1
        const bPriority = b.prioridade !== "normal" ? 0 : 1
        if (aPriority !== bPriority) return aPriority - bPriority
        return new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
      })
      setAppointments(sorted)
    } catch (err) {
      console.error("[v0] Error loading appointments:", err)
      toast.error("Erro ao carregar agendamentos")
    } finally {
      setLoadingData(false)
    }
  }

  const loadAllAppointments = async () => {
    try {
      const data = await getAllAgendamentos()
      setAllAppointments(data)
    } catch (err) {
      console.error("[v0] Error loading all appointments:", err)
    }
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  // When search is active, search across ALL appointments regardless of date
  // When no search, filter only appointments from selected date
  const isSearching = searchQuery.trim().length > 0
  const sourceList = isSearching ? allAppointments : appointments

  const filteredAppointments = sourceList.filter(apt => {
    if (!isSearching) {
      if (statusFilter !== "todos" && apt.status !== statusFilter) return false
      return true
    }
    const query = searchQuery.toLowerCase()
    const patientName = apt.paciente?.nome?.toLowerCase() || ""
    const patientCpf = apt.paciente?.cpf || ""
    return (
      patientName.includes(query) ||
      patientCpf.includes(query.replace(/\D/g, "")) ||
      apt.codigo.toLowerCase().includes(query) ||
      apt.medico_nome.toLowerCase().includes(query)
    )
  })

  // Stats
  const stats = {
    total: appointments.length,
    aguardando: appointments.filter(a => a.status === "aguardando").length,
    confirmado: appointments.filter(a => a.status === "confirmado").length,
    atendido: appointments.filter(a => a.status === "atendido").length,
  }

  // Find first normal patient to show separator
  const firstNormalIndex = filteredAppointments.findIndex(a => a.prioridade === "normal")
  const hasPriorityPatients = firstNormalIndex > 0

  const handleDateChange = (direction: "prev" | "next") => {
    const date = new Date(selectedDate + "T00:00:00")
    const newDate = direction === "prev" ? subDays(date, 1) : addDays(date, 1)
    setSelectedDate(format(newDate, "yyyy-MM-dd"))
  }

  const handleStatusChange = async (apt: Agendamento, newStatus: AppointmentStatus) => {
    setIsLoading(true)
    
    try {
      const success = await updateAgendamentoStatus(apt.id, newStatus)
      
      if (success) {
        setAppointments(prev => prev.map(a => 
          a.id === apt.id ? { ...a, status: newStatus } : a
        ))
        
        if (selectedAppointment?.id === apt.id) {
          setSelectedAppointment(prev => prev ? { ...prev, status: newStatus } : null)
        }
        
        toast.success("Paciente notificado via WhatsApp", { icon: "📱" })
      } else {
        toast.error("Erro ao atualizar status")
      }
    } catch (err) {
      toast.error("Erro ao atualizar status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("filajusta_session")
    localStorage.removeItem("filajusta_token")
    router.push("/admin/login")
  }

  const renderAppointmentActions = (apt: Agendamento) => {
    const isFinal = ["cancelado", "atendido", "falta"].includes(apt.status)
    if (isFinal) return null

    return (
      <div className="flex gap-1 mt-2">
        {apt.status === "aguardando" && (
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleStatusChange(apt, "confirmado") }}
            disabled={isLoading}
            className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="h-3 w-3 mr-1" />
            Confirmar
          </Button>
        )}
        {apt.status === "confirmado" && (
          <>
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleStatusChange(apt, "atendido") }}
              disabled={isLoading}
              className="h-7 text-xs bg-[#4A90D9] text-white hover:bg-[#4A90D9]/90"
            >
              <Stethoscope className="h-3 w-3 mr-1" />
              Atender
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); toast.info(`Chamando ${apt.paciente?.nome}...`) }}
              disabled={isLoading}
              className="h-7 text-xs"
            >
              <Bell className="h-3 w-3 mr-1" />
              Chamar
            </Button>
          </>
        )}
        {["aguardando", "confirmado"].includes(apt.status) && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); handleStatusChange(apt, "falta") }}
              disabled={isLoading}
              className="h-7 text-xs text-muted-foreground"
            >
              <UserX className="h-3 w-3 mr-1" />
              Falta
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); handleStatusChange(apt, "cancelado") }}
              disabled={isLoading}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              <X className="h-3 w-3 mr-1" />
              Cancelar
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="bg-primary border-b border-primary/80 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary-foreground">
                {session.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
              </span>
            </div>
            <span className="text-sm font-semibold text-primary-foreground truncate">{session.nome}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
              session?.setor === "administracao"
                ? "bg-primary-foreground/25 text-primary-foreground"
                : "bg-primary-foreground/20 text-primary-foreground"
            }`}>
              {session?.setor === "administracao" ? "Administração" : "Recepção"}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-primary-foreground/80 hidden md:inline">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </span>
            {session?.setor === "administracao" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/painel")}
                className="gap-2 text-sm border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">Painel Admin</span>
              </Button>
            )}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-primary-foreground/15 transition-colors"
                aria-label="Alternar tema"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-primary-foreground" />
                )}
              </button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Hoje</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-[#F5A623]" />
              <span className="text-xs text-muted-foreground">Aguardando</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.aguardando}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Confirmados</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.confirmado}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-[#4A90D9]" />
              <span className="text-xs text-muted-foreground">Atendidos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.atendido}</p>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDateChange("prev")}
            className="rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-foreground">
            {format(new Date(selectedDate + "T00:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDateChange("next")}
            className="rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {(["todos", "aguardando", "confirmado", "atendido", "cancelado", "falta"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-full whitespace-nowrap",
                statusFilter === status && "bg-primary text-primary-foreground"
              )}
            >
              {status === "todos" ? "Todos" : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou codigo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border"
          />
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {loadingData ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {isSearching ? "Nenhum resultado encontrado" : "Nenhuma consulta para este dia"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isSearching
                  ? "Nenhum agendamento encontrado para esta busca"
                  : "Selecione outra data ou aguarde novos agendamentos"}
              </p>
            </div>
          ) : (
            filteredAppointments.map((apt, index) => {
              const showSeparator = hasPriorityPatients && index === firstNormalIndex
              const timeStr = format(new Date(apt.data_hora), "HH:mm")

              return (
                <div key={apt.id}>
                  {showSeparator && (
                    <div className="flex items-center gap-2 py-3">
                      <hr className="flex-1 border-border" />
                      <span className="text-xs text-muted-foreground bg-background px-2">Atendimento Normal</span>
                      <hr className="flex-1 border-border" />
                    </div>
                  )}
                  <div
                    className="w-full bg-card border border-border rounded-xl p-4 text-left hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div 
                      onClick={() => setSelectedAppointment(apt)}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-primary">{timeStr}</span>
                          <StatusBadge status={apt.status} size="sm" />
                          {apt.prioridade !== "normal" && (
                            <PriorityBadge priority={apt.prioridade} size="sm" />
                          )}
                        </div>
                        <p className="font-semibold text-foreground truncate">{apt.paciente?.nome || "Paciente"}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {apt.medico_nome} - {apt.especialidade}
                        </p>
                        {isSearching && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            📅 {format(new Date(apt.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{apt.codigo}</span>
                    </div>
                    {renderAppointmentActions(apt)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="bg-popover border-border max-w-md max-h-[90vh] overflow-y-auto">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Detalhes da Consulta
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detalhes do agendamento do paciente
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Code */}
                <div className="bg-primary rounded-xl p-4 text-center">
                  <p className="text-xs text-primary-foreground/70 mb-1">Codigo</p>
                  <p className="text-2xl font-black text-primary-foreground">{selectedAppointment.codigo}</p>
                </div>

                {/* Status */}
                <div className="flex justify-center">
                  <StatusBadge status={selectedAppointment.status} size="lg" />
                </div>

                {/* Patient Info */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Paciente</p>
                      <p className="font-medium text-foreground">{selectedAppointment.paciente?.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">CPF</p>
                      <p className="font-medium text-foreground">{formatCpf(selectedAppointment.paciente?.cpf || "")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="font-medium text-foreground">{selectedAppointment.paciente?.telefone}</p>
                    </div>
                  </div>
                  {selectedAppointment.prioridade !== "normal" && (
                    <div className="pt-2">
                      <PriorityBadge priority={selectedAppointment.prioridade} size="md" />
                    </div>
                  )}
                </div>

                {/* Appointment Info */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Medico(a)</p>
                    <p className="font-medium text-foreground">{selectedAppointment.medico_nome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Especialidade</p>
                    <p className="font-medium text-foreground">{selectedAppointment.especialidade}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data e Horario</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(selectedAppointment.data_hora), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {!["cancelado", "atendido", "falta"].includes(selectedAppointment.status) && (
                  <div className="flex flex-wrap gap-2">
                    {selectedAppointment.status === "aguardando" && (
                      <Button
                        onClick={() => handleStatusChange(selectedAppointment, "confirmado")}
                        disabled={isLoading}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirmar
                      </Button>
                    )}
                    {selectedAppointment.status === "confirmado" && (
                      <Button
                        onClick={() => handleStatusChange(selectedAppointment, "atendido")}
                        disabled={isLoading}
                        className="flex-1 bg-[#4A90D9] text-white hover:bg-[#4A90D9]/90"
                      >
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Atender
                      </Button>
                    )}
                    <Button
                      onClick={() => handleStatusChange(selectedAppointment, "falta")}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Falta
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(selectedAppointment, "cancelado")}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
