import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { currentUser, logout, isAdmin, isUsingLocalStorage } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <motion.div
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <img src="/KappaSigmaFraternityImage.png" alt="Kappa Sigma" className="h-16 w-auto" />
            {isUsingLocalStorage && (
              <motion.span
                className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold shadow-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Demo Mode
              </motion.span>
            )}
          </motion.div>

          <div className="flex items-center space-x-4">
            <motion.span
              className="text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome, <span className="font-semibold">{currentUser?.email}</span>
              {isAdmin && (
                <motion.span
                  className="ml-2 px-3 py-1 bg-green-500 text-xs rounded-full font-semibold shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  Admin
                </motion.span>
              )}
            </motion.span>
            <motion.button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Sign out
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;