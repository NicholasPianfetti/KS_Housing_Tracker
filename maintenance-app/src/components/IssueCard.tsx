import React, { useState } from 'react';
import { Issue } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useIssues } from '../contexts/IssuesContext';
import EditIssueModal from './EditIssueModal';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const { currentUser, isAdmin } = useAuth();
  const { upvoteIssue, removeUpvote, deleteIssue } = useIssues();
  const [showEditModal, setShowEditModal] = useState(false);

  const hasUpvoted = currentUser?.email ? issue.upvotes.includes(currentUser.email) : false;

  const handleUpvote = async () => {
    try {
      if (hasUpvoted) {
        await removeUpvote(issue.id);
      } else {
        await upvoteIssue(issue.id);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await deleteIssue(issue.id);
      } catch (error) {
        console.error('Error deleting issue:', error);
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Fixed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h3>
          <p className="text-gray-700 mb-3">{issue.description}</p>

          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span>Submitted by: {issue.submittedBy}</span>
            <span>Date: {issue.dateSubmitted.toLocaleDateString()}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(issue.status)}`}>
              {issue.status}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <button
            onClick={handleUpvote}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition duration-150 ease-in-out ${
              hasUpvoted
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <span className="text-lg">👍</span>
            <span className="font-medium">{issue.upvotes.length}</span>
          </button>

          {isAdmin && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-md hover:bg-yellow-200 transition duration-150 ease-in-out"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition duration-150 ease-in-out"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditIssueModal issue={issue} onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
};

export default IssueCard;