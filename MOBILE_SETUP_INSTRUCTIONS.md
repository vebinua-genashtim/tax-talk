# Mobile App Setup Instructions (Expo SDK 53)

## Fixed: PlatformConstants Error

The mobile app has been updated to work with **Expo SDK 53** (stable, recommended) and Expo Go.

### What Was Changed

1. **Upgraded to Expo SDK 53**
   - React Native 0.79.2
   - Stable and recommended for production use
   - Better community support and stability

2. **Replaced AsyncStorage with expo-secure-store**
   - `@react-native-async-storage/async-storage` → `expo-secure-store`
   - AsyncStorage causes PlatformConstants errors in Expo Go
   - SecureStore is the recommended solution for Expo SDK 53

3. **Updated Supabase Storage Adapter**
   - Created custom `ExpoSecureStoreAdapter` for Supabase auth
   - Uses `SecureStore.getItemAsync()`, `setItemAsync()`, `deleteItemAsync()`

4. **Updated app.json**
   - Added proper Android adaptive icon configuration
   - Added empty plugins array for future extensibility

## Installation Steps

### 1. Navigate to Mobile Directory
```bash
cd mobile
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- `expo-secure-store@~14.0.0` (new)
- Remove `@react-native-async-storage/async-storage` (if prompted)

### 3. Clear Cache and Start
```bash
npx expo start -c
```

### 4. Open in Expo Go
- Scan the QR code with your phone
- The app should now work without PlatformConstants errors

## Verification

After starting the app, you should be able to:
- ✅ Sign in with demo users (subscriber@taxacademy.sg, payper@taxacademy.sg, free@taxacademy.sg)
- ✅ Auth tokens persist between app restarts
- ✅ No PlatformConstants errors in console

## Demo Users

All passwords: `demo123456`

- **subscriber@taxacademy.sg** - Full subscriber with unlimited access
- **payper@taxacademy.sg** - Pay-per-view user with 5 purchased videos
- **free@taxacademy.sg** - Free tier with no purchases

## Troubleshooting

### Still Getting PlatformConstants Error?

1. Stop Expo (`Ctrl+C`)
2. Clear cache: `npx expo start -c`
3. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npx expo start -c
   ```

### Session Not Persisting?

SecureStore only works on physical devices and simulators, not in web browsers. Make sure you're testing in Expo Go on a device or simulator.

## Technical Details

### Storage Adapter Implementation

```typescript
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};
```

This adapter makes Supabase auth compatible with Expo's SecureStore API.

### Why Not AsyncStorage?

- AsyncStorage requires native modules
- Not available by default in Expo Go
- Causes `PlatformConstants` errors in Expo SDK 53
- SecureStore is more secure and works out of the box with Expo Go

## SDK Version Info (Mobile-Only, Recommended)

- **Expo SDK**: 53.0.0 (Stable, Recommended for production)
- **React Native**: 0.79.2
- **React**: 19.0.0 (Latest stable)
- **@types/react**: 19.0.0
- Removed: `react-native-web`, `react-dom` (mobile-only, no version conflicts)

## Next Steps

The mobile app is now ready for development:
- Auth is fully functional
- Sessions persist securely
- Compatible with Expo Go for easy testing
- Ready for custom native builds when needed
