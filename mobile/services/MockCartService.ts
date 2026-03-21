import { 
  getMockCart, 
  addToMockCart, 
  updateMockCartQuantity, 
  removeFromMockCart, 
  clearMockCart,
  mockProducts,
  MockCart,
  MockCartItem
} from '../data/mockData';

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
  selectedVariant?: any;
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

class MockCartService {
  private readonly delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  private transformMockCartToApiFormat(mockCart: MockCart): Cart {
    const items: CartItem[] = mockCart.items.map(item => {
      const product = mockProducts.find(p => p.id === item.productId);
      return {
        _id: item.id,
        productId: {
          _id: item.productId,
          name: product?.name || 'Unknown Product',
          price: product?.price || item.price,
          images: product?.images || []
        },
        quantity: item.quantity,
        price: item.price,
        selectedVariant: item.selectedVariant
      };
    });

    return {
      _id: mockCart.id,
      items,
      totalItems: mockCart.totalItems,
      totalAmount: mockCart.totalAmount
    };
  }

  async getCart(): Promise<{ success: boolean; data?: Cart; message?: string }> {
    await this.delay(200);
    
    const mockCart = getMockCart();
    const cart = this.transformMockCartToApiFormat(mockCart);
    
    return {
      success: true,
      data: cart
    };
  }

  async addToCart(productId: string, quantity: number = 1, selectedVariant?: any): Promise<{ success: boolean; data?: Cart; message?: string }> {
    await this.delay(300);
    
    try {
      const mockCart = addToMockCart(productId, quantity);
      const cart = this.transformMockCartToApiFormat(mockCart);
      
      return {
        success: true,
        data: cart,
        message: 'Item added to cart'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add item to cart'
      };
    }
  }

  async updateQuantity(productId: string, quantity: number, selectedVariant?: any): Promise<{ success: boolean; data?: Cart; message?: string }> {
    await this.delay(200);
    
    try {
      const mockCart = updateMockCartQuantity(productId, quantity);
      const cart = this.transformMockCartToApiFormat(mockCart);
      
      return {
        success: true,
        data: cart,
        message: 'Cart updated'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update cart'
      };
    }
  }

  async removeFromCart(productId: string, selectedVariant?: any): Promise<{ success: boolean; data?: Cart; message?: string }> {
    await this.delay(200);
    
    try {
      const mockCart = removeFromMockCart(productId);
      const cart = this.transformMockCartToApiFormat(mockCart);
      
      return {
        success: true,
        data: cart,
        message: 'Item removed from cart'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to remove item from cart'
      };
    }
  }

  async clearCart(): Promise<{ success: boolean; data?: Cart; message?: string }> {
    await this.delay(200);
    
    const mockCart = clearMockCart();
    const cart = this.transformMockCartToApiFormat(mockCart);
    
    return {
      success: true,
      data: cart,
      message: 'Cart cleared'
    };
  }
}

export const mockCartService = new MockCartService();
export default mockCartService;