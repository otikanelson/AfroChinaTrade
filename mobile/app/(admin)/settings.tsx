import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Switch, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { CustomModal } from '../../components/ui/CustomModal';
import { useTheme } from '../../contexts/ThemeContext';
import { pageLayoutService, LayoutBlock } from '../../services/PageLayoutService';
import { collectionService } from '../../services/CollectionService';
import { Collection } from '../../types/product';
import { adService } from '../../services/AdService';

const BLOCK_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  featured_products: 'star',
  trending_products: 'flame',
  seller_favorites: 'ribbon',
  discounted_products: 'pricetag',
  new_arrivals: 'sparkles',
  recommendations: 'heart',
  collection: 'albums',
  ad_carousel: 'megaphone',
  promo_tiles: 'grid',
};

const BLOCK_COLORS: Record<string, string> = {
  featured_products: '#D4AF37',
  trending_products: '#f97316',
  seller_favorites: '#C41E3A',
  discounted_products: '#DC3545',
  new_arrivals: '#16a34a',
  recommendations: '#e11d48',
  collection: '#3b82f6',
  ad_carousel: '#8b5cf6',
  promo_tiles: '#06b6d4',
};

type PageKey = 'home' | 'buy-now';

export default function PageLayoutSettings() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [activePage, setActivePage] = useState<PageKey>('home');
  const [layouts, setLayouts] = useState<Record<PageKey, LayoutBlock[]>>({ home: [], 'buy-now': [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [dirty, setDirty] = useState(false);

  const [infoModal, setInfoModal] = useState<{ visible: boolean; title: string; message: string }>({ visible: false, title: '', message: '' });
  const [resetModal, setResetModal] = useState(false);
  const [validationModal, setValidationModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const showInfo = (title: string, message: string) => setInfoModal({ visible: true, title, message });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [homeRes, buyRes, colRes] = await Promise.all([
        pageLayoutService.getLayout('home'),
        pageLayoutService.getLayout('buy-now'),
        collectionService.getActiveCollections(),
      ]);
      setLayouts({
        home: homeRes.data?.blocks ?? [],
        'buy-now': buyRes.data?.blocks ?? [],
      });
      if (colRes.success && colRes.data) setCollections(colRes.data);
    } catch { showInfo('Error', 'Failed to load layouts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const blocks = [...(layouts[activePage] ?? [])].sort((a, b) => a.order - b.order);

  const updateBlock = (id: string, patch: Partial<LayoutBlock>) => {
    setLayouts(prev => ({
      ...prev,
      [activePage]: prev[activePage].map(b => b.id === id ? { ...b, ...patch } : b),
    }));
    setDirty(true);
  };

  const moveBlock = (id: string, dir: 'up' | 'down') => {
    const sorted = [...blocks];
    const idx = sorted.findIndex(b => b.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const newBlocks = sorted.map(b => {
      if (b.id === sorted[idx].id) return { ...b, order: sorted[swapIdx].order };
      if (b.id === sorted[swapIdx].id) return { ...b, order: sorted[idx].order };
      return b;
    });
    setLayouts(prev => ({ ...prev, [activePage]: newBlocks }));
    setDirty(true);
  };

  const addCollectionBlock = (col: Collection) => {
    const colId = (col as any)._id || col.id;
    const existing = layouts[activePage].find(b => b.config?.collectionId === colId);
    if (existing) { showInfo('Already added', `"${col.name}" is already in the layout`); return; }
    const maxOrder = Math.max(0, ...layouts[activePage].map(b => b.order));
    const newBlock: LayoutBlock = {
      id: `collection_${colId}`,
      type: 'collection',
      label: col.name,
      enabled: true,
      order: maxOrder + 1,
      config: { collectionId: colId, collectionName: col.name },
    };
    setLayouts(prev => ({ ...prev, [activePage]: [...prev[activePage], newBlock] }));
    setDirty(true);
  };

  const removeBlock = (id: string) => {
    setLayouts(prev => ({ ...prev, [activePage]: prev[activePage].filter(b => b.id !== id) }));
    setDirty(true);
  };

  const handleSave = async () => {
    // Check if layout has ad_carousel or promo_tiles blocks enabled
    const currentLayout = layouts[activePage];
    const hasAdCarousel = currentLayout.some(b => b.type === 'ad_carousel' && b.enabled);
    const hasPromoTiles = currentLayout.some(b => b.type === 'promo_tiles' && b.enabled);

    if (hasAdCarousel || hasPromoTiles) {
      // Validate that ads exist for this page
      try {
        const [carouselRes, tileRes] = await Promise.all([
          hasAdCarousel ? adService.getAds(activePage, 'carousel') : Promise.resolve({ success: true, data: [] }),
          hasPromoTiles ? adService.getAds(activePage, 'tile') : Promise.resolve({ success: true, data: [] }),
        ]);

        const carouselAds = carouselRes.data || [];
        const tileAds = tileRes.data || [];
        const missingTypes: string[] = [];

        if (hasAdCarousel && carouselAds.length === 0) {
          missingTypes.push('carousel ads');
        }
        if (hasPromoTiles && tileAds.length === 0) {
          missingTypes.push('tile ads');
        }

        if (missingTypes.length > 0) {
          const pageName = activePage === 'home' ? 'Home' : 'Buy Now';
          setValidationModal({
            visible: true,
            message: `There are no ${missingTypes.join(' or ')} configured for the ${pageName} page. Please create ${missingTypes.join(' or ')} before enabling these sections, or disable them in the layout.`,
          });
          return;
        }
      } catch {
        showInfo('Error', 'Failed to validate ads');
        return;
      }
    }

    setSaving(true);
    try {
      await pageLayoutService.updateLayout(activePage, layouts[activePage]);
      setDirty(false);
      showInfo('Saved', `${activePage === 'home' ? 'Home' : 'Buy Now'} layout saved successfully.`);
    } catch { showInfo('Error', 'Failed to save layout'); }
    finally { setSaving(false); }
  };

  const handleReset = () => setResetModal(true);

  const confirmReset = async () => {
    setResetModal(false);
    setSaving(true);
    try {
      const res = await pageLayoutService.resetLayout(activePage);
      if (res.success && res.data) {
        setLayouts(prev => ({ ...prev, [activePage]: res.data!.blocks }));
        setDirty(false);
        showInfo('Reset', 'Layout restored to default.');
      }
    } catch { showInfo('Error', 'Failed to reset'); }
    finally { setSaving(false); }
  };

  const unusedCollections = collections.filter(col => {
    const colId = (col as any)._id || col.id;
    return !layouts[activePage].some(b => b.config?.collectionId === colId);
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header
        title="Page Layout"
        subtitle="Use ↑↓ arrows to reorder sections"
        showBack
        rightAction={
          dirty ? (
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.md }}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={{ color: colors.textInverse, fontSize: fontSizes.sm, fontWeight: fontWeights.bold as any }}>
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Page tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: spacing.sm }}>
        {(['home', 'buy-now'] as PageKey[]).map(p => (
          <TouchableOpacity
            key={p}
            style={{
              flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
              backgroundColor: activePage === p ? colors.primary : colors.background,
              borderWidth: 1, borderColor: activePage === p ? colors.primary : colors.border,
              alignItems: 'center',
            }}
            onPress={() => setActivePage(p)}
          >
            <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: activePage === p ? colors.textInverse : colors.text }}>
              {p === 'home' ? 'Home Page' : 'Buy Now Page'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.base, paddingBottom: 40 }}>
          <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.text, marginBottom: spacing.sm }}>
            Layout Blocks ({blocks.filter(b => b.enabled).length} active)
          </Text>

          {blocks.map((block, idx) => {
            const accent = BLOCK_COLORS[block.type] ?? colors.primary;
            const icon = BLOCK_ICONS[block.type] ?? 'grid-outline';
            return (
              <View
                key={block.id}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: borderRadius.md,
                  marginBottom: spacing.sm,
                  borderLeftWidth: 4,
                  borderLeftColor: block.enabled ? accent : colors.border,
                  opacity: block.enabled ? 1 : 0.55,
                  overflow: 'hidden',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm }}>
                  <View style={{ gap: 2 }}>
                    <TouchableOpacity onPress={() => moveBlock(block.id, 'up')} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.3 : 1 }}>
                      <Ionicons name="chevron-up" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => moveBlock(block.id, 'down')} disabled={idx === blocks.length - 1} style={{ opacity: idx === blocks.length - 1 ? 0.3 : 1 }}>
                      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: accent + '20', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={icon} size={16} color={accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.text }}>{block.label}</Text>
                    <Text style={{ fontSize: 10, color: colors.textSecondary, textTransform: 'capitalize' }}>{block.type.replace(/_/g, ' ')}</Text>
                  </View>
                  <Switch
                    value={block.enabled}
                    onValueChange={v => updateBlock(block.id, { enabled: v })}
                    trackColor={{ false: colors.border, true: accent + '80' }}
                    thumbColor={block.enabled ? accent : colors.textLight}
                  />
                  {block.type === 'collection' && (
                    <TouchableOpacity onPress={() => removeBlock(block.id)} style={{ marginLeft: 4 }}>
                      <Ionicons name="close-circle" size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {unusedCollections.length > 0 && (
            <>
              <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }}>
                Add Collection Section
              </Text>
              {unusedCollections.map(col => (
                <TouchableOpacity
                  key={(col as any)._id || col.id}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
                    backgroundColor: colors.background, borderRadius: borderRadius.md,
                    padding: spacing.md, marginBottom: spacing.xs,
                    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
                  }}
                  onPress={() => addCollectionBlock(col)}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  <Text style={{ fontSize: fontSizes.sm, color: colors.primary, flex: 1 }}>{col.name}</Text>
                  <Text style={{ fontSize: 10, color: colors.textSecondary }}>Collection</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          <TouchableOpacity
            style={{ marginTop: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.error, alignItems: 'center' }}
            onPress={handleReset}
          >
            <Text style={{ color: colors.error, fontSize: fontSizes.sm, fontWeight: fontWeights.medium as any }}>Reset to Default Layout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Info modal — inside root View */}
      <CustomModal
        visible={infoModal.visible}
        title={infoModal.title}
        onClose={() => setInfoModal(prev => ({ ...prev, visible: false }))}
        size="small"
        position="center"
      >
        <Text style={{ fontSize: fontSizes.base, color: colors.text, lineHeight: 22 }}>
          {infoModal.message}
        </Text>
        <TouchableOpacity
          style={{ marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center' }}
          onPress={() => setInfoModal(prev => ({ ...prev, visible: false }))}
        >
          <Text style={{ color: colors.textInverse, fontWeight: fontWeights.semibold as any, fontSize: fontSizes.base }}>OK</Text>
        </TouchableOpacity>
      </CustomModal>

      {/* Reset confirm modal — inside root View */}
      <CustomModal
        visible={resetModal}
        title="Reset Layout"
        onClose={() => setResetModal(false)}
        size="small"
        position="center"
      >
        <Text style={{ fontSize: fontSizes.base, color: colors.text, lineHeight: 22 }}>
          Restore the default layout for the {activePage === 'home' ? 'Home' : 'Buy Now'} page? All custom changes will be lost.
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
          <TouchableOpacity
            style={{ flex: 1, borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
            onPress={() => setResetModal(false)}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: fontWeights.medium as any, fontSize: fontSizes.base }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.error }}
            onPress={confirmReset}
          >
            <Text style={{ color: colors.textInverse, fontWeight: fontWeights.semibold as any, fontSize: fontSizes.base }}>Reset</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* Validation modal for missing ads */}
      <CustomModal
        visible={validationModal.visible}
        title="Missing Ads"
        onClose={() => setValidationModal({ visible: false, message: '' })}
        size="small"
        position="center"
      >
        <View style={{ gap: spacing.sm }}>
          <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
            <Ionicons name="warning-outline" size={48} color={colors.warning} />
          </View>
          <Text style={{ fontSize: fontSizes.base, color: colors.text, lineHeight: 22, textAlign: 'center' }}>
            {validationModal.message}
          </Text>
        </View>
        <TouchableOpacity
          style={{ marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center' }}
          onPress={() => setValidationModal({ visible: false, message: '' })}
        >
          <Text style={{ color: colors.textInverse, fontWeight: fontWeights.semibold as any, fontSize: fontSizes.base }}>OK</Text>
        </TouchableOpacity>
      </CustomModal>
    </View>
  );
}
