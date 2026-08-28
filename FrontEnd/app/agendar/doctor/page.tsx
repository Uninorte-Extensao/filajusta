"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { StepProgress } from "@/components/step-progress"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMedicosByEspecialidade, type Medico } from "@/lib/api-actions"

const STEP_LABELS = ["Especialidade", "Medico", "Data e Horario", "Seus Dados", "Confirmar"]

function getInitials(name: string): string {
  return name
    .replace(/^(Dr\.|Dra\.)\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function getAvatarColor(index: number): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
  ]
  return colors[index % colors.length]
}

export default function DoctorPage() {
  const router = useRouter()
  const { booking, updateBooking } = useApp()
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!booking.especialidade) {
      router.push("/agendar/especialidade")
      return
    }
    
    async function load() {
      const data = await getMedicosByEspecialidade(booking.especialidade!)
      setMedicos(data)
      setLoading(false)
    }
    load()
  }, [booking.especialidade, router])

  if (!booking.especialidade) return null

  const handleSelect = (doctorId: string, doctorName: string, doctorCrm: string) => {
    updateBooking({ medico: doctorId, medicoNome: doctorName, medicoCrm: doctorCrm })
  }

  const handleNext = () => {
    if (booking.medico) {
      updateBooking({ step: 3 })
      router.push("/agendar/horario")
    }
  }

  const handleBack = () => {
    router.push("/agendar/especialidade")
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-card border-b border-border flex items-center justify-between px-4 py-3">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <span className="font-semibold text-base text-foreground">Médico</span>
        <div className="w-9" />
      </nav>

      {/* Header */}
      <div className="bg-primary p-4 pb-6">
        <div className="max-w-md mx-auto">
          <StepProgress currentStep={2} totalSteps={5} labels={STEP_LABELS} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-2">
          Escolha o profissional
        </h1>
        <p className="text-muted-foreground mb-6">
          {booking.especialidadeNome}
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : medicos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum profissional disponivel para esta especialidade.
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {medicos.map((doctor, index) => (
                <button
                  key={doctor.id}
                  onClick={() => handleSelect(doctor.id, doctor.nome, doctor.registro)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    booking.medico === doctor.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg",
                      getAvatarColor(index)
                    )}
                  >
                    {getInitials(doctor.nome)}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{doctor.nome}</h3>
                    <p className="text-sm text-muted-foreground">{doctor.registro}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                      {doctor.status === "disponivel" ? "Disponivel" : doctor.status === "em_consulta" ? "Em consulta" : "Ausente"}
                    </span>
                  </div>

                  {booking.medico === doctor.id && (
                    <div className="bg-primary rounded-full p-1">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!booking.medico}
              className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-50"
            >
              Proximo
            </Button>
          </>
        )}
      </div>
    </main>
  )
}
