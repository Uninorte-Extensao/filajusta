"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { StepProgress } from "@/components/step-progress"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getEspecialidades, type Especialidade } from "@/lib/api-actions"

const STEP_LABELS = ["Especialidade", "Médico", "Data e Horário", "Seus Dados", "Confirmar"]

export default function EspecialidadePage() {
  const router = useRouter()
  const { booking, updateBooking } = useApp()
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getEspecialidades()
      setEspecialidades(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleSelect = (specialtyId: string, specialtyName: string) => {
    updateBooking({ especialidade: specialtyId as any, especialidadeNome: specialtyName, step: 1 })
  }

  const handleNext = () => {
    if (booking.especialidade) {
      updateBooking({ step: 2 })
      router.push("/agendar/doctor")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-card border-b border-border flex items-center justify-between px-4 py-3">
        <Link href="/" className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} className="text-foreground" />
        </Link>
        <span className="font-semibold text-base text-foreground">Especialidade</span>
        <div className="w-9" />
      </nav>

      {/* Header */}
      <div className="bg-primary p-4 pb-6">
        <div className="max-w-md mx-auto">
          <StepProgress currentStep={1} totalSteps={5} labels={STEP_LABELS} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-6">
          Qual especialidade voce precisa?
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Specialty Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {especialidades.map((specialty) => (
                <button
                  key={specialty.id}
                  onClick={() => handleSelect(specialty.id, specialty.nome)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    booking.especialidade === specialty.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-3xl mb-2">{specialty.emoji}</span>
                  <span className="text-sm font-medium text-foreground text-center">
                    {specialty.nome}
                  </span>
                  {booking.especialidade === specialty.id && (
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <Button
              onClick={handleNext}
              disabled={!booking.especialidade}
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
