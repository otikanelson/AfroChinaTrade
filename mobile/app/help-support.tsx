import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/Header';
import { spacing } from '../theme/spacing';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I track my order?',
    answer: 'You can track your order by going to "My Orders" in your account and clicking on the specific order. You\'ll see real-time updates on your order status.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit/debit cards, mobile money, bank transfers, and PayPal. All payments are processed securely.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 3-7 business days depending on your location. Express delivery options are available for faster shipping.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for most items. Products must be unused and in original packaging. Contact support to initiate a return.',
  },
  {
    question: 'How do I request a refund?',
    answer: 'Go to your order details and click "Request Refund". Provide a reason and our team will review your request within 24-48 hours.',
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    infoCard: {
      backgroundColor: colors.primaryLight,
      padding: spacing.base,
      borderRadius: borderRadius.base,
      marginTop: spacing.md,
      marginHorizontal: spacing.md,
    },
    infoTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    infoText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 20,
    },
    section: {
      marginTop: spacing.base,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      paddingHorizontal: spacing.base,
      paddingTop: spacing.base,
      marginBottom: spacing.sm,
    },
    contactOptions: {
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
    contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
    },
    contactIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.base,
    },
    contactInfo: {
      flex: 1,
    },
    contactTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: 2,
    },
    contactSubtitle: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    faqList: {
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
    faqItem: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    faqQuestion: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.base,
    },
    faqQuestionText: {
      flex: 1,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginRight: spacing.sm,
    },
    faqAnswer: {
      paddingHorizontal: spacing.base,
      paddingBottom: spacing.base,
    },
    faqAnswerText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    footer: {
      backgroundColor: colors.background,
      marginHorizontal: spacing.base,
      marginTop: spacing.base,
      marginBottom: spacing.base,
      padding: spacing.base,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    footerTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    footerText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.base,
    },
    footerButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    footerButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
  });

  const handleContactPress = (type: string) => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:support@afrochinatrade.com');
        break;
      case 'phone':
        Linking.openURL('tel:+2348012345678');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/2348012345678');
        break;
      case 'chat':
        // Navigate to chat/support page
        break;
    }
  };

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Help & Support" 
        showBack={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Need Help?</Text>
          <Text style={styles.infoText}>
            We're here to help! Choose from the options below to get the support you need. 
            Our team is available 24/7 to assist you with any questions or issues.
          </Text>
        </View>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactOptions}>
            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleContactPress('email')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="mail-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactSubtitle}>support@afrochinatrade.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleContactPress('phone')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="call-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Phone Support</Text>
                <Text style={styles.contactSubtitle}>+234 801 234 5678</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleContactPress('whatsapp')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="logo-whatsapp" size={24} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>WhatsApp</Text>
                <Text style={styles.contactSubtitle}>Chat with us on WhatsApp</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleContactPress('chat')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Live Chat</Text>
                <Text style={styles.contactSubtitle}>Available 9 AM - 6 PM</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleContactPress('chat')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="flag-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Report a problem</Text>
                <Text style={styles.contactSubtitle}>Available 9 AM - 6 PM</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  <Ionicons 
                    name={expandedIndex === index ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
                {expandedIndex === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Still need help?</Text>
          <Text style={styles.footerText}>
            Our support team is here to assist you with any questions or concerns
          </Text>
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={() => handleContactPress('email')}
          >
            <Text style={styles.footerButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
