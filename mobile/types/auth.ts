export type UserRole = 'customer' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'blocked';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status?: UserStatus;
  addresses?: Array<{
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}

export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  isGuestMode: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forceLogout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  clearError: () => void;
  enableGuestMode: () => Promise<void>;
  requireAuth: () => boolean;
}
