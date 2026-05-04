import { Bell, User, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function Header() {
  const { user } = useAuthStore()

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Notifications */}
          <button className="relative text-neutral-600 hover:text-primary transition-colors">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full" />
          </button>

          {/* User menu */}
          <div className="flex items-center gap-3 pl-6 border-l border-neutral-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
              <p className="text-xs text-neutral-500">{user?.role}</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
