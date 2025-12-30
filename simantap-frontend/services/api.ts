import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Detection {
  class_id: number
  class_name: string
  confidence: number
  bbox: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
}

export interface ComplianceAssessment {
  compliance_rate: number
  detected_ppe: string[]
  missing_ppe: string[]
  hazard_level: 'Low' | 'Medium' | 'High'
  alert_message: string
  has_worker: boolean
}

export interface DetectionResponse {
  success: boolean
  detections: Detection[]
  compliance: ComplianceAssessment
  annotated_image: string
  total_detections: number
}

export interface STFHazard {
  type: string
  confidence: number
  location: string
}

export interface STFResponse {
  success: boolean
  hazards: STFHazard[]
  risk_level: string
  recommendation: string
}

export interface StatsResponse {
  total_inspections: number
  compliance_rate: number
  violations_today: number
  high_risk_areas: number
  ppe_breakdown: {
    helmet: number
    vest: number
    shoes: number
    complete: number
  }
}

// API Functions
export const api = {
  // Health check
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/')
      return response.data
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  },

  // Detect PPE in image
  detectPPE: async (imageFile: File): Promise<DetectionResponse> => {
    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await apiClient.post('/detect/ppe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      console.error('PPE detection failed:', error)
      throw error
    }
  },

  // Detect STF hazards
  detectSTF: async (imageFile: File): Promise<STFResponse> => {
    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await apiClient.post('/detect/stf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      console.error('STF detection failed:', error)
      throw error
    }
  },

  // Get summary statistics
  getStatsSummary: async (): Promise<StatsResponse> => {
    try {
      const response = await apiClient.get('/stats/summary')
      return response.data
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      throw error
    }
  },
}

export default api