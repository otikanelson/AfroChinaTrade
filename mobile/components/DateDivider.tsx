import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme/spacing';

interface DateDividerProps {
  date: string | Date;
  style?: any;
}

export const DateDivider: React.FC<DateDividerProps> = ({ date, style }) => {
  const { colors, fontSizes, fontWeights } = useTheme();

  const formatDateDivider = (dateInput: string | Date) => {
    const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (dateObj.toDateString() === today.toDateString()) return 'Today';
    if (dateObj.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const styles = StyleSheet.create({
    dateDivider: {
      paddingHorizontal: spacing.xs,
      paddingTop: spacing.base,
      paddingBottom: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dateDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderLight,
    },
    dateDividerText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={[styles.dateDivider, style]}>
      <View style={styles.dateDividerLine} />
      <Text style={styles.dateDividerText}>{formatDateDivider(date)}</Text>
      <View style={styles.dateDividerLine} />
    </View>
  );
};

// Utility function to create list items with date dividers
export const createListWithDateDividers = <T extends { timestamp?: string; createdAt?: string; updatedAt?: string; date?: string }>(
  items: T[],
  getItemKey: (item: T) => string,
  getItemDate: (item: T) => string = (item) => item.timestamp || item.createdAt || item.updatedAt || item.date || ''
): Array<{ type: 'divider'; label: string; key: string } | { type: 'item'; data: T; key: string }> => {
  const listItems: Array<{ type: 'divider'; label: string; key: string } | { type: 'item'; data: T; key: string }> = [];
  let lastDateKey = '';

  for (const item of items) {
    const itemDate = getItemDate(item);
    if (!itemDate) continue;

    const dateKey = new Date(itemDate).toDateString();
    if (dateKey !== lastDateKey) {
      lastDateKey = dateKey;
      listItems.push({ 
        type: 'divider', 
        label: itemDate, 
        key: `divider_${dateKey}` 
      });
    }
    listItems.push({ 
      type: 'item', 
      data: item, 
      key: getItemKey(item) 
    });
  }

  return listItems;
};