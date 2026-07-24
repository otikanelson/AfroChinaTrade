import { ExpoRoot } from 'expo-router';

// This file is required for Expo compatibility
// The actual routing is handled by app/_layout.tsx
export default function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}