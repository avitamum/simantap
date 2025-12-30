'use client'

import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Camera, Video, VideoOff, Download } from 'lucide-react'
import DetectionOverlay from './DetectionOverlay'
import { Detection } from '@/services/api'

interface WebcamFeedProps {
  detections: Detection[]
  hazardLevel: 'Low' | 'Medium' | 'High'
  isDetecting: boolean
  onCapture: (imageSrc: string, imageFile: File) => void
}

export default function WebcamFeed({ 
  detections, 
  hazardLevel, 
  isDetecting,
  onCapture 
}: WebcamFeedProps) {
  const webcamRef = useRef<Webcam>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 })

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  }

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      // Convert base64 to File
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" })
          onCapture(imageSrc, file)
        })
    }
  }, [onCapture])

  const handleDownloadSnapshot = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      const link = document.createElement('a')
      link.href = imageSrc
      link.download = `snapshot-${new Date().getTime()}.jpg`
      link.click()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement actual video recording
    console.log(isRecording ? 'Recording stopped' : 'Recording started')
  }

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
          }}
        />
        
        {/* Detection Overlay */}
        {detections.length > 0 && (
          <div className="absolute inset-0">
            <DetectionOverlay
              detections={detections}
              imageWidth={videoSize.width}
              imageHeight={videoSize.height}
              hazardLevel={hazardLevel}
            />
          </div>
        )}

        {/* Status Indicator */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isDetecting ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
            {isDetecting ? 'DETECTING' : 'STANDBY'}
          </span>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span className="text-white text-sm font-semibold">REC</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-4 mt-4">
        <button
          onClick={handleCapture}
          disabled={isDetecting}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Camera className="w-5 h-5" />
          <span>Capture & Detect</span>
        </button>

        <button
          onClick={handleDownloadSnapshot}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5" />
        </button>

        <button
          onClick={toggleRecording}
          className={`flex items-center space-x-2 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl`}
        >
          {isRecording ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}