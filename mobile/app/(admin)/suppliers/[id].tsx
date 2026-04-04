import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { FormField } from '../../../components/admin/forms/FormField';
import { ImagePickerField } from '../../../components/admin/forms/ImagePickerField';
import { supplierService } from '../../../services/SupplierService';
import { useTheme } from '../../../contexts/ThemeContext';
import { Supplier } from '../../../types/product';

export default function SupplierFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  
  const isEditing = id !== 'new';
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    logo: '',
    description: '',
    website: '',
    responseTime: '',
    verified: false,
  });

  const [logoImages, setLogoImages] = useState<any[]>([]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    form: {
      padding: spacing.base,
      gap: spacing.base,
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    verificationCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    verificationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    verificationTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginLeft: spacing.xs,
    },
    verificationStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
    },
    verifiedStatus: {
      backgroundColor: colors.success + '20',
    },
    unverifiedStatus: {
      backgroundColor: colors.warning + '20',
    },
    statusText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      marginLeft: spacing.xs,
    },
    verifiedText: {
      color: colors.success,
    },
    unverifiedText: {
      color: colors.warning,
    },
    verificationActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      flex: 1,
    },
    actionButtonSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    actionButtonTextSecondary: {
      color: colors.text,
    },
    saveButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      margin: spacing.base,
      gap: spacing.sm,
    },
    saveButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
  });

  useEffect(() => {
    if (isEditing) {
      loadSupplier();
    }
  }, [id]);

  const loadSupplier = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getSupplierById(id as string);
      
      if (response.success && response.data) {
        const supplier = response.data;
        setFormData({
          name: supplier.name || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          location: supplier.location || '',
          logo: supplier.logo || '',
          description: supplier.description || '',
          website: supplier.website || '',
          responseTime: supplier.responseTime || '',
          verified: supplier.verified || false,
        });
        
        // Set logo images if exists
        if (supplier.logo) {
          setLogoImages([{ uri: supplier.logo, id: '1' }]);
        }
      } else {
        Alert.alert('Error', 'Failed to load supplier details');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load supplier:', error);
      Alert.alert('Error', 'Failed to load supplier details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || 
          !formData.address.trim() || !formData.location.trim()) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return;
      }

      setSaving(true);
      
      let response;
      if (isEditing) {
        response = await supplierService.updateSupplier(id as string, formData);
      } else {
        response = await supplierService.createSupplier(formData);
      }
      
      if (response.success) {
        Alert.alert(
          'Success', 
          `Supplier ${isEditing ? 'updated' : 'created'} successfully`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', response.error?.message || `Failed to ${isEditing ? 'update' : 'create'} supplier`);
      }
    } catch (error) {
      console.error('Failed to save supplier:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} supplier`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVerification = () => {
    Alert.alert(
      formData.verified ? 'Unverify Supplier' : 'Verify Supplier',
      `Are you sure you want to ${formData.verified ? 'unverify' : 'verify'} this supplier?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: formData.verified ? 'Unverify' : 'Verify',
          onPress: () => setFormData(prev => ({ ...prev, verified: !prev.verified }))
        }
      ]
    );
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (images: any[]) => {
    setLogoImages(images);
    // Update the logo field with the first image URI
    const logoUri = images.length > 0 ? images[0].uri : '';
    updateField('logo', logoUri);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title={isEditing ? 'Edit Supplier' : 'Add Supplier'}
          showBack={true}
          onBackPress={() => router.back()}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? 'Edit Supplier' : 'Add Supplier'}
        showBack={true}
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <FormField
              label="Supplier Name *"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Enter supplier name"
            />
            
            <FormField
              label="Email Address *"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <FormField
              label="Phone Number *"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Location Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Information</Text>
            
            <FormField
              label="Address *"
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="Enter full address"
              multiline
              numberOfLines={3}
            />
            
            <FormField
              label="Location/City *"
              value={formData.location}
              onChangeText={(value) => updateField('location', value)}
              placeholder="Enter city or location"
            />
          </View>

          {/* Branding */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Branding</Text>
            
            <ImagePickerField
              label="Logo"
              images={logoImages}
              onImagesChange={handleLogoChange}
              maxImages={1}
              aspectRatio={[3, 1]}
              previewShape="square"
            />
            <Text style={{ fontSize: fontSizes.xs, color: colors.primaryDark, marginTop: -spacing.xs }}>
              Upload a PNG with a transparent background. Wide/landscape format (e.g. 300 × 80px) works best for logos that include the company name. The logo will appear directly on product cards — no background will be added.
            </Text>

            {/* Live preview of how logo appears on product card */}
            {formData.logo ? (
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                padding: spacing.sm,
                borderWidth: 1,
                borderColor: colors.border,
                marginTop: spacing.xs,
              }}>
                <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing.xs }}>
                  Preview on product card:
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  {formData.verified && (
                    <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
                  )}
                  <Image
                    source={{ uri: formData.logo }}
                    style={{ height: 18, width: 64, borderRadius: 3 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            ) : (
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                padding: spacing.sm,
                borderWidth: 1,
                borderColor: colors.border,
                marginTop: spacing.xs,
              }}>
                <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing.xs }}>
                  Example — how a logo with company name looks on a product card:
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
                  <View style={{ height: 18, width: 64, borderRadius: 3, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 7, fontWeight: '700' }}>BRAND NAME</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 10, color: colors.textLight, marginTop: spacing.xs }}>
                  Upload a logo above to see your actual preview here.
                </Text>
              </View>
            )}
            
            <FormField
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Brief description of the supplier"
              multiline
              numberOfLines={4}
            />
            
            <FormField
              label="Website"
              value={formData.website}
              onChangeText={(value) => updateField('website', value)}
              placeholder="https://example.com"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Service Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Information</Text>
            
            <FormField
              label="Response Time"
              value={formData.responseTime}
              onChangeText={(value) => updateField('responseTime', value)}
              placeholder="e.g., Within 24 hours"
            />
          </View>

          {/* Verification Status (only for editing) */}
          {isEditing && (
            <View style={styles.verificationCard}>
              <View style={styles.verificationHeader}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                <Text style={styles.verificationTitle}>Verification Status</Text>
              </View>
              
              <View style={[
                styles.verificationStatus,
                formData.verified ? styles.verifiedStatus : styles.unverifiedStatus
              ]}>
                <Ionicons 
                  name={formData.verified ? "shield-checkmark" : "shield-outline"} 
                  size={16} 
                  color={formData.verified ? colors.success : colors.warning} 
                />
                <Text style={[
                  styles.statusText,
                  formData.verified ? styles.verifiedText : styles.unverifiedText
                ]}>
                  {formData.verified ? 'Verified Supplier' : 'Pending Verification'}
                </Text>
              </View>
              
              <View style={styles.verificationActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    formData.verified ? styles.actionButtonSecondary : undefined
                  ]}
                  onPress={handleToggleVerification}
                >
                  <Text style={[
                    styles.actionButtonText,
                    formData.verified ? styles.actionButtonTextSecondary : undefined
                  ]}>
                    {formData.verified ? 'Unverify' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving && <Ionicons name="hourglass-outline" size={20} color={colors.textInverse} />}
        <Text style={styles.saveButtonText}>
          {isEditing ? 'Update Supplier' : 'Create Supplier'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}