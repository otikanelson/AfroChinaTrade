import apiClient, { ApiResponse } from './api/apiClient';

export type BlockType =
  | 'featured_products'
  | 'trending_products'
  | 'seller_favorites'
  | 'discounted_products'
  | 'new_arrivals'
  | 'recommendations'
  | 'collection'
  | 'ad_carousel'
  | 'promo_tiles';

export interface LayoutBlock {
  id: string;
  type: BlockType;
  label: string;
  enabled: boolean;
  order: number;
  config?: {
    collectionId?: string;
    collectionName?: string;
  };
}

export interface PageLayout {
  _id: string;
  page: 'home' | 'buy-now';
  blocks: LayoutBlock[];
  updatedAt: string;
}

class PageLayoutService {
  async getLayout(page: 'home' | 'buy-now'): Promise<ApiResponse<PageLayout>> {
    return apiClient.get<PageLayout>(`/page-layouts/${page}`);
  }

  async updateLayout(page: 'home' | 'buy-now', blocks: LayoutBlock[]): Promise<ApiResponse<PageLayout>> {
    return apiClient.put<PageLayout>(`/page-layouts/${page}`, { blocks });
  }

  async resetLayout(page: 'home' | 'buy-now'): Promise<ApiResponse<PageLayout>> {
    return apiClient.post<PageLayout>(`/page-layouts/${page}/reset`, {});
  }
}

export const pageLayoutService = new PageLayoutService();
