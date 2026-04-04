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
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const dateMonth = dateObj.getMonth();
    const dateYear = dateObj.getFullYear();

    // If it's the current month and year, show "This Month"
    if (dateMonth === currentMonth && dateYear === currentYear) {
      return 'This Month';
    }
    
    // If it's last month of the same year, show "Last Month"
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    if (dateMonth === lastMonth && dateYear === lastMonthYear) {
      return 'Last Month';
    }
    
    // Otherwise show month and year
    return dateObj.toLocaleDateString('en-US', { 
      month: 'long', 
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

// Utility function to create list items with date dividers (grouped by month)
export const createListWithDateDividers = <T extends { timestamp?: string; createdAt?: string; updatedAt?: string; date?: string }>(
  items: T[],
  getItemKey: (item: T) => string,
  getItemDate: (item: T) => string = (item) => item.timestamp || item.createdAt || item.updatedAt || item.date || ''
): Array<{ type: 'divider'; label: string; key: string } | { type: 'item'; data: T; key: string }> => {
  const listItems: Array<{ type: 'divider'; label: string; key: string } | { type: 'item'; data: T; key: string }> = [];
  let lastMonthKey = '';

  for (const item of items) {
    const itemDate = getItemDate(item);
    if (!itemDate) continue;

    const dateObj = new Date(itemDate);
    // Create a month key using year and month (e.g., "2024-03")
    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthKey !== lastMonthKey) {
      lastMonthKey = monthKey;
      listItems.push({ 
        type: 'divider', 
        label: itemDate, 
        key: `divider_${monthKey}` 
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