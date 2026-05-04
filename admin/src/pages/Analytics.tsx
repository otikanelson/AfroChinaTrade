import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react'
import Layout from '@/components/Layout'
import StatCard from '@/components/ui/StatCard'
import apiClient from '@/services/api'
import { Analytics } from '@/types'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/admin/analytics')
      .then((r) => setAnalytics(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-neutral-500">Loading analytics...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Analytics</h1>
          <p className="text-neutral-600 mt-1">Detailed business metrics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={BarChart3}
            label="Total Orders"
            value={analytics?.totalOrders ?? 0}
            iconBg="bg-red-50"
            iconColor="text-red-700"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Revenue"
            value={`₦${(analytics?.totalRevenue ?? 0).toLocaleString()}`}
            iconBg="bg-green-50"
            iconColor="text-green-700"
          />
          <StatCard
            icon={Users}
            label="Total Users"
            value={analytics?.totalUsers ?? 0}
            iconBg="bg-yellow-50"
            iconColor="text-yellow-700"
          />
          <StatCard
            icon={Package}
            label="Total Products"
            value={analytics?.totalProducts ?? 0}
            iconBg="bg-blue-50"
            iconColor="text-blue-700"
          />
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Trend */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Orders Trend</h2>
            <div className="space-y-3">
              {analytics?.ordersTrend.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-neutral-600 text-sm">{item.date}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.count / Math.max(...(analytics?.ordersTrend.map((t) => t.count) || [1]))) * 100}%`,
                          backgroundColor: '#C41E3A',
                        }}
                      />
                    </div>
                    <span className="text-neutral-900 font-medium w-12 text-right text-sm">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Revenue Trend</h2>
            <div className="space-y-3">
              {analytics?.revenueTrend.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-neutral-600 text-sm">{item.date}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.amount / Math.max(...(analytics?.revenueTrend.map((t) => t.amount) || [1]))) * 100}%`,
                          backgroundColor: '#2D5F3F',
                        }}
                      />
                    </div>
                    <span className="text-neutral-900 font-medium w-20 text-right text-sm">
                      ₦{(item.amount / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
