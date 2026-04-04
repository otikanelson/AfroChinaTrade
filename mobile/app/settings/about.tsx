import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Header } from '../../components/Header';

export default function AboutApp() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const appInfo = [
    { label: 'Version', value: '1.0.0' },
    { label: 'Build', value: '2024.03.24' },
    { label: 'Platform', value: 'React Native' },
  ];

  const legalLinks = [
    {
      title: 'Terms of Service',
      icon: 'document-text-outline',
      action: () => Linking.openURL('https://example.com/terms'),
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-outline',
      action: () => Linking.openURL('https://example.com/privacy'),
    },
    {
      title: 'Licenses',
      icon: 'library-outline',
      action: () => console.log('Open licenses'),
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
    logoSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: spacing.md,
    },
    appName: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    tagline: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
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
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    infoLabel: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.text,
    },
    linkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    linkIcon: {
      marginRight: spacing.md,
    },
    linkText: {
      flex: 1,
      fontSize: fontSizes.base,
      color: colors.text,
    },
    description: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="About" showBack />
      
      <ScrollView style={styles.content}>
        <View style={styles.logoSection}>
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={styles.logo}
          />
          <Text style={styles.appName}>ShopApp</Text>
          <Text style={styles.tagline}>Your favorite shopping companion</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          {appInfo.map((info, index) => (
            <View key={index} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{info.label}</Text>
              <Text style={styles.infoValue}>{info.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          {legalLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={styles.linkItem}
              onPress={link.action}
            >
              <Ionicons 
                name={link.icon as any} 
                size={24} 
                color={colors.primary} 
                style={styles.linkIcon}
              />
              <Text style={styles.linkText}>{link.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.description}>
          Built with ❤️ for a better shopping experience. 
          Thank you for using our app and supporting our mission to make shopping easier and more enjoyable.
        </Text>
      </ScrollView>
    </View>
  );
}