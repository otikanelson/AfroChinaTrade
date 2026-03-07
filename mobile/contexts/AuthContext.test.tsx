import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthUser } from '../types/auth';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with no user', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isSeller).toBe(false);
    });
  });

  it('should load user from storage on mount', async () => {
    const mockUser: AuthUser = {
      id: '1',
      name: 'Test Seller',
      email: 'seller@test.com',
      accountType: 'seller',
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isSeller).toBe(true);
    });
  });

  it('should identify seller account correctly', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSeller).toBe(false);
    });

    const sellerUser: AuthUser = {
      id: '1',
      name: 'Test Seller',
      email: 'seller@test.com',
      accountType: 'seller',
    };

    await act(async () => {
      await result.current.login(sellerUser);
    });

    expect(result.current.isSeller).toBe(true);
  });

  it('should identify customer account correctly', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });

    const customerUser: AuthUser = {
      id: '2',
      name: 'Test Customer',
      email: 'customer@test.com',
      accountType: 'customer',
    };

    await act(async () => {
      await result.current.login(customerUser);
    });

    expect(result.current.isSeller).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should login user and save to storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });

    const mockUser: AuthUser = {
      id: '1',
      name: 'Test User',
      email: 'test@test.com',
      accountType: 'customer',
    };

    await act(async () => {
      await result.current.login(mockUser);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@afrochinatrade:auth_user',
      JSON.stringify(mockUser)
    );
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout user and remove from storage', async () => {
    const mockUser: AuthUser = {
      id: '1',
      name: 'Test User',
      email: 'test@test.com',
      accountType: 'seller',
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@afrochinatrade:auth_user');
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isSeller).toBe(false);
  });
});
