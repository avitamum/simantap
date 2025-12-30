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

  const color = getColorByHazard(hazardLevel)

  return (
    <svg 
      className="detection-overlay" 
      width={imageWidth} 
      height={imageHeight}
      viewBox={`0 0 ${imageWidth} ${imageHeight}`}
    >
      {detections.map((detection, index) => {
        const { x1, y1, x2, y2 } = detection.bbox
        const width = x2 - x1
        const height = y2 - y1

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