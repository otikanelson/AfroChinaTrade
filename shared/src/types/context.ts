// Context State Types

import { User, Admin, CartItem } from './entities';

export interface AuthState {
  user: User | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface FavoritesState {
  productIds: string[];
}
