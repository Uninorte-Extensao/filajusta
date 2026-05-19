import { cn } from '@/lib/utils'
import { type PriorityType } from '@/contexts/app-context'

const PRIORITY_BADGE_COLORS: Record<Exclude<PriorityType, 'normal'>, string> = {
  idoso: 'bg-[#FF8C00]',
  pcd: 'bg-[#4A90D9]',
  gestante: 'bg-[#D966A8]',
}

const PRIORITY_DATA: Record<Exclude<PriorityType, 'normal'>, { icon: string; name: string }> = {
  idoso: { icon: '👴', name: 'Idoso' },
  pcd: { icon: '♿', name: 'PCD' },
  gestante: { icon: '🤰', name: 'Gestante' },
}

interface PriorityBadgeProps {
  priority: PriorityType
  showIcon?: boolean
  size?: 'sm' | 'md'
}

export function PriorityBadge({ priority, showIcon = true, size = 'sm' }: PriorityBadgeProps) {
  if (priority === 'normal') return null

  const priorityData = PRIORITY_DATA[priority]
  if (!priorityData) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium text-white',
        PRIORITY_BADGE_COLORS[priority],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {showIcon && <span>{priorityData.icon}</span>}
      <span>{priorityData.name}</span>
    </span>
  )
}
