'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { api, APDItem } from '@/services/api'
import { Plus, AlertCircle } from 'lucide-react'

export default function APDPage() {
  const [apdItems, setApdItems] = useState<APDItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load categories
      const categoriesResponse = await api.apd.getCategories()
      setCategories(categoriesResponse.data)

      // Load all APD items
      const itemsResponse = await api.apd.getAll()
      setApdItems(itemsResponse.data)
    } catch (err) {
      console.error('Error loading APD data:', err)
      setError('Gagal memuat data APD. Pastikan backend running di http://localhost:8000')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = selectedCategory
    ? apdItems.filter(item => item.category === selectedCategory)
    : apdItems

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Helmet: 'bg-red-100 text-red-800 border-red-300',
      Vest: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Shoes: 'bg-blue-100 text-blue-800 border-blue-300',
      Gloves: 'bg-purple-100 text-purple-800 border-purple-300',
      'Face Shield': 'bg-pink-100 text-pink-800 border-pink-300',
      Respirator: 'bg-green-100 text-green-800 border-green-300'
    }
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Alat Pelindung Diri (APD)
            </h1>
            <p className="text-xl text-gray-600">
              Katalog lengkap APD dan panduan penggunaan untuk keselamatan kerja
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Category Filter */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategori</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === null
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-600'
                    }`}
                  >
                    Semua ({apdItems.length})
                  </button>
                  {categories.map(category => {
                    const count = apdItems.filter(item => item.category === category).length
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedCategory === category
                            ? `${getCategoryColor(category)} border`
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-600'
                        }`}
                      >
                        {category} ({count})
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Items Grid */}
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <div
                      key={item.item_id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                    >
                      {/* Category Badge */}
                      <div className={`px-4 py-2 border-b ${getCategoryColor(item.category)}`}>
                        <span className="text-sm font-semibold">{item.category}</span>
                      </div>

                      {/* Item Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {item.item_name}
                        </h3>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-4">
                            {item.description}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200 my-4">
                          <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase">
                              Sampel Training
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {item.training_samples || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase">
                              Akurasi
                            </p>
                            <p className="text-2xl font-bold text-emerald-600">
                              {((item.accuracy || 0) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="text-xs text-gray-500">
                          {item.created_at && (
                            <p>
                              Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 text-lg">
                    {selectedCategory ? `Tidak ada APD di kategori ${selectedCategory}` : 'Tidak ada data APD'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
