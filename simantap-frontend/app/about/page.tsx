'use client'

import { Shield, AlertTriangle, HardHat, TrendingDown, CheckCircle, Brain, Users, Target, BarChart3, Lightbulb, Award, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutPage() {
  const stats = [
    { value: '462,241', label: 'Annual Workplace Accidents', source: 'BPJS Ketenagakerjaan' },
    { value: '3', label: 'Provinces with Highest Incidents', source: 'Jatim, Jabar, Jateng' },
    { value: '95%+', label: 'Detection Accuracy', source: 'YOLOv12 & Faster R-CNN' },
    { value: '24/7', label: 'Real-Time Monitoring', source: 'Continuous Protection' }
  ]

  const ppeTypes = [
    {
      name: 'Safety Helmet (Topi Keselamatan)',
      description: 'Protects head from falling objects and impact injuries. Essential for all construction and industrial work.',
      icon: HardHat,
      color: 'emerald',
      benefits: ['Head impact protection', 'Prevents scalp wounds', 'Reduces trauma severity']
    },
    {
      name: 'Safety Vest (Rompi Keselamatan)',
      description: 'Increases visibility and identifies authorized personnel. Critical for vehicle-heavy environments.',
      icon: Shield,
      color: 'yellow',
      benefits: ['High visibility', 'Personnel identification', 'Professional appearance']
    },
    {
      name: 'Safety Shoes (Sepatu Keselamatan)',
      description: 'Protects feet from crushing, puncture, and slip hazards. Mandatory for loading and handling tasks.',
      icon: CheckCircle,
      color: 'blue',
      benefits: ['Foot protection', 'Slip resistance', 'Puncture prevention']
    }
  ]

  const challenges = [
    {
      icon: AlertTriangle,
      title: 'High Accident Rate',
      description: '462,241 workplace accidents annually in Indonesia',
      color: 'red'
    },
    {
      icon: Users,
      title: 'Low Compliance',
      description: 'Workers often neglect to wear required PPE properly',
      color: 'yellow'
    },
    {
      icon: Zap,
      title: 'Undetected Hazards',
      description: 'STF hazards (Slip, Trip, Fall) go unnoticed in variable conditions',
      color: 'orange'
    },
    {
      icon: TrendingDown,
      title: 'Limited Prevention',
      description: 'Lack of real-time monitoring and proactive safety measures',
      color: 'blue'
    }
  ]

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Detection',
      description: 'Advanced deep learning models trained on real workplace scenarios'
    },
    {
      icon: Target,
      title: 'Precision Accuracy',
      description: '95%+ accuracy in PPE and hazard detection'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive compliance tracking and risk analysis'
    },
    {
      icon: Lightbulb,
      title: 'Smart Insights',
      description: 'Data-driven recommendations for workplace safety improvements'
    },
    {
      icon: Award,
      title: 'Industry Standards',
      description: 'Compliant with OSHA and Indonesian safety regulations'
    },
    {
      icon: Zap,
      title: 'Real-Time Response',
      description: 'Instant alerts and notifications for safety violations'
    }
  ]



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div style={{
            backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl font-black text-gray-900 mb-6 leading-tight">
              Tentang <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">SIMANTAP</span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Sistem Manajemen Tata Kelola Proteksi - Solusi AI untuk Keselamatan Kerja di Indonesia
            </p>
            <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
              Mengintegrasikan computer vision dan deep learning untuk monitoring keselamatan kerja real-time
            </p>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Data & Insight Utama
            </h2>
            <p className="text-gray-600">Statistik keselamatan kerja dan kemampuan sistem</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border-l-4 border-emerald-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl font-black text-emerald-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-gray-800 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-600">
                  {stat.source}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Tantangan Keselamatan Kerja
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Pemahaman mendalam tentang masalah keselamatan kerja di Indonesia
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {challenges.map((challenge, index) => {
              const Icon = challenge.icon
              const colorMap: Record<string, string> = {
                red: 'from-red-600/20 to-red-700/10 border-red-500/40 text-red-400',
                yellow: 'from-yellow-600/20 to-yellow-700/10 border-yellow-500/40 text-yellow-400',
                orange: 'from-orange-600/20 to-orange-700/10 border-orange-500/40 text-orange-400',
                blue: 'from-blue-600/20 to-blue-700/10 border-blue-500/40 text-blue-400'
              }
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`bg-gradient-to-br ${colorMap[challenge.color]} rounded-xl p-8 border backdrop-blur-sm hover:border-opacity-100 transition-all duration-300`}
                >
                  <div className="flex items-start space-x-4">
                    <Icon className="w-8 h-8 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {challenge.title}
                      </h3>
                      <p className="text-gray-300">
                        {challenge.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Problem Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl p-8 border border-emerald-500/40 backdrop-blur-sm"
          >
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6" />
              <span>Analisis Mendalam</span>
            </h3>
            <div className="space-y-4 text-gray-100">
              <p>
                <strong className="text-emerald-300">462,241 kecelakaan kerja</strong> dilaporkan setiap tahun di Indonesia menurut BPJS Ketenagakerjaan. Provinsi dengan tingkat insiden tertinggi adalah:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Jawa Timur - Pusat industri dan manufaktur terbesar</li>
                <li>Jawa Barat - Zona industri dan pertanian intensif</li>
                <li>Jawa Tengah - Kombinasi sektor industri dan perkebunan</li>
              </ul>
              <p className="mt-4">
                Dua faktor utama berkontribusi pada tingginya angka kecelakaan:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Kepatuhan APD Rendah</strong> - Pekerja tidak memakai atau memakai APD dengan tidak tepat</li>
                <li><strong>Hazard STF Tidak Terdeteksi</strong> - Risiko Slip, Trip, Fall di area terbuka dengan kondisi cahaya, medan, dan cuaca yang bervariasi</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Solusi SIMANTAP
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sistem terintegrasi yang memanfaatkan AI dan deep learning untuk monitoring keselamatan real-time
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-200 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="inline-flex p-3 rounded-lg bg-emerald-100 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-emerald-600" />
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

      {/* PPE Education Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Memahami Alat Pelindung Diri (APD)
            </h2>
            <p className="text-gray-600">Panduan lengkap tentang setiap jenis APD dan manfaatnya</p>
          </motion.div>

          <div className="space-y-8">
            {ppeTypes.map((ppe, index) => {
              const Icon = ppe.icon
              const colorMap: Record<string, string> = {
                emerald: 'from-emerald-100 to-teal-100 border-emerald-300',
                yellow: 'from-yellow-100 to-amber-100 border-yellow-300',
                blue: 'from-blue-100 to-cyan-100 border-blue-300'
              }
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`bg-gradient-to-r ${colorMap[ppe.color]} rounded-xl p-8 border-l-4`}
                >
                  <div className="flex items-start space-x-6">
                    <div className="bg-opacity-20 p-4 rounded-lg flex-shrink-0">
                      <Icon className="w-8 h-8 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {ppe.name}
                      </h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {ppe.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ppe.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        ></motion.div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Visi Kami
            </h2>
            <p className="text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed mb-8">
              Menciptakan ekosistem keselamatan kerja yang lebih aman di Indonesia melalui teknologi AI yang inovatif. Kami berkomitmen untuk mengurangi angka kecelakaan kerja dan meningkatkan kesadaran keselamatan di setiap industri.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/30 text-white">
                <Shield className="w-8 h-8 mb-3" />
                <h3 className="font-bold mb-2">Proteksi Maksimal</h3>
                <p className="text-sm text-emerald-100">Melindungi setiap pekerja dengan teknologi terdepan</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/30 text-white">
                <Target className="w-8 h-8 mb-3" />
                <h3 className="font-bold mb-2">Inovasi Berkelanjutan</h3>
                <p className="text-sm text-emerald-100">Terus mengembangkan solusi keselamatan yang lebih baik</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/30 text-white">
                <Users className="w-8 h-8 mb-3" />
                <h3 className="font-bold mb-2">Kesadaran Bersama</h3>
                <p className="text-sm text-emerald-100">Meningkatkan budaya keselamatan di industri Indonesia</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Siap Tingkatkan Keselamatan Kerja?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Bergabunglah dengan ribuan industri yang telah mempercayai SIMANTAP untuk monitoring keselamatan kerja mereka.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="/detection"
                className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300"
              >
                Mulai Detection Sekarang
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="/dashboard"
                className="inline-block bg-gray-100 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all duration-300"
              >
                Lihat Dashboard
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
