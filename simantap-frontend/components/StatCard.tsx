import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: string
}

export default function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend,
  color = 'emerald' 
}: StatCardProps) {
  return (
    <div className="card stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-2 rounded-lg bg-${color}-100`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <span className="text-sm font-medium text-gray-600">{title}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {value}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  )
}