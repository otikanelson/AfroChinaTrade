import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Ad } from '../services/AdService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 190;
const AUTO_SCROLL_MS = 4000;

interface AdCarouselProps {
  ads: Ad[];
}

export const AdCarousel: React.FC<AdCarouselProps> = ({ ads }) => {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const isUserScrolling = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textAnimations = useRef<Animated.Value[]>([]);

  // Initialize animation values for each ad
  useEffect(() => {
    textAnimations.current = ads.map(() => new Animated.Value(0));
  }, [ads.length]);

  // Animate text when active index changes
  useEffect(() => {
    if (textAnimations.current[activeIndex]) {
      // Reset animation
      textAnimations.current[activeIndex].setValue(0);
      
      // Start rise-up animation
      Animated.timing(textAnimations.current[activeIndex], {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [activeIndex]);

  const scrollTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    activeIndexRef.current = index;
    setActiveIndex(index);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isUserScrolling.current) return;
      const next = (activeIndexRef.current + 1) % ads.length;
      scrollTo(next);
    }, AUTO_SCROLL_MS);
  };

  useEffect(() => {
    if (ads.length > 1) startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [ads.length]);

  const handleScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    const clamped = Math.max(0, Math.min(index, ads.length - 1));
    activeIndexRef.current = clamped;
    setActiveIndex(clamped);
    isUserScrolling.current = false;
    startTimer();
  };

  const handlePress = (ad: Ad) => {
    if (ad.linkPath) {
      router.push({ pathname: ad.linkPath as any, params: ad.linkParams });
    }
  };

  if (!ads.length) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary, paddingBottom: spacing.sm, paddingTop: spacing.md + 10, marginBottom: 15, }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          isUserScrolling.current = true;
          if (timerRef.current) clearInterval(timerRef.current);
        }}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          const clamped = Math.max(0, Math.min(index, ads.length - 1));
          activeIndexRef.current = clamped;
          setActiveIndex(clamped);
          isUserScrolling.current = false;
          startTimer();
        }}
      >
        {ads.map((ad, index) => {
          const animValue = textAnimations.current[index] || new Animated.Value(1);
          const translateY = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          });
          const opacity = animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.7, 1],
          });

          return (
            <TouchableOpacity
              key={ad._id}
              activeOpacity={ad.linkPath ? 0.85 : 1}
              onPress={() => handlePress(ad)}
              style={[styles.card, { width: SCREEN_WIDTH }]}
            >
              <Image source={{ uri: ad.imageUrl }} style={styles.image} resizeMode="cover" />
              <View style={styles.overlay} />
              <Animated.View 
                style={[
                  styles.textBlock, 
                  { 
                    padding: spacing.md,
                    transform: [{ translateY }],
                    opacity,
                  }
                ]}
              >
                <Text style={styles.title} numberOfLines={1}>{ad.title}</Text>
                {ad.description && (
                  <Text style={styles.description} numberOfLines={2}>{ad.description}</Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {ads.length > 1 && (
        <View style={styles.dots}>
          {ads.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => scrollTo(i)}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.35)',
                    width: i === activeIndex ? 18 : 6,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  card: {
    height: CARD_HEIGHT,
    position: 'relative',
    borderRadius: 10,
  },
  image: {
    width: SCREEN_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  textBlock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
