import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

export default function AccountScreen({ navigation }: Props) {
  const { user, profile, loading, signOut } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('AccountScreen focused - Auth State:', {
        hasUser: !!user,
        userEmail: user?.email,
        hasProfile: !!profile,
        profileStatus: profile?.subscription_status,
        loading: loading,
      });

      // Force refresh auth state when screen comes into focus
      const refreshAuth = async () => {
        if (!user && !loading) {
          setIsRefreshing(true);
          const { data } = await supabase.auth.getSession();
          console.log('Manual session check:', data.session ? 'Has session' : 'No session');
          setIsRefreshing(false);
        }
      };

      refreshAuth();
    }, [user, profile, loading])
  );

  useEffect(() => {
    console.log('AccountScreen - Auth State Updated:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!profile,
      profileStatus: profile?.subscription_status,
      loading: loading,
    });
  }, [user, profile, loading]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  if (loading || isRefreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#827546" />
        <Text style={[styles.errorText, { marginTop: 16 }]}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Please sign in to view your account</Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#827546" />
        <Text style={[styles.errorText, { marginTop: 16 }]}>Loading profile...</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Information</Text>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile.email}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{profile.full_name}</Text>
          </View>
          {profile.created_at && (
            <View style={styles.infoGroup}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{formatDate(profile.created_at)}</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, styles.membershipCard]}>
          <Text style={styles.cardTitle}>Membership</Text>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>
              {profile.subscription_status === 'active' ? 'Pro Subscription' : 'Free Account'}
            </Text>
          </View>
          {profile.subscription_status === 'active' && (
            <>
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Plan</Text>
                <Text style={styles.infoValue}>{profile.subscription_plan || 'Pro'}</Text>
              </View>
              {profile.subscription_end_date && (
                <View style={styles.infoGroup}>
                  <Text style={styles.infoLabel}>Next Renewal</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(profile.subscription_end_date)}
                  </Text>
                </View>
              )}
            </>
          )}
          {profile.subscription_status !== 'active' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signInButton: {
    backgroundColor: '#827546',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  membershipCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoGroup: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  upgradeButton: {
    backgroundColor: '#827546',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 32,
  },
});