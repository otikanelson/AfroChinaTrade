import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { tokenManager } from '../services/api/tokenManager';
import { productService } from '../services/ProductService';
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
  addToCart: (productId: string, quantity?: number, selectedVariant?: any, productData?: { name: string; price: number; images: string[] }) => Promise<boolean>;
  removeFromCart: (productId: string, selectedVariant?: any) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number, selectedVariant?: any) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
  isOperationPending: (productId: string) => boolean;
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
  const { user, isGuestMode } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const [guestCart, setGuestCart] = useState<Cart>({
    _id: 'guest-cart',
    items: [],
    totalItems: 0,
    totalAmount: 0
  });

  const GUEST_CART_KEY = '@afrochinatrade:guest_cart';

  // Load guest cart from storage on mount
  useEffect(() => {
    loadGuestCart();
  }, []);

  const loadGuestCart = async () => {
    try {
      const storedGuestCart = await AsyncStorage.getItem(GUEST_CART_KEY);
      if (storedGuestCart) {
        const parsedCart = JSON.parse(storedGuestCart);
        setGuestCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading guest cart:', error);
    }
  };

  const saveGuestCart = async (cartData: Cart) => {
    try {
      await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const cartCount = isGuestMode ? guestCart.totalItems : (cart?.totalItems || 0);

  useEffect(() => {
    if (user) {
      // Transfer guest cart items to authenticated cart if any exist
      if (guestCart.items.length > 0) {
        transferGuestCartToAuthenticated();
      } else {
        refreshCart();
      }
    } else if (isGuestMode) {
      setCart(guestCart);
    } else {
      setCart(null);
    }
  }, [user, isGuestMode]);

  // Function to transfer guest cart items to authenticated cart
  const transferGuestCartToAuthenticated = async () => {
    if (guestCart.items.length === 0) {
      refreshCart();
      return;
    }

    try {
      // Add each guest cart item to the authenticated cart
      for (const item of guestCart.items) {
        await addToCart(item.productId._id, item.quantity, item.selectedVariant);
      }
      
      // Clear guest cart after successful transfer
      const clearedCart = {
        _id: 'guest-cart',
        items: [],
        totalItems: 0,
        totalAmount: 0
      };
      setGuestCart(clearedCart);
      await saveGuestCart(clearedCart);
      
      // Refresh to get the updated cart from server
      refreshCart();
    } catch (error) {
      console.error('Error transferring guest cart:', error);
      // If transfer fails, just refresh the cart
      refreshCart();
    }
  };

  const isOperationPending = (productId: string): boolean => {
    return pendingOperations.has(productId);
  };

  const addPendingOperation = (productId: string) => {
    setPendingOperations(prev => new Set(prev).add(productId));
  };

  const removePendingOperation = (productId: string) => {
    setPendingOperations(prev => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

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

  // Function to fetch product details for guest cart items
  const fetchProductDetails = async (productId: string) => {
    try {
      const response = await productService.getProductById(productId);
      if (response.success && response.data) {
        return {
          _id: response.data.id,
          name: response.data.name,
          price: response.data.price,
          images: response.data.images || []
        };
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
    return null;
  };

  const addToCart = async (
    productId: string, 
    quantity: number = 1, 
    selectedVariant?: any,
    productData?: { name: string; price: number; images: string[] }
  ): Promise<boolean> => {
    try {
      // Handle guest mode - store in local state only
      if (isGuestMode) {
        const updatedGuestCart = { ...guestCart };
        
        // Check if item already exists
        const existingItemIndex = updatedGuestCart.items.findIndex(item => 
          item.productId._id === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          updatedGuestCart.items[existingItemIndex] = {
            ...updatedGuestCart.items[existingItemIndex],
            quantity: updatedGuestCart.items[existingItemIndex].quantity + quantity
          };
        } else {
          // Use provided product data or fetch from API
          const productInfo = productData || await fetchProductDetails(productId) || {
            _id: productId,
            name: 'Product',
            price: 0,
            images: []
          };

          // Add new item with actual product data
          updatedGuestCart.items.push({
            _id: `guest-${Date.now()}`,
            productId: {
              _id: productId,
              name: productInfo.name,
              price: productInfo.price,
              images: productInfo.images
            },
            quantity,
            price: productInfo.price,
            selectedVariant
          });
        }
        
        updatedGuestCart.totalItems = updatedGuestCart.items.reduce((sum, item) => sum + item.quantity, 0);
        updatedGuestCart.totalAmount = updatedGuestCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setGuestCart(updatedGuestCart);
        setCart(updatedGuestCart);
        await saveGuestCart(updatedGuestCart);
        return true;
      }

      // Authenticated user logic (existing code)
      // Optimistic update - update UI immediately
      const previousCart = cart;
      
      if (cart) {
        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(item => 
          item.productId._id === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
        );

        const updatedCart = { ...cart };
        
        if (existingItemIndex >= 0) {
          // Update existing item
          updatedCart.items[existingItemIndex] = {
            ...updatedCart.items[existingItemIndex],
            quantity: updatedCart.items[existingItemIndex].quantity + quantity
          };
        } else {
          // Add new item with actual product data if available
          const productInfo = productData || {
            name: 'Loading...',
            price: 0,
            images: []
          };
          
          updatedCart.items.push({
            _id: `temp-${Date.now()}`,
            productId: {
              _id: productId,
              name: productInfo.name,
              price: productInfo.price,
              images: productInfo.images
            },
            quantity,
            price: productInfo.price,
            selectedVariant
          });
        }
        
        updatedCart.totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
        updatedCart.totalAmount = updatedCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setCart(updatedCart);
      }

      addPendingOperation(productId);

      // Send request in background
      await tokenManager.initialize();
      const token = await tokenManager.getAccessToken();
      
      if (!token) {
        console.error('No access token available for cart operation');
        setCart(previousCart);
        removePendingOperation(productId);
        return false;
      }

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

      const data = await response.json();
      
      if (data.success) {
        // Update with server response to get accurate data
        setCart(data.data);
        removePendingOperation(productId);
        return true;
      } else {
        console.error('Add to cart error:', data.message);
        // Rollback on error
        setCart(previousCart);
        removePendingOperation(productId);
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      removePendingOperation(productId);
      return false;
    }
  };

  const removeFromCart = async (
    productId: string, 
    selectedVariant?: any
  ): Promise<boolean> => {
    try {
      // Handle guest mode - update local state only
      if (isGuestMode) {
        const updatedGuestCart = { ...guestCart };
        updatedGuestCart.items = updatedGuestCart.items.filter(item => 
          !(item.productId._id === productId && 
            JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
        );
        updatedGuestCart.totalItems = updatedGuestCart.items.reduce((sum, item) => sum + item.quantity, 0);
        updatedGuestCart.totalAmount = updatedGuestCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setGuestCart(updatedGuestCart);
        setCart(updatedGuestCart);
        await saveGuestCart(updatedGuestCart);
        return true;
      }

      // Authenticated user logic
      // Optimistic update - remove immediately
      const previousCart = cart;
      
      if (cart) {
        const updatedCart = { ...cart };
        updatedCart.items = updatedCart.items.filter(item => 
          !(item.productId._id === productId && 
            JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
        );
        updatedCart.totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
        updatedCart.totalAmount = updatedCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setCart(updatedCart);
      }

      addPendingOperation(productId);

      // Send request in background
      await tokenManager.initialize();
      const token = await tokenManager.getAccessToken();
      
      if (!token) {
        console.error('No access token available for remove from cart operation');
        setCart(previousCart);
        removePendingOperation(productId);
        return false;
      }

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
        removePendingOperation(productId);
        return true;
      } else {
        console.error('Remove from cart error:', data.message);
        // Rollback on error
        setCart(previousCart);
        removePendingOperation(productId);
        return false;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      removePendingOperation(productId);
      return false;
    }
  };

  const updateQuantity = async (
    productId: string, 
    quantity: number, 
    selectedVariant?: any
  ): Promise<boolean> => {
    try {
      if (quantity < 1) return false;

      // Handle guest mode - update local state only
      if (isGuestMode) {
        const updatedGuestCart = { ...guestCart };
        const itemIndex = updatedGuestCart.items.findIndex(item => 
          item.productId._id === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
        );

        if (itemIndex >= 0) {
          updatedGuestCart.items[itemIndex] = {
            ...updatedGuestCart.items[itemIndex],
            quantity
          };
          updatedGuestCart.totalItems = updatedGuestCart.items.reduce((sum, item) => sum + item.quantity, 0);
          updatedGuestCart.totalAmount = updatedGuestCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          setGuestCart(updatedGuestCart);
          setCart(updatedGuestCart);
          await saveGuestCart(updatedGuestCart);
          return true;
        }
        return false;
      }

      // Authenticated user logic
      // Optimistic update - update immediately
      const previousCart = cart;
      
      if (cart) {
        const updatedCart = { ...cart };
        const itemIndex = updatedCart.items.findIndex(item => 
          item.productId._id === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
        );

        if (itemIndex >= 0) {
          updatedCart.items[itemIndex] = {
            ...updatedCart.items[itemIndex],
            quantity
          };
          updatedCart.totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
          updatedCart.totalAmount = updatedCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          setCart(updatedCart);
        }
      }

      addPendingOperation(productId);

      // Send request in background
      await tokenManager.initialize();
      const token = await tokenManager.getAccessToken();
      
      if (!token || quantity < 1) {
        console.error('No access token or invalid quantity for update cart operation');
        setCart(previousCart);
        removePendingOperation(productId);
        return false;
      }

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
        removePendingOperation(productId);
        return true;
      } else {
        console.error('Update cart error:', data.message);
        // Rollback on error
        setCart(previousCart);
        removePendingOperation(productId);
        return false;
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      removePendingOperation(productId);
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      // Handle guest mode - clear local state only
      if (isGuestMode) {
        const clearedCart = {
          _id: 'guest-cart',
          items: [],
          totalItems: 0,
          totalAmount: 0
        };
        setGuestCart(clearedCart);
        setCart(clearedCart);
        await saveGuestCart(clearedCart);
        return true;
      }

      // Authenticated user logic
      // Optimistic update - clear immediately
      const previousCart = cart;
      setCart({ ...cart!, items: [], totalItems: 0, totalAmount: 0 });

      // Send request in background
      await tokenManager.initialize();
      const token = await tokenManager.getAccessToken();
      
      if (!token) {
        console.error('No access token available for clear cart operation');
        setCart(previousCart);
        return false;
      }

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
        // Rollback on error
        setCart(previousCart);
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
    isOperationPending,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};