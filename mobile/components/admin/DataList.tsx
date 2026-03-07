import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';

// ─── Skeleton ────────────────────────────────────────────────────────────────

interface SkeletonItemProps {
  height?: number;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ height = 72 }) => (
  <View style={[styles.skeletonItem, { height }]} />
);

const SkeletonList: React.FC<{ count?: number; itemHeight?: number }> = ({
  count = 6,
  itemHeight,
}) => (
  <View style={styles.skeletonContainer}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonItem key={i} height={itemHeight} />
    ))}
  </View>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No items found',
  icon,
}) => (
  <View style={styles.emptyContainer}>
    {icon}
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

// ─── Footer (infinite scroll indicator) ──────────────────────────────────────

const ListFooter: React.FC<{ loadingMore: boolean }> = ({ loadingMore }) => {
  if (!loadingMore) return null;
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
    </View>
  );
};

// ─── DataList ─────────────────────────────────────────────────────────────────

export interface DataListProps<T> {
  /** Data array to render */
  data: T[];
  /** Render function for each item */
  renderItem: FlatListProps<T>['renderItem'];
  /** Key extractor */
  keyExtractor: (item: T, index: number) => string;

  // Loading / refresh
  /** Show skeleton loaders instead of list while true */
  loading?: boolean;
  /** Pull-to-refresh active state */
  refreshing?: boolean;
  /** Pull-to-refresh callback */
  onRefresh?: () => void;

  // Infinite scroll
  /** Called when the user scrolls near the end of the list */
  onEndReached?: () => void;
  /** How far from the end (0–1) to trigger onEndReached */
  onEndReachedThreshold?: number;
  /** Show a loading spinner at the bottom while fetching more */
  loadingMore?: boolean;

  // Performance
  /** Fixed item height for getItemLayout optimisation */
  itemHeight?: number;

  // Empty state
  /** Message shown when data is empty and not loading */
  emptyMessage?: string;
  /** Custom icon for the empty state */
  emptyIcon?: React.ReactNode;
  /** Fully custom empty-state component */
  EmptyComponent?: React.ReactNode;

  // Skeleton
  /** Number of skeleton rows to show while loading */
  skeletonCount?: number;

  // Style
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;

  // Pass-through
  ListHeaderComponent?: FlatListProps<T>['ListHeaderComponent'];
  ItemSeparatorComponent?: FlatListProps<T>['ItemSeparatorComponent'];
}

export function DataList<T>({
  data,
  renderItem,
  keyExtractor,
  loading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.2,
  loadingMore = false,
  itemHeight,
  emptyMessage,
  emptyIcon,
  EmptyComponent,
  skeletonCount = 6,
  style,
  contentContainerStyle,
  ListHeaderComponent,
  ItemSeparatorComponent,
}: DataListProps<T>) {
  // Prevent duplicate end-reached calls while already loading more
  const endReachedLock = useRef(false);

  const handleEndReached = useCallback(() => {
    if (endReachedLock.current || loadingMore || !onEndReached) return;
    endReachedLock.current = true;
    onEndReached();
    // Release lock after a short delay so the next page can trigger it again
    setTimeout(() => {
      endReachedLock.current = false;
    }, 500);
  }, [loadingMore, onEndReached]);

  // getItemLayout optimisation – only available when item height is fixed
  const getItemLayout = useCallback(
    itemHeight
      ? (_: ArrayLike<T> | null | undefined, index: number) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })
      : () => ({ length: 0, offset: 0, index: 0 }),
    [itemHeight],
  );

  if (loading) {
    return <SkeletonList count={skeletonCount} itemHeight={itemHeight} />;
  }

  const emptyComponent =
    EmptyComponent ??
    (data.length === 0 ? (
      <EmptyState message={emptyMessage} icon={emptyIcon} />
    ) : null);

  const hasHeader = !!ListHeaderComponent;

  return (
    <FlatList<T>
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={[styles.list, style]}
      contentContainerStyle={[
        data.length === 0 && !hasHeader && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      // Pull-to-refresh
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        ) : undefined
      }
      // Infinite scroll
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={<ListFooter loadingMore={loadingMore} />}
      // Performance
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      {...(itemHeight ? { getItemLayout } : {})}
      // Empty state
      ListEmptyComponent={emptyComponent as React.ReactElement}
      // Pass-through
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  // Skeleton
  skeletonContainer: {
    flex: 1,
    padding: theme.spacing.base,
    gap: theme.spacing.sm,
  },
  skeletonItem: {
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.borderLight,
    opacity: 0.7,
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  // Footer loader
  footerLoader: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
});
