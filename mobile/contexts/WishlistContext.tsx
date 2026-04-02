import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { tokenManager } from '../services/api/tokenManager';
import { productService } from '../services/ProductService';
import { API_BASE_URL } from '../constants/config';

interface WishlistItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    discount?: number;
    reviewCount?: number;
    viewCount?: number;
    images: string[];
    category: string;
    stock: number;
    supplier?: {
      _id: string;
      name: string;
      email: string;
      verified: boolean;
      rating: number;
      location: string;
      responseTime: string;
      logo?: string;
    };
    supplierId?: {
      _id: string;
      name: string;
      email: string;
      verified: boolean;
      rating: number;
      location: string;
      responseTime: string;
      logo?: string;
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
  loadGuestWishlistProducts: () => Promise<void>;
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
  const { user, isGuestMode } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [guestWishlist, setGuestWishlist] = useState<string[]>([]); // Store only product IDs for guests

  const GUEST_WISHLIST_KEY = '@afrochinatrade:guest_wishlist';

  // Load guest wishlist from storage on mount
  useEffect(() => {
    loadGuestWishlist();
  }, []);

  const loadGuestWishlist = async () => {
    try {
      const storedGuestWishlist = await AsyncStorage.getItem(GUEST_WISHLIST_KEY);
      if (storedGuestWishlist) {
        const parsedWishlist = JSON.parse(storedGuestWishlist);
        setGuestWishlist(parsedWishlist);
      }
    } catch (error) {
      console.error('Error loading guest wishlist:', error);
    }
  };

  const saveGuestWishlist = async (wishlistData: string[]) => {
    try {
      await AsyncStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlistData));
    } catch (error) {
      console.error('Error saving guest wishlist:', error);
    }
  };

  const wishlistCount = isGuestMode ? guestWishlist.length : wishlist.length;

  useEffect(() => {
    if (user) {
      // Transfer guest wishlist items to authenticated wishlist if any exist
      if (guestWishlist.length > 0) {
        transferGuestWishlistToAuthenticated();
      } else {
        refreshWishlist();
      }
    } else if (isGuestMode) {
      // Load guest wishlist products for display
      loadGuestWishlistProducts();
    } else {
      setWishlist([]);
    }
  }, [user, isGuestMode]);

  // Function to load product details for guest wishlist items
  const loadGuestWishlistProducts = async () => {
    if (guestWishlist.length === 0) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const wishlistItems: WishlistItem[] = [];
      
      for (const productId of guestWishlist) {
        try {
          const response = await productService.getProductById(productId);
          if (response.success && response.data) {
            const product = response.data;
            wishlistItems.push({
              _id: `guest-${productId}`,
              productId: {
                _id: product.id,
                name: product.name,
                price: product.price,
                discount: product.discount,
                reviewCount: product.reviewCount,
                viewCount: product.viewCount,
                images: product.images || [],
                category: product.category,
                stock: product.stock,
                supplier: (typeof product.supplier === 'object' && product.supplier?._id) ? product.supplier as any : undefined,
                supplierId: (typeof product.supplierId === 'object' && product.supplierId?._id) ? product.supplierId as any : undefined,
              },
              addedAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error(`Error loading product ${productId}:`, error);
        }
      }
      
      setWishlist(wishlistItems);
    } catch (error) {
      console.error('Error loading guest wishlist products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to transfer guest wishlist items to authenticated wishlist
  const transferGuestWishlistToAuthenticated = async () => {
    if (guestWishlist.length === 0) {
      refreshWishlist();
      return;
    }

    try {
      // Add each guest wishlist item to the authenticated wishlist
      for (const productId of guestWishlist) {
        await addToWishlist(productId);
      }
      
      // Clear guest wishlist after successful transfer
      setGuestWishlist([]);
      await saveGuestWishlist([]);
      
      // Refresh to get the updated wishlist from server
      refreshWishlist();
    } catch (error) {
      console.error('Error transferring guest wishlist:', error);
      // If transfer fails, just refresh the wishlist
      refreshWishlist();
    }
  };

  const refreshWishlist = async () => {
    // Handle guest mode - reload guest wishlist products
    if (isGuestMode) {
      await loadGuestWishlistProducts();
      return;
    }

    // Authenticated user logic
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
    if (isGuestMode) {
      return guestWishlist.includes(productId);
    }
    return wishlist.some(item => item.productId._id === productId);
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    // Handle guest mode - store in local state only
    if (isGuestMode) {
      if (!guestWishlist.includes(productId)) {
        const updatedGuestWishlist = [...guestWishlist, productId];
        setGuestWishlist(updatedGuestWishlist);
        await saveGuestWishlist(updatedGuestWishlist);
        
        // Fetch and add the product to display wishlist
        try {
          const response = await productService.getProductById(productId);
          if (response.success && response.data) {
            const product = response.data;
            const newWishlistItem: WishlistItem = {
              _id: `guest-${productId}`,
              productId: {
                _id: product.id,
                name: product.name,
                price: product.price,
                discount: product.discount,
                reviewCount: product.reviewCount,
                viewCount: product.viewCount,
                images: product.images || [],
                category: product.category,
                stock: product.stock,
                supplier: (typeof product.supplier === 'object' && product.supplier?._id) ? product.supplier as any : undefined,
                supplierId: (typeof product.supplierId === 'object' && product.supplierId?._id) ? product.supplierId as any : undefined,
              },
              addedAt: new Date().toISOString(),
            };
            setWishlist(prev => [...prev, newWishlistItem]);
          }
        } catch (error) {
          console.error('Error fetching product details for wishlist:', error);
        }
      }
      return true;
    }

    // Authenticated user logic
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
    // Handle guest mode - remove from local state only
    if (isGuestMode) {
      const updatedGuestWishlist = guestWishlist.filter(id => id !== productId);
      setGuestWishlist(updatedGuestWishlist);
      await saveGuestWishlist(updatedGuestWishlist);
      
      // Update the display wishlist as well
      setWishlist(prev => prev.filter(item => item.productId._id !== productId));
      
      return true;
    }

    // Authenticated user logic
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
    // Handle guest mode - clear local state only
    if (isGuestMode) {
      setGuestWishlist([]);
      setWishlist([]);
      await saveGuestWishlist([]);
      return true;
    }

    // Authenticated user logic
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
    loadGuestWishlistProducts,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};