import { API_BASE_URL } from '../constants/config';
import { tokenManager } from './api/tokenManager';

export interface Review {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images: string[];
  };
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  response?: string;
  responseAt?: string;
  isFlagged: boolean;
  createdAt: string;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  reviews?: Review[];
  data?: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ReviewService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = await tokenManager.getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}/reviews${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async createReview(reviewData: CreateReviewData): Promise<{ message: string; review: Review }> {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getProductReviews(productId: string, page = 1, limit = 10): Promise<ReviewResponse> {
    return this.makeRequest(`/product/${productId}?page=${page}&limit=${limit}`);
  }

  async getUserReviews(page = 1, limit = 10): Promise<ReviewResponse> {
    return this.makeRequest(`/user?page=${page}&limit=${limit}`);
  }

  async getAllReviews(page = 1, limit = 20, flagged?: boolean): Promise<ReviewResponse> {
    const flaggedParam = flagged !== undefined ? `&flagged=${flagged}` : '';
    return this.makeRequest(`/admin/all?page=${page}&limit=${limit}${flaggedParam}`);
  }

  async addAdminResponse(reviewId: string, response: string): Promise<{ message: string; review: Review }> {
    return this.makeRequest(`/${reviewId}/response`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  async flagReview(reviewId: string, isFlagged = true): Promise<{ message: string; review: Review }> {
    return this.makeRequest(`/${reviewId}/flag`, {
      method: 'PATCH',
      body: JSON.stringify({ isFlagged }),
    });
  }

  async deleteReview(reviewId: string): Promise<{ message: string }> {
    return this.makeRequest(`/${reviewId}`, {
      method: 'DELETE',
    });
  }
}

export const reviewService = new ReviewService();