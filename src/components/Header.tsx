import React from 'react';
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
    <header className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold">Kappa Sigma Housing Tasks</h1>
            {isUsingLocalStorage && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                Demo Mode
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {currentUser?.email}
              {isAdmin && (
                <span className="ml-2 px-2 py-1 bg-green-500 text-xs rounded-full">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-medium transition duration-150 ease-in-out"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;