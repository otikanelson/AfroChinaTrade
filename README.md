# 🌍 AfroChinaTrade

<div align="center">

![AfroChinaTrade Logo](https://img.shields.io/badge/AfroChinaTrade-Connecting%20Africa%20%26%20China-C41E3A?style=for-the-badge&logo=globe&logoColor=white)

**The Premier Platform for Africa-China Trade**

[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg?style=flat-square)](https://github.com/afrochinatrade/mobile)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg?style=flat-square&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2049+-black.svg?style=flat-square&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)

</div>

## 🚀 Overview

AfroChinaTrade is a comprehensive mobile e-commerce platform designed to bridge the trade gap between African buyers and Chinese suppliers. Built with React Native and Expo, it offers a seamless, secure, and user-friendly experience for cross-border commerce.

### 🎯 Mission
To democratize Africa-China trade by providing a trusted, efficient, and accessible platform that connects African entrepreneurs with verified Chinese manufacturers and suppliers.

## ✨ Key Features

### 🛒 **Smart Commerce**
- **Advanced Product Discovery**: Browse thousands of products with intelligent categorization
- **Visual Search**: Camera-powered search to find products by image
- **Personalized Recommendations**: AI-driven product suggestions based on user behavior
- **Smart Collections**: Curated product collections (Featured, Trending, New Arrivals)
- **Real-time Inventory**: Live stock updates and availability tracking

### 🏪 **Verified Supplier Network**
- **Supplier Verification**: Rigorous verification process for Chinese suppliers
- **Rating System**: Comprehensive supplier ratings and reviews
- **Direct Communication**: Built-in messaging system for negotiations
- **Bulk Quotations**: Request custom quotes for wholesale orders
- **Supplier Profiles**: Detailed supplier information and certifications

### 💬 **Communication Hub**
- **Real-time Messaging**: Instant communication between buyers and suppliers
- **Multi-language Support**: Breaking language barriers in trade
- **File Sharing**: Share specifications, documents, and images
- **Order Discussions**: Dedicated channels for order-related communications
- **Support Tickets**: Integrated customer support system

### 🛍️ **Complete E-commerce Solution**
- **Shopping Cart**: Full-featured cart with guest and user support
- **Wishlist Management**: Save and organize favorite products
- **Multiple Payment Methods**: Secure payment processing options
- **Order Management**: Complete order lifecycle tracking
- **Returns & Refunds**: Streamlined return and refund processes

### 📱 **Modern Mobile Experience**
- **Responsive Design**: Optimized for all screen sizes
- **Dark/Light Themes**: Customizable user interface themes
- **Offline Support**: Smart caching for offline browsing
- **Progressive Loading**: Smooth performance with lazy loading
- **Push Notifications**: Real-time updates and alerts

## 🏗️ Architecture

### **Frontend (Mobile App)**
```
mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Main tab navigation
│   ├── (admin)/           # Admin panel
│   ├── auth/              # Authentication screens
│   └── ...                # Other screens
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── services/              # API and business logic
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── theme/                 # Design system and styling
└── utils/                 # Utility functions
```

### **Backend (API)**
```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── config/           # Configuration files
└── api/                  # Vercel serverless functions
```

## 🛠️ Technology Stack

### **Mobile Application**
- **Framework**: React Native with Expo SDK 49+
- **Language**: TypeScript 5.0+
- **Navigation**: Expo Router (File-based routing)
- **State Management**: React Context + Custom hooks
- **Styling**: StyleSheet with custom theme system
- **Icons**: Expo Vector Icons (Ionicons)
- **Storage**: AsyncStorage for local data
- **Networking**: Fetch API with custom retry logic

### **Backend Services**
- **Runtime**: Node.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Storage**: Cloudinary for image management
- **Deployment**: Vercel serverless functions
- **Environment**: Multi-environment configuration

### **Development Tools**
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git with conventional commits
- **CI/CD**: GitHub Actions
- **Testing**: Jest + React Native Testing Library

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/afrochinatrade/mobile.git
   cd afrochinatrade
   ```

2. **Install dependencies**
   ```bash
   # Install mobile app dependencies
   cd mobile
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Mobile app environment
   cd mobile
   cp .env.example .env.local
   # Edit .env.local with your configuration
   
   # Backend environment
   cd ../backend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Servers**
   ```bash
   # Start backend (in one terminal)
   cd backend
   npm run dev
   
   # Start mobile app (in another terminal)
   cd mobile
   npx expo start
   ```

5. **Run on Device/Simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## 📱 App Structure

### **Main Navigation**
- **🏠 Home**: Product discovery and featured content
- **🛒 Buy Now**: Quick purchase interface with deals
- **💬 Messages**: Communication hub with suppliers
- **👤 Account**: User profile and settings

### **Key User Flows**
1. **Product Discovery** → Browse → Add to Cart → Checkout
2. **Supplier Communication** → Message → Negotiate → Order
3. **Order Management** → Track → Receive → Review
4. **Account Management** → Profile → Addresses → Payment Methods

## 🎨 Design System

### **Color Palette**
```typescript
// Primary Brand Colors
primary: '#C41E3A',      // Deep Red
secondary: '#2D5F3F',    // Deep Green  
accent: '#D4AF37',       // Gold

// Neutral Colors
background: '#FFFFFF',
surface: '#F8F9FA',
text: '#1A1A1A',
textSecondary: '#6C757D'
```

### **Typography**
- **Headings**: System fonts with custom weights
- **Body Text**: Optimized for readability
- **UI Elements**: Consistent sizing scale

### **Components**
- **ProductCard**: Flexible product display component
- **Header**: Consistent page headers with actions
- **SearchBar**: Advanced search with filters
- **SectionHeader**: Organized content sections

## 🔧 Configuration

### **Environment Variables**
```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://your-api-url.com/api
EXPO_PUBLIC_FALLBACK_API_URL=http://localhost:3000/api

# App Configuration
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_DEBUG=true
```

### **App Configuration**
```json
{
  "name": "AfroChinaTrade",
  "slug": "afrochinatrade",
  "version": "1.0.0",
  "currency": "NGN",
  "defaultLanguage": "en"
}
```

## 🧪 Testing

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Test Structure**
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and service testing
- **E2E Tests**: Complete user flow testing

## 📦 Building & Deployment

### **Development Build**
```bash
# Create development build
npx expo build:android --type apk
npx expo build:ios --type simulator
```

### **Production Build**
```bash
# Create production build
eas build --platform android --profile production
eas build --platform ios --profile production
```

### **Deployment**
```bash
# Deploy to Expo
eas submit --platform android
eas submit --platform ios
```

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Code Standards**
- Follow TypeScript best practices
- Use conventional commit messages
- Maintain test coverage above 80%
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- 📧 Email: support@afrochinatrade.com
- 💬 Discord: [Join our community](https://discord.gg/afrochinatrade)
- 📖 Documentation: [docs.afrochinatrade.com](https://docs.afrochinatrade.com)
- 🐛 Issues: [GitHub Issues](https://github.com/afrochinatrade/mobile/issues)

### **FAQ**
**Q: How do I reset my development environment?**
A: Delete `node_modules`, clear Expo cache (`npx expo r -c`), and reinstall dependencies.

**Q: Why am I getting network errors?**
A: Check your API URL configuration and ensure the backend is running.

**Q: How do I add new features?**
A: Follow our [Development Guide](docs/DEVELOPMENT.md) for detailed instructions.

## 🙏 Acknowledgments

- **Expo Team** for the amazing development platform
- **React Native Community** for continuous innovation
- **African Entrepreneurs** who inspired this platform
- **Chinese Suppliers** who make global trade possible
- **Open Source Contributors** who make this project better

---

<div align="center">

**Made with ❤️ for Africa-China Trade**

[Website](https://afrochinatrade.com) • [App Store](https://apps.apple.com/app/afrochinatrade) • [Play Store](https://play.google.com/store/apps/details?id=com.afrochinatrade) • [Documentation](https://docs.afrochinatrade.com)

</div>