import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="text-lg font-medium text-gray-600"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Loading issues...
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 mt-2 sm:mt-4">
        <motion.div
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Kappa Sigma Housing Tasks
            {isAdmin && (
              <span className="text-sm sm:text-base font-medium text-gray-500 ml-2 sm:ml-3">(Admin View)</span>
            )}
          </h2>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report New Issue
          </motion.button>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {sortedIssues.length === 0 ? (
            <motion.div
              className="text-center py-20 bg-white rounded-2xl shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-gray-500 text-xl font-medium">No issues reported yet.</div>
              <p className="text-gray-400 mt-2">Be the first to report a maintenance issue!</p>
            </motion.div>
          ) : (
            sortedIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <IssueCard issue={issue} />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {showCreateModal && (
        <CreateIssueModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;