import { useState, useEffect, useCallback } from 'react';
import { refundService } from '../services/RefundService';

export const useRefundNotifications = () => {
  const [pendingRefunds, setPendingRefunds] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPendingRefunds = useCallback(async () => {
    try {
      const response = await refundService.getRefunds({
        page: 1,
        limit: 1,
        status: 'pending',
      });

      if (response.success && response.data) {
        setPendingRefunds(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching pending refunds:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRefunds();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchPendingRefunds, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPendingRefunds]);

  return {
    pendingRefunds,
    loading,
    refresh: fetchPendingRefunds,
  };
};