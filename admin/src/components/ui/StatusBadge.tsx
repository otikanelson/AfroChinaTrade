interface StatusBadgeProps {
  status: string
  type?: 'order' | 'product' | 'user' | 'refund' | 'review' | 'default'
}

const orderColors: Record<string, string> = {
  delivered:  'bg-green-100 text-green-700',
  shipped:    'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  pending:    'bg-orange-100 text-orange-700',
  cancelled:  'bg-red-100 text-red-700',
}

const productColors: Record<string, string> = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-neutral-100 text-neutral-600',
  draft:    'bg-yellow-100 text-yellow-700',
}

const userColors: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  inactive:  'bg-neutral-100 text-neutral-600',
  suspended: 'bg-red-100 text-red-700',
}

const refundColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
}

const reviewColors: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

const roleColors: Record<string, string> = {
  admin:    'bg-red-100 text-red-700',
  seller:   'bg-blue-100 text-blue-700',
  customer: 'bg-neutral-100 text-neutral-600',
}

function getColor(status: string, type: StatusBadgeProps['type']): string {
  const map =
    type === 'order'   ? orderColors :
    type === 'product' ? productColors :
    type === 'user'    ? userColors :
    type === 'refund'  ? refundColors :
    type === 'review'  ? reviewColors :
    roleColors

  return map[status] ?? 'bg-neutral-100 text-neutral-600'
}

export default function StatusBadge({ status, type = 'default' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getColor(status, type)}`}>
      {status}
    </span>
  )
}
