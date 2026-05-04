import { useEffect, useState } from 'react'
import { Eye, Search } from 'lucide-react'
import Layout from '@/components/Layout'
import apiClient from '@/services/api'
import { Order } from '@/types'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/orders')
        setOrders(response.data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'shipped':
        return 'bg-blue-100 text-blue-700'
      case 'processing':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
        return 'bg-error/10 text-error'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Orders</h1>
          <p className="text-neutral-600 mt-1">Manage customer orders</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search orders..."
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Order #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium text-neutral-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-neutral-600">{order.userId}</td>
                    <td className="px-6 py-4 font-medium text-neutral-900">₦{order.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-neutral-100 rounded transition-colors">
                        <Eye size={18} style={{ color: '#C41E3A' }} />
                      </button>
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
