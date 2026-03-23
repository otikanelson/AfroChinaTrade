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
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { tokenManager } from '../../services/api/tokenManager';
import { API_BASE_URL } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';
import { CustomModal } from '../../components/ui/CustomModal';
import { useAlertContext } from '../../contexts/AlertContext';

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

export default function NewAddressScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const alert = useAlertContext();
  
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
  const [loading, setLoading] = useState(false);
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
    locationStatusContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      marginTop: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    locationStatusText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      flex: 1,
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
      marginTop: spacing.sm,
      marginBottom: spacing.base,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      fontSize: fontSizes.base,
      color: colors.text,
    },
    modalItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemText: {
      fontSize: fontSizes.base,
      color: colors.text,
      flex: 1,
    },
  });

  useEffect(() => {
    fetchStates();
  }, []);

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

  const getDeviceLocation = async () => {
    try {
      setGettingLocation(true);
      setLocationStatus('Requesting location permission...');

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationStatus('Location permission denied');
        setTimeout(() => setLocationStatus(''), 3000);
        setGettingLocation(false);
        return;
      }

      setLocationStatus('Getting your location...');
      
      // Use lower accuracy for faster results (3-5 seconds instead of 10-15)
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // Changed from Balanced to Low for speed
        timeInterval: 5000, // Maximum 5 seconds wait
        distanceInterval: 0,
      });

      const { latitude, longitude, accuracy } = currentLocation.coords;
      console.log('Got GPS coordinates:', { latitude, longitude, accuracy });

      // Save coordinates immediately - don't wait for reverse geocoding
      setFormData(prev => ({
        ...prev,
        location: {
          latitude,
          longitude,
          accuracy: accuracy || undefined,
        }
      }));

      setLocationStatus('✓ GPS captured! You can now enter address details.');
      
      // Try reverse geocoding in background (non-blocking)
      // If it fails or takes too long, user can still proceed with manual entry
      setTimeout(async () => {
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (reverseGeocode.length > 0) {
            const location = reverseGeocode[0];
            console.log('Reverse geocode result:', reverseGeocode);

            // Only update if fields are still empty
            setFormData(prev => ({
              ...prev,
              addressLine1: prev.addressLine1 || location.street?.trim() || '',
              city: prev.city || (location.city || location.district)?.trim() || '',
              state: prev.state || location.region?.trim() || '',
              postalCode: prev.postalCode || location.postalCode?.trim() || '',
              location: {
                latitude,
                longitude,
                accuracy: accuracy || undefined,
              }
            }));
            
            setLocationStatus('✓ Location and address captured!');
          }
        } catch (error) {
          console.log('Reverse geocoding failed (non-critical):', error);
          // Don't show error - GPS coordinates are already saved
        }
      }, 100); // Start reverse geocoding after a brief delay

      setTimeout(() => setLocationStatus(''), 5000);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationStatus('Failed to get location. Please enter address manually.');
      setTimeout(() => setLocationStatus(''), 3000);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedStreet = formData.addressLine1?.trim();
    const trimmedCity = formData.city?.trim();
    const trimmedState = formData.state?.trim();
    const trimmedPostal = formData.postalCode?.trim();

    console.log('Form validation:', {
      street: `"${trimmedStreet}"`,
      city: `"${trimmedCity}"`,
      state: `"${trimmedState}"`,
      postal: `"${trimmedPostal}"`,
      hasLocation: !!formData.location,
    });

    // Check if all manual fields are filled
    const hasAllManualFields = trimmedStreet && trimmedCity && trimmedState && trimmedPostal;

    // If all manual fields are filled, allow submission (GPS is optional)
    if (hasAllManualFields) {
      console.log('✓ Submitting with all manual fields filled');
      setLoading(true);
      const token = await tokenManager.getAccessToken();
      console.log('Token:', token ? '✓ obtained' : '✗ missing');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const payload = {
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
      };

      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
      console.log('📤 API URL:', `${API_BASE_URL}/addresses`);
      console.log('📤 Token present:', !!token);

      try {
        console.log('🌐 Fetching:', `${API_BASE_URL}/addresses`);
        const response = await fetch(`${API_BASE_URL}/addresses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        
        const responseText = await response.text();
        console.log('📥 Response text:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('📥 Parsed response:', JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.error('✗ Failed to parse response:', parseError);
          Alert.alert('Error', 'Invalid response from server');
          return;
        }
        
        if (data.status === 'success') {
          console.log('✓ Success! Address created:', data.data);
          alert.showSuccess('Success', 'Address added successfully', 2000);
          setTimeout(() => router.back(), 2000);
        } else {
          console.log('✗ Error from server:', data.message);
          console.log('✗ Error code:', data.errorCode);
          console.log('✗ Error fields:', data.fields);
          Alert.alert('Error', data.message || 'Failed to add address');
        }
      } catch (error) {
        console.error('✗ Fetch error:', error);
        console.error('✗ Error details:', JSON.stringify(error, null, 2));
        Alert.alert('Error', 'Failed to create address. Check console for details.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // If not all manual fields, check if we have GPS + street
    if (formData.location && trimmedStreet) {
      console.log('Submitting with GPS location');
      setLoading(true);
      const token = await tokenManager.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: formData.type || 'home',
            addressLine1: trimmedStreet,
            addressLine2: formData.addressLine2?.trim() || undefined,
            city: trimmedCity || 'Current Location',
            state: trimmedState || 'GPS Location',
            country: formData.country,
            postalCode: trimmedPostal || 'GPS',
            landmark: formData.landmark?.trim() || undefined,
            location: formData.location,
            isDefault: formData.isDefault,
          }),
        });

        const data = await response.json();
        
        if (data.status === 'success') {
          Alert.alert('Success', 'Address added successfully', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } else {
          Alert.alert('Error', data.message || 'Failed to add address');
        }
      } catch (error) {
        console.error('Error creating address:', error);
        Alert.alert('Error', 'Failed to create address');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Missing required fields
    const missingFields = [];
    if (!trimmedStreet) missingFields.push('Street Address');
    if (!trimmedCity) missingFields.push('LGA');
    if (!trimmedState) missingFields.push('State');
    if (!trimmedPostal) missingFields.push('Postal Code');

    console.log('Missing fields:', missingFields);

    Alert.alert('Missing Fields', `Please fill in:\n• ${missingFields.join('\n• ')}`);
  };

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
        <Text style={styles.headerTitle}>Add New Address</Text>
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
              {gettingLocation ? 'Capturing...' : 'Quick Capture GPS'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: spacing.sm, fontSize: fontSizes.xs, color: colors.textSecondary }]}>
            GPS capture is optional. You can enter address manually.
          </Text>

          {gettingLocation && (
            <View style={styles.locationStatusContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.locationStatusText}>{locationStatus}</Text>
            </View>
          )}

          {locationStatus && !gettingLocation && (
            <View style={styles.locationStatusContainer}>
              <Ionicons 
                name={locationStatus.includes('✓') ? "checkmark-circle" : "information-circle"} 
                size={20} 
                color={locationStatus.includes('✓') ? colors.success : colors.primary} 
              />
              <Text style={styles.locationStatusText}>{locationStatus}</Text>
            </View>
          )}

          {formData.location && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationInfoText}>
                📍 GPS: {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
              </Text>
              <Text style={[styles.locationInfoText, { fontSize: fontSizes.xs, marginTop: 4 }]}>
                Accuracy: ±{Math.round(formData.location.accuracy || 0)}m
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
              placeholder="e.g., Near the market, opposite the school (optional)"
              placeholderTextColor={colors.textSecondary}
              value={formData.landmark}
              onChangeText={(text) => setFormData({ ...formData, landmark: text })}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitButtonText}>Add Address</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={showStateModal}
        onClose={() => {
          setShowStateModal(false);
          setStateSearch('');
        }}
        title="Select State"
        size="large"
        position="bottom"
        scrollable={false}
      >
        <View style={{ height: 500 }}>
          <TextInput
            style={styles.modalSearchInput}
            placeholder="Search states..."
            placeholderTextColor={colors.textSecondary}
            value={stateSearch}
            onChangeText={setStateSearch}
            autoFocus
          />
          <FlatList
            data={filteredStates}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleStateSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalItemText}>{item}</Text>
                {formData.state === item && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: spacing.base }}
            ListEmptyComponent={
              <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSizes.base }}>
                  No states found
                </Text>
              </View>
            }
          />
        </View>
      </CustomModal>

      <CustomModal
        visible={showLgaModal}
        onClose={() => {
          setShowLgaModal(false);
          setLgaSearch('');
        }}
        title="Select Local Government"
        size="large"
        position="bottom"
        scrollable={false}
      >
        <View style={{ height: 500 }}>
          <TextInput
            style={styles.modalSearchInput}
            placeholder="Search LGAs..."
            placeholderTextColor={colors.textSecondary}
            value={lgaSearch}
            onChangeText={setLgaSearch}
            autoFocus
          />
          <FlatList
            data={filteredLgas}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleLgaSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalItemText}>{item}</Text>
                {formData.city === item && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: spacing.base }}
            ListEmptyComponent={
              <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSizes.base }}>
                  {formData.state ? 'No LGAs found' : 'Please select a state first'}
                </Text>
              </View>
            }
          />
        </View>
      </CustomModal>
    </SafeAreaView>
  );
}
