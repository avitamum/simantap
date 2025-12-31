// simantap-frontend/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import StatCard from '@/components/StatCard'
import { Users, Shield, AlertTriangle, TrendingUp, HardHat, Shirt, Footprints, CheckCircle2, Brain, Database, Zap, Target } from 'lucide-react'
import { api, StatsResponse } from '@/services/api'
import { mockStatsData } from '@/utils/mockData'

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse>(mockStatsData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const data = await api.getStatsSummary()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats(mockStatsData)
    } finally {
      setIsLoading(false)
    }
  }

  // Chart data
  const ppeComplianceData = [
    { name: 'Helmet', value: stats.ppe_breakdown.helmet, color: '#10b981' },
    { name: 'Vest', value: stats.ppe_breakdown.vest, color: '#3b82f6' },
    { name: 'Shoes', value: stats.ppe_breakdown.shoes, color: '#f59e0b' },
    { name: 'Complete', value: stats.ppe_breakdown.complete, color: '#8b5cf6' }
  ]

  const modelPerformanceData = [
    { model: 'YOLOv12 Nano', helmet: 95.1, vest: 95.4, shoes: 92.6, worker: 93.4 },
    { model: 'YOLOv12 Small', helmet: 95.31, vest: 95.51, shoes: 92.51, worker: 93.41 },
    { model: 'YOLOv12 Medium', helmet: 95.88, vest: 95.88, shoes: 92.6, worker: 93.4 },
    { model: 'Faster R-CNN', helmet: 87.5, vest: 88.5, shoes: 87.0, worker: 88.5 }
  ]

  const accuracyTrendData = [
    { month: 'Phase 1', nano: 75.83, small: 76.80, medium: 77.72, rcnn: 51.43 },
    { month: 'Phase 2', nano: 95.63, small: 95.63, medium: 95.88, rcnn: 88.51 },
    { month: 'Phase 3', nano: 97.77, small: 97.41, medium: 97.54, rcnn: 95.55 },
    { month: 'Final', nano: 97.77, small: 97.41, medium: 97.54, rcnn: 95.55 }
  ]

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']

  return (
    <div className="min-h-screen pt-20 px-4 pb-12 bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-1 h-10 bg-emerald-600 rounded"></div>
            <h1 className="text-5xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Comprehensive monitoring and analytics untuk workplace safety menggunakan AI-powered detection system
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Users}
            title="Total Inspections"
            value={stats.total_inspections.toLocaleString()}
            subtitle="This month"
            trend={{ value: 12, isPositive: true }}
            color="emerald"
          />
          <StatCard
            icon={Shield}
            title="Compliance Rate"
            value={`${stats.compliance_rate}%`}
            subtitle="Overall average"
            trend={{ value: 5, isPositive: true }}
            color="blue"
          />
          <StatCard
            icon={AlertTriangle}
            title="Violations Today"
            value={stats.violations_today}
            subtitle="Requires attention"
            trend={{ value: 3, isPositive: false }}
            color="red"
          />
          <StatCard
            icon={TrendingUp}
            title="High Risk Areas"
            value={stats.high_risk_areas}
            subtitle="Active monitoring"
            color="yellow"
          />
        </div>

        {/* Methodology Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Methodology Explanation */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Methodology</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">Supervised Learning Approach</h3>
                <p className="text-sm text-gray-700">
                  Sistem menggunakan deep learning object detection dengan curated PPE dataset yang mencakup diverse scenarios (lighting conditions, angles, occlusion).
                </p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">Four Models Evaluated</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                  <li><strong>YOLOv12 Nano</strong> - Baseline (Paling ringan, embedded-friendly)</li>
                  <li><strong>YOLOv12 Small</strong> - Balanced (Tengah-tengah, production standard)</li>
                  <li><strong>YOLOv12 Medium</strong> - Complex (Arsitektur rumit, best accuracy)</li>
                  <li><strong>Faster R-CNN</strong> - Benchmark (Two-stage detector untuk perbandingan)</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">Training Pipeline</h3>
                <p className="text-sm text-gray-700">
                  Train-validation-test split dengan augmentation techniques untuk improve model robustness terhadap real-world variations.
                </p>
              </div>
            </div>
          </div>

          {/* Dataset Info */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Database className="w-8 h-8 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Dataset & Evaluation</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">Dataset Characteristics</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ PPE Classes: Helmet, Vest, Shoes, Worker</li>
                  <li>✓ Real-world variations: Lighting, angles, occlusion</li>
                  <li>✓ Balanced distribution across classes</li>
                  <li>✓ Augmented for robustness</li>
                </ul>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">Evaluation Metrics</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ <strong>F1-Score</strong> - Balance precision & recall</li>
                  <li>✓ <strong>Precision</strong> - Correct predictions ratio</li>
                  <li>✓ <strong>Recall</strong> - Detection completeness</li>
                  <li>✓ <strong>Inference Time</strong> - Real-time capability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Accuracy Trend Chart */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Model Performance Improvement Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accuracyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[70, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="nano" stroke="#3b82f6" strokeWidth={2} name="YOLOv12 Nano" />
              <Line type="monotone" dataKey="small" stroke="#10b981" strokeWidth={2} name="YOLOv12 Small" />
              <Line type="monotone" dataKey="medium" stroke="#06b6d4" strokeWidth={3} name="YOLOv12 Medium" />
              <Line type="monotone" dataKey="rcnn" stroke="#8b5cf6" strokeWidth={2} name="Faster R-CNN" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* PPE Compliance Breakdown */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">PPE Compliance Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ppeComplianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ppeComplianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {ppeComplianceData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                  <span className="text-sm font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Model Performance Comparison */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Model Performance Comparison (F1-Score)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="helmet" fill="#10b981" name="Helmet" />
                <Bar dataKey="vest" fill="#3b82f6" name="Vest" />
                <Bar dataKey="shoes" fill="#f59e0b" name="Shoes" />
                <Bar dataKey="worker" fill="#8b5cf6" name="Worker" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PPE Detection Performance Cards */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-12">
          <div className="flex items-center space-x-3 mb-8">
            <Target className="w-8 h-8 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Individual PPE Detection Performance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
              <HardHat className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Helmet Detection</h3>
              <p className="text-4xl font-bold text-emerald-600 mb-2">95.1%</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Model:</strong> YOLOv12</p>
                <p><strong>Metric:</strong> F1-Score</p>
              </div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <Shirt className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Safety Vest</h3>
              <p className="text-4xl font-bold text-blue-600 mb-2">95.4%</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Model:</strong> YOLOv12</p>
                <p><strong>Metric:</strong> F1-Score</p>
              </div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <Footprints className="w-12 h-12 mx-auto text-yellow-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Safety Shoes</h3>
              <p className="text-4xl font-bold text-yellow-600 mb-2">92.6%</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Model:</strong> YOLOv12</p>
                <p><strong>Metric:</strong> F1-Score</p>
              </div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <CheckCircle2 className="w-12 h-12 mx-auto text-purple-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Worker Detection</h3>
              <p className="text-4xl font-bold text-purple-600 mb-2">98.0%</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Model:</strong> Faster R-CNN</p>
                <p><strong>Metric:</strong> F1-Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Evaluation Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* YOLOv12 Nano */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">YOLOv12 Nano</h3>
            </div>
            <p className="text-xs text-blue-600 font-semibold mb-3">Baseline: Paling Ringan</p>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600">Model Size</p>
                <p className="text-lg font-bold text-blue-600">3.0MB</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600">Helmet Accuracy</p>
                <p className="text-lg font-bold text-blue-600">92.8%</p>
              </div>
            </div>
          </div>

          {/* YOLOv12 Small */}
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-6 border border-cyan-200">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-6 h-6 text-cyan-600" />
              <h3 className="text-lg font-bold text-gray-900">YOLOv12 Small</h3>
            </div>
            <p className="text-xs text-cyan-600 font-semibold mb-3">Balanced: Tengah-tengah</p>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600">Model Size</p>
                <p className="text-lg font-bold text-cyan-600">27MB</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600">Helmet Accuracy</p>
                <p className="text-lg font-bold text-cyan-600">94.5%</p>
              </div>
            </div>
          </div>

          {/* YOLOv12 Medium */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-900">YOLOv12 Medium</h3>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mb-3">Complex: Arsitektur Rumit</p>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600">Model Size</p>
                <p className="text-lg font-bold text-emerald-600">52MB</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600">Helmet Accuracy</p>
                <p className="text-lg font-bold text-emerald-600">95.1%</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600">Vest Accuracy</p>
                <p className="text-lg font-bold text-emerald-600">95.4%</p>
              </div>
            </div>
          </div>

          {/* Faster R-CNN */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Faster R-CNN</h3>
            </div>
            <p className="text-xs text-purple-600 font-semibold mb-3">Benchmark: Pembanding</p>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600">Detector Type</p>
                <p className="text-lg font-bold text-purple-600">Two-stage</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600">Worker Detection</p>
                <p className="text-lg font-bold text-purple-600">98.0%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Research Findings */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Research Findings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-emerald-600 pl-4 py-2">
              <h3 className="font-bold text-emerald-900 mb-2">
                ✓ Superior YOLOv12 Performance
              </h3>
              <p className="text-sm text-gray-600">
                YOLOv12 achieved most consistent performance dengan F1-scores 92.6%-95.4% across semua PPE classes, particularly excelling dalam helmet detection (95.1%) dan safety vest (95.4%).
              </p>
            </div>
            
            <div className="border-l-4 border-blue-600 pl-4 py-2">
              <h3 className="font-bold text-blue-900 mb-2">
                ✓ R-CNN Worker Detection Excellence
              </h3>
              <p className="text-sm text-gray-600">
                Faster R-CNN menunjukkan exceptional performance dalam worker detection (F1=0.980) dan clothing identification (F1=0.974), confirming robustness region-based approaches untuk structured objects.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-600 pl-4 py-2">
              <h3 className="font-bold text-purple-900 mb-2">
                ✓ Real-World Deployment Ready
              </h3>
              <p className="text-sm text-gray-600">
                YOLOv12's real-time capability combined dengan 95%+ accuracy makes system production-ready untuk integrated workplace safety monitoring dengan automated alerts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}