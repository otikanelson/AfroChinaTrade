import { Router } from 'expo-router';

/**
 * Handle notification deep linking based on data payload
 * Maps data.screen values to appropriate routes
 * 
 * @param data - Notification data payload containing screen and entity IDs
 * @param router - Expo router instance for navigation
 */
export function handleNotificationDeepLink(
  data: Record<string, any>,
  router: Router
): void {
  if (!data || !data.screen) {
    // Fallback to notifications screen if no screen specified
    router.push('/notifications');
    return;
  }

  const { screen } = data;

  switch (screen) {
    case 'order-detail':
      if (data.orderId) {
        router.push(`/order-detail/${data.orderId}`);
      } else {
        router.push('/notifications');
      }
      break;

    case 'my-refunds':
      router.push('/my-refunds');
      break;

    case 'message-thread':
      if (data.threadId) {
        router.push(`/message-thread/${data.threadId}`);
      } else {
        router.push('/notifications');
      }
      break;

    case 'collection':
      if (data.collectionId) {
        // Navigate to product listing with collection filter
        router.push({
          pathname: '/product-listing',
          params: {
            collection: data.collectionId,
          },
        } as any);
      } else {
        router.push('/notifications');
      }
      break;

    case 'admin-order':
      if (data.orderId) {
        router.push(`/(admin)/order/${data.orderId}` as any);
      } else {
        router.push('/notifications');
      }
      break;

    case 'admin-refund':
      router.push('/(admin)/refunds' as any);
      break;

    default:
      // Fallback for unrecognized screen values
      router.push('/notifications');
      break;
  }
}
