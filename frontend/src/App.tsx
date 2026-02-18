/**
 * App - Root Component
 * Handles routing and global layout
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import InterviewPage from './pages/InterviewPage';
import ProfilePage from './pages/ProfilePage';

/** Error Boundary to catch runtime errors */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0a0a1a', color: '#f1f5f9', fontFamily: 'system-ui', padding: '2rem',
          flexDirection: 'column', gap: '1rem'
        }}>
          <h1 style={{ color: '#f87171', fontSize: '1.5rem' }}>Something went wrong</h1>
          <pre style={{
            background: '#1a1a3e', padding: '1rem', borderRadius: '8px',
            maxWidth: '600px', overflow: 'auto', fontSize: '0.85rem', color: '#94a3b8'
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.5rem 1.5rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Protected route wrapper */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a1a',
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

/** Public route - redirect to dashboard if already logged in */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a1a',
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><AuthPage mode="signup" /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a3e', color: '#f1f5f9',
                border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '0.75rem', fontSize: '0.9rem',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#f1f5f9' } },
            }}
          />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
