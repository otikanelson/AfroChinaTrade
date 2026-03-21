import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#C41E3A" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Redirect based on user role
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    return <Redirect href="/(admin)/(tabs)/products" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
