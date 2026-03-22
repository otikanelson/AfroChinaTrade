import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { tokenManager } from '../services/api/tokenManager';
import { API_BASE_URL } from '../constants/config';

interface WishlistItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
    supplierId?: {
      _id: string;
      name: string;
      email: string;
      verified: boolean;
      rating: number;
      location: string;
      responseTime: string;
    };
  };
  addedAt: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const wishlistCount = wishlist.length;

  useEffect(() => {
    if (user) {
      refreshWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const refreshWishlist = async () => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setWishlist(data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.productId._id === productId);
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    const token = await tokenManager.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      if (data.success) {
        setWishlist(prev => [...prev, data.data]);
        return true;
      } else {
        console.error('Add to wishlist error:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    const token = await tokenManager.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setWishlist(prev => prev.filter(item => item.productId._id !== productId));
        return true;
      } else {
        console.error('Remove from wishlist error:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const clearWishlist = async (): Promise<boolean> => {
    const token = await tokenManager.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setWishlist([]);
        return true;
      } else {
        console.error('Clear wishlist error:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }
  };

  const value: WishlistContextType = {
    wishlist,
    wishlistCount,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};