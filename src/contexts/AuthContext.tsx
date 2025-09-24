import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../supabase';
import { localStorageService, MockUser } from '../services/localStorageService';

interface AuthContextType {
  currentUser: MockUser | User | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  isAuthorized: boolean;
  isUsingLocalStorage: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AUTHORIZED_EMAILS = [
  'admin@fraternity.edu',
  'maintenance@fraternity.edu',
  'president@fraternity.edu',
  'member1@fraternity.edu',
  'member2@fraternity.edu',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const isUsingLocalStorage = !isSupabaseConfigured();

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', { email, isUsingLocalStorage });

    if (!isSupabaseConfigured()) {
      // Mock authentication for local storage mode
      console.log('Using local storage authentication');
      if (AUTHORIZED_EMAILS.includes(email) && password === 'demo123') {
        console.log('Valid credentials, creating mock user');
        const mockUser: MockUser = {
          email,
          uid: Date.now().toString(),
        };
        localStorageService.setCurrentUser(mockUser);
        setCurrentUser(mockUser);
        return Promise.resolve({ user: mockUser });
      } else {
        console.log('Invalid credentials provided');
        return Promise.reject(new Error(`Invalid credentials. Use any authorized email (${AUTHORIZED_EMAILS.join(', ')}) with password "demo123"`));
      }
    }

    console.log('Using Supabase authentication');
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signup = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Signup not available in local storage mode');
    }

    console.log('Supabase signup attempt:', { email });
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const logout = async () => {
    if (!isSupabaseConfigured()) {
      // Mock logout for local storage mode
      localStorageService.setCurrentUser(null);
      setCurrentUser(null);
      return Promise.resolve();
    }

    const { error } = await supabase!.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const isAuthorized = currentUser ? AUTHORIZED_EMAILS.includes(currentUser.email || '') : false;

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Local storage mode - check for saved user
      const savedUser = localStorageService.getCurrentUser();
      setCurrentUser(savedUser);
      setIsAdmin(savedUser?.email === 'admin@fraternity.edu');
      setLoading(false);

      // Initialize sample data
      localStorageService.initializeSampleData();
      return;
    }

    let isMounted = true;
    let loadingTimeout: number | undefined;

    loadingTimeout = window.setTimeout(() => {
      if (isMounted) {
        console.warn('[Auth] Auth initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, 3000);

    const initializeAuthState = async () => {
      console.debug('[Auth] Initializing auth state...');
      try {
        const { data, error } = await supabase!.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
        }
        const user = data?.session?.user ?? null;
        if (!isMounted) return;
        setCurrentUser(user);

        if (user) {
          const { data: profileData } = await supabase!
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          if (!isMounted) return;
          setIsAdmin(profileData?.is_admin ?? false);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      } catch (e) {
        console.error('Unexpected error initializing auth state:', e);
        if (!isMounted) return;
        setLoading(false);
      }
    };

    initializeAuthState();

    // Set up Supabase auth state listener for subsequent changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        console.debug('[Auth] onAuthStateChange event:', event);
        const user = session?.user ?? null;
        if (!isMounted) return;
        setCurrentUser(user);

        if (user) {
          const { data: profileData } = await supabase!
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          if (!isMounted) return;
          setIsAdmin(profileData?.is_admin ?? false);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (loadingTimeout) {
        window.clearTimeout(loadingTimeout);
      }
    };
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    isAdmin,
    isAuthorized,
    isUsingLocalStorage,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};