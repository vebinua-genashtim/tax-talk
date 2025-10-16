import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && !fullName) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email.trim().toLowerCase(), password, fullName);
        if (error) {
          console.error('Sign up error:', error);
          throw error;
        }
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const { error } = await signIn(email.trim().toLowerCase(), password);
        if (error) {
          console.error('Sign in error:', error);
          throw error;
        }
        navigation.goBack();
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred during authentication';
      console.error('Auth error:', errorMessage);
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'free@taxtalkpro.com', name: 'Free User', desc: 'Trailers only', password: 'demo123456' },
    { email: 'payper@taxtalkpro.com', name: 'Pay-Per-View', desc: '2 purchased videos', password: 'demo123456' },
    { email: 'subscriber@taxtalkpro.com', name: 'Subscriber', desc: 'Full access', password: 'demo123456' },
  ];

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLoading(true);
    try {
      const { error } = await signIn(demoEmail, demoPassword);
      if (error) {
        console.error('Demo login error:', error);
        throw error;
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Login Error', error?.message || 'Failed to login with demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
          <Text style={styles.subtitle}>Tax Talk Pro</Text>

          {!isSignUp && (
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Quick Demo Login</Text>
              {demoAccounts.map((account) => (
                <TouchableOpacity
                  key={account.email}
                  style={styles.demoAccount}
                  onPress={() => handleDemoLogin(account.email, account.password)}
                  disabled={loading}
                >
                  <View style={styles.demoAccountContent}>
                    <View style={styles.demoInfo}>
                      <Text style={styles.demoName}>{account.name}</Text>
                      <Text style={styles.demoDesc}>{account.desc}</Text>
                      <Text style={styles.demoEmail}>{account.email}</Text>
                    </View>
                    <View style={styles.demoLoginButton}>
                      <Text style={styles.demoLoginText}>Login</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Doe"
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#033a66',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  demoSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  demoAccount: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  demoAccountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  demoInfo: {
    flex: 1,
  },
  demoName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  demoDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  demoEmail: {
    fontSize: 11,
    color: '#827546',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  demoLoginButton: {
    backgroundColor: '#827546',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  demoLoginText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#033a66',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchText: {
    color: '#827546',
    fontSize: 14,
  },
});