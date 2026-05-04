import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Login successful!')
      navigate('/')
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : (error as any)?.response?.data?.message ?? 'Login failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white"
        style={{ background: 'linear-gradient(160deg, #1B3A28 0%, #2D5F3F 50%, #8B0000 100%)' }}
      >
        <div>
          {/* Wordmark */}
          <span className="text-4xl font-bold tracking-tight">
            <span style={{ color: '#6EE7A0' }}>Afro</span>
            <span style={{ color: '#C41E3A' }}>China</span>
            <span style={{ color: '#FCD34D' }}>Trade</span>
          </span>
          <p className="mt-2 text-white/60 text-sm tracking-widest uppercase">Admin Dashboard</p>
        </div>

        <div className="space-y-6">
          <blockquote className="text-xl font-light leading-relaxed text-white/90">
            "Connecting Africa and China through seamless trade."
          </blockquote>
          <div className="flex gap-2">
            <div className="w-8 h-1 rounded-full" style={{ backgroundColor: '#C41E3A' }} />
            <div className="w-4 h-1 rounded-full bg-white/30" />
            <div className="w-4 h-1 rounded-full bg-white/30" />
          </div>
        </div>

        <p className="text-white/40 text-xs">© {new Date().getFullYear()} AfroChinaTrade. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50">
        <div className="w-full max-w-sm">
          {/* Mobile wordmark */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-3xl font-bold tracking-tight">
              <span style={{ color: '#2D5F3F' }}>Afro</span>
              <span style={{ color: '#C41E3A' }}>China</span>
              <span style={{ color: '#B8941E' }}>Trade</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Welcome back</h1>
          <p className="text-neutral-500 text-sm mb-8">Sign in to your admin account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:border-red-700 transition-colors"
                placeholder="admin@afrochinatrade.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:border-red-700 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#C41E3A' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-neutral-400 text-xs mt-8">
            Admin access only. Unauthorised access is prohibited.
          </p>
        </div>
      </div>
    </div>
  )
}
