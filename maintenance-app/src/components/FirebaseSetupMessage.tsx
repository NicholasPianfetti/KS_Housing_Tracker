import React from 'react';

const FirebaseSetupMessage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Fraternity Maintenance Portal
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome! Your app is ready, but you need to set up Firebase to enable authentication and database features.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📋 Setup Steps:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Firebase Console</a> and create a new project</li>
              <li>Enable <strong>Authentication</strong> with Email/Password provider</li>
              <li>Enable <strong>Cloud Firestore</strong> database</li>
              <li>Copy your Firebase configuration from Project Settings</li>
              <li>Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file in your project root</li>
              <li>Add your Firebase config to the .env.local file</li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Example .env.local file:</h4>
            <pre className="text-sm text-gray-700 bg-gray-100 p-3 rounded overflow-x-auto">
{`REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef`}
            </pre>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              After setting up Firebase, restart your development server with <code className="bg-gray-100 px-1 rounded">npm start</code>
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition duration-150 ease-in-out"
              >
                Open Firebase Console
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

export default FirebaseSetupMessage;