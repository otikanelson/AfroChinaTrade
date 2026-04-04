import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Redirect component for old product-listing route
export default function ProductListingRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Redirect to new products page with all parameters
    router.replace({
      pathname: '/products',
      params
    });
  }, []);

  return null;
}