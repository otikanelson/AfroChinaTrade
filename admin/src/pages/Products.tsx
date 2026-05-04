import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import Layout from '@/components/Layout'
import apiClient from '@/services/api'
import { Product } from '@/types'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/products')
        setProducts(response.data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
            <p className="text-neutral-600 mt-1">Manage your product catalog</p>
          </div>
          <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#C41E3A' }}>
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:border-red-700"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <span className="font-medium text-neutral-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">{product.category}</td>
                    <td className="px-6 py-4 font-medium text-neutral-900">₦{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-neutral-600">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : product.status === 'inactive'
                            ? 'bg-neutral-100 text-neutral-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-neutral-100 rounded transition-colors">
                          <Edit size={18} className="text-neutral-600" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded transition-colors">
                          <Trash2 size={18} className="text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
