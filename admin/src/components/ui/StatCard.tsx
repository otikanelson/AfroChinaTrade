import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  iconBg: string
  iconColor: string
  trend?: string
  trendUp?: boolean
}

export default function StatCard({ icon: Icon, label, value, iconBg, iconColor, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg hover:border-neutral-300 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBg} p-3.5 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon size={24} className={iconColor} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {trendUp ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              )}
            </svg>
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-neutral-900 tracking-tight">{value}</p>
      </div>
    </div>
  )
}
