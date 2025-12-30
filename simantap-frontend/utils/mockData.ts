export const mockDetectionData = {
  success: true,
  detections: [
    {
      class_id: 1,
      class_name: "Topi",
      confidence: 0.95,
      bbox: { x1: 120, y1: 50, x2: 200, y2: 100 }
    },
    {
      class_id: 3,
      class_name: "Pakaian",
      confidence: 0.92,
      bbox: { x1: 100, y1: 150, x2: 220, y2: 350 }
    },
    {
      class_id: 4,
      class_name: "Pekerja",
      confidence: 0.98,
      bbox: { x1: 80, y1: 40, x2: 240, y2: 450 }
    }
  ],
  compliance: {
    compliance_rate: 66.7,
    detected_ppe: ["Topi", "Pakaian"],
    missing_ppe: ["Sepatu"],
    hazard_level: "Medium" as const,
    alert_message: "Missing: Sepatu",
    has_worker: true
  },
  annotated_image: "",
  total_detections: 3
}

export const mockStatsData = {
  total_inspections: 1247,
  compliance_rate: 87.3,
  violations_today: 23,
  high_risk_areas: 5,
  ppe_breakdown: {
    helmet: 95.1,
    vest: 92.6,
    shoes: 95.4,
    complete: 87.3
  }
}

export const mockRecentEvents = [
  {
    id: 1,
    timestamp: "2025-01-15 14:30:22",
    type: "violation",
    message: "Missing helmet detected",
    severity: "high",
    location: "Area A"
  },
  {
    id: 2,
    timestamp: "2025-01-15 14:28:15",
    type: "hazard",
    message: "Wet surface detected",
    severity: "medium",
    location: "Area B"
  },
  {
    id: 3,
    timestamp: "2025-01-15 14:25:00",
    type: "compliance",
    message: "All PPE compliant",
    severity: "low",
    location: "Area C"
  }
]