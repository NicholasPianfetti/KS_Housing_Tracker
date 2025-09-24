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
      // Note: Local storage mode doesn't have admin functionality
      setIsAdmin(false);
      setLoading(false);

      // Initialize sample data
      localStorageService.initializeSampleData();
      return;
    }

    let isMounted = true;
    let loadingTimeout: number | undefined;
    let hasInitialSession = false;

    loadingTimeout = window.setTimeout(() => {
      if (isMounted) {
        console.warn('[Auth] Auth initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, 3000);

    const checkAdminStatus = async (user: User) => {
      try {
        console.log('[Auth] Querying profile for user:', user.id, user.email);

        const { data: profileData, error: profileError } = await supabase!
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        console.log('[Auth] Profile query completed:', { profileData, profileError });

        if (profileError) {
          console.error('[Auth] Profile query error:', profileError);
          console.error('[Auth] Could not determine admin status from database');
          return false;
        }

        const isAdmin = profileData?.is_admin ?? false;
        console.log('[Auth] Admin status from DB:', isAdmin, 'for', user.email);
        return isAdmin;
      } catch (e) {
        console.error('[Auth] Profile query exception:', e);
        console.error('[Auth] Could not determine admin status from database');
        return false;
      }
    };

    // Set up auth state listener FIRST (this is the recommended Supabase pattern)
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state change:', event);
        const user = session?.user ?? null;
        if (!isMounted) return;

        // Skip the early SIGNED_IN event on initial load, wait for INITIAL_SESSION
        if (event === 'SIGNED_IN' && !hasInitialSession) {
          console.log('[Auth] Skipping early SIGNED_IN, waiting for INITIAL_SESSION');
          return;
        }

        if (event === 'INITIAL_SESSION') {
          hasInitialSession = true;
        }

        setCurrentUser(user);

        if (user) {
          const isAdminUser = await checkAdminStatus(user);
          if (isMounted) {
            setIsAdmin(isAdminUser);
          }
        } else {
          setIsAdmin(false);
        }

        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Then get initial session (this triggers the listener above)
    const initSession = async () => {
      console.log('[Auth] Getting initial session...');
      const { data: { session } } = await supabase!.auth.getSession();

      if (!isMounted) return;

      // The listener will handle state updates, but we need to ensure loading is set to false
      if (!session) {
        setCurrentUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
      // If there is a session, the listener already handled it
    };

    initSession();

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