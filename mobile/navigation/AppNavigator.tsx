import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Video } from '../lib/supabase';

import HomeScreen from '../screens/HomeScreen';
import VideoDetailScreen from '../screens/VideoDetailScreen';
import AuthScreen from '../screens/AuthScreen';
import AccountScreen from '../screens/AccountScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import CategoryListScreen from '../screens/CategoryListScreen';

export type RootStackParamList = {
  Home: undefined;
  VideoDetail: { video: Video };
  Auth: undefined;
  Account: undefined;
  Subscription: undefined;
  CategoryList: { title: string; videos: Video[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#033a66',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Tax Talk Pro' }}
        />
        <Stack.Screen
          name="VideoDetail"
          component={VideoDetailScreen}
          options={{ title: 'Video Details' }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            title: 'Sign In',
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="Account"
          component={AccountScreen}
          options={{ title: 'Account' }}
        />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{
            title: 'Subscribe',
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="CategoryList"
          component={CategoryListScreen}
          options={({ route }) => ({ title: route.params.title })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
