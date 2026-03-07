import React, { useRef } from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';

const MIN_TOUCH = 44;

export interface AccessibleTouchableProps extends Omit<PressableProps, 'accessibilityLabel'> {
  /** Required: describes the element for screen readers */
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  children: React.ReactNode;
}

/**
 * A Pressable wrapper that enforces a minimum 44×44 touch target via hitSlop
 * when the rendered element is smaller than that threshold.
 *
 * Requires `accessibilityLabel` so every interactive element is screen-reader
 * friendly. Defaults `accessibilityRole` to "button".
 */
export const AccessibleTouchable: React.FC<AccessibleTouchableProps> = ({
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  style,
  children,
  ...rest
}) => {
  const sizeRef = useRef<{ width: number; height: number } | null>(null);

  return (
    <Pressable
      {...rest}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      style={style}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        sizeRef.current = { width, height };
        // Forward original onLayout if provided
        if (typeof rest.onLayout === 'function') {
          rest.onLayout(e);
        }
      }}
      hitSlop={(state) => {
        // state is unused here; we rely on the measured size stored in the ref
        void state;
        const size = sizeRef.current;
        if (!size) {
          // Before first layout, apply a conservative hitSlop
          return { top: 8, bottom: 8, left: 8, right: 8 };
        }
        const dw = Math.max(0, MIN_TOUCH - size.width) / 2;
        const dh = Math.max(0, MIN_TOUCH - size.height) / 2;
        return { top: dh, bottom: dh, left: dw, right: dw };
      }}
    >
      {children}
    </Pressable>
  );
};
