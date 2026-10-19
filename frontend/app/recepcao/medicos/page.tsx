'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/contexts/app-context'
import { Logo } from '@/components/logo'
import { 
  DOCTORS,
  SPECIALTIES,
  getSpecialty,
  type SpecialtyId,
  type DoctorId,
} from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Search,
  LogOut,
  CalendarDays,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

function getInitials(name: string): string {
  return name
    .replace(/^(Dr\.|Dra\.)\s*/i, '')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getAvatarColor(specialtyId: string): string {
  const colors: Record<string, string> = {
    'clinico-geral': 'bg-blue-500',
    'cardiologia': 'bg-red-500',
    'neurologia': 'bg-purple-500',
    'pediatria': 'bg-yellow-500',
    'ortopedia': 'bg-orange-500',
    'oftalmologia': 'bg-cyan-500',
    'dermatologia': 'bg-pink-500',
    'ginecologia': 'bg-rose-500',
    'odontologia': 'bg-teal-500',
    'pneumologia': 'bg-indigo-500',
  }
  return colors[specialtyId] || 'bg-gray-500'
}

export default function MedicosPage() {
  const router = useRouter()
  const { adminUser, logout, getDoctorStatus, getDoctorAppointmentsToday } = useApp()
  
  const [specialtyFilter, setSpecialtyFilter] = useState<SpecialtyId | 'todos'>('todos')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!adminUser) {
      router.push('/admin/login')
    }
  }, [adminUser, router])

  if (!adminUser) return null

  const filteredDoctors = DOCTORS.filter(doctor => {
    if (specialtyFilter !== 'todos' && doctor.specialty !== specialtyFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return doctor.name.toLowerCase().includes(query) || doctor.crm.toLowerCase().includes(query)
    }
    return true
  })

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
        <h1 className="text-xl font-bold text-foreground mb-6">Profissionais</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Select value={specialtyFilter} onValueChange={(value) => setSpecialtyFilter(value as typeof specialtyFilter)}>
            <SelectTrigger className="h-10 rounded-xl bg-secondary border-border sm:w-48">
              <SelectValue placeholder="Filtrar por especialidade" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="todos">Todas as especialidades</SelectItem>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CRM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-secondary border-border"
            />
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doctor) => {
            const specialty = getSpecialty(doctor.specialty)
            const status = getDoctorStatus(doctor.id)
            const appointmentsToday = getDoctorAppointmentsToday(doctor.id)

            const statusConfig = {
              'disponivel': { label: 'Disponível', color: 'bg-primary text-primary-foreground' },
              'em-consulta': { label: 'Em consulta', color: 'bg-[#F5A623] text-black' },
              'ausente': { label: 'Ausente', color: 'bg-[#E94040] text-white' },
            }

            return (
              <div
                key={doctor.id}
                className="bg-secondary rounded-xl p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0',
                    getAvatarColor(doctor.specialty)
                  )}>
                    {getInitials(doctor.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{doctor.crm}</p>
                    <p className="text-sm text-foreground mt-1">
                      {specialty?.emoji} {specialty?.name}
                    </p>
                  </div>
                </div>

                {/* Stats & Status */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{appointmentsToday} consulta(s) hoje</span>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    statusConfig[status].color
                  )}>
                    {statusConfig[status].label}
                  </span>
                </div>

                {/* View Schedule Button */}
                <Button
                  variant="outline"
                  className="w-full mt-3 rounded-lg"
                  onClick={() => router.push(`/recepcao?medico=${doctor.id}`)}
                >
                  Ver agenda
                </Button>
              </div>
            )
          })}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum profissional encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros ou a busca
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
