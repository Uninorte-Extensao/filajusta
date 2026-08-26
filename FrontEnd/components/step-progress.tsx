'use client'

import { cn } from '@/lib/utils'

interface StepProgressProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Passo {currentStep} de {totalSteps}
        </span>
        <span className="text-sm font-medium text-foreground">
          {labels[currentStep - 1]}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < currentStep ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  )
}
