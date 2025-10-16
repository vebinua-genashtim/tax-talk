# Mobile App Setup Instructions (Expo SDK 52)

## Fixed: PlatformConstants Error

The mobile app has been updated to work with **Expo SDK 52** and Expo Go.

### What Was Changed

1. **Replaced AsyncStorage with expo-secure-store**
   - `@react-native-async-storage/async-storage` → `expo-secure-store`
   - AsyncStorage causes PlatformConstants errors in Expo Go
   - SecureStore is the recommended solution for Expo SDK 52+

2. **Updated Supabase Storage Adapter**
   - Created custom `ExpoSecureStoreAdapter` for Supabase auth
   - Uses `SecureStore.getItemAsync()`, `setItemAsync()`, `deleteItemAsync()`

3. **Updated app.json**
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
- Causes `PlatformConstants` errors in Expo SDK 52+
- SecureStore is more secure and works out of the box with Expo Go

## Next Steps

The mobile app is now ready for development:
- Auth is fully functional
- Sessions persist securely
- Compatible with Expo Go for easy testing
- Ready for custom native builds when needed
