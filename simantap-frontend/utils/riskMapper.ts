export type HazardLevel = 'Low' | 'Medium' | 'High'

export interface RiskConfig {
  color: string
  bgColor: string
  textColor: string
  icon: string
}

export const riskColorMap: Record<HazardLevel, RiskConfig> = {
  Low: {
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: '✓'
  },
  Medium: {
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    icon: '⚠'
  },
  High: {
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: '✗'
  }
}

export const getRiskConfig = (level: HazardLevel): RiskConfig => {
  return riskColorMap[level] || riskColorMap.Low
}

export const calculateComplianceScore = (detectedPPE: string[], requiredPPE: string[]): number => {
  const detected = new Set(detectedPPE)
  const required = new Set(requiredPPE)
  const matches = Array.from(detected).filter(item => required.has(item))
  return (matches.length / required.size) * 100
}

export const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}