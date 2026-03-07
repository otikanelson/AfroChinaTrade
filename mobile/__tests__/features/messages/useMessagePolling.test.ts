/**
 * Unit tests for useMessagePolling hook
 * Requirements: 3.6, 3.8
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

// Use module-level object to avoid jest.mock hoisting issues with variable references
const mockStorage = { get: jest.fn(), set: jest.fn() };
jest.mock('../../../../shared/src/services/storage/AsyncStorageAdapter', () => ({
  AsyncStorageAdapter: jest.fn().mockImplementation(() => mockStorage),
}));

jest.mock('../../../app/(admin)/(tabs)/messages', () => ({
  MESSAGE_THREADS_KEY: 'message_threads',
}));

import { useMessagePolling, requestNotificationPermissions } from '../../../hooks/useMessagePolling';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeThread(id: string, unreadCount: number) {
  return {
    id,
    customerId: `customer-${id}`,
    customerName: `Customer ${id}`,
    lastMessage: 'Hello',
    lastMessageAt: new Date().toISOString(),
    unreadCount,
    messages: [],
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('requestNotificationPermissions', () => {
  it('returns true when permissions are already granted', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
    const result = await requestNotificationPermissions();
    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permissions when not yet granted and returns true on grant', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
    const result = await requestNotificationPermissions();
    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it('returns false when permissions are denied', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    const result = await requestNotificationPermissions();
    expect(result).toBe(false);
  });
});

describe('useMessagePolling', () => {
  it('calls onThreadsUpdated with sorted threads on mount', async () => {
    mockStorage.get.mockResolvedValue([makeThread('t1', 0), makeThread('t2', 1)]);
    const onThreadsUpdated = jest.fn();
    renderHook(() => useMessagePolling({ onThreadsUpdated }));
    await waitFor(() => expect(onThreadsUpdated).toHaveBeenCalled());
  });

  it('does not schedule a notification on the first poll (establishes baseline)', async () => {
    mockStorage.get.mockResolvedValue([makeThread('t1', 2)]);
    renderHook(() => useMessagePolling({}));
    await waitFor(() => expect(mockStorage.get).toHaveBeenCalled());
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('schedules a notification when unread count increases on subsequent poll', async () => {
    mockStorage.get
      .mockResolvedValueOnce([makeThread('t1', 1)])
      .mockResolvedValueOnce([makeThread('t1', 3)]);

    renderHook(() => useMessagePolling({}));
    await waitFor(() => expect(mockStorage.get).toHaveBeenCalledTimes(1));
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();

    await act(async () => { jest.advanceTimersByTime(10_000); });
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1));

    const arg = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(arg.content.title).toBe('New Message');
    expect(arg.content.body).toContain('2');
  });

  it('does not schedule a notification when unread count stays the same', async () => {
    mockStorage.get.mockResolvedValue([makeThread('t1', 2)]);
    renderHook(() => useMessagePolling({}));
    await waitFor(() => expect(mockStorage.get).toHaveBeenCalledTimes(1));
    await act(async () => { jest.advanceTimersByTime(10_000); });
    await waitFor(() => expect(mockStorage.get).toHaveBeenCalledTimes(2));
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('does not schedule a notification when unread count decreases', async () => {
    mockStorage.get
      .mockResolvedValueOnce([makeThread('t1', 3)])
      .mockResolvedValueOnce([makeThread('t1', 1)]);
    renderHook(() => useMessagePolling({}));
    await waitFor(() => expect(mockStorage.get).toHaveBeenCalledTimes(1));
    await act(async () => { jest.advanceTimersByTime(10_000); });
    await waitFor(() => expect(mockStorage.get).toHaveBeenCalledTimes(2));
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('stops polling when enabled is false', async () => {
    mockStorage.get.mockResolvedValue([makeThread('t1', 0)]);
    renderHook(() => useMessagePolling({ enabled: false }));
    await act(async () => { jest.advanceTimersByTime(30_000); });
    expect(mockStorage.get).not.toHaveBeenCalled();
  });

  it('navigates to specific thread when notification with threadId is tapped', () => {
    mockStorage.get.mockResolvedValue([]);
    let capturedListener: ((r: unknown) => void) | null = null;
    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
      (cb: (r: unknown) => void) => { capturedListener = cb; return { remove: jest.fn() }; },
    );
    renderHook(() => useMessagePolling({}));
    capturedListener?.({ notification: { request: { content: { data: { threadId: 'thread-42' } } } } });
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(admin)/message/[threadId]',
      params: { threadId: 'thread-42' },
    });
  });

  it('navigates to messages list when notification has no threadId', () => {
    mockStorage.get.mockResolvedValue([]);
    let capturedListener: ((r: unknown) => void) | null = null;
    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
      (cb: (r: unknown) => void) => { capturedListener = cb; return { remove: jest.fn() }; },
    );
    renderHook(() => useMessagePolling({}));
    capturedListener?.({ notification: { request: { content: { data: {} } } } });
    expect(mockPush).toHaveBeenCalledWith('/(admin)/(tabs)/messages');
  });

  it('cleans up interval and listener on unmount', async () => {
    mockStorage.get.mockResolvedValue([]);
    const removeMock = jest.fn();
    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({
      remove: removeMock,
    });
    const { unmount } = renderHook(() => useMessagePolling({}));
    await waitFor(() => expect(mockStorage.get).toHaveBeenCalled());
    unmount();
    const callCount = mockStorage.get.mock.calls.length;
    await act(async () => { jest.advanceTimersByTime(10_000); });
    expect(mockStorage.get.mock.calls.length).toBe(callCount);
    expect(removeMock).toHaveBeenCalled();
  });
});
