import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AUTHORIZED_EMAILS = [
  'admin@fraternity.edu',
  'maintenance@fraternity.edu',
  'president@fraternity.edu',
  'member1@fraternity.edu',
  'member2@fraternity.edu',
];

const TempSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!AUTHORIZED_EMAILS.includes(email)) {
      setMessage(`Error: ${email} is not an authorized email address.`);
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      await signup(email, password);
      setMessage(`Success! User ${email} has been created. You can now log in.`);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const createAllUsers = async () => {
    setLoading(true);
    const results = [];

    for (const email of AUTHORIZED_EMAILS) {
      try {
        await signup(email, 'password123');
        results.push(`✅ ${email} - Success`);
      } catch (error: any) {
        results.push(`❌ ${email} - ${error.message}`);
      }
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setMessage(results.join('\n'));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Create Kappa Sigma Users
          </h2>
          <p className="text-gray-600 mb-6 text-center text-sm">
            This is a temporary component to create users in Supabase.
            Only use this if the Supabase admin panel isn't working.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (must be authorized)
              </label>
              <select
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              >
                <option value="">Select an email...</option>
                {AUTHORIZED_EMAILS.map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={createAllUsers}
              disabled={loading}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating All...' : 'Create All Users (password: password123)'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm whitespace-pre-line ${
              message.includes('Success') || message.includes('✅')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            <p><strong>Authorized emails:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              {AUTHORIZED_EMAILS.map(email => (
                <li key={email}>{email}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempSignup;