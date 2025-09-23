import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isUsingLocalStorage } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in. Please check your credentials.');
    }
    setLoading(false);
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Fraternity Maintenance
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isUsingLocalStorage
              ? "Demo Mode - Use any authorized email with password 'demo123'"
              : "Only authorized fraternity members can access this system"
            }
          </p>
          {isUsingLocalStorage && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</h3>
              <div className="text-xs text-blue-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span><strong>Regular User:</strong> member1@fraternity.edu</span>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('member1@fraternity.edu')}
                    className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs hover:bg-blue-300"
                  >
                    Use
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span><strong>Admin User:</strong> admin@fraternity.edu</span>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin@fraternity.edu')}
                    className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs hover:bg-blue-300"
                  >
                    Use
                  </button>
                </div>
                <p><strong>Password:</strong> demo123 (auto-filled)</p>
              </div>
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;