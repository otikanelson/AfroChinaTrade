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
  { label: 'App Launch (Splash)', value: 'app' as const },
];

const AD_TYPE_OPTIONS = [
  { label: 'Carousel', value: 'carousel' as const },
  { label: 'Tile', value: 'tile' as const },
  { label: 'Splash Modal', value: 'splash' as const },
];

const SPLASH_FREQUENCY_OPTIONS = [
  { label: 'Once Ever', value: 'once' as const },
  { label: 'Daily', value: 'daily' as const },
  { label: 'Per Session', value: 'session' as const },
  { label: 'Always', value: 'always' as const },
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
      app: 'splash' as 'splash',
    },
    splashFrequency: 'daily' as 'once' | 'daily' | 'session' | 'always',
    splashDuration: '3000',
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
              app: 'splash',
            },
            splashFrequency: ad.splashFrequency || 'daily',
            splashDuration: String(ad.splashDuration || 3000),
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

  const togglePlacement = (page: 'home' | 'buy-now' | 'product-detail' | 'app') => {
    setForm(prev => {
      const newPlacement = { ...prev.placement };
      if (newPlacement[page]) {
        // Remove this page
        delete newPlacement[page];
      } else {
        // Add this page with default type
        if (page === 'app') {
          newPlacement[page] = 'splash';
        } else {
          newPlacement[page] = 'carousel';
        }
      }
      return { ...prev, placement: newPlacement };
    });
  };

  const updatePlacementType = (page: 'home' | 'buy-now' | 'product-detail' | 'app', type: 'carousel' | 'tile' | 'splash') => {
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

    // Validate splash ad settings
    if (form.placement.app) {
      const duration = parseInt(form.splashDuration) || 3000;
      if (duration < 1000 || duration > 10000) {
        setInfoModal({
          visible: true,
          title: 'Validation',
          message: 'Splash ad duration must be between 1 and 10 seconds',
          type: 'warning'
        });
        return;
      }
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
        splashFrequency: form.splashFrequency,
        splashDuration: parseInt(form.splashDuration) || 3000,
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
    frequencyContainer: {
      gap: spacing.sm,
    },
    fieldLabel: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    frequencyOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    frequencyOption: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    frequencyOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    frequencyOptionText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      fontWeight: fontWeights.medium,
    },
    frequencyOptionTextActive: {
      color: colors.textInverse,
    },
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
              aspectRatio={form.placement.app ? [9, 16] : [8, 3]}
              required
              helperText={
                form.placement.app 
                  ? "Recommended size: 720 × 1280px (portrait). For splash ads, use vertical images."
                  : "Recommended size: 800 × 300px (landscape). This is what users will see in the carousel."
              }
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
              placeholder="e.g., /products or /verified-suppliers"
              autoCapitalize="none"
            />
            <Text style={styles.hint}>
              Use app routes like /products, /verified-suppliers, /buy-now. Leave empty for a non-tappable banner.
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
                      {(option.value === 'app' ? [AD_TYPE_OPTIONS[2]] : AD_TYPE_OPTIONS.slice(0, 2)).map(typeOption => (
                        <TouchableOpacity
                          key={typeOption.value}
                          style={[
                            styles.adTypeButton,
                            adType === typeOption.value && styles.adTypeButtonActive
                          ]}
                          onPress={() => updatePlacementType(option.value, typeOption.value)}
                        >
                          <Ionicons
                            name={
                              typeOption.value === 'carousel' ? 'images-outline' :
                              typeOption.value === 'tile' ? 'grid-outline' :
                              'phone-portrait-outline'
                            }
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

          {/* Splash Ad Settings */}
          {form.placement.app && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Splash Ad Settings</Text>
              <Text style={styles.hint}>
                Configure how often and for how long the splash ad appears
              </Text>
              
              <View style={styles.frequencyContainer}>
                <Text style={styles.fieldLabel}>Show Frequency</Text>
                <View style={styles.frequencyOptions}>
                  {SPLASH_FREQUENCY_OPTIONS.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.frequencyOption,
                        form.splashFrequency === option.value && styles.frequencyOptionActive
                      ]}
                      onPress={() => update('splashFrequency', option.value)}
                    >
                      <Text style={[
                        styles.frequencyOptionText,
                        form.splashFrequency === option.value && styles.frequencyOptionTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <FormField
                label="Display Duration (seconds)"
                value={String(parseInt(form.splashDuration) / 1000)}
                onChangeText={v => update('splashDuration', String((parseFloat(v) || 3) * 1000))}
                placeholder="3"
                keyboardType="numeric"
                helperText="How long the splash ad stays visible (3-10 seconds recommended)"
              />
            </View>
          )}
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
