import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

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

  return null;
}