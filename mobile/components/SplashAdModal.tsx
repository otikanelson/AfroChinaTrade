import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  StatusBar,
  ImageBackground,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ad } from '../services/AdService';

interface SplashAdModalProps {
  ad: Ad;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function SplashAdModal({ ad, onClose }: SplashAdModalProps) {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [countdown, setCountdown] = useState(Math.ceil((ad.splashDuration || 3000) / 1000));
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Animate in with fade and scale effect
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for action button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Countdown timer
    const duration = ad.splashDuration || 3000;
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setShowCloseButton(true);
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto close after duration
    const timer = setTimeout(() => {
      if (!showCloseButton) {
        handleClose();
      }
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleAdPress = () => {
    if (ad.linkPath) {
      handleClose();
      // Navigate after modal closes
      setTimeout(() => {
        router.push(ad.linkPath as any);
      }, 250);
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: screenWidth * 0.9,
      maxWidth: 450,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      elevation: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 1,
      position: 'relative',
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      zIndex: 10,
    },
    countdownBadge: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    countdownText: {
      color: 'white',
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: showCloseButton ? 1 : 0.4,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    contentContainer: {
      padding: spacing.xl,
      backgroundColor: colors.surface,
    },
    titleContainer: {
      marginBottom: spacing.lg,
      alignItems: 'center',
    },
    title: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    actionContainer: {
      gap: spacing.md,
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      elevation: 6,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    actionButtonText: {
      color: 'white',
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
    },
    secondaryButton: {
      backgroundColor: colors.background,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
    },
    badge: {
      position: 'absolute',
      top: spacing.lg,
      left: spacing.lg,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    badgeText: {
      color: 'white',
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View 
        style={[
          styles.overlay, 
          { 
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={showCloseButton ? handleClose : undefined}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View 
                style={[
                  styles.container,
                  {
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                {/* Image Section */}
                <View style={styles.imageContainer}>
                  <ImageBackground 
                    source={{ uri: ad.imageUrl }} 
                    style={styles.backgroundImage}
                    resizeMode="cover"
                  >
                    {/* Gradient overlay for better contrast */}
                    <LinearGradient
                      colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']}
                      style={styles.gradientOverlay}
                    />
                    
                    {/* Top bar with countdown and close button */}
                    <View style={styles.topBar}>
                      <View style={styles.countdownBadge}>
                        <Ionicons name="time-outline" size={14} color="white" />
                        <Text style={styles.countdownText}>
                          {countdown > 0 ? `${countdown}s` : 'Close'}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        disabled={!showCloseButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close" size={20} color={colors.text} />
                      </TouchableOpacity>
                    </View>

                    {/* New/Hot Badge */}
                    <View style={styles.badge}>
                      <Ionicons name="flash" size={12} color="white" />
                      <Text style={styles.badgeText}>New</Text>
                    </View>
                  </ImageBackground>
                </View>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>{ad.title}</Text>
                    {ad.description && (
                      <Text style={styles.description}>{ad.description}</Text>
                    )}
                  </View>

                  <View style={styles.actionContainer}>
                    {ad.linkPath && (
                      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={handleAdPress}
                        >
                          <Text style={styles.actionButtonText}>Shop Now</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" />
                        </TouchableOpacity>
                      </Animated.View>
                    )}

                    <TouchableOpacity 
                      style={styles.secondaryButton} 
                      onPress={handleClose}
                    >
                      <Text style={styles.secondaryButtonText}>Maybe Later</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Modal>
  );
}