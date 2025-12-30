import { AlertTriangle, CheckCircle, AlertCircle, X } from 'lucide-react'
import { HazardLevel, getRiskConfig } from '@/utils/riskMapper'

interface AlertPanelProps {
  level: HazardLevel
  message: string
  details?: string[]
  onClose?: () => void
}

export default function AlertPanel({ level, message, details, onClose }: AlertPanelProps) {
  const config = getRiskConfig(level)
  
  const IconComponent = level === 'High' ? AlertTriangle : 
                        level === 'Medium' ? AlertCircle : 
                        CheckCircle

  return (
    <div className={`${config.bgColor} border-l-4 border-${config.color}-500 p-4 rounded-lg shadow-md relative animate-fade-in`}>
      <div className="flex items-start">
        <IconComponent className={`w-6 h-6 ${config.textColor} mr-3 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${config.textColor} mb-1`}>
            {level} Risk Alert
          </h3>
          <p className={`text-sm ${config.textColor}`}>
            {message}
          </p>
          {details && details.length > 0 && (
            <ul className={`mt-2 text-sm ${config.textColor} space-y-1`}>
              {details.map((detail, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">•</span>
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${config.textColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}