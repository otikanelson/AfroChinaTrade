import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Image, Switch, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { CustomModal } from '../../../components/ui/CustomModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { adService, Ad } from '../../../services/AdService';
import { useTourGuide } from '../../../contexts/TourGuideContext';
import { tourGuideService } from '../../../services/TourGuideService';
import { TourListModal } from '../../../components/tour/TourListModal';
import { TourButton } from '../../../components/tour/TourButton';

const PLACEMENT_OPTIONS = [
  { label: 'Home Page', value: 'home' },
  { label: 'Buy Now Page', value: 'buy-now' },
  { label: 'Product Detail Page', value: 'product-detail' },
];

export default function AdsManagement() {
  const router = useRouter();
  const { colors, spacing, fontSizes, borderRadius, fontWeights } = useTheme();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tourModalVisible, setTourModalVisible] = useState(false);
  const { startTour } = useTourGuide();
  
  const availableTours = tourGuideService.getToursByPage('ads');
  
  const [infoModal, setInfoModal] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({
    visible: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; ad: Ad | null }>({
    visible: false,
    ad: null
  });

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      // Fetch all ads (admin sees inactive too via direct API)
      const res = await adService.getAds();
      if (res.success && res.data) setAds(res.data);
    } catch {
      setInfoModal({
        visible: true,
        title: 'Error',
        message: 'Failed to load ads',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleToggle = async (ad: Ad) => {
    try {
      const res = await adService.updateAd(ad._id, { isActive: !ad.isActive });
      if (res.success) load();
    } catch {
      setInfoModal({
        visible: true,
        title: 'Error',
        message: 'Failed to update ad',
        type: 'error'
      });
    }
  };

  const handleDelete = (ad: Ad) => {
    setDeleteModal({ visible: true, ad });
  };

  const confirmDelete = async () => {
    if (!deleteModal.ad) return;
    
    const ad = deleteModal.ad;
    setDeleteModal({ visible: false, ad: null });
    
    try {
      const res = await adService.deleteAd(ad._id);
      if (res.success) {
        load();
        setInfoModal({
          visible: true,
          title: 'Success',
          message: 'Ad deleted successfully',
          type: 'success'
        });
      } else {
        setInfoModal({
          visible: true,
          title: 'Error',
          message: 'Failed to delete ad',
          type: 'error'
        });
      }
    } catch {
      setInfoModal({
        visible: true,
        title: 'Error',
        message: 'Failed to delete ad',
        type: 'error'
      });
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { flex: 1, padding: spacing.base },
    createBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    createBtnText: { color: colors.textInverse, fontSize: fontSizes.base, fontWeight: fontWeights.bold },
    card: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    thumb: { width: '100%', height: 120 },
    thumbPlaceholder: {
      width: '100%', height: 120,
      backgroundColor: colors.surface,
      alignItems: 'center', justifyContent: 'center',
    },
    cardBody: { padding: spacing.md },
    cardTitle: { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.text, marginBottom: 2 },
    cardDesc: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing.xs },
    cardLink: { fontSize: fontSizes.xs, color: colors.primary },
    placementText: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: spacing.xs, fontStyle: 'italic' },
    cardFooter: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      borderTopWidth: 1, borderTopColor: colors.borderLight,
    },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    statusLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
    actions: { flexDirection: 'row', gap: spacing.sm },
    actionBtn: {
      width: 34, height: 34, borderRadius: borderRadius.md,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1,
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyText: { fontSize: fontSizes.base, color: colors.textSecondary, marginTop: spacing.md },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  const renderAd = ({ item }: { item: Ad }) => (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Ionicons name="image-outline" size={32} color={colors.textLight} />
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.description ? <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
        {item.linkPath ? <Text style={styles.cardLink}>→ {item.linkPath}</Text> : null}
        <Text style={styles.placementText}>
          {Object.entries(item.placement || {})
            .map(([page, type]) => {
              const opt = PLACEMENT_OPTIONS.find(o => o.value === page);
              return opt ? `${opt.label.replace(' Page', '')}: ${type}` : '';
            })
            .filter(Boolean)
            .join(' • ') || 'No placement configured'}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.statusRow}>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggle(item)}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={item.isActive ? colors.primary : colors.textLight}
          />
          <Text style={styles.statusLabel}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
            onPress={() => router.push({ pathname: '/(admin)/ads/[id]', params: { id: item._id } })}
          >
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.error, backgroundColor: colors.error + '15' }]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Ads Management" 
        showBack
        rightAction={
          <TourButton onPress={() => setTourModalVisible(true)} variant="icon" />
        }
      />
      <View style={styles.content}>
        <TouchableOpacity style={styles.createBtn} onPress={() => router.push({ pathname: '/(admin)/ads/[id]', params: { id: 'new' } })}>
          <Ionicons name="add-circle" size={22} color={colors.textInverse} />
          <Text style={styles.createBtnText}>Create New Ad</Text>
        </TouchableOpacity>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={ads}
            renderItem={renderAd}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="megaphone-outline" size={56} color={colors.textLight} />
                <Text style={styles.emptyText}>No ads yet. Create your first one.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Info modal */}
      <CustomModal
        visible={infoModal.visible}
        title={infoModal.title}
        onClose={() => setInfoModal(prev => ({ ...prev, visible: false }))}
        size="small"
        position="center"
      >
        <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
          <Ionicons
            name={infoModal.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={48}
            color={infoModal.type === 'success' ? colors.success : colors.error}
          />
        </View>
        <Text style={{ fontSize: fontSizes.base, color: colors.text, lineHeight: 22, textAlign: 'center' }}>
          {infoModal.message}
        </Text>
        <TouchableOpacity
          style={{ marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center' }}
          onPress={() => setInfoModal(prev => ({ ...prev, visible: false }))}
        >
          <Text style={{ color: colors.textInverse, fontWeight: fontWeights.semibold as any, fontSize: fontSizes.base }}>OK</Text>
        </TouchableOpacity>
      </CustomModal>

      {/* Delete confirmation modal */}
      <CustomModal
        visible={deleteModal.visible}
        title="Delete Ad"
        onClose={() => setDeleteModal({ visible: false, ad: null })}
        size="small"
        position="center"
      >
        <Text style={{ fontSize: fontSizes.base, color: colors.text, lineHeight: 22, textAlign: 'center' }}>
          Are you sure you want to delete "{deleteModal.ad?.title}"? This action cannot be undone.
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
          <TouchableOpacity
            style={{ flex: 1, borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
            onPress={() => setDeleteModal({ visible: false, ad: null })}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: fontWeights.medium as any, fontSize: fontSizes.base }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.error }}
            onPress={confirmDelete}
          >
            <Text style={{ color: colors.textInverse, fontWeight: fontWeights.semibold as any, fontSize: fontSizes.base }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      <TourListModal
        visible={tourModalVisible}
        tours={availableTours}
        onClose={() => setTourModalVisible(false)}
      />
    </View>
  );
}
