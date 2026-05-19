import { cn } from '@/lib/utils'
import { type AppointmentStatus } from '@/contexts/app-context'

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; bgColor: string }> = {
  aguardando: { label: 'Aguardando', bgColor: 'bg-[#F5A623]' },
  confirmado: { label: 'Confirmado', bgColor: 'bg-[#00E96A]' },
  atendido: { label: 'Atendido', bgColor: 'bg-[#4A90D9]' },
  cancelado: { label: 'Cancelado', bgColor: 'bg-[#E94040]' },
  falta: { label: 'Falta', bgColor: 'bg-[#888888]' },
}

interface StatusBadgeProps {
  status: AppointmentStatus
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  if (!config) return null

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bgColor,
        status === 'confirmado' || status === 'aguardando' ? 'text-black' : 'text-white',
        sizeClasses[size]
      )}
    >
      {config.label}
    </span>
  )
}
