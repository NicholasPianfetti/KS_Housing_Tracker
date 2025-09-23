import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { IssuesProvider } from './contexts/IssuesContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <ProtectedRoute>
      <IssuesProvider>
        <Dashboard />
      </IssuesProvider>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
