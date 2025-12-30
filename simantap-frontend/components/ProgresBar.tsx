interface ProgressBarProps {
  label: string
  value: number
  max?: number
  color?: string
  showPercentage?: boolean
}

export default function ProgressBar({ 
  label, 
  value, 
  max = 100, 
  color = 'emerald',
  showPercentage = true 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showPercentage && (
          <span className="text-sm font-semibold text-gray-900">
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-${color}-600 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent to-white/30"></div>
        </div>
      </div>
    </div>
  )
}