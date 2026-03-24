import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/ProductService';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types/product';

export const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setRecommendations([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await productService.getRecommendedProducts(user.id, 1, 10);
      
      if (response.success && response.data?.products && response.data.products.length > 0) {
        setRecommendations(response.data.products);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.log('No recommendations available for user:', error);
      setRecommendations([]);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load recommendations when user changes
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Function to refresh recommendations (call this after user views a product)
  const refreshRecommendations = useCallback(() => {
    loadRecommendations(true);
  }, [loadRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refreshRecommendations,
    hasRecommendations: recommendations.length > 0
  };
};

export default useRecommendations;