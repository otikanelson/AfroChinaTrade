import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import Layout from '@/components/Layout'
import apiClient from '@/services/api'
import { Category } from '@/types'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories')
        setCategories(response.data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Categories</h1>
            <p className="text-neutral-600 mt-1">Manage product categories</p>
          </div>
          <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#C41E3A' }}>
            <Plus size={20} />
            Add Category
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:border-red-700"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-neutral-500">Loading...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="col-span-full text-center py-8 text-neutral-500">No categories found</div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg border border-neutral-200 p-6">
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold text-neutral-900">{category.name}</h3>
                <p className="text-neutral-600 text-sm mt-1">{category.description}</p>
                <p className="text-neutral-500 text-sm mt-3">{category.productCount} products</p>
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                    <Edit size={18} />
                    Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-error/20 text-error rounded-lg hover:bg-error/5 transition-colors">
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
