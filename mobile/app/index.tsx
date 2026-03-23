import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading, user, isGuestMode } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#C41E3A" />
      </View>
    );
  }

  // If authenticated, redirect based on role
  if (isAuthenticated && user) {
    if (user.role === 'admin' || user.role === 'super_admin') {
      return <Redirect href="/(admin)/(tabs)/products" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  // If in guest mode or not authenticated, go to home (guest browsing)
  return <Redirect href="/(tabs)/home" />;
}
