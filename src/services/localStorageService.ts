import { Issue, CreateIssueData, UpdateIssueData } from '../types';

const STORAGE_KEYS = {
  ISSUES: 'maintenance_issues',
  CURRENT_USER: 'maintenance_current_user',
};

export interface MockUser {
  email: string;
  uid: string;
}

class LocalStorageService {
  // User Management
  setCurrentUser(user: MockUser | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  getCurrentUser(): MockUser | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Issues Management
  getIssues(): Issue[] {
    const issuesStr = localStorage.getItem(STORAGE_KEYS.ISSUES);
    if (!issuesStr) return [];

    const issues = JSON.parse(issuesStr);
    // Convert date strings back to Date objects
    return issues.map((issue: any) => ({
      ...issue,
      dateSubmitted: new Date(issue.dateSubmitted),
    }));
  }

  saveIssues(issues: Issue[]): void {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  }

  createIssue(data: CreateIssueData, userEmail: string): Issue {
    const issues = this.getIssues();
    const newIssue: Issue = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      submittedBy: userEmail,
      dateSubmitted: new Date(),
      upvotes: [],
      status: 'Pending',
    };

    issues.push(newIssue);
    this.saveIssues(issues);
    return newIssue;
  }

  updateIssue(id: string, data: UpdateIssueData): Issue | null {
    const issues = this.getIssues();
    const issueIndex = issues.findIndex(issue => issue.id === id);

    if (issueIndex === -1) return null;

    issues[issueIndex] = { ...issues[issueIndex], ...data };
    this.saveIssues(issues);
    return issues[issueIndex];
  }

  deleteIssue(id: string): boolean {
    const issues = this.getIssues();
    const filteredIssues = issues.filter(issue => issue.id !== id);

    if (filteredIssues.length === issues.length) return false;

    this.saveIssues(filteredIssues);
    return true;
  }

  addUpvote(issueId: string, userEmail: string): boolean {
    const issues = this.getIssues();
    const issue = issues.find(issue => issue.id === issueId);

    if (!issue || issue.upvotes.includes(userEmail)) return false;

    issue.upvotes.push(userEmail);
    this.saveIssues(issues);
    return true;
  }

  removeUpvote(issueId: string, userEmail: string): boolean {
    const issues = this.getIssues();
    const issue = issues.find(issue => issue.id === issueId);

    if (!issue || !issue.upvotes.includes(userEmail)) return false;

    issue.upvotes = issue.upvotes.filter(email => email !== userEmail);
    this.saveIssues(issues);
    return true;
  }

  // Initialize with sample data if empty
  initializeSampleData(): void {
    const issues = this.getIssues();
    if (issues.length === 0) {
      const sampleIssues: Issue[] = [
        {
          id: '1',
          title: 'Broken washing machine in laundry room',
          description: 'The washing machine on the second floor is making loud noises and not draining properly. Water is pooling at the bottom.',
          submittedBy: 'member1@fraternity.edu',
          dateSubmitted: new Date(Date.now() - 86400000), // 1 day ago
          upvotes: ['member2@fraternity.edu', 'president@fraternity.edu'],
          status: 'In Progress',
        },
        {
          id: '2',
          title: 'Kitchen sink faucet leaking',
          description: 'The main kitchen sink has a persistent drip that started yesterday. It\'s wasting water and making noise.',
          submittedBy: 'president@fraternity.edu',
          dateSubmitted: new Date(Date.now() - 43200000), // 12 hours ago
          upvotes: ['member1@fraternity.edu'],
          status: 'Pending',
        },
        {
          id: '3',
          title: 'WiFi dead zone in study room',
          description: 'The WiFi signal is very weak in the main study room. Members can\'t connect to video calls for classes.',
          submittedBy: 'member2@fraternity.edu',
          dateSubmitted: new Date(Date.now() - 21600000), // 6 hours ago
          upvotes: ['member1@fraternity.edu', 'president@fraternity.edu', 'member3@fraternity.edu'],
          status: 'Pending',
        },
      ];

      this.saveIssues(sampleIssues);
    }
  }

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.ISSUES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export const localStorageService = new LocalStorageService();