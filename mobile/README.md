# AfroChinaTrade Mobile App

React Native e-commerce app built with Expo and TypeScript.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platform:
```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## Project Structure

```
mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── theme/          # Theme configuration (colors, typography, spacing)
│   ├── types/          # TypeScript type definitions
│   ├── data/           # Mock data and constants
│   └── constants/      # App configuration
├── assets/             # Images, fonts, and other assets
├── App.tsx             # Root component
└── app.json            # Expo configuration
```

## Theme

The app uses a custom theme based on the AfroChinaTrade brand:
- Primary: Deep Red (#C41E3A)
- Secondary: Deep Green (#2D5F3F)
- Accent: Gold (#D4AF37)

## Features

- Product browsing and search
- Category filtering
- Supplier verification badges
- Secured trading indicators
- Bottom navigation
- Responsive design

## Assets

Add the following assets to the `assets/` directory:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen (1284x2778)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `favicon.png` - Web favicon (48x48)
