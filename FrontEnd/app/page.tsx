"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Phone, Calendar, ArrowRight, Sun, Moon } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

export default function HomePage() {
  const { theme, toggleTheme, mounted } = useTheme()

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header Card */}
      <div className="bg-primary p-6 pb-8 rounded-b-3xl relative">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-primary-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-primary-foreground" />
            )}
          </button>
        )}

        <div className="max-w-md mx-auto flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Fila Justa"
            width={190}
            height={190}
            className="rounded-xl mb-3"
          />
          <div className="text-center">
            
            <p className="text-4xl font-bold text-primary-foreground/80">VidaPlena</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2 text-balance">
            Bem-vindo à Clínica Popular VidaPlena
          </h1>
          <p className="text-muted-foreground">
            Agende sua consulta de forma simples e gratuita
          </p>
        </div>

        {/* Main CTA */}
        <Link href="/agendar/especialidade" className="block mb-4">
          <Button
            className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Agendar Consulta
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>

        {/* Secondary Action */}
        <Link href="/consulta" className="block mb-8">
          <Button
            variant="outline"
            className="w-full h-12 border-primary text-primary hover:bg-primary/10 rounded-xl"
          >
            Acompanhar minha consulta
          </Button>
        </Link>

        {/* Priority Notice */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <p className="text-sm text-center text-muted-foreground">
            Atendimento prioritário a idosos, PCD e gestantes conforme legislação brasileira
          </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Horário de Funcionamento</h3>
              <p className="text-sm text-muted-foreground">Segunda a Sexta, 7h às 17h</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Endereço</h3>
              <p className="text-sm text-muted-foreground">Rua da Saúde, 100 - Manaus/AM</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Telefone</h3>
              <p className="text-sm text-muted-foreground">(92) 3333-4444</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
