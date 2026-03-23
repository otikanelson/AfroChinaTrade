import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { tokenManager } from '../../services/api/tokenManager';
import { API_BASE_URL } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';
import { CustomModal } from '../../components/ui/CustomModal';

interface Address {
  type?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  landmark?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export default function EditAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  
  const [formData, setFormData] = useState<Address>({
    type: 'home',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    isDefault: false,
    landmark: '',
    location: undefined,
  });

  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [showStateModal, setShowStateModal] = useState(false);
  const [showLgaModal, setShowLgaModal] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [lgaSearch, setLgaSearch] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      flex: 1,
      marginLeft: spacing.base,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.base,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    formGroup: {
      marginBottom: spacing.base,
    },
    label: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: spacing.xs,
      marginStart: spacing.xs,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      fontSize: fontSizes.base,
      color: colors.text,
    },
    pickerButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pickerButtonText: {
      fontSize: fontSizes.base,
      color: colors.text,
    },
    pickerButtonPlaceholder: {
      color: colors.textSecondary,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
      marginLeft: spacing.xs
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxLabel: {
      fontSize: fontSizes.base,
      color: colors.text,
    },
    footer: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.base,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    submitButtonText: {
      color: colors.background,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
    },
    modalSearchInput: {
      marginHorizontal: spacing.base,
      marginVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      fontSize: fontSizes.base,
      color: colors.text,
    },
    modalItem: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemText: {
      fontSize: fontSizes.base,
      color: colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  useEffect(() => {
    fetchStates();
    fetchAddress();
  }, []);

  const fetchAddress = async () => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.status === 'success') {
        setFormData(data.data);
        if (data.data.state) {
          fetchLGAs(data.data.state);
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      Alert.alert('Error', 'Failed to load address');
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/states`);
      const data = await response.json();
      if (data.status === 'success') {
        setStates(data.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchLGAs = async (state: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/states/${state}/lgas`);
      const data = await response.json();
      if (data.status === 'success') {
        setLgas(data.data);
      }
    } catch (error) {
      console.error('Error fetching LGAs:', error);
    }
  };

  const handleStateSelect = (state: string) => {
    setFormData({ ...formData, state, city: '' });
    fetchLGAs(state);
    setShowStateModal(false);
    setStateSearch('');
  };

  const handleLgaSelect = (lga: string) => {
    setFormData({ ...formData, city: lga });
    setShowLgaModal(false);
    setLgaSearch('');
  };

  const handleSubmit = async () => {
    const trimmedStreet = formData.addressLine1?.trim();
    const trimmedCity = formData.city?.trim();
    const trimmedState = formData.state?.trim();
    const trimmedPostal = formData.postalCode?.trim();

    if (!trimmedStreet || !trimmedCity || !trimmedState || !trimmedPostal) {
      const missingFields = [];
      if (!trimmedStreet) missingFields.push('Street Address');
      if (!trimmedCity) missingFields.push('LGA');
      if (!trimmedState) missingFields.push('State');
      if (!trimmedPostal) missingFields.push('Postal Code');
      Alert.alert('Missing Fields', `Please fill in:\n• ${missingFields.join('\n• ')}`);
      return;
    }

    setSaving(true);
    const token = await tokenManager.getAccessToken();
    if (!token) {
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type || 'home',
          addressLine1: trimmedStreet,
          addressLine2: formData.addressLine2?.trim() || undefined,
          city: trimmedCity,
          state: trimmedState,
          country: formData.country,
          postalCode: trimmedPostal,
          landmark: formData.landmark?.trim() || undefined,
          location: formData.location,
          isDefault: formData.isDefault,
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        Alert.alert('Success', 'Address updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert('Error', 'Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  const filteredStates = states.filter(state =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredLgas = lgas.filter(lga =>
    lga.toLowerCase().includes(lgaSearch.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Address</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Address</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter street address"
              placeholderTextColor={colors.textSecondary}
              value={formData.addressLine1}
              onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>State *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowStateModal(true)}
            >
              <Text style={[
                styles.pickerButtonText,
                !formData.state && styles.pickerButtonPlaceholder
              ]}>
                {formData.state || 'Select state'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {formData.state && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Local Government Area *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowLgaModal(true)}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.city && styles.pickerButtonPlaceholder
                ]}>
                  {formData.city || 'Select LGA'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Postal Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter postal code"
              placeholderTextColor={colors.textSecondary}
              value={formData.postalCode}
              onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              style={styles.input}
              placeholder="Apartment, suite, etc. (optional)"
              placeholderTextColor={colors.textSecondary}
              value={formData.addressLine2}
              onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Landmark</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Near the market (optional)"
              placeholderTextColor={colors.textSecondary}
              value={formData.landmark}
              onChangeText={(text) => setFormData({ ...formData, landmark: text })}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                formData.isDefault && styles.checkboxActive
              ]}
              onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            >
              {formData.isDefault && (
                <Ionicons name="checkmark" size={16} color={colors.background} />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitButtonText}>Update Address</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        size="large"
        position="bottom"
        scrollable={true}
      >
        <TextInput
          style={styles.modalSearchInput}
          placeholder="Search states..."
          placeholderTextColor={colors.textSecondary}
          value={stateSearch}
          onChangeText={setStateSearch}
        />
        <FlatList
          data={filteredStates}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => handleStateSelect(item)}
            >
              <Text style={styles.modalItemText}>{item}</Text>
            </TouchableOpacity>
          )}
          style={{ maxHeight: 400 }}
        />
      </CustomModal>

      <CustomModal
        visible={showLgaModal}
        onClose={() => setShowLgaModal(false)}
        title="Select Local Government"
        size="large"
        position="bottom"
        scrollable={true}
      >
        <TextInput
          style={styles.modalSearchInput}
          placeholder="Search LGAs..."
          placeholderTextColor={colors.textSecondary}
          value={lgaSearch}
          onChangeText={setLgaSearch}
        />
        <FlatList
          data={filteredLgas}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => handleLgaSelect(item)}
            >
              <Text style={styles.modalItemText}>{item}</Text>
            </TouchableOpacity>
          )}
          style={{ maxHeight: 400 }}
        />
      </CustomModal>
    </SafeAreaView>
  );
}
