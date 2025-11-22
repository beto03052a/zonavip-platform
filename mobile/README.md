# ZonaVIP Mobile App

React Native mobile application for the ZonaVIP platform - B2B2C benefit plans with geolocation.

## Tech Stack

- **Framework**: React Native 0.72
- **Language**: TypeScript 5.x
- **Navigation**: React Navigation 6.x
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Maps**: react-native-maps (Google Maps)
- **QR Code**: react-native-camera + react-native-qrcode-scanner
- **Push Notifications**: Firebase Cloud Messaging
- **UI Components**: React Native Paper

## Prerequisites

### General
- Node.js 18+ LTS
- npm or yarn
- Watchman (macOS/Linux)
- React Native CLI

### iOS
- macOS with Xcode 14+
- CocoaPods
- iOS 13+ device or simulator

### Android
- JDK 11 or higher
- Android SDK (API Level 31+)
- Android Studio
- Android 8.0+ device or emulator

## Getting Started

### 1. Clone and Install

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# iOS only - Install pods
cd ios && pod install && cd ..
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

### 3. Run the App

#### iOS
```bash
# Run on iOS simulator
npm run ios

# Run on specific device
npm run ios -- --device "iPhone 14 Pro"

# Production build
npx react-native run-ios --configuration Release
```

#### Android
```bash
# Run on Android emulator/device
npm run android

# Production build
cd android && ./gradlew assembleRelease
```

### 4. Development Mode

```bash
# Start Metro bundler
npm start

# Clear cache and restart
npm start -- --reset-cache
```

## Project Structure

```
mobile/
├── android/                # Android native code
├── ios/                    # iOS native code
├── src/
│   ├── screens/           # Screen components
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── Home/
│   │   │   ├── HomeScreen.tsx
│   │   │   └── SearchScreen.tsx
│   │   ├── Business/
│   │   │   ├── BusinessListScreen.tsx
│   │   │   └── BusinessDetailScreen.tsx
│   │   ├── Transaction/
│   │   │   ├── QRGenerateScreen.tsx
│   │   │   ├── QRScanScreen.tsx
│   │   │   └── TransactionHistoryScreen.tsx
│   │   ├── Profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── Onboarding/
│   │       └── OnboardingScreen.tsx
│   ├── components/        # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Loading.tsx
│   │   ├── business/
│   │   │   ├── BusinessCard.tsx
│   │   │   └── BusinessMap.tsx
│   │   ├── transaction/
│   │   │   ├── QRCode.tsx
│   │   │   └── TransactionCard.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── TabBar.tsx
│   ├── navigation/        # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── services/          # API services
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── catalog.ts
│   │   │   ├── transactions.ts
│   │   │   └── notifications.ts
│   │   ├── storage/
│   │   │   └── AsyncStorage.ts
│   │   ├── location/
│   │   │   └── LocationService.ts
│   │   └── notifications/
│   │       └── PushNotifications.ts
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useLocation.ts
│   │   ├── useSearch.ts
│   │   └── usePermissions.ts
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── LocationContext.tsx
│   ├── utils/             # Utility functions
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── types/             # TypeScript types
│   │   ├── api.types.ts
│   │   ├── navigation.types.ts
│   │   └── models.types.ts
│   └── assets/            # Images, fonts, etc.
│       ├── images/
│       ├── icons/
│       └── fonts/
├── App.tsx                # Root component
├── index.js              # Entry point
├── app.json              # App configuration
├── babel.config.js       # Babel configuration
├── metro.config.js       # Metro bundler config
├── package.json
├── tsconfig.json
└── .env.example
```

## Key Features

### Authentication
- Email/Password login and registration
- Google OAuth integration
- Facebook OAuth integration
- Password reset flow
- Biometric authentication (Face ID/Touch ID)

### Search & Discovery
- Geolocation-based business search
- Category filtering
- Text search with autocomplete
- Map view with business markers
- Favorites/bookmarks

### Transactions
- QR code generation for purchases
- QR code scanning (business app)
- Transaction history
- Receipt viewing
- Discount calculation display

