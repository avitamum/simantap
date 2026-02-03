import { Detection } from '@/services/api'

interface DetectionOverlayProps {
  detections: Detection[]
  imageWidth: number
  imageHeight: number
  hazardLevel: 'Low' | 'Medium' | 'High'
}

export default function DetectionOverlay({ 
  detections, 
  imageWidth, 
  imageHeight,
  hazardLevel 
}: DetectionOverlayProps) {
  const getColorByHazard = (level: string) => {
    switch(level) {
      case 'High': return 'rgb(239, 68, 68)' // red-500
      case 'Medium': return 'rgb(245, 158, 11)' // yellow-500
      default: return 'rgb(16, 185, 129)' // emerald-500
    }
  }

  // Get color based on class name for STF detection
  const getColorByClassName = (className: string) => {
    const lowerName = className.toLowerCase()
    if (lowerName.includes('slip') || lowerName.includes('oil') || lowerName.includes('puddle')) {
      return 'rgb(59, 130, 246)' // blue-500 for slip
    }
    if (lowerName.includes('trip') || lowerName.includes('pothole') || lowerName.includes('gravel')) {
      return 'rgb(249, 115, 22)' // orange-500 for trip
    }
    if (lowerName.includes('fall') || lowerName.includes('cliff') || lowerName.includes('stairs')) {
      return 'rgb(239, 68, 68)' // red-500 for fall
    }
    // Default PPE colors
    if (lowerName.includes('topi') || lowerName.includes('helmet')) {
      return 'rgb(16, 185, 129)' // emerald
    }
    if (lowerName.includes('sepatu') || lowerName.includes('shoes')) {
      return 'rgb(59, 130, 246)' // blue
    }
    if (lowerName.includes('pakaian') || lowerName.includes('vest')) {
      return 'rgb(245, 158, 11)' // yellow
    }
    if (lowerName.includes('pekerja') || lowerName.includes('person') || lowerName.includes('worker')) {
      return 'rgb(139, 92, 246)' // purple
    }
    return getColorByHazard(hazardLevel)
  }

  // IMPORTANT: Backend returns detections in 640x640 space (after preprocessing)
  // So we ALWAYS use 640x640 as viewBox, not the video dimensions
  // The SVG will scale to fill the container
  const DETECTION_SPACE_SIZE = 640

  return (
    <svg 
      className="detection-overlay w-full h-full" 
      width="100%" 
      height="100%"
      viewBox={`0 0 ${DETECTION_SPACE_SIZE} ${DETECTION_SPACE_SIZE}`}
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10
      }}
    >
      {detections.map((detection, index) => {
        const { x1, y1, x2, y2 } = detection.bbox
        const width = x2 - x1
        const height = y2 - y1
        const color = getColorByClassName(detection.class_name)

        return (
          <g key={index}>
            {/* Bounding Box */}
            <rect
              x={x1}
              y={y1}
              width={width}
              height={height}
              fill="none"
              stroke={color}
              strokeWidth="3"
              rx="4"
            />
            
            {/* Label Background */}
            <rect
              x={x1}
              y={y1 - 25}
              width={Math.max(width, 120)}
              height="25"
              fill={color}
              rx="4"
            />
            
            {/* Label Text */}
            <text
              x={x1 + 5}
              y={y1 - 8}
              fill="white"
              fontSize="14"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {detection.class_name}: {(detection.confidence * 100).toFixed(1)}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}