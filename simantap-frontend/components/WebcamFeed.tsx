'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Camera, Play, Square } from 'lucide-react'
import DetectionOverlay from './DetectionOverlay'
import { Detection } from '@/services/api'

interface WebcamFeedProps {
  detections: Detection[]
  hazardLevel: 'Low' | 'Medium' | 'High'
  isDetecting: boolean
  onCapture: (imageSrc: string, imageFile: File) => void
  onRealtimeDetection?: (result: any) => void
  detectionMode?: 'ppe' | 'stf'
}

export default function WebcamFeed({ 
  detections, 
  hazardLevel, 
  isDetecting,
  onCapture,
  onRealtimeDetection,
  detectionMode = 'ppe'
}: WebcamFeedProps) {
  const webcamRef = useRef<Webcam>(null)
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 })
  const [isRealtimeActive, setIsRealtimeActive] = useState(false) // START ONLY ON CLICK - NO AUTO-START
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [lastDetectionTime, setLastDetectionTime] = useState<number>(0)
  const [webcamReady, setWebcamReady] = useState(false)
  const isRealtimeActiveRef = useRef(false) // Keep track of realtime state without closure issues

  const DETECTION_INTERVAL = 500 // ms - 2 FPS for smooth but not too fast

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  }

  // Real-time detection function
  const performRealtimeDetection = useCallback(async () => {
    // Check ref instead of state to avoid closure issues
    if (!webcamRef.current || !isRealtimeActiveRef.current) return

    try {
      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) return

      // Convert base64 to Blob
      const response = await fetch(imageSrc)
      const blob = await response.blob()
      const file = new File([blob], "realtime-frame.jpg", { type: "image/jpeg" })

      // Send to backend for real-time detection
      const formData = new FormData()
      formData.append('file', file)

      // Use realtime detection endpoint (works for both PPE and STF)
      const endpoint = 'http://localhost:8000/detect/realtime'

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const result = await res.json()
        console.log('[WebcamFeed] Backend response received:', result)
        console.log(`[WebcamFeed] Response has ${result.detections ? result.detections.length : 0} detections`)
        console.log(`[WebcamFeed] Calling onRealtimeDetection callback...`)
        if (onRealtimeDetection) {
          onRealtimeDetection(result)
        }
        setLastDetectionTime(Date.now())
      } else {
        console.error('[WebcamFeed] Backend error:', res.status)
      }
    } catch (error) {
      console.error('[WebcamFeed] Real-time detection error:', error)
    }
  }, [onRealtimeDetection, detectionMode])

  // Start real-time detection
  const toggleRealtimeDetection = useCallback(() => {
    if (isRealtimeActive) {
      // Pause detection
      setIsRealtimeActive(false)
      isRealtimeActiveRef.current = false
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
      }
    } else {
      // Resume detection
      setIsRealtimeActive(true)
      isRealtimeActiveRef.current = true
      
      // Clear existing interval if any
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
      
      // Start new interval
      detectionIntervalRef.current = setInterval(() => {
        performRealtimeDetection()
      }, DETECTION_INTERVAL)
    }
  }, [isRealtimeActive, performRealtimeDetection])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
      }
    }
  }, [])

  // Auto-start real-time detection when webcam is ready
  useEffect(() => {
    if (webcamReady && isRealtimeActive) {
      // Only start if not already running
      if (!detectionIntervalRef.current) {
        detectionIntervalRef.current = setInterval(() => {
          performRealtimeDetection()
        }, DETECTION_INTERVAL)
      }
    }
  }, [webcamReady, isRealtimeActive, performRealtimeDetection])

  return (
    <div className="relative">
      {/* Webcam Container */}
      <div className="webcam-container bg-black rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement
            setVideoSize({
              width: video.videoWidth,
              height: video.videoHeight
            })
            console.log(`[WebcamFeed] Video loaded: ${video.videoWidth}x${video.videoHeight}`)
            // Mark webcam as ready - this triggers auto-start of detection
            setWebcamReady(true)
          }}
        />
        
        {/* Detection Overlay */}
        {detections.length > 0 && (
          <>
            <div style={{position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: '#0f0', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', zIndex: 5}}>
              {detections.length} detection(s)
            </div>
            <DetectionOverlay
              detections={detections}
              imageWidth={videoSize.width}
              imageHeight={videoSize.height}
              hazardLevel={hazardLevel}
            />
          </>
        )}
        {detections.length === 0 && isRealtimeActive && (
          <div style={{position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: '#faa', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', zIndex: 5}}>
            Waiting for detections...
          </div>
        )}

        {/* Status Indicator */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isRealtimeActive && webcamReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'}`}></div>
          <span className="text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
            {!webcamReady ? 'LOADING...' : isRealtimeActive ? '🔴 LIVE DETECT' : 'PAUSED'}
          </span>
        </div>

        {/* Last Detection Time */}
        {lastDetectionTime > 0 && (
          <div className="absolute bottom-4 right-4 text-xs text-gray-300 bg-black/50 px-2 py-1 rounded">
            Last: {new Date(lastDetectionTime).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-4 mt-4 flex-wrap">
        <button
          onClick={toggleRealtimeDetection}
          disabled={!webcamReady}
          className={`flex items-center space-x-2 ${
            !webcamReady 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isRealtimeActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-emerald-600 hover:bg-emerald-700'
          } text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl`}
        >
          {isRealtimeActive ? (
            <>
              <Square className="w-5 h-5" />
              <span>Pause Detection</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Start Detection</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}