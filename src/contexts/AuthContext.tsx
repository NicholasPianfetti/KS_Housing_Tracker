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

const ADMIN_EMAILS = [
  'admin@fraternity.edu',
  'maintenance@fraternity.edu',
  'nickpisme4@gmail.com'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | User | null>(null);
  const [loading, setLoading] = useState(true);
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
  const isAdmin = currentUser ? ADMIN_EMAILS.includes(currentUser.email || '') : false;

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Local storage mode - check for saved user
      const savedUser = localStorageService.getCurrentUser();
      setCurrentUser(savedUser);
      setLoading(false);

      // Initialize sample data
      localStorageService.initializeSampleData();
      return;
    }

    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};