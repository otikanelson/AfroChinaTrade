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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { tokenManager } from '../../services/api/tokenManager';
import { API_BASE_URL } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  landmark?: string;
  locationSummary?: string;
}

export default function EditAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, setUser } = useAuth();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  
  const [formData, setFormData] = useState<Address | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
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
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
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
    locationButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    locationButtonText: {
      color: colors.background,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    locationInfo: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginTop: spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    locationInfoText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
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
  });

  useEffect(() => {
    fetchStates();
    loadAddress();
  }, []);

  useEffect(() => {
    if (formData?.state) {
      fetchLGAs(formData.state);
    }
  }, [formData?.state]);

  const loadAddress = () => {
    if (user?.addresses && id) {
      const addressIndex = parseInt(id as string);
      if (addressIndex >= 0 && addressIndex < user.addresses.length) {
        setFormData(user.addresses[addressIndex]);
      }
    }
    setLoading(false);
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
    if (formData) {
      setFormData({ ...formData, state, city: '' });
    }
    setShowStateModal(false);
    setStateSearch('');
  };

  const handleLgaSelect = (lga: string) => {
    if (formData) {
      setFormData({ ...formData, city: lga });
    }
    setShowLgaModal(false);
    setLgaSearch('');
  };

  const getDeviceLocation = async () => {
    try {
      setGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          const location = reverseGeocode[0];
          const summary = [
            location.street,
            location.district,
            location.city,
            location.region,
          ]
            .filter(Boolean)
            .join(', ');
          
          // Autofill fields from location data
          if (formData) {
            setFormData({
              ...formData,
              street: location.street || formData.street,
              city: location.city || location.district || formData.city,
              state: location.region || formData.state,
              postalCode: location.postalCode || formData.postalCode,
              locationSummary: summary,
            });
          }
        }
      } catch (error) {
        console.error('Error getting location summary:', error);
        if (formData) {
          setFormData({ ...formData, locationSummary: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get device location');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData) return;

    // All fields except landmark are required
    if (!formData.street || !formData.city || !formData.state || !formData.postalCode) {
      Alert.alert('Validation Error', 'Please fill in all required fields or capture device location');
      return;
    }

    setSaving(true);
    const token = await tokenManager.getAccessToken();
    if (!token) {
      setSaving(false);
      return;
    }

    try {
      const addressIndex = parseInt(id as string);
      const updatedAddresses = user?.addresses ? [...user.addresses] : [];
      updatedAddresses[addressIndex] = {
        street: formData.street.trim() || 'Device Location',
        city: formData.city.trim() || (formData.locationSummary ? 'Current Location' : ''),
        state: formData.state.trim() || '',
        country: formData.country,
        postalCode: formData.postalCode.trim() || '',
        isDefault: formData.isDefault,
        landmark: formData.landmark?.trim(),
        locationSummary: formData.locationSummary?.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/users/profile/addresses`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        if (setUser) {
          setUser(data.data);
        }
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

  if (loading || !formData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const filteredStates = states.filter(state =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredLgas = lgas.filter(lga =>
    lga.toLowerCase().includes(lgaSearch.toLowerCase())
  );

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
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getDeviceLocation}
            disabled={gettingLocation}
          >
            <Ionicons 
              name={gettingLocation ? "hourglass" : "location"} 
              size={20} 
              color={colors.background} 
            />
            <Text style={styles.locationButtonText}>
              {gettingLocation ? 'Getting location...' : 'Update Location'}
            </Text>
          </TouchableOpacity>
          
          {formData.locationSummary && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationInfoText}>
                📍 {formData.locationSummary}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Landmark</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Near the market, opposite the school"
              placeholderTextColor={colors.textSecondary}
              value={formData.landmark || ''}
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
            <Text style={styles.submitButtonText}>Save Changes</Text>
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

      <Modal
        visible={showStateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
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
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLgaModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLgaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Local Government</Text>
              <TouchableOpacity onPress={() => setShowLgaModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
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
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
