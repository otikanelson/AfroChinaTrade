import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/Header';
import { spacing } from '../theme/spacing';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    languageList: {
      paddingHorizontal: spacing.base,
      paddingTop: spacing.base,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.sm,
    },
    languageFlag: {
      fontSize: 32,
      marginRight: spacing.base,
    },
    languageInfo: {
      flex: 1,
    },
    languageName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: 2,
    },
    languageNativeName: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    checkIcon: {
      marginLeft: spacing.sm,
    },
    comingSoonBadge: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
      marginLeft: spacing.sm,
    },
    comingSoonText: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      fontWeight: fontWeights.semibold,
    },
    note: {
      backgroundColor: colors.background,
      marginHorizontal: spacing.base,
      marginTop: spacing.base,
      padding: spacing.base,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    noteIcon: {
      marginRight: spacing.sm,
      marginTop: 2,
    },
    noteText: {
      flex: 1,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });

  const handleLanguageSelect = (code: string) => {
    if (code === 'en') {
      setSelectedLanguage(code);
      // TODO: Implement language change logic
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Language" 
        showBack={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.languageList}>
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={styles.languageItem}
              onPress={() => handleLanguageSelect(language.code)}
              disabled={language.code !== 'en'}
              activeOpacity={0.7}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={styles.languageName}>{language.name}</Text>
                <Text style={styles.languageNativeName}>{language.nativeName}</Text>
              </View>
              {language.code !== 'en' && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              )}
              {selectedLanguage === language.code && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={colors.primary} 
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.note}>
          <Ionicons 
            name="information-circle-outline" 
            size={20} 
            color={colors.primary} 
            style={styles.noteIcon}
          />
          <Text style={styles.noteText}>
            Currently, only English is available. We're working on adding more languages to make your shopping experience better.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
