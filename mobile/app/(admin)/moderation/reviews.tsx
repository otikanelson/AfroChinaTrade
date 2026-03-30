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
import { theme } from '../../../theme';
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
  const [text, setText] = useState('');
  return (
    <Modal visible={!!review} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Respond to Review</Text>
          {review && (
            <View style={styles.reviewPreview}>
              <StarRating rating={review.rating} />
              <Text style={styles.reviewPreviewText} numberOfLines={3}>{review.comment}</Text>
              <Text style={styles.reviewPreviewMeta}>— {review.userName}</Text>
            </View>
          )}
          <TextInput
            style={styles.responseInput}
            value={text}
            onChangeText={setText}
            placeholder="Write your public response…"
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.modalActions}>
            <Button label="Cancel" variant="secondary" onPress={() => { setText(''); onClose(); }} style={styles.modalBtn} />
            <Button label="Post Response" onPress={() => { if (review) { onSubmit(review._id, text.trim()); setText(''); } }} disabled={!text.trim()} style={styles.modalBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

type RatingFilter = 'all' | '1' | '2' | '3' | '4' | '5';

interface Props { embedded?: boolean }

export default function ReviewsScreen({ embedded }: Props) {
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
      
      // Handle both possible response structures
      const reviewsData = response.reviews || response.data || [];
      if (reviewsData.length > 0) {
        console.log('[Reviews] sample productId field:', JSON.stringify(reviewsData[0].productId));
      }
      setReviews(reviewsData);
      
      // For now, we'll skip responses and flagged reviews since they're not implemented in the backend
      setResponses([]);
      setFlagged(new Set());
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setResponses([]);
      setFlagged(new Set());
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const reviewsArray = Array.isArray(reviews) ? reviews : [];
    if (ratingFilter === 'all') return reviewsArray;
    return reviewsArray.filter((r) => r.rating === parseInt(ratingFilter));
  }, [reviews, ratingFilter]);

  const handleRespond = useCallback(async (reviewId: string, response: string) => {
    try {
      const apiResponse = await reviewService.addAdminResponse(reviewId, response);
      
      // The API returns { message: string; review: Review }
      if (apiResponse.message) {
        const newResp: ReviewResponse = { reviewId, response, createdAt: new Date().toISOString() };
        setResponses((prev) => [newResp, ...prev.filter((r) => r.reviewId !== reviewId)]);
        setRespondTo(null);
        mobileToastManager.success('Response posted', 'Done');
      } else {
        throw new Error('Failed to post response');
      }
    } catch (error) {
      console.error('Error posting review response:', error);
      Alert.alert('Error', 'Failed to post response.');
    }
  }, []);

  const handleFlag = useCallback(async (reviewId: string) => {
    // For now, just handle flagging locally since it's not implemented in the backend
    const newFlagged = new Set(flagged);
    if (newFlagged.has(reviewId)) { 
      newFlagged.delete(reviewId); 
    } else { 
      newFlagged.add(reviewId); 
    }
    setFlagged(newFlagged);
    mobileToastManager.info(newFlagged.has(reviewId) ? 'Review flagged' : 'Flag removed', 'Moderation');
  }, [flagged]);

  const Wrapper = embedded ? View : SafeAreaView;

  return (
    <Wrapper style={styles.screen}>
      {!embedded && <Header title="Product Reviews" subtitle="Manage and respond to reviews" showBack={true} />}
      {/* Rating filter */}
      <View style={styles.filterRow}>
        {(['all', '5', '4', '3', '2', '1'] as RatingFilter[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, ratingFilter === r && styles.chipActive]}
            onPress={() => setRatingFilter(r)}
            accessibilityRole="button"
            accessibilityState={{ selected: ratingFilter === r }}
          >
            <Text style={[styles.chipText, ratingFilter === r && styles.chipTextActive]}>
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
            <Card style={isFlagged ? { ...styles.card, ...styles.cardFlagged } : styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.userName}>{item.userName}</Text>
                  <StarRating rating={item.rating} />
                </View>
                <View style={styles.cardHeaderRight}>
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  <TouchableOpacity onPress={() => handleFlag(item._id)} accessibilityRole="button" accessibilityLabel={isFlagged ? 'Remove flag' : 'Flag review'}>
                    <Ionicons name={isFlagged ? 'flag' : 'flag-outline'} size={18} color={isFlagged ? theme.colors.error : theme.colors.textLight} />
                  </TouchableOpacity>
                </View>
              </View>
              {product && (
                <View style={styles.productRef}>
                  {product.images?.[0] && (
                    <Image source={{ uri: product.images[0] }} style={styles.productThumb} />
                  )}
                  <View style={styles.productRefTextWrap}>
                    <Text style={styles.productRefLabel}>Product</Text>
                    <Text style={styles.productRefName} numberOfLines={1}>{product.name}</Text>
                  </View>
                </View>
              )}
              <Text style={styles.comment}>{item.comment}</Text>
              {response && (
                <View style={styles.responseBox}>
                  <Text style={styles.responseLabel}>Your response:</Text>
                  <Text style={styles.responseText}>{response.response}</Text>
                </View>
              )}
              {!response && (
                <TouchableOpacity style={styles.respondBtn} onPress={() => setRespondTo(item)} accessibilityRole="button">
                  <Ionicons name="chatbubble-outline" size={14} color={theme.colors.primary} />
                  <Text style={styles.respondBtnText}>Respond</Text>
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
        contentContainerStyle={styles.listContent}
      />

      <RespondModal review={respondTo} onClose={() => setRespondTo(null)} onSubmit={handleRespond} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface },
  filterRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.base, paddingVertical: theme.spacing.sm, gap: theme.spacing.sm },
  chip: {
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  chipText: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary, fontWeight: theme.fontWeights.medium as any },
  chipTextActive: { color: theme.colors.background },
  listContent: { paddingBottom: theme.spacing['2xl'] },
  card: { marginHorizontal: theme.spacing.base, marginVertical: theme.spacing.xs },
  cardFlagged: { borderWidth: 1, borderColor: theme.colors.error + '60' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm },
  cardHeaderLeft: { gap: 4 },
  cardHeaderRight: { alignItems: 'flex-end', gap: 4 },
  userName: { fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  date: { fontSize: theme.fontSizes.xs, color: theme.colors.textLight },
  comment: { fontSize: theme.fontSizes.sm, color: theme.colors.text, lineHeight: 20 },
  productRef: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base,
    padding: theme.spacing.sm, marginBottom: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  productThumb: { width: 36, height: 36, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.border },
  productRefTextWrap: { flex: 1 },
  productRefLabel: { fontSize: theme.fontSizes.xs, color: theme.colors.textLight, marginBottom: 1 },
  productRefName: { fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium as any, color: theme.colors.text },
  responseBox: { marginTop: theme.spacing.sm, padding: theme.spacing.sm, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base, borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  responseLabel: { fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.primary, marginBottom: 2 },
  responseText: { fontSize: theme.fontSizes.sm, color: theme.colors.text },
  respondBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: theme.spacing.sm, alignSelf: 'flex-start' },
  respondBtnText: { fontSize: theme.fontSizes.sm, color: theme.colors.primary, fontWeight: theme.fontWeights.medium as any },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl, gap: theme.spacing.md,
  },
  modalTitle: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  reviewPreview: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.base, gap: 4 },
  reviewPreviewText: { fontSize: theme.fontSizes.sm, color: theme.colors.text, fontStyle: 'italic' },
  reviewPreviewMeta: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary },
  responseInput: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.base,
    padding: theme.spacing.md, fontSize: theme.fontSizes.base, color: theme.colors.text,
    backgroundColor: theme.colors.surface, minHeight: 100,
  },
  modalActions: { flexDirection: 'row', gap: theme.spacing.sm },
  modalBtn: { flex: 1 },
});
