export type AccountType = 'customer' | 'seller';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  accountType: AccountType;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSeller: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}
