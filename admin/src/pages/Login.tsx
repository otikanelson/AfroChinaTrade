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
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2D5F3F 0%, #1B3A28 50%, #8B0000 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          {/* Wordmark */}
          <div className="mb-3">
            <span className="text-5xl font-bold tracking-tight">
              <span style={{ color: '#6EE7A0' }}>Afro</span>
              <span style={{ color: '#FF6B7A' }}>China</span>
              <span style={{ color: '#FCD34D' }}>Trade</span>
            </span>
          </div>
          <p className="text-white/70 text-sm tracking-widest uppercase font-medium">Admin Dashboard</p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm">Manage Products & Orders</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm">Monitor Business Analytics</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-sm">Support Your Customers</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <blockquote className="text-xl font-light leading-relaxed text-white/95">
            "Connecting Africa and China through seamless trade."
          </blockquote>
          <div className="text-sm text-white/60">
            <p className="font-medium mb-1">🌍 Bridging Continents</p>
            <p>Empowering businesses across Africa with direct access to Chinese manufacturers</p>
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-1 rounded-full" style={{ backgroundColor: '#C41E3A' }} />
            <div className="w-6 h-1 rounded-full" style={{ backgroundColor: '#B8941E' }} />
            <div className="w-3 h-1 rounded-full bg-white/30" />
          </div>
        </div>

        <p className="text-white/40 text-xs relative z-10">© {new Date().getFullYear()} AfroChinaTrade. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <div className="w-full max-w-md">
          {/* Mobile wordmark */}
          <div className="lg:hidden mb-10 text-center">
            <span className="text-4xl font-bold tracking-tight">
              <span style={{ color: '#2D5F3F' }}>Afro</span>
              <span style={{ color: '#C41E3A' }}>China</span>
              <span style={{ color: '#B8941E' }}>Trade</span>
            </span>
            <p className="text-neutral-500 text-xs mt-2 uppercase tracking-widest">Admin Dashboard</p>
          </div>

          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: 'linear-gradient(135deg, #2D5F3F 0%, #C41E3A 100%)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back</h1>
              <p className="text-neutral-500 text-sm">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 text-sm border-2 border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="admin@afrochinatrade.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 text-sm border-2 border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] mt-6"
                style={{ backgroundColor: '#C41E3A' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
              <p className="text-neutral-400 text-xs">
                🔒 Admin access only. Unauthorised access is prohibited.
              </p>
            </div>
          </div>

          {/* Features badges */}
          <div className="mt-6 flex justify-center gap-6 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure Login
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Fast Access
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Protected
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
