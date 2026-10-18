"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Share2, CalendarCheck, Home, MessageSquare, Loader2 } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { PriorityBadge } from "@/components/priority-badge"
import { getAgendamentoByCodigo, searchByCodigoAndCpf, type Agendamento } from "@/lib/api-actions"
import { useApp } from "@/contexts/app-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "")
  if (clean.length >= 10) {
    return `(${clean.slice(0, 2)}) *****-${clean.slice(-4)}`
  }
  return phone
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
 const codigo = searchParams.get("codigo")

let bookingData: any = {}

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("filajusta_last_booking")

  try {
    bookingData = stored ? JSON.parse(stored) : {}
  } catch {
    bookingData = {
      codigo: stored,
      cpf: "",
    }
  }
}

const cpf = bookingData.cpf
  const { resetBooking } = useApp()
  
  const [appointment, setAppointment] = useState<Agendamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [toastShown, setToastShown] = useState(false)

  useEffect(() => {
    resetBooking()
  }, [resetBooking])

  useEffect(() => {
  async function load() {
    if (!codigo) {
      router.push("/")
      return
    }

    if (!cpf) {
      console.error("[sucesso] CPF não encontrado no localStorage")
      setLoading(false)
      return
    }

    console.log("[sucesso] Buscando agendamento:", {
      codigo,
      cpf: "***" + cpf.slice(-2),
    })

    const data = await searchByCodigoAndCpf(codigo, cpf)

    if (data) {
      setAppointment(data)
    }

    setLoading(false)
  }

  load()
}, [codigo, cpf, router])

  useEffect(() => {
    if (appointment && appointment.paciente && !toastShown) {
      toast.success(`Confirmacao enviada via WhatsApp para ${formatPhone(appointment.paciente.telefone)}`, {
        icon: "📱",
      })
      setToastShown(true)
    }
  }, [appointment, toastShown])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!codigo || !appointment) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-foreground mb-4">Agendamento nao encontrado</p>
        <Button onClick={() => router.push("/")}>Voltar ao Inicio</Button>
      </main>
    )
  }

  const dateTime = new Date(appointment.data_hora)
  const formattedDate = format(dateTime, "dd/MM/yyyy", { locale: ptBR })
  const formattedDateLong = format(dateTime, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const formattedTime = format(dateTime, "HH:mm")

  const handleShare = () => {
    const text = `Ola! Agendamento FilaJusta VidaPlena: ${codigo} | ${appointment.medico_nome} | ${appointment.especialidade} | ${formattedDate} as ${formattedTime}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  const handleTrack = () => {
    router.push("/consulta")
  }

  const handleHome = () => {
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-4">
          <Image 
            src="/logo.png" 
            alt="VidaPlena Logo" 
            width={60} 
            height={60} 
            className="rounded-xl mx-auto"
          />
        </div>

        {/* Success Checkmark */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-primary-foreground" strokeWidth={3} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Consulta Agendada!
        </h1>
        <p className="text-muted-foreground mb-6">Guarde este codigo para acompanhar sua consulta</p>

        {/* Appointment Code */}
        <div className="bg-primary rounded-2xl p-6 mb-6">
          <p className="text-sm text-primary-foreground/70 mb-1">Codigo do Agendamento</p>
          <p className="text-4xl font-black text-primary-foreground tracking-wider">
            {codigo}
          </p>
        </div>

        {/* Appointment Details Card */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 text-left">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Medico(a)</span>
              <span className="text-sm font-medium text-foreground text-right">{appointment.medico_nome}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Especialidade</span>
              <span className="text-sm font-medium text-foreground">{appointment.especialidade}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Data</span>
              <span className="text-sm font-medium text-foreground">{formattedDateLong}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Horario</span>
              <span className="text-sm font-medium text-foreground">{formattedTime}</span>
            </div>
            {appointment.prioridade !== "normal" && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Prioridade</span>
                <PriorityBadge priority={appointment.prioridade} />
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Reminder Notice */}
        {appointment.paciente && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
            <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Voce recebera um lembrete via WhatsApp 24h antes da consulta no numero: <strong>{formatPhone(appointment.paciente.telefone)}</strong>
            </p>
          </div>
        )}

        {/* Share Button */}
        <Button
          onClick={handleShare}
          variant="outline"
          className="w-full h-12 mb-4 border-primary text-primary hover:bg-primary/10 rounded-xl"
        >
          <Share2 className="mr-2 h-5 w-5" />
          Compartilhar via WhatsApp
        </Button>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleTrack}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            <CalendarCheck className="mr-2 h-5 w-5" />
            Acompanhar minha consulta
          </Button>

          <Button 
            onClick={handleHome}
            variant="ghost" 
            className="w-full h-12 text-muted-foreground hover:text-foreground rounded-xl"
          >
            <Home className="mr-2 h-5 w-5" />
            Voltar ao inicio
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function SucessoPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}
