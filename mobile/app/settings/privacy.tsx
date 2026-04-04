import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Header } from '../../components/Header';

export default function PrivacySettings() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [settings, setSettings] = useState({
    dataCollection: true,
    analytics: false,
    notifications: true,
    locationTracking: false,
    personalizedAds: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const privacyOptions = [
    {
      key: 'dataCollection' as const,
      title: 'Data Collection',
      description: 'Allow app to collect usage data for improvement',
    },
    {
      key: 'analytics' as const,
      title: 'Analytics',
      description: 'Share anonymous analytics to help improve the app',
    },
    {
      key: 'notifications' as const,
      title: 'Push Notifications',
      description: 'Receive notifications about orders and updates',
    },
    {
      key: 'locationTracking' as const,
      title: 'Location Tracking',
      description: 'Allow location access for delivery and local offers',
    },
    {
      key: 'personalizedAds' as const,
      title: 'Personalized Ads',
      description: 'Show ads based on your interests and activity',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.md,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    optionContent: {
      flex: 1,
      marginRight: spacing.md,
    },
    optionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Privacy Settings" showBack />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Controls</Text>
          {privacyOptions.map((option) => (
            <View key={option.key} style={styles.option}>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Switch
                value={settings[option.key]}
                onValueChange={() => toggleSetting(option.key)}
                trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                thumbColor={settings[option.key] ? colors.primary : colors.textSecondary}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}