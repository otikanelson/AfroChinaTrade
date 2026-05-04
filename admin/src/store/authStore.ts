import { create } from 'zustand'
import apiClient from '@/services/api'

interface User {
  id: string
  email: string
  name: string
  role: string
  isAdmin: boolean
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })

    const response = await apiClient.post('/auth/login', { email, password })

    if (!response.success || !response.data) {
      const message = response.error?.message || 'Login failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }

    const data = response.data
    const { token, userId, name, email: userEmail, role } = data

    if (!token) {
      const message = 'No token received from server'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }

    if (role !== 'admin') {
      const message = 'Access denied. Admin accounts only.'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }

    const user: User = { id: userId, email: userEmail, name, role, isAdmin: true }
    localStorage.setItem('authToken', token)
    set({ user, token, isLoading: false, error: null })
  },

  logout: () => {
    localStorage.removeItem('authToken')
    set({ user: null, token: null, error: null })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      set({ user: null, token: null })
      return
    }

    const response = await apiClient.get('/auth/me')

    if (!response.success || !response.data) {
      localStorage.removeItem('authToken')
      set({ user: null, token: null })
      return
    }

    const data = response.data
    const user: User = {
      id: data._id || data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      isAdmin: data.role === 'admin',
    }

    // If the stored token belongs to a non-admin, kick them out
    if (!user.isAdmin) {
      localStorage.removeItem('authToken')
      set({ user: null, token: null })
      return
    }

    set({ user, token })
  },
}))
