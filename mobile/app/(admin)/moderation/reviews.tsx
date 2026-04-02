import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Image, Modal, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Review, reviewService } from '../../../services/ReviewService';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { Button } from '../../../components/admin/Button';
import { mobileToastManager } from '../../../utils/toast';
import { useTheme } from '../../../contexts/ThemeContext';
import { Header } from '../../../components/Header';

interface ReviewResponse { reviewId: string; response: string; createdAt: string }

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons key={s} name={s <= rating ? 'star' : 'star-outline'} size={14} color="#f59e0b" />
      ))}
    </View>
  );
}

interface RespondModalProps {
  review: Review | null;
  onClose: () => void;
  onSubmit: (reviewId: string, response: string) => void;
}

const RespondModal: React.FC<RespondModalProps> = ({ review, onClose, onSubmit }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [text, setText] = useState('');

  return (
    <Modal visible={!!review} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
          padding: spacing.xl, gap: spacing.md,
        }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold as any, color: colors.text }}>
            Respond to Review
          </Text>
          {review && (
            <View style={{ backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.base, gap: 4 }}>
              <StarRating rating={review.rating} />
              <Text style={{ fontSize: fontSizes.sm, color: colors.text, fontStyle: 'italic' }} numberOfLines={3}>
                {review.comment}
              </Text>
              <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary }}>— {review.userName}</Text>
            </View>
          )}
          <TextInput
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.base,
              padding: spacing.md, fontSize: fontSizes.base, color: colors.text,
              backgroundColor: colors.surface, minHeight: 100, textAlignVertical: 'top',
            }}
            value={text}
            onChangeText={setText}
            placeholder="Write your public response…"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
          />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button label="Cancel" variant="secondary" onPress={() => { setText(''); onClose(); }} style={{ flex: 1 }} />
            <Button
              label="Post Response"
              onPress={() => { if (review) { onSubmit(review._id, text.trim()); setText(''); } }}
              disabled={!text.trim()}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

type RatingFilter = 'all' | '1' | '2' | '3' | '4' | '5';
interface Props { embedded?: boolean }

export default function ReviewsScreen({ embedded }: Props) {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [responses, setResponses] = useState<ReviewResponse[]>([]);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [respondTo, setRespondTo] = useState<Review | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const response = await reviewService.getAllReviews(1, 100);
      const reviewsData = response.reviews || response.data || [];
      setReviews(reviewsData);
      setResponses([]);
      setFlagged(new Set());
    } catch {
      setReviews([]); setResponses([]); setFlagged(new Set());
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const arr = Array.isArray(reviews) ? reviews : [];
    if (ratingFilter === 'all') return arr;
    return arr.filter((r) => r.rating === parseInt(ratingFilter));
  }, [reviews, ratingFilter]);

  const handleRespond = useCallback(async (reviewId: string, response: string) => {
    try {
      const apiResponse = await reviewService.addAdminResponse(reviewId, response);
      if (apiResponse.message) {
        setResponses((prev) => [{ reviewId, response, createdAt: new Date().toISOString() }, ...prev.filter((r) => r.reviewId !== reviewId)]);
        setRespondTo(null);
        mobileToastManager.success('Response posted', 'Done');
      } else throw new Error();
    } catch {
      Alert.alert('Error', 'Failed to post response.');
    }
  }, []);

  const handleFlag = useCallback(async (reviewId: string) => {
    const next = new Set(flagged);
    next.has(reviewId) ? next.delete(reviewId) : next.add(reviewId);
    setFlagged(next);
    mobileToastManager.info(next.has(reviewId) ? 'Review flagged' : 'Flag removed', 'Moderation');
  }, [flagged]);

  const Wrapper = embedded ? View : SafeAreaView;

  return (
    <Wrapper style={{ flex: 1, backgroundColor: colors.surface }}>
      {!embedded && <Header title="Product Reviews" subtitle="Manage and respond to reviews" showBack />}

      {/* Rating filter chips */}
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: spacing.sm }}>
        {(['all', '5', '4', '3', '2', '1'] as RatingFilter[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={{
              paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
              borderRadius: borderRadius.full, borderWidth: 1.5,
              borderColor: ratingFilter === r ? colors.primary : colors.border,
              backgroundColor: ratingFilter === r ? colors.primary : colors.background,
            }}
            onPress={() => setRatingFilter(r)}
          >
            <Text style={{
              fontSize: fontSizes.sm,
              color: ratingFilter === r ? colors.textInverse : colors.textSecondary,
              fontWeight: fontWeights.medium as any,
            }}>
              {r === 'all' ? 'All' : `${r}★`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <DataList<Review>
        data={filtered}
        renderItem={({ item }) => {
          const response = responses.find((r) => r.reviewId === item._id);
          const isFlagged = flagged.has(item._id);
          const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
          return (
            <Card style={{
              marginHorizontal: spacing.base, marginVertical: spacing.xs,
              ...(isFlagged ? { borderWidth: 1, borderColor: colors.error + '60' } : {}),
            }}>
              {/* Header row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: fontSizes.base, fontWeight: fontWeights.semibold as any, color: colors.text }}>
                    {item.userName}
                  </Text>
                  <StarRating rating={item.rating} />
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.textLight }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity onPress={() => handleFlag(item._id)}>
                    <Ionicons name={isFlagged ? 'flag' : 'flag-outline'} size={18} color={isFlagged ? colors.error : colors.textLight} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Product reference */}
              {product && (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
                  backgroundColor: colors.surface, borderRadius: borderRadius.base,
                  padding: spacing.sm, marginBottom: spacing.sm,
                  borderWidth: 1, borderColor: colors.border,
                }}>
                  {product.images?.[0] && (
                    <Image source={{ uri: product.images[0] }} style={{ width: 36, height: 36, borderRadius: borderRadius.sm, backgroundColor: colors.border }} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.textLight, marginBottom: 1 }}>Product</Text>
                    <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.medium as any, color: colors.text }} numberOfLines={1}>
                      {product.name}
                    </Text>
                  </View>
                </View>
              )}

              {/* Comment */}
              <Text style={{ fontSize: fontSizes.sm, color: colors.text, lineHeight: 20 }}>{item.comment}</Text>

              {/* Existing response */}
              {response && (
                <View style={{
                  marginTop: spacing.sm, padding: spacing.sm,
                  backgroundColor: colors.surface, borderRadius: borderRadius.base,
                  borderLeftWidth: 3, borderLeftColor: colors.primary,
                }}>
                  <Text style={{ fontSize: fontSizes.xs, fontWeight: fontWeights.semibold as any, color: colors.primary, marginBottom: 2 }}>
                    Your response:
                  </Text>
                  <Text style={{ fontSize: fontSizes.sm, color: colors.text }}>{response.response}</Text>
                </View>
              )}

              {/* Respond button */}
              {!response && (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm, alignSelf: 'flex-start' }}
                  onPress={() => setRespondTo(item)}
                >
                  <Ionicons name="chatbubble-outline" size={14} color={colors.primary} />
                  <Text style={{ fontSize: fontSizes.sm, color: colors.primary, fontWeight: fontWeights.medium as any }}>Respond</Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        }}
        keyExtractor={(item) => item._id}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        emptyMessage="No reviews."
        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
      />

      <RespondModal review={respondTo} onClose={() => setRespondTo(null)} onSubmit={handleRespond} />
    </Wrapper>
  );
}
