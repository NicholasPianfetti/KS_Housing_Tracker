import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useIssues } from '../contexts/IssuesContext';
import Header from './Header';
import IssueCard from './IssueCard';
import CreateIssueModal from './CreateIssueModal';

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const { issues, loading } = useIssues();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => b.upvotes.length - a.upvotes.length);
  }, [issues]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading issues...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Maintenance Issues
            {isAdmin && <span className="text-sm font-normal text-gray-600 ml-2">(Admin View)</span>}
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out"
          >
            Report New Issue
          </button>
        </div>

        <div className="space-y-4">
          {sortedIssues.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No issues reported yet.</div>
              <p className="text-gray-400 mt-2">Be the first to report a maintenance issue!</p>
            </div>
          ) : (
            sortedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateIssueModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;