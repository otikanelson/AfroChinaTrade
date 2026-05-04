import { useEffect, useState } from 'react'
import { TrendingUp, Users, Package, ShoppingCart, AlertCircle, FileText } from 'lucide-react'
import Layout from '@/components/Layout'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import apiClient from '@/services/api'
import { Analytics } from '@/types'

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/admin/analytics')
      .then((r) => setAnalytics(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    {
      icon: ShoppingCart,
      label: 'Total Orders',
      value: loading ? '—' : (analytics?.totalOrders ?? 0).toLocaleString(),
      iconBg: 'bg-red-50',
      iconColor: 'text-red-700',
    },
    {
      icon: TrendingUp,
      label: 'Total Revenue',
      value: loading ? '—' : `₦${(analytics?.totalRevenue ?? 0).toLocaleString()}`,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-700',
    },
    {
      icon: Users,
      label: 'Total Users',
      value: loading ? '—' : (analytics?.totalUsers ?? 0).toLocaleString(),
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-700',
    },
    {
      icon: Package,
      label: 'Total Products',
      value: loading ? '—' : (analytics?.totalProducts ?? 0).toLocaleString(),
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-700',
    },
  ]

  const recentOrders = [
    { id: '#ORD-1042', customer: 'Amara Osei', amount: '₦24,500', status: 'delivered' },
    { id: '#ORD-1041', customer: 'Liu Wei',    amount: '₦8,200',  status: 'processing' },
    { id: '#ORD-1040', customer: 'Fatima Bello', amount: '₦61,000', status: 'shipped' },
    { id: '#ORD-1039', customer: 'Chidi Eze',  amount: '₦3,750',  status: 'pending' },
    { id: '#ORD-1038', customer: 'Ngozi Adeyemi', amount: '₦15,900', status: 'cancelled' },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Welcome back — here's your business overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders — 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900">Recent Orders</h2>
              <a href="/orders" className="text-xs font-medium hover:underline" style={{ color: '#C41E3A' }}>
                View all →
              </a>
            </div>
            <div className="divide-y divide-neutral-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{order.id}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{order.customer}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-neutral-900">{order.amount}</span>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions — 1/3 width */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold text-neutral-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Add New Product', href: '/products', icon: Package, color: '#C41E3A' },
                  { label: 'View Refunds',    href: '/refunds',  icon: AlertCircle, color: '#2D5F3F' },
                  { label: 'Moderate Reviews', href: '/reviews', icon: FileText, color: '#B8941E' },
                  { label: 'Manage Users',    href: '/users',    icon: Users, color: '#1d4ed8' },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <a
                      key={action.href}
                      href={action.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${action.color}15` }}>
                        <Icon size={16} style={{ color: action.color }} />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">
                        {action.label}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Revenue trend mini */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold text-neutral-900 mb-3">Revenue Trend</h2>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm transition-all"
                    style={{ height: `${h}%`, backgroundColor: i === 5 ? '#C41E3A' : '#C41E3A30' }} />
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-2">Last 7 days</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
