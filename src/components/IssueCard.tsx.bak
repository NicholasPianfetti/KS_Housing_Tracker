import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fixed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-3">{issue.title}</h3>
          <p className="text-gray-600 mb-4 leading-relaxed">{issue.description}</p>

          <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {issue.submittedBy}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {issue.dateSubmitted.toLocaleDateString()}
            </span>
            <motion.span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(issue.status)}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {issue.status}
            </motion.span>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleUpvote();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold shadow-md transition-all duration-200 ${
              hasUpvoted
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">🆎</span>
            <span className="font-bold">{issue.upvotes.length}</span>
          </motion.button>

          {isAdmin && (
            <div className="flex space-x-2">
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Edit
              </motion.button>
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Delete
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditIssueModal issue={issue} onClose={() => setShowEditModal(false)} />
      )}
    </motion.div>
  );
};

export default IssueCard;