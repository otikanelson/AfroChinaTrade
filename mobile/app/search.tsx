import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FloatingCartButton } from '../components/FloatingCartButton';

// Redirect component for old search route
export default function SearchRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Redirect to new products page with search parameters
    router.replace({
      pathname: '/products',
      params: {
        ...params,
        query: params.query || params.q,
      }
    });
  }, []);

  // Show floating cart button even during redirect
  return <FloatingCartButton />;
}