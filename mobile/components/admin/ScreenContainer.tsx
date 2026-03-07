import React, { ReactNode } from 'react';
import {
  ScrollView,
  RefreshControl,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface ScreenContainerProps {
  children: ReactNode;
  /** Enable ScrollView wrapping */
  scrollable?: boolean;
  /** Pull-to-refresh callback; enables RefreshControl when provided */
  onRefresh?: () => void;
  /** Controlled refreshing state for pull-to-refresh */
  refreshing?: boolean;
  /** Override or extend container style */
  style?: ViewStyle;
  /** Override or extend content padding style */
  contentStyle?: ViewStyle;
  /** Background color override */
  backgroundColor?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  onRefresh,
  refreshing = false,
  style,
  contentStyle,
  backgroundColor,
}) => {
  const bgColor = backgroundColor ?? theme.colors.surface;

  const refreshControl =
    onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={theme.colors.primary}
        colors={[theme.colors.primary]}
      />
    ) : undefined;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }, style]}>
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, contentStyle]}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.base,
  },
});
