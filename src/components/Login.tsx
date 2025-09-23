import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupMessage, setSignupMessage] = useState('');
  const { login, signup, isUsingLocalStorage } = useAuth();

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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUsingLocalStorage) {
      setSignupMessage('Signup is not available in demo mode.');
      return;
    }
    try {
      setSignupMessage('');
      setSignupLoading(true);
      await signup(signupEmail, signupPassword);
      setSignupMessage('Success! Please check your email to confirm and then sign in.');
      setSignupEmail('');
      setSignupPassword('');
    } catch (err: any) {
      setSignupMessage(err.message || 'Failed to sign up.');
    }
    setSignupLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Kappa Sigma Housing Tasks
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isUsingLocalStorage
              ? "Demo Mode - Use any authorized email with password 'demo123'"
              : "Only authorized Kappa Sigma members can access this system"
            }
          </p>
          {isUsingLocalStorage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-semibold text-green-900 mb-2">Demo Credentials:</h3>
              <div className="text-xs text-green-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span><strong>Regular User:</strong> member1@fraternity.edu</span>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('member1@fraternity.edu')}
                    className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300"
                  >
                    Use
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span><strong>Admin User:</strong> admin@fraternity.edu</span>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin@fraternity.edu')}
                    className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Don't have an account?</h3>
            <button
              type="button"
              onClick={() => setShowSignup(s => !s)}
              className="text-sm text-green-700 hover:text-green-800 font-medium"
            >
              {showSignup ? 'Hide' : 'Create one'}
            </button>
          </div>

          {showSignup && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow border border-gray-200">
              {isUsingLocalStorage ? (
                <div className="text-sm text-gray-600">
                  Signup is disabled in demo mode. Use the provided demo credentials above.
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSignupSubmit}>
                  {signupMessage && (
                    <div className={`px-4 py-3 rounded text-sm ${signupMessage.startsWith('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {signupMessage}
                    </div>
                  )}
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">Email address</label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      id="signup-password"
                      type="password"
                      required
                      minLength={6}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50"
                  >
                    {signupLoading ? 'Creating account...' : 'Sign up'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;