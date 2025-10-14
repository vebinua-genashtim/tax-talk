import { createContext, useContext, useState } from 'react';
import { mockProfiles } from '../data/mockProfiles';

interface Profile {
  subscription_status: 'free' | 'active';
  full_name: string;
}

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading] = useState(false);

  const signIn = async (email: string, password: string) => {
    const mockProfile = mockProfiles[email as keyof typeof mockProfiles];

    if (mockProfile) {
      setUser({ id: email, email });
      setProfile({
        subscription_status: mockProfile.subscription_status,
        full_name: mockProfile.full_name
      });
      return { error: null };
    }

    return { error: { message: 'Invalid credentials' } };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user?.email) {
      const mockProfile = mockProfiles[user.email as keyof typeof mockProfiles];
      if (mockProfile) {
        setProfile({
          subscription_status: mockProfile.subscription_status,
          full_name: mockProfile.full_name
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
