import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Zap,
  Tag,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Tag, label: 'Categories', path: '/categories' },
  { icon: FileText, label: 'Reviews', path: '/reviews' },
  { icon: AlertCircle, label: 'Refunds', path: '/refunds' },
  { icon: Zap, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-white p-2 rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-neutral-900 text-white transition-transform duration-300 z-40 flex flex-col lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            {/* Brand wordmark matching mobile app */}
            <span className="text-2xl font-bold tracking-tight">
              <span style={{ color: '#2D5F3F' }}>Afro</span>
              <span style={{ color: '#C41E3A' }}>China</span>
              <span style={{ color: '#B8941E' }}>Trade</span>
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 tracking-wide uppercase">Admin Dashboard</p>
        </div>

        {/* User info */}
        {user && (
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
              style={{ backgroundColor: '#C41E3A' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      isActive
                        ? 'text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                    style={isActive ? { backgroundColor: '#C41E3A' } : {}}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
