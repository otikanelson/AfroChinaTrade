import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SuccessCheckmark } from './SuccessCheckmark';

interface SuccessOverlayProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onPress: () => void;
  primaryColor?: string;
}

export const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
  visible, title, message, buttonText = 'Continue', onPress, primaryColor = '#16a34a',
}) => {
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, speed: 14, bounciness: 6, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(textOpacity, { toValue: 1, duration: 300, delay: 150, useNativeDriver: true }).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(cardScale, { toValue: 0.8, duration: 200, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
          <SuccessCheckmark visible={visible} size={90} color={primaryColor} />
          <Animated.View style={[{ alignItems: 'center', marginTop: 20 }, { opacity: textOpacity }]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: primaryColor }]} onPress={onPress}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', width: '100%', maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  title: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  button: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, minWidth: 160, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
