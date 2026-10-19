'use client'

import { useRouter } from 'next/navigation'
import { useApp, ESPECIALIDADES } from '@/contexts/app-context'
import { StepProgress } from '@/components/step-progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState, useMemo } from 'react'
import { format, addDays, isSameDay, isWeekend, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STEP_LABELS = ['Especialidade', 'Medico', 'Data e Horario', 'Seus Dados', 'Confirmar']

const TIME_SLOTS = {
  morning: ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'],
  afternoon: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
}

export default function HorarioPage() {
  const router = useRouter()
  const { booking, updateBooking, appointments } = useApp()
  const [currentMonth] = useState(new Date())

  useEffect(() => {
    if (!booking.especialidade || !booking.medico) {
      router.push('/agendar/especialidade')
    }
  }, [booking.especialidade, booking.medico, router])

  const availableDates = useMemo(() => {
    const dates: Date[] = []
    const today = startOfDay(new Date())
    
    // Next 7 days excluding weekends (RN-03)
    let daysAdded = 0
    let i = 0
    while (daysAdded < 7 && i < 14) {
      const date = addDays(today, i)
      if (!isWeekend(date)) {
        dates.push(date)
        daysAdded++
      }
      i++
    }
    
    return dates
  }, [])

  const selectedDate = booking.data ? new Date(booking.data + 'T00:00:00') : null

  const isSlotDisabled = (slot: string) => {
    if (!booking.data) return true
    
    // Check if slot is booked (RN-01)
    const slotBooked = appointments.some(apt => {
      const [datePart, timePart] = apt.dataHora.split(' ')
      return datePart === booking.data && 
             timePart === slot && 
             apt.medico === booking.medico &&
             !['cancelado', 'falta'].includes(apt.status)
    })
    if (slotBooked) return true
    
    // Check if slot is within next 60 minutes (RN-02)
    const now = new Date()
    const slotTime = new Date(`${booking.data}T${slot}:00`)
    const diffMinutes = (slotTime.getTime() - now.getTime()) / (1000 * 60)
    
    return diffMinutes < 60
  }

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    updateBooking({ data: dateStr, horario: null })
  }

  const handleTimeSelect = (time: string) => {
    updateBooking({ horario: time })
  }

  const handleNext = () => {
    if (booking.data && booking.horario) {
      updateBooking({ step: 4 })
      router.push('/agendar/dados')
    }
  }

  const handleBack = () => {
    router.push('/agendar/doctor')
  }

  if (!booking.especialidade || !booking.medico) return null

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-card border-b border-border flex items-center justify-between px-4 py-3">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <span className="font-semibold text-base text-foreground">Data e Horário</span>
        <div className="w-9" />
      </nav>

      {/* Header */}
      <div className="bg-primary p-4 pb-6">
        <div className="max-w-md mx-auto">
          <StepProgress currentStep={3} totalSteps={5} labels={STEP_LABELS} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-6">
          Quando você quer ser atendido?
        </h1>

        {/* Calendar - Simple Date Selection */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <span className="text-xs text-muted-foreground">Próximos 7 dias</span>
          </div>

          {/* Available dates */}
          <div className="flex flex-wrap gap-2 justify-center">
            {availableDates.map((date) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isToday = isSameDay(date, new Date())

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    'flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-primary/20 text-foreground'
                  )}
                >
                  <span className="text-xs">{format(date, 'EEE', { locale: ptBR })}</span>
                  <span className="text-lg font-bold">{format(date, 'd')}</span>
                  {isToday && <span className="text-[10px]">Hoje</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Slots */}
        {booking.data && (
          <div className="animate-fade-in">
            {/* Morning Slots */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Manhã</h3>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.morning.map((slot) => {
                  const disabled = isSlotDisabled(slot)
                  const isSelected = booking.horario === slot

                  return (
                    <button
                      key={slot}
                      onClick={() => !disabled && handleTimeSelect(slot)}
                      disabled={disabled}
                      className={cn(
                        'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : disabled
                          ? 'bg-muted text-muted-foreground line-through cursor-not-allowed'
                          : 'bg-card border border-border text-foreground hover:bg-primary/20'
                      )}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Afternoon Slots */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tarde</h3>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.afternoon.map((slot) => {
                  const disabled = isSlotDisabled(slot)
                  const isSelected = booking.horario === slot

                  return (
                    <button
                      key={slot}
                      onClick={() => !disabled && handleTimeSelect(slot)}
                      disabled={disabled}
                      className={cn(
                        'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : disabled
                          ? 'bg-muted text-muted-foreground line-through cursor-not-allowed'
                          : 'bg-card border border-border text-foreground hover:bg-primary/20'
                      )}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!booking.data || !booking.horario}
          className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-50"
        >
          Próximo
        </Button>
      </div>
    </main>
  )
}
