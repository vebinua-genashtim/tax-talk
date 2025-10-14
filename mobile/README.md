# Tax Academy Singapore - Mobile App

Native iOS and Android mobile application for Tax Academy Singapore training platform.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device:
- Install **Expo Go** app on your phone
- Scan the QR code that appears
- App opens instantly on your device

## Demo Accounts

Test with these accounts:

**Free User** (trailers only):
- Email: `free@taxacademy.sg`
- Password: `demo123456`

**Pay-Per-View** (purchased videos):
- Email: `payper@taxacademy.sg`
- Password: `demo123456`

**Subscriber** (full access):
- Email: `subscriber@taxacademy.sg`
- Password: `demo123456`

## Features

- Native video playback
- User authentication
- Subscription system
- Pay-per-view purchases
- Watch progress tracking
- Account management
- Offline-ready architecture

## Tech Stack

- React Native 0.74
- Expo 51
- TypeScript 5.1
- Supabase (backend)
- React Navigation 6
- Expo AV (video)

## Project Structure

```
mobile/
├── App.tsx                 # Entry point
├── app.json               # Expo config
├── screens/               # App screens
│   ├── HomeScreen.tsx
│   ├── VideoDetailScreen.tsx
│   ├── AuthScreen.tsx
│   ├── AccountScreen.tsx
│   └── SubscriptionScreen.tsx
├── components/
│   └── VideoPlayer.tsx    # Video player
├── navigation/
│   └── AppNavigator.tsx   # Navigation
├── contexts/
│   └── AuthContext.tsx    # Auth state
└── lib/
    └── supabase.ts        # Database
```

## Deployment

### Build for Production

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login:
```bash
eas login
```

3. Build:
```bash
eas build --platform all
```

### Submit to Stores

**iOS:**
```bash
eas submit --platform ios
```

**Android:**
```bash
eas submit --platform android
```

## Requirements

- Node.js 18+
- Expo Go app (for testing)
- Apple Developer Account ($99/year for iOS)
- Google Play Console ($25 one-time for Android)

## Support

- Expo Docs: https://docs.expo.dev
- React Native: https://reactnative.dev
- Supabase: https://supabase.com/docs
