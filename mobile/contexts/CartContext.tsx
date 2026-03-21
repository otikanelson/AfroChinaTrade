import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { tokenManager } from '../services/api/tokenManager';
import { API_BASE_URL } from '../constants/config';

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  price: number;
  selectedVariant?: {
    size?: string;
    color?: string;
    style?: string;
  };
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, selectedVariant?: any) => Promise<boolean>;
  removeFromCart: (productId: string, selectedVariant?: any) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number, selectedVariant?: any) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const cartCount = cart?.totalItems || 0;

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const refreshCart = async () => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (
    productId: string, 
    quantity: number = 1, 
    selectedVariant?: any
  ): Promise<boolean> => {
    try {
      // Initialize token manager if needed
      await tokenManager.initialize();
      
      const token = await tokenManager.getAccessToken();
      if (!token) {
        console.error('No access token available for cart operation');
        console.log('User authentication status:', !!user);
        return false;
      }

      console.log('Adding to cart:', { productId, quantity, selectedVariant });
      console.log('Using token:', token ? 'Token available' : 'No token');
      console.log('API URL:', `${API_BASE_URL}/cart`);
      
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          selectedVariant,
        }),
      });

      console.log('Cart API response status:', response.status);
      const data = await response.json();
      console.log('Cart API response data:', data);
      
      if (data.success) {
        setCart(data.data);
        return true;
      } else {
        console.error('Add to cart error:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (
    productId: string, 
    selectedVariant?: any
  ): Promise<boolean> => {
    const token = await tokenManager.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedVariant }),
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        return true;
      } else {
        console.error('Remove from cart error:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const updateQuantity = async (
    productId: string, 
    quantity: number, 
    selectedVariant?: any
  ): Promise<boolean> => {
    const token = await tokenManager.getAccessToken();
    if (!token || quantity < 1) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, selectedVariant }),
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        return true;
      } else {
        console.error('Update cart error:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    const token = await tokenManager.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        return true;
      } else {
        console.error('Clear cart error:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const value: CartContextType = {
    cart,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};