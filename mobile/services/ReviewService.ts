import apiClient, { ApiResponse } from './api/apiClient';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  response?: {
    text: string;
    adminName: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

class ReviewService {
  private readonly basePath = '/reviews';

  async getReviews(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<Review[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    return apiClient.get<Review[]>(url);
  }

  async getProductReviews(productId: string, params: { page?: number; limit?: number } = {}): Promise<ApiResponse<Review[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/product/${productId}?${queryString}` : `${this.basePath}/product/${productId}`;
    return apiClient.get<Review[]>(url);
  }

  async createReview(reviewData: CreateReviewData): Promise<ApiResponse<Review>> {
    return apiClient.post<Review>(this.basePath, reviewData);
  }

  async addAdminResponse(reviewId: string, response: string): Promise<ApiResponse<Review>> {
    return apiClient.post<Review>(`${this.basePath}/${reviewId}/response`, { response });
  }

  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${reviewId}`);
  }
}

export const reviewService = new ReviewService();
export default reviewService;