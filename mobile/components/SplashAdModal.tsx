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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
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
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const [countdown, setCountdown] = useState(Math.ceil((ad.splashDuration || 3000) / 1000));
  const [showCloseButton, setShowCloseButton] = useState(false);

  useEffect(() => {
    // Animate in with slide up effect
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

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
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 400,
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
      backgroundColor: '#000',
    },
    container: {
      flex: 1,
      position: 'relative',
    },
    backgroundImage: {
      flex: 1,
      width: screenWidth,
      height: screenHeight,
    },
    gradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    topBar: {
      position: 'absolute',
      top: StatusBar.currentHeight || 44,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      zIndex: 10,
    },
    countdownBadge: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    countdownText: {
      color: 'white',
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: showCloseButton ? 1 : 0,
    },
    contentContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing['2xl'],
      paddingTop: spacing.xl,
    },
    titleContainer: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      color: 'white',
      textAlign: 'center',
      marginBottom: spacing.sm,
      textShadowColor: 'rgba(0, 0, 0, 0.7)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    description: {
      fontSize: fontSizes.lg,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      lineHeight: 24,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
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
      elevation: 8,
      shadowColor: '#000',
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
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    secondaryButtonText: {
      color: 'white',
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
    },
    brandingContainer: {
      position: 'absolute',
      top: '45%',
      left: spacing.xl,
      right: spacing.xl,
      alignItems: 'center',
    },
    brandingText: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: 'white',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    decorativeElements: {
      position: 'absolute',
      top: '20%',
      right: spacing.lg,
      opacity: 0.1,
    },
  });

  return (
    <Modal
      visible={true}
      transparent={false}
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
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={ad.linkPath ? handleAdPress : undefined}>
          <View style={styles.container}>
            <ImageBackground 
              source={{ uri: ad.imageUrl }} 
              style={styles.backgroundImage}
              resizeMode="cover"
            >
              {/* Gradient overlay for better text readability */}
              <View style={styles.gradient} />
              
              {/* Top bar with countdown and close button */}
              <View style={styles.topBar}>
                <View style={styles.countdownBadge}>
                  <Ionicons name="time-outline" size={16} color="white" />
                  <Text style={styles.countdownText}>
                    {countdown > 0 ? `${countdown}s` : 'Tap to close'}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Decorative elements */}
              <View style={styles.decorativeElements}>
                <Ionicons name="sparkles" size={60} color="white" />
              </View>

              {/* Center branding area */}
              {!ad.description && (
                <View style={styles.brandingContainer}>
                  <Text style={styles.brandingText}>
                    {ad.title}
                  </Text>
                </View>
              )}

              {/* Bottom content area */}
              <View style={styles.contentContainer}>
                {ad.description && (
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>{ad.title}</Text>
                    <Text style={styles.description}>{ad.description}</Text>
                  </View>
                )}

                <View style={styles.actionContainer}>
                  {ad.linkPath && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleAdPress}
                    >
                      <Text style={styles.actionButtonText}>Shop Now</Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={styles.secondaryButton} 
                    onPress={handleClose}
                  >
                    <Text style={styles.secondaryButtonText}>Maybe Later</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Modal>
  );
}