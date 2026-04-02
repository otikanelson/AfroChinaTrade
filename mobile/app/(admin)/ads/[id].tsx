import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { FormField } from '../../../components/admin/forms/FormField';
import { ImagePickerField, PickedImage } from '../../../components/admin/forms/ImagePickerField';
import { CustomModal } from '../../../components/ui/CustomModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { adService } from '../../../services/AdService';

const PLACEMENT_OPTIONS = [
  { label: 'Home Page', value: 'home' as const },
  { label: 'Buy Now Page', value: 'buy-now' as const },
  { label: 'Product Detail Page', value: 'product-detail' as const },
];

const AD_TYPE_OPTIONS = [
  { label: 'Carousel', value: 'carousel' as const },
  { label: 'Tile', value: 'tile' as const },
];

export default function AdFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const isEditing = id !== 'new';

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [imageFiles, setImageFiles] = useState<PickedImage[]>([]);
  const [infoModal, setInfoModal] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' }>({
    visible: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkPath: '',
    displayOrder: '0',
    isActive: true,
    placement: {
      home: 'carousel' as 'carousel' | 'tile',
      'buy-now': 'carousel' as 'carousel' | 'tile',
      'product-detail': 'carousel' as 'carousel' | 'tile',
    },
  });

  useEffect(() => {
    if (isEditing) loadAd();
  }, [id]);

  const loadAd = async () => {
    try {
      // Fetch all ads and find the one we need
      const res = await adService.getAds();
      if (res.success && res.data) {
        const ad = res.data.find(a => a._id === id);
        if (ad) {
          setForm({
            title: ad.title,
            description: ad.description || '',
            imageUrl: ad.imageUrl,
            linkPath: ad.linkPath || '',
            displayOrder: String(ad.displayOrder),
            isActive: ad.isActive,
            placement: ad.placement || {
              home: 'carousel',
              'buy-now': 'carousel',
              'product-detail': 'carousel',
            },
          });
          if (ad.imageUrl) {
            setImageFiles([{ uri: ad.imageUrl, width: 800, height: 300, uploaded: true, uploadedUrl: ad.imageUrl }]);
          }
        }
      }
    } catch {
      setInfoModal({
        visible: true,
        title: 'Error',
        message: 'Failed to load ad',
        type: 'error'
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string | boolean | Record<string, any>) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const togglePlacement = (page: 'home' | 'buy-now' | 'product-detail') => {
    setForm(prev => {
      const newPlacement = { ...prev.placement };
      if (newPlacement[page]) {
        // Remove this page
        delete newPlacement[page];
      } else {
        // Add this page with default carousel type
        newPlacement[page] = 'carousel';
      }
      return { ...prev, placement: newPlacement };
    });
  };

  const updatePlacementType = (page: 'home' | 'buy-now' | 'product-detail', type: 'carousel' | 'tile') => {
    setForm(prev => ({
      ...prev,
      placement: { ...prev.placement, [page]: type },
    }));
  };

  const handleImageChange = (imgs: PickedImage[]) => {
    setImageFiles(imgs);
    const url = imgs.length > 0 ? (imgs[0].uploadedUrl || imgs[0].uri) : '';
    update('imageUrl', url);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setInfoModal({
        visible: true,
        title: 'Validation',
        message: 'Title is required',
        type: 'warning'
      });
      return;
    }
    if (!form.imageUrl.trim()) {
      setInfoModal({
        visible: true,
        title: 'Validation',
        message: 'Please upload a flyer image',
        type: 'warning'
      });
      return;
    }
    if (Object.keys(form.placement).length === 0) {
      setInfoModal({
        visible: true,
        title: 'Validation',
        message: 'Please select at least one page placement',
        type: 'warning'
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim(),
        linkPath: form.linkPath.trim() || undefined,
        displayOrder: parseInt(form.displayOrder) || 0,
        isActive: form.isActive,
        placement: form.placement,
      };
      const res = isEditing
        ? await adService.updateAd(id, payload)
        : await adService.createAd(payload);

      if (res.success) {
        setInfoModal({
          visible: true,
          title: 'Success',
          message: `Ad ${isEditing ? 'updated' : 'created'} successfully`,
          type: 'success'
        });
        // Navigate back after a short delay
        setTimeout(() => router.back(), 1500);
      } else {
        setInfoModal({
          visible: true,
          title: 'Error',
          message: res.error?.message || 'Failed to save ad',
          type: 'error'
        });
      }
    } catch {
      setInfoModal({
        visible: true,
        title: 'Error',
        message: 'Failed to save ad',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { flex: 1 },
    form: { padding: spacing.base, gap: spacing.base },
    section: { gap: spacing.sm },
    sectionTitle: {
      fontSize: fontSizes.base, fontWeight: fontWeights.semibold,
      color: colors.text, marginBottom: spacing.xs,
    },
    hint: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: -spacing.xs },
    toggleRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.background, borderRadius: borderRadius.md,
      padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    },
    toggleLabel: { fontSize: fontSizes.sm, color: colors.text, fontWeight: fontWeights.medium },
    placementCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
      overflow: 'hidden',
    },
    placementHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      gap: spacing.sm,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.sm,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxLabel: {
      fontSize: fontSizes.sm,
      color: colors.text,
      fontWeight: fontWeights.medium,
      flex: 1,
    },
    adTypeSelector: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      paddingLeft: spacing.md + 24 + spacing.sm,
    },
    adTypeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    adTypeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    adTypeButtonText: {
      fontSize: fontSizes.xs,
      color: colors.text,
      fontWeight: fontWeights.medium,
    },
    adTypeButtonTextActive: {
      color: colors.textInverse,
    },
    saveBtn: {
      backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', paddingVertical: spacing.md, margin: spacing.base,
      borderRadius: borderRadius.md, gap: spacing.sm,
    },
    saveBtnText: { color: colors.textInverse, fontSize: fontSizes.base, fontWeight: fontWeights.bold },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={isEditing ? 'Edit Ad' : 'New Ad'} showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={isEditing ? 'Edit Ad' : 'New Ad'} showBack />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>

          {/* Flyer image */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flyer Image</Text>
            <ImagePickerField
              label="Ad Image"
              images={imageFiles}
              onImagesChange={handleImageChange}
              maxImages={1}
              aspectRatio={[8, 3]}
              required
              helperText="Recommended size: 800 × 300px (landscape). This is what users will see in the carousel."
            />
          </View>

          {/* Content */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content</Text>
            <FormField
              label="Title *"
              value={form.title}
              onChangeText={v => update('title', v)}
              placeholder="e.g., New Arrivals This Week"
            />
            <FormField
              label="Description"
              value={form.description}
              onChangeText={v => update('description', v)}
              placeholder="Short description shown below the title"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Link */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Link (optional)</Text>
            <FormField
              label="In-app route"
              value={form.linkPath}
              onChangeText={v => update('linkPath', v)}
              placeholder="e.g., /product-listing or /verified-suppliers"
              autoCapitalize="none"
            />
            <Text style={styles.hint}>
              Use app routes like /product-listing, /verified-suppliers, /buy-now. Leave empty for a non-tappable banner.
            </Text>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Display Placement & Type *</Text>
            <Text style={styles.hint}>
              Select pages where this ad will appear and choose the display type for each page
            </Text>
            
            {PLACEMENT_OPTIONS.map(option => {
              const isSelected = !!form.placement[option.value];
              const adType = form.placement[option.value] || 'carousel';
              
              return (
                <View key={option.value} style={styles.placementCard}>
                  <TouchableOpacity
                    style={styles.placementHeader}
                    onPress={() => togglePlacement(option.value)}
                  >
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxChecked
                    ]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color={colors.textInverse} />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{option.label}</Text>
                  </TouchableOpacity>
                  
                  {isSelected && (
                    <View style={styles.adTypeSelector}>
                      {AD_TYPE_OPTIONS.map(typeOption => (
                        <TouchableOpacity
                          key={typeOption.value}
                          style={[
                            styles.adTypeButton,
                            adType === typeOption.value && styles.adTypeButtonActive
                          ]}
                          onPress={() => updatePlacementType(option.value, typeOption.value)}
                        >
                          <Ionicons
                            name={typeOption.value === 'carousel' ? 'images-outline' : 'grid-outline'}
                            size={18}
                            color={adType === typeOption.value ? colors.textInverse : colors.text}
                          />
                          <Text style={[
                            styles.adTypeButtonText,
                            adType === typeOption.value && styles.adTypeButtonTextActive
                          ]}>
                            {typeOption.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

            <FormField
              label="Display Order"
              value={form.displayOrder}
              onChangeText={v => update('displayOrder', v)}
              placeholder="0"
              keyboardType="numeric"
              helperText="Lower numbers appear first in the carousel"
            />
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Active</Text>
              <Switch
                value={form.isActive}
                onValueChange={v => update('isActive', v)}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={form.isActive ? colors.primary : colors.textLight}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving && <Ionicons name="hourglass-outline" size={18} color={colors.textInverse} />}
        <Text style={styles.saveBtnText}>{isEditing ? 'Update Ad' : 'Create Ad'}</Text>
      </TouchableOpacity>

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
            name={
              infoModal.type === 'success' ? 'checkmark-circle' :
              infoModal.type === 'warning' ? 'warning' :
              'alert-circle'
            }
            size={48}
            color={
              infoModal.type === 'success' ? colors.success :
              infoModal.type === 'warning' ? colors.warning :
              colors.error
            }
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
    </View>
  );
}
