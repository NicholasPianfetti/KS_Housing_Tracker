import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';
import { localStorageService, MockUser } from '../services/localStorageService';

interface AuthContextType {
  currentUser: MockUser | User | null;
  login: (email: string, password: string) => Promise<any>;
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
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | User | null>(null);
  const [loading, setLoading] = useState(true);
  const isUsingLocalStorage = !auth;

  const login = (email: string, password: string) => {
    console.log('Login attempt:', { email, isUsingLocalStorage });

    if (!auth) {
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
    console.log('Using Firebase authentication');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    if (!auth) {
      // Mock logout for local storage mode
      localStorageService.setCurrentUser(null);
      setCurrentUser(null);
      return Promise.resolve();
    }
    return signOut(auth);
  };

  const isAuthorized = currentUser ? AUTHORIZED_EMAILS.includes(currentUser.email || '') : false;
  const isAdmin = currentUser ? ADMIN_EMAILS.includes(currentUser.email || '') : false;

  useEffect(() => {
    if (!auth) {
      // Local storage mode - check for saved user
      const savedUser = localStorageService.getCurrentUser();
      setCurrentUser(savedUser);
      setLoading(false);

      // Initialize sample data
      localStorageService.initializeSampleData();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    loading,
    isAdmin,
    isAuthorized,
    isUsingLocalStorage,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};