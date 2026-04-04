import { API_BASE_URL } from '../constants/config';

export interface Tag {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

class TagService {
  private baseUrl = `${API_BASE_URL}/tags`;

  /**
   * Get all active tags
   */
  async getTags(): Promise<{ success: boolean; data?: Tag[]; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ tags: Tag[] }> = await response.json();
      
      if (result.status === 'success') {
        return {
          success: true,
          data: result.data.tags || []
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to fetch tags'
        };
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get tag names only (for dropdowns)
   */
  async getTagNames(): Promise<string[]> {
    try {
      const response = await this.getTags();
      if (response.success && response.data) {
        return response.data.map(tag => tag.name);
      }
      return [];
    } catch (error) {
      console.error('Error fetching tag names:', error);
      return [];
    }
  }
}

export const tagService = new TagService();
