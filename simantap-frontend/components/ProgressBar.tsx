'use client'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showLabel?: boolean
  color?: 'emerald' | 'red' | 'yellow' | 'blue'
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showLabel = true,
  color = 'emerald'
}: ProgressBarProps) {
  const percentage = (value / max) * 100

  const colorClasses = {
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500'
  }

  const textColorClasses = {
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600'
  }

  return (
    <div className="w-full">
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label || 'Progress'}</span>
          <span className={`text-sm font-semibold ${textColorClasses[color]}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
