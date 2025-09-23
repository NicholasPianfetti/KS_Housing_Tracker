import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Issue, CreateIssueData, UpdateIssueData } from '../types';
import { useAuth } from './AuthContext';
import { localStorageService } from '../services/localStorageService';

interface IssuesContextType {
  issues: Issue[];
  loading: boolean;
  createIssue: (data: CreateIssueData) => Promise<void>;
  updateIssue: (id: string, data: UpdateIssueData) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  upvoteIssue: (id: string) => Promise<void>;
  removeUpvote: (id: string) => Promise<void>;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export const useIssues = () => {
  const context = useContext(IssuesContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssuesProvider');
  }
  return context;
};

export const IssuesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isUsingLocalStorage } = useAuth();

  useEffect(() => {
    if (isUsingLocalStorage) {
      // Load issues from local storage
      const localIssues = localStorageService.getIssues();
      setIssues(localIssues);
      setLoading(false);
      return;
    }

    if (!db) {
      console.error('Firestore not initialized. Please check your Firebase configuration.');
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'issues'), orderBy('dateSubmitted', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const issuesData: Issue[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        issuesData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          submittedBy: data.submittedBy,
          dateSubmitted: data.dateSubmitted.toDate(),
          upvotes: data.upvotes || [],
          status: data.status || 'Pending',
        });
      });
      setIssues(issuesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isUsingLocalStorage]);

  const createIssue = async (data: CreateIssueData) => {
    if (!currentUser) throw new Error('User not authenticated');

    if (isUsingLocalStorage) {
      const newIssue = localStorageService.createIssue(data, currentUser.email || '');
      setIssues(prev => [newIssue, ...prev]);
      return;
    }

    if (!db) throw new Error('Firebase not configured');
    await addDoc(collection(db, 'issues'), {
      ...data,
      submittedBy: currentUser.email,
      dateSubmitted: new Date(),
      upvotes: [],
      status: 'Pending',
    });
  };

  const updateIssue = async (id: string, data: UpdateIssueData) => {
    if (isUsingLocalStorage) {
      const updatedIssue = localStorageService.updateIssue(id, data);
      if (updatedIssue) {
        setIssues(prev => prev.map(issue => issue.id === id ? updatedIssue : issue));
      }
      return;
    }

    if (!db) throw new Error('Firebase not configured');
    const issueRef = doc(db, 'issues', id);
    await updateDoc(issueRef, data as any);
  };

  const deleteIssue = async (id: string) => {
    if (isUsingLocalStorage) {
      const success = localStorageService.deleteIssue(id);
      if (success) {
        setIssues(prev => prev.filter(issue => issue.id !== id));
      }
      return;
    }

    if (!db) throw new Error('Firebase not configured');
    const issueRef = doc(db, 'issues', id);
    await deleteDoc(issueRef);
  };

  const upvoteIssue = async (id: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    if (isUsingLocalStorage) {
      const success = localStorageService.addUpvote(id, currentUser.email || '');
      if (success) {
        setIssues(localStorageService.getIssues());
      }
      return;
    }

    if (!db) throw new Error('Firebase not configured');
    const issueRef = doc(db, 'issues', id);
    await updateDoc(issueRef, {
      upvotes: arrayUnion(currentUser.email),
    });
  };

  const removeUpvote = async (id: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    if (isUsingLocalStorage) {
      const success = localStorageService.removeUpvote(id, currentUser.email || '');
      if (success) {
        setIssues(localStorageService.getIssues());
      }
      return;
    }

    if (!db) throw new Error('Firebase not configured');
    const issueRef = doc(db, 'issues', id);
    await updateDoc(issueRef, {
      upvotes: arrayRemove(currentUser.email),
    });
  };

  const value = {
    issues,
    loading,
    createIssue,
    updateIssue,
    deleteIssue,
    upvoteIssue,
    removeUpvote,
  };

  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>;
};