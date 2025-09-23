export interface Issue {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  dateSubmitted: Date;
  upvotes: string[];
  status: 'Pending' | 'In Progress' | 'Fixed';
}

export interface CreateIssueData {
  title: string;
  description: string;
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: 'Pending' | 'In Progress' | 'Fixed';
}