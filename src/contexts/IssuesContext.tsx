import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
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

    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured. Please check your Supabase configuration.');
      setLoading(false);
      return;
    }

    const fetchIssues = async () => {
      const { data, error } = await supabase!
        .from('issues')
        .select('*')
        .order('date_submitted', { ascending: false });

      if (error) {
        console.error('Error fetching issues:', error);
        setLoading(false);
        return;
      }

      const issuesData: Issue[] = data.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        submittedBy: issue.submitted_by,
        dateSubmitted: new Date(issue.date_submitted),
        upvotes: issue.upvotes || [],
        status: issue.status || 'Pending',
      }));

      setIssues(issuesData);
      setLoading(false);
    };

    // Set up real-time subscription
    const subscription = supabase!
      .channel('issues')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'issues'
      }, () => {
        fetchIssues();
      })
      .subscribe();

    fetchIssues();

    return () => {
      subscription.unsubscribe();
    };
  }, [isUsingLocalStorage]);

  const createIssue = async (data: CreateIssueData) => {
    if (!currentUser) throw new Error('User not authenticated');

    if (isUsingLocalStorage) {
      const newIssue = localStorageService.createIssue(data, currentUser.email || '');
      setIssues(prev => [newIssue, ...prev]);
      return;
    }

    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { error } = await supabase!.from('issues').insert({
      title: data.title,
      description: data.description,
      submitted_by: currentUser.email,
      date_submitted: new Date().toISOString(),
      upvotes: [],
      status: 'Pending',
    });

    if (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  };

  const updateIssue = async (id: string, data: UpdateIssueData) => {
    if (isUsingLocalStorage) {
      const updatedIssue = localStorageService.updateIssue(id, data);
      if (updatedIssue) {
        setIssues(prev => prev.map(issue => issue.id === id ? updatedIssue : issue));
      }
      return;
    }

    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    const { error } = await supabase!
      .from('issues')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  };

  const deleteIssue = async (id: string) => {
    if (isUsingLocalStorage) {
      const success = localStorageService.deleteIssue(id);
      if (success) {
        setIssues(prev => prev.filter(issue => issue.id !== id));
      }
      return;
    }

    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { error } = await supabase!
      .from('issues')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
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

    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    // Get current upvotes
    const { data: issue, error: fetchError } = await supabase!
      .from('issues')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching issue for upvote:', fetchError);
      throw fetchError;
    }

    const currentUpvotes = issue.upvotes || [];
    const updatedUpvotes = [...currentUpvotes, currentUser.email];

    const { error } = await supabase!
      .from('issues')
      .update({ upvotes: updatedUpvotes })
      .eq('id', id);

    if (error) {
      console.error('Error upvoting issue:', error);
      throw error;
    }

    // Optimistically update local state so UI updates immediately
    setIssues(prev => prev.map(existingIssue => {
      if (existingIssue.id !== id) return existingIssue;
      // Avoid duplicate emails if any race condition
      const uniqueUpvotes = Array.from(new Set([...(existingIssue.upvotes || []), currentUser.email || ''].filter(Boolean)));
      return { ...existingIssue, upvotes: uniqueUpvotes };
    }));
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

    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    // Get current upvotes
    const { data: issue, error: fetchError } = await supabase!
      .from('issues')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching issue for remove upvote:', fetchError);
      throw fetchError;
    }

    const currentUpvotes = issue.upvotes || [];
    const updatedUpvotes = currentUpvotes.filter((email: string) => email !== currentUser.email);

    const { error } = await supabase!
      .from('issues')
      .update({ upvotes: updatedUpvotes })
      .eq('id', id);

    if (error) {
      console.error('Error removing upvote:', error);
      throw error;
    }

    // Optimistically update local state so UI updates immediately
    setIssues(prev => prev.map(existingIssue => {
      if (existingIssue.id !== id) return existingIssue;
      const filtered = (existingIssue.upvotes || []).filter((email: string) => email !== (currentUser.email || ''));
      return { ...existingIssue, upvotes: filtered };
    }));
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