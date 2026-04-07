# Icon Cache Clearing Guide

## 🚨 **The Icon Cache Problem**

You're experiencing a very common issue! Even when you replace icon files, the old icons often persist due to aggressive caching at multiple levels.

## 🧹 **Complete Cache Clearing Process**

### **Step 1: Clear All Metro/Expo Caches**

```bash
# Navigate to your mobile directory
cd mobile

# Clear Metro cache
npx expo start --clear

# Alternative: Clear with reset cache
npx react-native start --reset-cache

# Clear npm/yarn cache
npm cache clean --force
# OR
yarn cache clean

# Clear Expo cache
npx expo install --fix
```

### **Step 2: Clear Build Caches**

```bash
# Clear EAS build cache
eas build --clear-cache --platform all

# Clear local build artifacts
rm -rf node_modules
rm -rf .expo
rm -rf dist
rm package-lock.json  # or yarn.lock

# Reinstall dependencies
npm install  # or yarn install
```

### **Step 3: Clear Device/Simulator Caches**

#### **iOS Simulator**
```bash
# Reset iOS Simulator completely
xcrun simctl erase all

# Or reset specific simulator
xcrun simctl erase "iPhone 15 Pro"
```

#### **Android Emulator**
```bash
# Wipe Android emulator data
emulator -avd YOUR_AVD_NAME -wipe-data

# Or from Android Studio: AVD Manager → Wipe Data
```

#### **Physical Devices**
- **iOS**: Delete app completely, restart device, reinstall
- **Android**: Delete app, clear launcher cache, restart, reinstall

### **Step 4: Verify Icon Files**

**🚨 PROBLEM FOUND!** Your `app.json` references icon files that don't exist:
- `./assets/images/icon.png` ❌ (missing)
- `./assets/images/splash.png` ❌ (missing)

**Current files in assets/images:**
- `favicon.png` ✅
- `Logo.png` ✅ 
- `sample logo.png` ✅
- `splash_icon.png` ✅

### **Step 5: Fix Icon Configuration**

You need to either:

**Option A: Rename existing files**
```bash
cd mobile/assets/images
cp "Logo.png" "icon.png"
cp "splash_icon.png" "splash.png"
```

**Option B: Update app.json to use existing files**
```json
{
  "expo": {
    "icon": "./assets/images/Logo.png",
    "splash": {
      "image": "./assets/images/splash_icon.png"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/Logo.png"
      }
    }
  }
}
```

### **Step 6: Icon Requirements**

**Icon specifications:**
- **Size**: 1024x1024px minimum
- **Format**: PNG with transparency
- **Content**: Should fit in safe area (avoid edges)

**Splash screen specifications:**
- **Size**: 1284x2778px (iPhone 14 Pro Max) or larger
- **Format**: PNG
- **Content**: Centered, will be cropped on different screens

### **Step 7: Complete Rebuild Process**

After fixing icon files:

```bash
# 1. Clear all caches
cd mobile
npx expo start --clear
rm -rf node_modules .expo
npm install

# 2. Test locally first
npx expo start

# 3. Build with cleared cache
eas build --clear-cache --platform all

# 4. If still cached, increment version
# Update version in app.json: "1.0.1"
```

### **Step 8: Verification**

Use the icon preview tool to verify before building:
```bash
npx expo start
# Navigate to /icon-preview in your app
```

### **🔍 Debug Tips**

**If icons still don't update:**
1. Change the filename (icon.png → app-icon.png)
2. Update app.json to reference new filename
3. Increment app version number
4. Clear all caches again
5. Build fresh

**Check build logs for:**
- "Using cached assets" warnings
- Icon processing messages
- File not found errors

### **📱 Testing Strategy**

1. **Local testing**: Expo Go (limited icon preview)
2. **Development build**: `eas build --profile development`
3. **Production build**: `eas build --profile production`

**Note**: Expo Go won't show custom icons - you need actual builds to see real icons.