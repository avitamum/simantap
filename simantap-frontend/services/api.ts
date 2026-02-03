import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============ DETECTION INTERFACES ============
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

// ============ AREA INTERFACES ============
export interface Area {
  area_id: string
  area_name: string
  location: string
  risk_level: 'Low' | 'Medium' | 'High'
  description?: string
  created_at?: string
  updated_at?: string
}

export interface AreasResponse {
  success: boolean
  total: number
  data: Area[]
}

// ============ APD TRAINING INTERFACES ============
export interface APDItem {
  item_id: string
  item_name: string
  category: string
  description?: string
  training_samples?: number
  accuracy?: number
  created_at?: string
  updated_at?: string
}

export interface APDResponse {
  success: boolean
  total: number
  data: APDItem[]
}

export interface APDCategoryResponse {
  success: boolean
  category: string
  total: number
  data: APDItem[]
}

// ============ TRAINING LOG INTERFACES ============
export interface TrainingLog {
  log_id: string
  date: string
  epoch: number
  loss: number
  accuracy: number
  validation_accuracy: number
  area_id?: string
  apd_categories?: string
  created_at?: string
}

export interface TrainingLogsResponse {
  success: boolean
  total: number
  data: TrainingLog[]
}

// API Functions
export const api = {
  // ============ HEALTH & INFO ============
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/')
      return response.data
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  },

  // ============ DETECTION ENDPOINTS ============
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

  getStatsSummary: async (): Promise<StatsResponse> => {
    try {
      const response = await apiClient.get('/stats/summary')
      return response.data
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      throw error
    }
  },

  // ============ AREA MANAGEMENT ENDPOINTS ============
  areas: {
    getAll: async (): Promise<AreasResponse> => {
      try {
        const response = await apiClient.get('/areas')
        return response.data
      } catch (error) {
        console.error('Failed to fetch areas:', error)
        throw error
      }
    },

    getById: async (areaId: string): Promise<{ success: boolean; data: Area }> => {
      try {
        const response = await apiClient.get(`/areas/${areaId}`)
        return response.data
      } catch (error) {
        console.error(`Failed to fetch area ${areaId}:`, error)
        throw error
      }
    },

    create: async (area: Area): Promise<{ success: boolean; message: string; data: Area }> => {
      try {
        const response = await apiClient.post('/areas', area)
        return response.data
      } catch (error) {
        console.error('Failed to create area:', error)
        throw error
      }
    },

    update: async (areaId: string, area: Area): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await apiClient.put(`/areas/${areaId}`, area)
        return response.data
      } catch (error) {
        console.error(`Failed to update area ${areaId}:`, error)
        throw error
      }
    },

    delete: async (areaId: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await apiClient.delete(`/areas/${areaId}`)
        return response.data
      } catch (error) {
        console.error(`Failed to delete area ${areaId}:`, error)
        throw error
      }
    },
  },

  // ============ APD TRAINING DATA ENDPOINTS ============
  apd: {
    getAll: async (): Promise<APDResponse> => {
      try {
        const response = await apiClient.get('/apd')
        return response.data
      } catch (error) {
        console.error('Failed to fetch APD items:', error)
        throw error
      }
    },

    getAllAPD: async (): Promise<APDResponse> => {
      try {
        const response = await apiClient.get('/apd')
        return response.data
      } catch (error) {
        console.error('Failed to fetch APD items:', error)
        throw error
      }
    },

    getCategories: async (): Promise<{ success: boolean; data: string[] }> => {
      try {
        const response = await apiClient.get('/apd/categories')
        return response.data
      } catch (error) {
        console.error('Failed to fetch APD categories:', error)
        throw error
      }
    },

    getById: async (itemId: string): Promise<{ success: boolean; data: APDItem }> => {
      try {
        const response = await apiClient.get(`/apd/${itemId}`)
        return response.data
      } catch (error) {
        console.error(`Failed to fetch APD item ${itemId}:`, error)
        throw error
      }
    },

    getByCategory: async (category: string): Promise<APDCategoryResponse> => {
      try {
        const response = await apiClient.get(`/apd/${category}`)
        return response.data
      } catch (error) {
        console.error(`Failed to fetch APD items for category ${category}:`, error)
        throw error
      }
    },

    create: async (item: APDItem): Promise<{ success: boolean; message: string; data: APDItem }> => {
      try {
        const response = await apiClient.post('/apd', item)
        return response.data
      } catch (error) {
        console.error('Failed to create APD item:', error)
        throw error
      }
    },

    update: async (itemId: string, item: APDItem): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await apiClient.put(`/apd/${itemId}`, item)
        return response.data
      } catch (error) {
        console.error(`Failed to update APD item ${itemId}:`, error)
        throw error
      }
    },

    delete: async (itemId: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await apiClient.delete(`/apd/${itemId}`)
        return response.data
      } catch (error) {
        console.error(`Failed to delete APD item ${itemId}:`, error)
        throw error
      }
    },
  },

  // ============ TRAINING LOG ENDPOINTS ============
  trainingLogs: {
    getAll: async (limit: number = 100): Promise<TrainingLogsResponse> => {
      try {
        const response = await apiClient.get('/training-logs', { params: { limit } })
        return response.data
      } catch (error) {
        console.error('Failed to fetch training logs:', error)
        throw error
      }
    },

    getByArea: async (areaId: string, limit: number = 100): Promise<TrainingLogsResponse> => {
      try {
        const response = await apiClient.get('/training-logs', { params: { area_id: areaId, limit } })
        return response.data
      } catch (error) {
        console.error(`Failed to fetch training logs for area ${areaId}:`, error)
        throw error
      }
    },

    create: async (log: TrainingLog): Promise<{ success: boolean; message: string; data: Partial<TrainingLog> }> => {
      try {
        const response = await apiClient.post('/training-logs', log)
        return response.data
      } catch (error) {
        console.error('Failed to create training log:', error)
        throw error
      }
    },
  },
}

export default api