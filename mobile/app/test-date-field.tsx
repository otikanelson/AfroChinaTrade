import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DateField } from '../components/admin/forms/DateField';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography, fontSizes, fontWeights } from '../theme/typography';

export default function TestDateFieldScreen() {
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('2024-12-31');
  const [date3, setDate3] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Date Field Test</Text>
        <Text style={styles.subtitle}>
          Testing the formatted date input component
        </Text>
      </View>

      <View style={styles.content}>
        <DateField
          label="Empty Date Field"
          value={date1}
          onChangeText={setDate1}
          helperText="Start typing numbers and watch the formatting"
        />

        <DateField
          label="Pre-filled Date Field"
          value={date2}
          onChangeText={setDate2}
          helperText="This field has a pre-filled date"
        />

        <DateField
          label="Required Date Field"
          value={date3}
          onChangeText={setDate3}
          required
          helperText="This field is marked as required"
        />

        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Current Values:</Text>
          <Text style={styles.previewText}>Date 1: "{date1}"</Text>
          <Text style={styles.previewText}>Date 2: "{date2}"</Text>
          <Text style={styles.previewText}>Date 3: "{date3}"</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  preview: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  previewText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});