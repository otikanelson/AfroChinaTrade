import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: '#C41E3A' }}>404</h1>
        <p className="text-2xl font-semibold text-neutral-900 mb-2">Page not found</p>
        <p className="text-neutral-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#C41E3A' }}
        >
          <Home size={20} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
