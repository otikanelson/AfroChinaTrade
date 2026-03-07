import { RefObject, useEffect } from 'react';
import { AccessibilityInfo, findNodeHandle, View } from 'react-native';

/**
 * useFocusTrap
 *
 * Accepts a ref to a modal container View and programmatically moves
 * accessibility focus to the first focusable child when `active` becomes true.
 *
 * Usage:
 *   const containerRef = useRef<View>(null);
 *   useFocusTrap(containerRef, isModalVisible);
 *
 * @param containerRef - ref attached to the modal's root View
 * @param active       - set to true when the modal opens
 */
export function useFocusTrap(
  containerRef: RefObject<View | null>,
  active: boolean,
): void {
  useEffect(() => {
    if (!active) return;

    // Defer slightly so the modal has time to mount and become visible
    const timer = setTimeout(() => {
      const node = containerRef.current;
      if (!node) return;

      const handle = findNodeHandle(node);
      if (handle !== null) {
        AccessibilityInfo.setAccessibilityFocus(handle);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [active, containerRef]);
}
