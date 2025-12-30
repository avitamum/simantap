// simantap-frontend/app/research/page.tsx
'use client'

import { FileText, Award, Target, Lightbulb, TrendingUp, BarChart3, Users, AlertTriangle, Shield, Eye, Zap } from 'lucide-react'

export default function ResearchPage() {
  const keyInsights = [
    {
      icon: TrendingUp,
      title: '462,241 Kecelakaan/Tahun',
      description: 'Incident rate di Indonesia berdasarkan data BPJS Ketenagakerjaan',
      color: 'red'
    },
    {
      icon: AlertTriangle,
      title: '3 Provinsi Tertinggi',
      description: 'Jatim, Jabar, Jateng menjadi hotspot kecelakaan kerja',
      color: 'yellow'
    },
    {
      icon: Eye,
      title: 'AI Computer Vision',
      description: 'Teknologi machine learning untuk deteksi real-time PPE & STF hazards',
      color: 'blue'
    },
    {
      icon: Zap,
      title: '95.1% Akurasi',
      description: 'YOLOv12 Medium mencapai F1-Score tertinggi untuk helmet detection',
      color: 'emerald'
    }
  ]

  const findings = [
    {
      title: 'Model Performance Comparison',
      stats: [
        { label: 'YOLOv12 Nano (Baseline)', value: '92.8%', model: 'Helmet' },
        { label: 'YOLOv12 Small (Balanced)', value: '94.5%', model: 'Helmet' },
        { label: 'YOLOv12 Medium (Complex)', value: '95.1%', model: 'Helmet - BEST' },
        { label: 'Faster R-CNN (Benchmark)', value: '98.0%', model: 'Worker' }
      ],
      bgColor: 'emerald'
    }
  ]

  const researchQuestions = [
    'Bagaimana AI dapat meningkatkan compliance rate keselamatan kerja?',
    'Apa saja model ML terbaik untuk deteksi PPE real-time?',
    'Bagaimana integrasi dengan governance sistem existing?',
    'Bagaimana mitigasi outdoor STF (Slip, Trip, Fall) hazards?'
  ]

  return (
    <div className="min-h-screen pt-20 px-4 pb-12 bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Research Paper Summary
          </h1>
          <p className="text-2xl text-emerald-600 font-semibold mb-2">
            SIMANTAP: AI-Driven Occupational Safety Intelligence
          </p>
          <p className="text-gray-600 mb-1">
            Computer Vision untuk deteksi PPE Compliance & STF Hazards
          </p>
          <p className="text-sm text-gray-500">
            Politeknik Statistika STIS | 2025
          </p>
        </div>

        {/* Key Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {keyInsights.map((insight, idx) => {
            const Icon = insight.icon
            const colorClasses = {
              red: 'from-red-100 to-red-50 border-red-200',
              yellow: 'from-yellow-100 to-yellow-50 border-yellow-200',
              blue: 'from-blue-100 to-blue-50 border-blue-200',
              emerald: 'from-emerald-100 to-emerald-50 border-emerald-200'
            }
            const iconColors = {
              red: 'text-red-600',
              yellow: 'text-yellow-600',
              blue: 'text-blue-600',
              emerald: 'text-emerald-600'
            }
            return (
              <div key={idx} className={`bg-gradient-to-br ${colorClasses[insight.color as keyof typeof colorClasses]} border rounded-lg p-4 hover:shadow-lg transition-shadow`}>
                <Icon className={`w-8 h-8 mb-3 ${iconColors[insight.color as keyof typeof iconColors]}`} />
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{insight.title}</h3>
                <p className="text-xs text-gray-600">{insight.description}</p>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Abstract */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span className="w-1 h-8 bg-emerald-600 rounded"></span>
                <span>Abstract</span>
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Workplace accidents remain a persistent challenge in Indonesia, dengan <strong>462,241 cases</strong> reported oleh BPJS Ketenagakerjaan annually. Insiden tertinggi terkonsentrasi di East Java, West Java, dan Central Java.
                </p>
                <p>
                  Penelitian ini mengusulkan integrated <strong>computer-vision framework</strong> yang dirancang untuk:
                </p>
                <ul className="list-none space-y-2 ml-4">
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Identify PPE (Personal Protective Equipment) compliance secara real-time</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Detect outdoor STF (Slip-Trip-Fall) hazards menggunakan texture analysis</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Provide policy-oriented analytics dashboard untuk safety governance</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Research Questions */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span className="w-1 h-8 bg-blue-600 rounded"></span>
                <span>Research Questions</span>
              </h2>
              <div className="space-y-3">
                {researchQuestions.map((q, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded border border-blue-100">
                    <span className="text-blue-600 font-bold flex-shrink-0 mt-1">Q{idx + 1}.</span>
                    <span className="text-gray-700">{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Methodology */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="w-6 h-6 text-emerald-600" />
                <span>Methodology</span>
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Models Evaluated</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'YOLOv12 Nano', desc: 'Baseline: Paling ringan untuk embedded systems' },
                      { name: 'YOLOv12 Small', desc: 'Balanced: Tengah-tengah antara akurasi & performa' },
                      { name: 'YOLOv12 Medium', desc: 'Complex: Arsitektur rumit dengan akurasi tertinggi - BEST PERFORMER' },
                      { name: 'Faster R-CNN', desc: 'Benchmark: Two-stage detector untuk perbandingan algoritma' }
                    ].map((m, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                        <p className="font-semibold text-emerald-900">{m.name}</p>
                        <p className="text-sm text-gray-700">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">Dataset</h3>
                  <p className="text-gray-700">Curated PPE dataset dengan helmet, safety vest, safety shoes, dan worker detection. Mencakup diverse lighting conditions, angles, dan occlusion scenarios untuk real-world robustness.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Key Results Highlight */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-6 h-6" />
                <h3 className="text-xl font-bold">Top Performance</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/20 rounded p-3">
                  <p className="text-sm opacity-90">Helmet Detection</p>
                  <p className="text-3xl font-bold">95.1%</p>
                  <p className="text-xs opacity-75">YOLOv12 F1-Score</p>
                </div>
                <div className="bg-white/20 rounded p-3">
                  <p className="text-sm opacity-90">Worker Accuracy</p>
                  <p className="text-3xl font-bold">93.4%</p>
                  <p className="text-xs opacity-75">Faster R-CNN</p>
                </div>
                <div className="bg-white/20 rounded p-3">
                  <p className="text-sm opacity-90">Safety Vest</p>
                  <p className="text-3xl font-bold">95.4%</p>
                  <p className="text-xs opacity-75">YOLOv12</p>
                </div>
              </div>
            </div>

            {/* Impact Statement */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-bold text-gray-900">Expected Impact</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span>Mengurangi accident rate melalui AI-powered monitoring</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span>Meningkatkan compliance rate hingga 95%+</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span>Real-time alerts untuk hazard prevention</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span>Data-driven decision making untuk safety governance</span>
                </li>
              </ul>
            </div>

            {/* System Architecture */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-emerald-600" />
                <span>System Components</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                  <span>Real-time PPE monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                  <span>STF hazard detection pipeline</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                  <span>Analytics dashboard</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                  <span>Automated alert system</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                  <span>Risk scoring engine</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Research Team */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center space-x-2">
            <Users className="w-8 h-8 text-emerald-600" />
            <span>Research Team</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Avita Mumtahana',
                role: 'Lead Researcher',
                email: '222313008@stis.ac.id'
              },
              {
                name: 'Nur Nai\'mah Ma\'ruf',
                role: 'Co-Researcher',
                email: '222313302@stis.ac.id'
              },
              {
                name: 'Wafi Aulia Tsabitah',
                role: 'Co-Researcher',
                email: '222212910@stis.ac.id'
              }
            ].map((member, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-emerald-600 font-semibold mb-3">{member.role}</p>
                <a href={`mailto:${member.email}`} className="text-xs text-blue-600 hover:underline break-all">
                  {member.email}
                </a>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded text-center">
            <p className="text-gray-700 font-semibold">Politeknik Statistika STIS</p>
            <p className="text-sm text-gray-600">Jakarta, Indonesia | 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}