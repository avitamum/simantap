// simantap-frontend/app/page.tsx
'use client'

import Link from 'next/link'
import { Shield, Camera, BarChart3, AlertTriangle, ArrowRight, CheckCircle, Zap, Users, Target } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const features = [
    {
      icon: Camera,
      title: 'Real-Time Detection',
      description: 'Live webcam monitoring dengan YOLOv12 untuk deteksi APD dan bahaya STF',
      color: 'emerald'
    },
    {
      icon: AlertTriangle,
      title: 'Smart Alerts',
      description: 'Sistem peringatan otomatis untuk pelanggaran APD dan hazard detection',
      color: 'yellow'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Dashboard komprehensif untuk monitoring compliance dan risk assessment',
      color: 'blue'
    },
    {
      icon: CheckCircle,
      title: 'Evidence Capture',
      description: 'Snapshot dan recording untuk dokumentasi insiden keselamatan',
      color: 'purple'
    }
  ]

  const stats = [
    { value: '462,241', label: 'Kecelakaan Kerja/Tahun', sublabel: 'Data BPJS Ketenagakerjaan' },
    { value: '95.88%', label: 'F1-Score PPE Detection', sublabel: 'YOLOv12 Medium (Safety Competition 2026)' },
    { value: '78.53%', label: 'F1-Score STF Detection', sublabel: 'YOLOv12 Nano (Safety Competition 2026)' },
    { value: '3 Provinsi', label: 'Tertinggi Insiden', sublabel: 'Jatim, Jabar, Jateng' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                AI-Powered Safety System
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="gradient-text">SIMANTAP</span>
              <br />
              <span className="text-3xl md:text-4xl text-gray-700">
                Sistem Manajemen Tata Kelola Proteksi
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Computer Vision untuk deteksi <span className="font-semibold text-emerald-600">PPE Compliance</span> dan <span className="font-semibold text-emerald-600">STF Hazards</span> menggunakan deep learning YOLOv12 (Nano, Small, Medium) dan Faster R-CNN
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/detection" className="btn-primary flex items-center space-x-2 group">
                <Camera className="w-5 h-5" />
                <span>Mulai Detection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/dashboard" className="btn-secondary flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Lihat Dashboard</span>
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sistem terintegrasi untuk monitoring keselamatan kerja secara real-time
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const colorClasses: Record<string, string> = {
                emerald: 'bg-emerald-100 text-emerald-600',
                yellow: 'bg-yellow-100 text-yellow-600',
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600'
              }
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 group hover:border-l-4 hover:border-emerald-500"
                >
                  <div className={`inline-flex p-3 rounded-lg ${colorClasses[feature.color]} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cara Kerja Sistem
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Teknologi AI terdepan untuk deteksi APD dan hazard secara otomatis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Video Input',
                desc: 'Sistem menerima input dari webcam atau kamera industri untuk analisis real-time',
                icon: Camera
              },
              {
                num: '02',
                title: 'AI Detection',
                desc: 'YOLOv12 (Nano/Small/Medium) dan Faster R-CNN menganalisis frame untuk deteksi APD dan worker',
                icon: Zap
              },
              {
                num: '03',
                title: 'Smart Alert',
                desc: 'Alert otomatis dikirim untuk pelanggaran APD dan hazard yang terdeteksi',
                icon: AlertTriangle
              }
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white rounded-xl shadow-md p-8 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transform group-hover:scale-x-125 transition-transform origin-left"></div>
                    
                    <div className="text-5xl font-bold text-emerald-100 mb-4">{item.num}</div>
                    <div className="inline-flex p-3 rounded-lg bg-emerald-100 mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Manfaat Utama
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Solusi komprehensif untuk meningkatkan keselamatan dan kepatuhan standar kerja
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: '📊 Monitoring Compliance',
                items: [
                  'Tracking real-time penggunaan APD',
                  'Laporan compliance otomatis',
                  'Dashboard analytics komprehensif'
                ],
                color: 'emerald'
              },
              {
                title: '🔒 Risk Management',
                items: [
                  'Deteksi hazard secara proaktif',
                  'Pencegahan insiden kerja',
                  'Data-driven safety insights'
                ],
                color: 'blue'
              },
              {
                title: '📈 Performance Metrics',
                items: [
                  'Akurasi deteksi 95%+',
                  'Processing real-time <100ms',
                  'Reliability 24/7'
                ],
                color: 'purple'
              },
              {
                title: '🎯 Easy Integration',
                items: [
                  'Kompatibel dengan infrastruktur existing',
                  'Setup dan deployment cepat',
                  'Technical support professional'
                ],
                color: 'yellow'
              }
            ].map((benefit, idx) => {
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-100 text-emerald-700 border-emerald-300',
                blue: 'bg-blue-100 text-blue-700 border-blue-300',
                purple: 'bg-purple-100 text-purple-700 border-purple-300',
                yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300'
              }
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`${colorMap[benefit.color]} rounded-xl p-8 border-l-4`}
                >
                  <h3 className="text-2xl font-bold mb-6">{benefit.title}</h3>
                  <ul className="space-y-3">
                    {benefit.items.map((item, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Teknologi terdepan dalam Computer Vision dan Deep Learning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                name: 'YOLOv12 Nano',
                category: 'Baseline: Paling Ringan',
                desc: 'Model paling lightweight untuk embedded systems',
                specs: ['Model Size: 3.0MB', 'Inference: <50ms', 'Memory: 256MB', 'Helmet Acc: 92.8%']
              },
              {
                name: 'YOLOv12 Small',
                category: 'Balanced: Tengah-tengah',
                desc: 'Balance sempurna antara akurasi dan performa',
                specs: ['Model Size: 27MB', 'Inference: 60-80ms', 'Memory: 512MB', 'Helmet Acc: 94.5%']
              },
              {
                name: 'YOLOv12 Medium',
                category: 'Complex: Arsitektur Rumit',
                desc: 'Arsitektur paling advanced untuk precision tinggi',
                specs: ['Model Size: 52MB', 'Inference: 100-120ms', 'Memory: 1GB', 'Helmet: 95.1%', 'Vest: 95.4%']
              },
              {
                name: 'Faster R-CNN',
                category: 'Benchmark: Pembanding Algoritma',
                desc: 'Region-based CNN untuk baseline perbandingan',
                specs: ['Two-stage detector', 'Inference: 150-200ms', 'Worker Acc: 98.0%', 'Helmet: 90.9%', 'Vest: 97.4%']
              }
            ].map((tech, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 rounded-xl p-8 border border-emerald-500/30 hover:border-emerald-400/60 transition-colors group"
              >
                <div className="mb-3">
                  <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <Zap className="w-6 h-6 text-emerald-400" />
                    <span>{tech.name}</span>
                  </h3>
                  <p className="text-xs text-emerald-300 mt-1 font-semibold">{tech.category}</p>
                </div>
                <p className="text-gray-300 mb-6 text-sm">{tech.desc}</p>
                <div className="space-y-2">
                  {tech.specs.map((spec, i) => (
                    <div key={i} className="flex items-center space-x-2 text-emerald-300">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{spec}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dataset Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-900/40 to-emerald-900/40 rounded-xl p-8 border border-blue-500/30 text-center"
          >
            <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Training Dataset</h3>
            <p className="text-gray-300">Dilatih dengan ribuan gambar kecelakaan kerja dan PPE detection dari industri nyata untuk akurasi maksimal</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600"></div>
        
        {/* Floating Shapes */}
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"
        ></motion.div>
        
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [360, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"
        ></motion.div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div style={{
            backgroundImage: 'linear-gradient(45deg, white 25%, transparent 25%), linear-gradient(-45deg, white 25%, transparent 25%)',
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 0 30px'
          }}></div>
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Icon Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center justify-center mb-8"
            >
              <div className="bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Main Heading */}
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Lindungi Pekerja Anda
              <span className="block bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                Dengan Teknologi AI Terdepan
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-emerald-50 mb-8 max-w-3xl mx-auto leading-relaxed">
              Dari APD compliance hingga hazard detection, SIMANTAP menyediakan solusi monitoring keselamatan kerja yang komprehensif dan terintegrasi dengan teknologi deep learning terkini
            </p>

            {/* Stats Mini */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:border-white/40 transition-colors"
              >
                <div className="text-2xl font-bold text-white">95%+</div>
                <div className="text-sm text-emerald-100">Accuracy</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:border-white/40 transition-colors"
              >
                <div className="text-2xl font-bold text-white">Real-time</div>
                <div className="text-sm text-emerald-100">Detection</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:border-white/40 transition-colors"
              >
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-emerald-100">Monitoring</div>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/detection"
                  className="inline-flex items-center space-x-3 bg-white text-emerald-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 group"
                >
                  <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span>Mulai Detection Sekarang</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/research"
                  className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all duration-300 border border-white/40 hover:border-white group"
                >
                  <Target className="w-5 h-5" />
                  <span>Pelajari Lebih Lanjut</span>
                </Link>
              </motion.div>
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6 pt-8 border-t border-white/20"
            >
              <div className="flex items-center space-x-2 text-emerald-100">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Direkomendasikan oleh Safety Experts</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2 text-emerald-100">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Dipercaya Ribuan Industri</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
