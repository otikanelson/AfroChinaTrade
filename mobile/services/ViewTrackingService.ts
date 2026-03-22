import apiClient, { ApiResponse } from './api/apiClient';

export interface ViewMetadata {
  viewDuration?: number;
  scrollDepth?: number;
  imageViews?: number;
  source?: string;
}

export interface ViewTrackingResult {
  productId: string;
  newViewCount: number;
  tracked: boolean;
}

export interface InteractionResult {
  productId: string;
  interactionType: string;
  recorded: boolean;
}

class ViewTrackingService {
  /**
   * Track a product view
   * @param productId - The product ID to track
   * @param sessionId - Optional session ID for anonymous users
   * @param metadata - Optional metadata about the view
   */
  async trackProductView(
    productId: string,
    sessionId?: string,
    metadata?: ViewMetadata
  ): Promise<ApiResponse<ViewTrackingResult>> {
    const body: any = {};
    if (sessionId) body.sessionId = sessionId;
    if (metadata) body.metadata = metadata;

    return apiClient.post<ViewTrackingResult>(`/products/${productId}/view`, body);
  }

  /**
   * Record user interaction (cart add, wishlist, purchase)
   * @param productId - The product ID
   * @param interactionType - Type of interaction
   * @param sessionId - Optional session ID
   * @param metadata - Optional metadata
   */
  async recordInteraction(
    productId: string,
    interactionType: 'cart_add' | 'wishlist_add' | 'purchase',
    sessionId?: string,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<InteractionResult>> {
    const body: any = { interactionType };
    if (sessionId) body.sessionId = sessionId;
    if (metadata) body.metadata = metadata;

    return apiClient.post<InteractionResult>(`/products/${productId}/interaction`, body);
  }

  /**
   * Get product analytics (admin only)
   * @param productId - The product ID
   */
  async getProductAnalytics(productId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/products/${productId}/analytics`);
  }
}

// Export singleton instance
export const viewTrackingService = new ViewTrackingService();
export default viewTrackingService;