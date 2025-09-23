import React from 'react';

const SupabaseSetupMessage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Kappa Sigma Housing Tasks
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome! Your app is ready, but you need to set up Supabase to enable authentication and database features.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              📋 Setup Steps:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-green-800">
              <li>Go to <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600">Supabase</a> and create a new project</li>
              <li>Copy your project URL and anon key from Project Settings → API</li>
              <li>Run the SQL schema (see supabase-schema.sql) in the SQL Editor</li>
              <li>Enable Email Authentication in Authentication → Settings</li>
              <li>Create a <code className="bg-green-100 px-1 rounded">.env.local</code> file in your project root</li>
              <li>Add your Supabase config to the .env.local file</li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Example .env.local file:</h4>
            <pre className="text-sm text-gray-700 bg-gray-100 p-3 rounded overflow-x-auto">
{`REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here`}
            </pre>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              After setting up Supabase, restart your development server with <code className="bg-gray-100 px-1 rounded">npm start</code>
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-md font-medium transition duration-150 ease-in-out"
              >
                Open Supabase Dashboard
              </a>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition duration-150 ease-in-out"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetupMessage;