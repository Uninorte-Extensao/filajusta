"use client"

import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { StepProgress } from "@/components/step-progress"
import { PriorityBadge } from "@/components/priority-badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2, UserRound, CalendarDays, User, CreditCard, Phone, Tag, MessageSquare, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createAgendamento } from "@/lib/api-actions"

const STEP_LABELS = ["Especialidade", "Medico", "Data e Horario", "Seus Dados", "Confirmar"]

function maskCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, "")
  if (clean.length !== 11) return cpf
  return `***.***.***.${clean.slice(-2)}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Data não informada"
  try {
    const date = new Date(dateStr + "T12:00:00")
    if (isNaN(date.getTime())) return dateStr
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export default function ConfirmacaoPage() {
  const router = useRouter()
  const { booking, resetBooking } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (confirmed) return
    if (!booking.especialidade || !booking.medico || !booking.data || !booking.horario || !booking.nome) {
      router.push("/agendar/especialidade")
    }
  }, [booking, router, confirmed])

  if (!confirmed && (!booking.especialidade || !booking.medico || !booking.data || !booking.horario || !booking.nome)) {
    return null
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const body = {
        medico_id: booking.medico!,
  consulta_em: `${booking.data}T${booking.horario}:00-04:00`,
  paciente_nome: booking.nome!,
  paciente_cpf: booking.cpf!.replace(/\D/g, ""),
  paciente_telefone: booking.telefone!.replace(/\D/g, ""),
  paciente_email: null,
  prioridade: booking.prioridade,
  descricao_prioridade: booking.descricaoDeficiencia || null,
      }

      console.log("[api] POST /api/consultas body:", JSON.stringify(body))

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/consultas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      console.log("[api] POST /api/consultas response:", json)

      if (!json.sucesso) {
        setError(json.mensagem || "Erro ao criar agendamento")
        setIsLoading(false)
        return
      }

      setConfirmed(true)
      localStorage.setItem("filajusta_last_booking", json.dados.codigo)
      resetBooking()
      router.push("/")
    } catch (err) {
      console.error("[api] Erro ao criar agendamento:", err)
      setError("Erro ao conectar com o servidor. Verifique sua conexão.")
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/agendar/dados")
  }

  return (
    <main className="min-h-screen bg-background pb-8">
      {/* Navbar */}
      <nav className="bg-card border-b border-border flex items-center justify-between px-4 py-3">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <span className="font-semibold text-base text-foreground">Confirmar</span>
        <div className="w-9" />
      </nav>

      {/* Step Progress */}
      <div className="bg-primary p-4 pb-6">
        <div className="max-w-md mx-auto">
          <StepProgress currentStep={5} totalSteps={5} labels={STEP_LABELS} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-6">
          Revise seu agendamento
        </h1>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-xl p-4 mb-4">
            {error}
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-primary rounded-2xl p-5 mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary-foreground mt-0.5" />
              <div>
                <p className="text-xs text-primary-foreground/70">Especialidade</p>
                <p className="font-semibold text-primary-foreground">{booking.especialidadeNome}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserRound className="h-5 w-5 text-primary-foreground mt-0.5" />
              <div>
                <p className="text-xs text-primary-foreground/70">Medico</p>
                <p className="font-semibold text-primary-foreground">{booking.medicoNome}</p>
                <p className="text-sm text-primary-foreground/80">{booking.medicoCrm}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays className="h-5 w-5 text-primary-foreground mt-0.5" />
              <div>
                <p className="text-xs text-primary-foreground/70">Data e Horario</p>
                <p className="font-semibold text-primary-foreground">
                  {formatDate(booking.data!)} as {booking.horario}
                </p>
              </div>
            </div>

            <hr className="border-primary-foreground/20" />

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary-foreground mt-0.5" />
              <div>
                <p className="text-xs text-primary-foreground/70">Paciente</p>
                <p className="font-semibold text-primary-foreground">{booking.nome}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-primary-foreground mt-0.5" />
              <div>
                <p className="text-xs text-primary-foreground/70">CPF</p>
                <p className="font-semibold text-primary-foreground">{maskCpf(booking.cpf!)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary-foreground mt-0.5" />
              <div>
                <p className="text-xs text-primary-foreground/70">Celular</p>
                <p className="font-semibold text-primary-foreground">{booking.telefone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-primary-foreground mt-0.5" />
              <div>
                <p className="text-xs text-primary-foreground/70">Tipo de Atendimento</p>
                <div className="mt-1">
                  {booking.prioridade === "normal" ? (
                    <span className="font-semibold text-primary-foreground">Normal</span>
                  ) : (
                    <PriorityBadge priority={booking.prioridade} size="md" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary-foreground mt-0.5" />
              <div>
                <p className="text-xs text-primary-foreground/70">Documento</p>
                {booking.documentoFrente ? (
                  <p className="font-semibold text-primary-foreground">Documento enviado</p>
                ) : (
                  <p className="text-sm text-primary-foreground/80">Sem documento — apresentar na recepcao</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Notice */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-start gap-3">
          <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Voce recebera confirmacao e lembretes via WhatsApp no numero informado.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Confirmando...
              </span>
            ) : (
              "Confirmar Agendamento"
            )}
          </Button>

          <Button
            onClick={handleBack}
            variant="outline"
            disabled={isLoading}
            className="w-full h-13 text-base font-medium border-border text-foreground hover:bg-muted rounded-xl"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar e Editar
          </Button>
        </div>
      </div>
    </main>
  )
}