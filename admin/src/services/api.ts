import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'
import { API_BASE_URL, FALLBACK_API_URL, APP_CONFIG, CONNECTION_CONFIG } from '@/config'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: { code: string; message: string; details?: any }
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

// ── Client ────────────────────────────────────────────────────────────────────

class AdminApiClient {
  private client: AxiosInstance
  private readyPromise: Promise<void>

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: CONNECTION_CONFIG.timeout,
      headers: { 'Content-Type': 'application/json' },
    })

    this.setupInterceptors()
    // readyPromise resolves immediately — no probe needed.
    // Dev: Vite proxy forwards /api → localhost:3001 (same origin, no CORS).
    // Prod: API_BASE_URL is the full Vercel URL.
    this.readyPromise = Promise.resolve()

    if (APP_CONFIG.debug) {
      console.log(`✅ Admin API ready: ${APP_CONFIG.isProduction ? API_BASE_URL : '/api (Vite proxy → localhost:3001)'}`)
    }
  }

  private setupInterceptors() {
    // Attach auth token to every request
    this.client.interceptors.request.use(
      async (config) => {
        await this.readyPromise
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        } else {
          delete config.headers.Authorization
        }
        if (APP_CONFIG.debug) {
          console.log(`🚀 Admin API: ${config.method?.toUpperCase()} ${config.url}`)
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Handle responses and errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _fallbackRetry?: boolean
        }

        // In production only: retry unauthenticated requests on the fallback URL
        const isNetworkError = !error.response
        const isNotFallback = this.client.defaults.baseURL !== FALLBACK_API_URL
        const notYetRetried = !originalRequest._fallbackRetry
        const isAuthenticated = !!(originalRequest.headers as any)?.Authorization

        if (isNetworkError && isNotFallback && notYetRetried && !isAuthenticated && APP_CONFIG.isProduction) {
          originalRequest._fallbackRetry = true
          this.client.defaults.baseURL = FALLBACK_API_URL
          ;(originalRequest as any).baseURL = FALLBACK_API_URL
          return this.client(originalRequest)
        }

        // 401: clear token and redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken')
          window.location.href = '/login'
        }

        if (APP_CONFIG.debug) {
          console.error(`❌ Admin API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
          })
        }

        return Promise.reject(error)
      }
    )
  }

  // Transform MongoDB _id → id
  private transformData<T = any>(data: T): T {
    if (!data) return data
    if (Array.isArray(data)) return data.map((item) => this.transformData(item)) as T
    if (typeof data === 'object' && data !== null) {
      const out = { ...data } as any
      if (out._id && !out.id) out.id = out._id
      Object.keys(out).forEach((key) => {
        if (typeof out[key] === 'object' && out[key] !== null) {
          out[key] = this.transformData(out[key])
        }
      })
      return out as T
    }
    return data
  }

  private async makeRequest<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
    try {
      const response = await requestFn()
      const body = response.data as any

      if (body && typeof body === 'object') {
        if (body.status === 'success' || body.success === true) {
          return { success: true, data: this.transformData(body.data), pagination: body.pagination }
        }
        if (body.status === 'error') {
          return { success: false, error: { code: body.errorCode || 'API_ERROR', message: body.message || 'API request failed' } }
        }
      }

      return { success: true, data: this.transformData(response.data) }
    } catch (error: any) {
      const data = error.response?.data as any
      return {
        success: false,
        error: {
          code: data?.errorCode || data?.error?.code || 'UNKNOWN_ERROR',
          message: data?.message || data?.error?.message || error.message || 'An error occurred',
          details: data?.fields || data?.details,
        },
      }
    }
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.get(url, config))
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.post(url, data, config))
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.put(url, data, config))
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.patch(url, data, config))
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.delete(url, config))
  }

  async uploadFile<T = any>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => formData.append(key, value))
    }
    const token = localStorage.getItem('authToken')
    return this.makeRequest(() =>
      this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    )
  }
}

export const apiClient = new AdminApiClient()
export default apiClient