### User Experience
- Onboarding flow
- Push notifications
- Offline mode support
- Dark mode
- Multi-language support (ES/EN)

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
API_BASE_URL=http://localhost:3000/api/v1
GOOGLE_MAPS_API_KEY=your_key
FIREBASE_API_KEY=your_key
```

## Available Scripts

```bash
# Development
npm start              # Start Metro bundler
npm run android        # Run on Android
npm run ios           # Run on iOS

# Testing
npm test              # Run tests
npm run test:watch    # Run tests in watch mode

# Code Quality
npm run lint          # Lint code
npm run format        # Format code
npm run type-check    # TypeScript check
```

## Building for Production

### Android

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk

# Generate AAB (for Google Play)
./gradlew bundleRelease

# AAB location: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS

```bash
# Open Xcode
open ios/ZonaVIP.xcworkspace

# Select "Any iOS Device" or your device
# Product > Archive
# Follow Xcode organizer for App Store submission
```

## Configuration

### Android

1. **Package Name**: `com.zonavip.app`
2. **Min SDK**: 21 (Android 5.0)
3. **Target SDK**: 33 (Android 13)
4. **Permissions**: Location, Camera, Internet, Notifications

### iOS

1. **Bundle ID**: `com.zonavip.app`
2. **Deployment Target**: iOS 13.0
3. **Required Capabilities**: Location, Camera, Push Notifications

## Firebase Setup

### Android
1. Download `google-services.json` from Firebase Console
2. Place in `android/app/` directory

### iOS
1. Download `GoogleService-Info.plist` from Firebase Console
2. Add to Xcode project

## Maps Setup

### Google Maps API Key

#### Android
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

#### iOS
Add to `ios/ZonaVIP/AppDelegate.mm`:
```objc
#import <GoogleMaps/GoogleMaps.h>

[GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY"];
```

## Permissions

### Location

The app requires location permissions for:
- Finding nearby businesses
- Geolocation-based search
- Transaction location tracking

### Camera

Camera permission is needed for:
- QR code scanning
- Profile photo capture

### Notifications

Push notification permissions for:
- Discount alerts
- Transaction confirmations
- Marketing messages

## Deep Linking

The app supports deep links:

```
zonavip://business/:id
zonavip://transaction/:id
zonavip://qr/scan
zonavip://oauth/google
zonavip://oauth/facebook
```

## Troubleshooting

### Common Issues

**Metro bundler cache issues**:
```bash
npm start -- --reset-cache
```

**iOS build fails**:
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Android build fails**:
```bash
cd android
./gradlew clean
cd ..
```

**Location not working**:
- Check permissions in device settings
- Ensure API_BASE_URL is accessible from device
- For iOS simulator, use Debug > Location > Custom Location

## Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# E2E tests (Detox)
npm run test:e2e:build
npm run test:e2e:test
```

## Performance Optimization

- Use FastImage for images
- Implement lazy loading for lists
- Use React.memo for expensive components
- Optimize navigation animations
- Enable Hermes JavaScript engine

## Security

- Store sensitive data in Keychain (iOS) / Keystore (Android)
- Use SSL pinning for API calls
- Implement jailbreak/root detection
- Encrypt local storage
- Validate all user inputs

## Analytics

Integrated analytics:
- Firebase Analytics
- Custom event tracking
- User behavior tracking
- Crash reporting (Crashlytics)

## Release Checklist

- [ ] Update version in package.json
- [ ] Update version in android/app/build.gradle
- [ ] Update version in ios project
- [ ] Test on physical devices
- [ ] Verify all API endpoints work
- [ ] Check permissions are requested
- [ ] Test push notifications
- [ ] Verify deep links work
- [ ] Run security audit
- [ ] Generate release builds
- [ ] Submit to stores

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../LICENSE) file.

## Support

- **API Docs**: [docs/API.md](../docs/API.md)
- **Architecture**: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)

## Related Projects

- [Backend](../backend/README.md)
- [Web Dashboard](../web/README.md)
