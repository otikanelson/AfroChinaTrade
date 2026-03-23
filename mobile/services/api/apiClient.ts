import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '../../constants/config';
import { tokenManager } from './tokenManager';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status?: number;
}

class SimpleApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private onTokenExpiredCallback: (() => void) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupTokenExpiryListeners();
  }

  private setupTokenExpiryListeners() {
    // Listen for token expiry warnings
    tokenManager.onExpiryWarning((secondsRemaining) => {
      console.warn(`⏰ Token expiring in ${secondsRemaining} seconds. Attempting refresh...`);
      this.refreshAccessToken();
    });

    // Listen for token expiry
    tokenManager.onTokenExpired(() => {
      console.error('🔴 Token expired. User needs to re-authenticate.');
      if (this.onTokenExpiredCallback) {
        this.onTokenExpiredCallback();
      }
    });
  }

  setOnTokenExpired(callback: () => void) {
    this.onTokenExpiredCallback = callback;
  }

  private subscribeToTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.subscribeToTokenRefresh(() => {
          resolve(true);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        console.error('❌ No refresh token available');
        await tokenManager.clearTokens();
        return false;
      }

      const response = await this.client.post('/auth/refresh', { refreshToken });
      const { data } = response;

      if (data.status === 'success' && data.data?.token) {
        const newAccessToken = data.data.token;
        await tokenManager.setTokens(newAccessToken, refreshToken);
        console.log('✅ Token refreshed successfully');
        this.onRefreshed(newAccessToken);
        this.isRefreshing = false;
        return true;
      } else {
        console.error('❌ Token refresh failed:', data.message);
        await tokenManager.clearTokens();
        this.isRefreshing = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      await tokenManager.clearTokens();
      this.isRefreshing = false;
      return false;
    }
  }

  private setupInterceptors() {
    // Request interceptor - add token to requests
    this.client.interceptors.request.use(
      async (config) => {
        const token = await tokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // Ensure no Authorization header is sent for guest users
          delete config.headers.Authorization;
        }

        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle responses and errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (__DEV__) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
          });
        }

        // If 401 error and not already retried, attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const errorData = error.response?.data as any;
          const errorCode = errorData?.errorCode || errorData?.data?.errorCode;

          // Only attempt refresh if token expired, not for other auth errors
          if (errorCode === 'TOKEN_EXPIRED') {
            console.log('🔄 Attempting to refresh token...');
            const refreshed = await this.refreshAccessToken();

            if (refreshed) {
              // Retry original request with new token
              const newToken = await tokenManager.getAccessToken();
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.client(originalRequest);
              }
            }
          }

          // If refresh failed or other auth error, clear tokens
          console.warn('🔒 Authentication failed, clearing tokens');
          await tokenManager.clearTokens();
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError): ApiError {
    const response = error.response;
    
    if (response?.data && typeof response.data === 'object') {
      const errorData = response.data as any;
      
      return {
        code: errorData.errorCode || errorData.error?.code || 'API_ERROR',
        message: errorData.message || errorData.error?.message || error.message,
        details: errorData.fields || errorData.details || errorData.error?.details,
        status: response.status,
      };
    }

    // Network errors
    if (error.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'Request timeout. Please check your internet connection.',
        status: 0,
      };
    }

    if (!error.response) {
      console.error('🌐 Network Error Details:', {
        code: error.code,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        }
      });
      
      return {
        code: 'NETWORK_ERROR',
        message: `Unable to connect to server at ${error.config?.baseURL || 'unknown URL'}. Please check your internet connection and ensure the backend server is running.`,
        status: 0,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      status: response?.status || 0,
    };
  }

  // Transform MongoDB _id to id for frontend
  private transformData<T = any>(data: T): T {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map(item => this.transformData(item)) as T;
    }

    if (typeof data === 'object' && data !== null) {
      const transformed = { ...data } as any;
      
      // Transform _id to id
      if (transformed._id && !transformed.id) {
        transformed.id = transformed._id;
      }

      // Transform nested objects
      Object.keys(transformed).forEach(key => {
        if (typeof transformed[key] === 'object' && transformed[key] !== null) {
          transformed[key] = this.transformData(transformed[key]);
        }
      });

      return transformed as T;
    }

    return data;
  }

  private async makeRequest<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
    try {
      const response = await requestFn();
      const backendResponse = response.data as any;
      
      // Handle backend response format
      if (backendResponse && typeof backendResponse === 'object') {
        if (backendResponse.status === 'success' || backendResponse.success === true) {
          return {
            success: true,
            data: this.transformData(backendResponse.data),
            pagination: backendResponse.pagination
          };
        } else if (backendResponse.status === 'error') {
          return {
            success: false,
            error: {
              code: backendResponse.errorCode || 'API_ERROR',
              message: backendResponse.message || 'API request failed'
            }
          };
        }
      }
      
      // Direct data response
      return {
        success: true,
        data: this.transformData(response.data)
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        error: {
          code: apiError.code || 'UNKNOWN_ERROR',
          message: apiError.message || 'An error occurred',
          details: apiError.details
        }
      };
    }
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.get(url, config));
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.post(url, data, config));
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.put(url, data, config));
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.patch(url, data, config));
  }

  async delete<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.delete(url, { ...config, data }));
  }

  async uploadFile<T = any>(
    url: string, 
    file: { uri: string; type: string; name: string }, 
    additionalData?: Record<string, any>,
    fieldName: string = 'file'
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    formData.append(fieldName, {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    return this.makeRequest(() => this.client.post(url, formData, config));
  }

  // Test connection to the backend
  async testConnection(): Promise<ApiResponse<any>> {
    console.log('🔍 Testing connection to:', this.client.defaults.baseURL);
    return this.makeRequest(() => this.client.get('/health'));
  }
}

export const apiClient = new SimpleApiClient();
export default apiClient;