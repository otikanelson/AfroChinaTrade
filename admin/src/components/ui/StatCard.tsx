import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  iconBg: string
  iconColor: string
  trend?: { value: number; label: string }
}

export default function StatCard({ icon: Icon, label, value, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1.5 truncate">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`${iconBg} p-3 rounded-xl flex-shrink-0 ml-3`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </div>
  )
}
