import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Centers content with a max width on tablets.
 * On phones it renders children without any width constraint.
 */
export function ResponsiveContainer({ children, style }: ResponsiveContainerProps) {
  const { isTablet, contentMaxWidth } = useResponsive();

  if (!isTablet) {
    return <View style={[styles.base, style]}>{children}</View>;
  }

  return (
    <View style={styles.outer}>
      <View style={[styles.base, { maxWidth: contentMaxWidth, width: '100%' }, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
  },
  base: {
    flex: 1,
  },
});
