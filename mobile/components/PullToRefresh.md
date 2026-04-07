# PullToRefresh Component

A custom pull-to-refresh component that provides both manual drag-to-refresh and automatic refresh functionality.

## Features

- **Manual Pull-to-Refresh**: Drag down from the top to manually refresh content
- **Auto-Refresh**: Automatically refreshes content at specified intervals (default: 30 seconds)
- **Visual Feedback**: Shows refresh progress with animated indicators
- **Smooth Animations**: Uses React Native's Animated API for smooth transitions
- **Customizable**: Configurable refresh threshold and auto-refresh interval

## Usage

```tsx
import { PullToRefresh } from '../components/PullToRefresh';

<PullToRefresh
  onRefresh={handleRefresh}
  refreshThreshold={80}
  autoRefreshInterval={30000}
  enableAutoRefresh={true}
>
  <YourContent />
</PullToRefresh>
```

## Props

- `onRefresh`: Function called when refresh is triggered (manual or auto)
- `refreshThreshold`: Distance in pixels to trigger refresh (default: 80)
- `autoRefreshInterval`: Time in milliseconds between auto-refreshes (default: 30000)
- `enableAutoRefresh`: Whether to enable automatic refreshing (default: true)

## Implementation Details

- Uses React Native's PanResponder for gesture handling
- No external dependencies required (works without react-native-gesture-handler)
- Automatically manages refresh state and animations
- Shows different indicators for manual vs auto refresh