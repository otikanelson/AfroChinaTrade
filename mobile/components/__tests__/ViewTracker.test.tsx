import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ViewTracker } from '../ViewTracker';
import { useViewTracking } from '../../hooks/useViewTracking';

// Mock the useViewTracking hook
jest.mock('../../hooks/useViewTracking');
const mockUseViewTracking = jest.mocked(useViewTracking);

describe('ViewTracker', () => {
  const mockTrackView = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseViewTracking.mockReturnValue({
      trackView: mockTrackView,
      trackProductCardInteraction: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should render without UI (invisible component)', () => {
    const { container } = render(
      <ViewTracker productId="test-product-id" />
    );
    
    expect(container.children).toHaveLength(0);
  });

  it('should track view after default threshold (2 seconds)', async () => {
    jest.useFakeTimers();
    
    render(
      <ViewTracker 
        productId="test-product-id" 
        userId="test-user-id" 
      />
    );

    // Fast-forward time by 2 seconds
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockTrackView).toHaveBeenCalledWith(
        'test-product-id',
        'test-user-id',
        expect.objectContaining({
          viewDuration: expect.any(Number)
        })
      );
    });

    jest.useRealTimers();
  });

  it('should track view after custom threshold', async () => {
    jest.useFakeTimers();
    
    render(
      <ViewTracker 
        productId="test-product-id" 
        threshold={5000}
      />
    );

    // Fast-forward time by 4 seconds (less than threshold)
    jest.advanceTimersByTime(4000);
    expect(mockTrackView).not.toHaveBeenCalled();

    // Fast-forward time by 1 more second (total 5 seconds)
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockTrackView).toHaveBeenCalledWith(
        'test-product-id',
        undefined,
        expect.objectContaining({
          viewDuration: expect.any(Number)
        })
      );
    });

    jest.useRealTimers();
  });

  it('should call onViewTracked callback when view is tracked', async () => {
    jest.useFakeTimers();
    const mockOnViewTracked = jest.fn();
    
    render(
      <ViewTracker 
        productId="test-product-id" 
        onViewTracked={mockOnViewTracked}
      />
    );

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockOnViewTracked).toHaveBeenCalledWith('test-product-id');
    });

    jest.useRealTimers();
  });

  it('should reset tracking when productId changes', async () => {
    jest.useFakeTimers();
    
    const { rerender } = render(
      <ViewTracker productId="product-1" />
    );

    // Fast-forward time by 1 second
    jest.advanceTimersByTime(1000);

    // Change productId before threshold is reached
    rerender(<ViewTracker productId="product-2" />);

    // Fast-forward time by 2 more seconds
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      // Should track view for product-2, not product-1
      expect(mockTrackView).toHaveBeenCalledWith(
        'product-2',
        undefined,
        expect.objectContaining({
          viewDuration: expect.any(Number)
        })
      );
    });

    expect(mockTrackView).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('should not track view multiple times for same product', async () => {
    jest.useFakeTimers();
    
    render(
      <ViewTracker productId="test-product-id" />
    );

    // Fast-forward time by 2 seconds
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockTrackView).toHaveBeenCalledTimes(1);
    });

    // Fast-forward more time
    jest.advanceTimersByTime(5000);

    // Should still only be called once
    expect(mockTrackView).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('should cleanup timer on unmount', () => {
    jest.useFakeTimers();
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { unmount } = render(
      <ViewTracker productId="test-product-id" />
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();

    jest.useRealTimers();
    clearTimeoutSpy.mockRestore();
  });
});