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
      trend: '+12.5%',
      trendUp: true,
    },
    {
      icon: TrendingUp,
      label: 'Total Revenue',
      value: loading ? '—' : `₦${(analytics?.totalRevenue ?? 0).toLocaleString()}`,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-700',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      icon: Users,
      label: 'Total Users',
      value: loading ? '—' : (analytics?.totalUsers ?? 0).toLocaleString(),
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-700',
      trend: '+5.1%',
      trendUp: true,
    },
    {
      icon: Package,
      label: 'Total Products',
      value: loading ? '—' : (analytics?.totalProducts ?? 0).toLocaleString(),
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-700',
      trend: '+2.3%',
      trendUp: false,
    },
  ]

  const recentOrders = [
    { id: '#ORD-1042', customer: 'Amara Osei', amount: '₦24,500', status: 'delivered', time: '2 mins ago' },
    { id: '#ORD-1041', customer: 'Liu Wei',    amount: '₦8,200',  status: 'processing', time: '15 mins ago' },
    { id: '#ORD-1040', customer: 'Fatima Bello', amount: '₦61,000', status: 'shipped', time: '1 hour ago' },
    { id: '#ORD-1039', customer: 'Chidi Eze',  amount: '₦3,750',  status: 'pending', time: '2 hours ago' },
    { id: '#ORD-1038', customer: 'Ngozi Adeyemi', amount: '₦15,900', status: 'cancelled', time: '3 hours ago' },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header with welcome message */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-sm text-neutral-500 mt-1">Welcome back — here's your business overview for today.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </span>
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#C41E3A' }}>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Order
              </span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders — 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div>
                <h2 className="font-semibold text-neutral-900 text-lg">Recent Orders</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Latest customer orders from your store</p>
              </div>
              <a href="/orders" className="text-xs font-semibold hover:underline flex items-center gap-1" style={{ color: '#C41E3A' }}>
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="divide-y divide-neutral-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C41E3A15' }}>
                      <ShoppingCart size={18} style={{ color: '#C41E3A' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 group-hover:text-primary transition-colors">{order.id}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{order.customer} • {order.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-neutral-900">{order.amount}</span>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar — 1/3 width */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
              <h2 className="font-semibold text-neutral-900 mb-4 text-lg">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Add New Product', href: '/products', icon: Package, color: '#C41E3A', bg: '#C41E3A15' },
                  { label: 'View Refunds',    href: '/refunds',  icon: AlertCircle, color: '#2D5F3F', bg: '#2D5F3F15' },
                  { label: 'Moderate Reviews', href: '/reviews', icon: FileText, color: '#B8941E', bg: '#B8941E15' },
                  { label: 'Manage Users',    href: '/users',    icon: Users, color: '#1d4ed8', bg: '#1d4ed815' },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <a
                      key={action.href}
                      href={action.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 transition-all group border border-transparent hover:border-neutral-200"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: action.bg }}>
                        <Icon size={18} style={{ color: action.color }} />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">
                        {action.label}
                      </span>
                      <svg className="w-4 h-4 ml-auto text-neutral-300 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Revenue trend */}
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Revenue Trend</h2>
                <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +12.5%
                </div>
              </div>
              <div className="flex items-end gap-1 h-24 mb-3">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                    style={{ 
                      height: `${h}%`, 
                      backgroundColor: i === 5 ? '#FFF' : 'rgba(255,255,255,0.3)'
                    }} />
                ))}
              </div>
              <p className="text-xs text-white/70">Last 7 days performance</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
