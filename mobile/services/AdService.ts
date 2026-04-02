import apiClient, { ApiResponse } from './api/apiClient';

export interface Ad {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkPath?: string;
  linkParams?: Record<string, string>;
  isActive: boolean;
  displayOrder: number;
  placement: {
    home?: 'carousel' | 'tile';
    'buy-now'?: 'carousel' | 'tile';
    'product-detail'?: 'carousel' | 'tile';
  };
}

class AdService {
  async getAds(placement?: 'home' | 'buy-now' | 'product-detail', adType?: 'carousel' | 'tile'): Promise<ApiResponse<Ad[]>> {
    const params: any = {};
    if (placement) params.placement = placement;
    if (adType) params.adType = adType;
    return apiClient.get<Ad[]>('/ads', { params });
  }

  async createAd(data: Partial<Ad>): Promise<ApiResponse<Ad>> {
    return apiClient.post<Ad>('/ads', data);
  }

  async updateAd(id: string, data: Partial<Ad>): Promise<ApiResponse<Ad>> {
    return apiClient.put<Ad>(`/ads/${id}`, data);
  }

  async deleteAd(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/ads/${id}`);
  }
}

export const adService = new AdService();
