// simantap-frontend/app/detection/page.tsx
'use client'

import { useState } from 'react'
import WebcamFeed from '@/components/WebcamFeed'
import AlertPanel from '@/components/AlertPanel'
import ProgressBar from '@/components/ProgressBar'
import LoadingSpinner from '@/components/LoadingSpinner'
import { api, Detection, ComplianceAssessment } from '@/services/api'
import { Clock, Shield, AlertTriangle, Activity, Zap, Camera, Target, Info, CheckCircle, Eye } from 'lucide-react'
import { formatTimestamp } from '@/utils/riskMapper'

interface RecentEvent {
  id: number
  timestamp: string
  message: string
  level: 'Low' | 'Medium' | 'High'
}

export default function DetectionPage() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [compliance, setCompliance] = useState<ComplianceAssessment | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionMode, setDetectionMode] = useState<'ppe' | 'stf'>('ppe')
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [sessionStats, setSessionStats] = useState({
    totalScans: 0,
    violations: 0,
    avgCompliance: 0
  })

  const handleCapture = async (imageSrc: string, imageFile: File) => {
    setIsDetecting(true)
    
    try {
      if (detectionMode === 'ppe') {
        const result = await api.detectPPE(imageFile)
        
        setDetections(result.detections)
        setCompliance(result.compliance)
        
        setSessionStats(prev => ({
          totalScans: prev.totalScans + 1,
          violations: prev.violations + (result.compliance.hazard_level !== 'Low' ? 1 : 0),
          avgCompliance: ((prev.avgCompliance * prev.totalScans) + result.compliance.compliance_rate) / (prev.totalScans + 1)
        }))

        const newEvent: RecentEvent = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          message: result.compliance.alert_message,
          level: result.compliance.hazard_level
        }
        setRecentEvents(prev => [newEvent, ...prev].slice(0, 5))
        
      } else {
        const result = await api.detectSTF(imageFile)
        console.log('STF Detection:', result)
      }
    } catch (error) {
      console.error('Detection error:', error)
      alert('Detection failed. Please check if backend is running.')
    } finally {
      setIsDetecting(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-12 bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-1 h-10 bg-emerald-600 rounded"></div>
            <h1 className="text-5xl font-bold text-gray-900">
              Live Detection System
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            Real-time PPE compliance dan hazard detection menggunakan AI Computer Vision
          </p>
          <p className="text-sm text-gray-500">
            Powered by YOLOv12 Small (94.5% accuracy) & Faster R-CNN (98% worker detection)
          </p>
        </div>

        {/* Detection Mode Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
            detectionMode === 'ppe' 
              ? 'bg-emerald-50 border-emerald-600 shadow-md' 
              : 'bg-white border-gray-200 hover:border-emerald-300'
          }`}>
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">PPE Detection</h3>
                <p className="text-sm text-gray-600">
                  Detect helmet, safety vest, safety shoes, dan worker compliance status
                </p>
                <p className="text-xs text-emerald-600 font-semibold mt-2">✓ 95%+ Accuracy</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
            detectionMode === 'stf' 
              ? 'bg-yellow-50 border-yellow-600 shadow-md' 
              : 'bg-white border-gray-200 hover:border-yellow-300'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">STF Hazard Detection</h3>
                <p className="text-sm text-gray-600">
                  Identifikasi Slip, Trip, Fall hazards menggunakan texture analysis
                </p>
                <p className="text-xs text-yellow-600 font-semibold mt-2">✓ Advanced Detection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center space-x-4 mb-8">
          <span className="text-sm font-semibold text-gray-700">Active Mode:</span>
          <button
            onClick={() => setDetectionMode('ppe')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              detectionMode === 'ppe'
                ? 'bg-emerald-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>PPE Detection</span>
          </button>
          <button
            onClick={() => setDetectionMode('stf')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              detectionMode === 'stf'
                ? 'bg-yellow-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-50'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span>STF Hazards</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Left Column - Webcam & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Webcam Feed Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Camera className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">Live Camera Feed</h2>
              </div>
              <WebcamFeed
                detections={detections}
                hazardLevel={compliance?.hazard_level || 'Low'}
                isDetecting={isDetecting}
                onCapture={handleCapture}
              />
              
              {isDetecting && (
                <div className="mt-4">
                  <LoadingSpinner message="Analyzing image with AI..." />
                </div>
              )}
            </div>

            {/* Detection Results */}
            {detections.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-6">
                  <Eye className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Detection Results</h3>
                </div>
                <div className="space-y-4">
                  {detections.map((detection, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">{detection.class_name}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {(detection.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <ProgressBar
                        label=""
                        value={detection.confidence * 100}
                        color={detection.confidence > 0.9 ? 'emerald' : detection.confidence > 0.7 ? 'yellow' : 'red'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <Info className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Detection Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                  <span><strong>Good Lighting:</strong> Ensure adequate lighting untuk optimal detection accuracy</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                  <span><strong>Clear View:</strong> Position camera untuk clear view dari workers & equipment</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                  <span><strong>Distance:</strong> Optimal detection range 1-5 meters dari subjects</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                  <span><strong>Multiple Scans:</strong> Perform scans dari berbagai angles untuk coverage lengkap</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Alerts & Stats */}
          <div className="space-y-6">
            {/* Compliance Alert - Large */}
            {compliance && (
              <div>
                <AlertPanel
                  level={compliance.hazard_level}
                  message={compliance.alert_message}
                  details={compliance.missing_ppe.length > 0 ? [
                    `Detected: ${compliance.detected_ppe.join(', ') || 'None'}`,
                    `Missing: ${compliance.missing_ppe.join(', ')}`
                  ] : [
                    `All required PPE detected`,
                    `Compliance Rate: ${compliance.compliance_rate}%`
                  ]}
                />
              </div>
            )}

            {/* Session Statistics Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-6 border border-emerald-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <Activity className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Session Statistics</h3>
              </div>
              <div className="space-y-5">
                <div className="bg-white rounded p-4">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Scans</p>
                  <p className="text-3xl font-bold text-emerald-600">{sessionStats.totalScans}</p>
                  <p className="text-xs text-gray-500 mt-1">Camera captures analyzed</p>
                </div>
                <div className="bg-white rounded p-4">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Violations Detected</p>
                  <p className={`text-3xl font-bold ${sessionStats.violations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {sessionStats.violations}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Non-compliant detections</p>
                </div>
                <div className="bg-white rounded p-4">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Avg Compliance Rate</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {sessionStats.avgCompliance.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Session average</p>
                </div>
              </div>
            </div>

            {/* Detection Info Card */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-bold text-gray-900">Model Info</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                  <p className="font-semibold text-emerald-900">YOLOv12</p>
                  <p className="text-xs text-gray-600 mt-1">Real-time detection | 95%+ F1-Score</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="font-semibold text-blue-900">Faster R-CNN</p>
                  <p className="text-xs text-gray-600 mt-1">Structured objects | 98% accuracy</p>
                </div>
              </div>
            </div>

            {/* Recent Events Timeline */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Recent Events</h3>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`border-l-4 pl-4 py-3 rounded transition-colors ${
                        event.level === 'High' 
                          ? 'bg-red-50 border-red-500' 
                          : event.level === 'Medium' 
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-green-50 border-green-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{event.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(event.timestamp)}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-semibold flex-shrink-0 whitespace-nowrap ${
                          event.level === 'High' ? 'bg-red-200 text-red-800' :
                          event.level === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {event.level}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No events yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Start detecting to see activity timeline.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Safety Guidelines */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Required PPE</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  <span><strong>Safety Helmet</strong> - Head protection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  <span><strong>Safety Vest</strong> - Visibility & protection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  <span><strong>Safety Shoes</strong> - Foot protection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}