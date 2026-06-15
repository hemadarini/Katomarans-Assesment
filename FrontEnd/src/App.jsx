import { useState, useEffect } from 'react';
import Signup from './Components/Signup';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import AnalyticsReport from './Components/AnalyticsReport';
import Header from './Components/Header';
import { api, setAccessToken, registerLogoutCallback, BASE_URL } from './services/api';
import './index.css';

// ── Loading Screen ────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    }}>
      {/* Logo mark */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--accent-600)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-accent)',
        position: 'relative',
      }}>
        <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        {/* Spinner ring */}
        <div style={{
          position: 'absolute', inset: -6, borderRadius: 22,
          border: '2px solid transparent',
          borderTopColor: 'rgba(79,70,229,0.5)',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>URLytics </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>Initializing secure session…</div>
      </div>
    </div>
  );
}

// ── Auth Page Layout ──────────────────────────────────────────────────────

function AuthLayout({ children }) {
  return (
    <div className="auth-bg">
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460 }}>
        {children}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────

function App() {
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handleLocationChange);

    registerLogoutCallback(() => {
      setUser(null);
      setIsSignup(false);
      navigate('/');
    });

    const checkSession = async () => {
      try {
        const refreshData = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshData.ok) {
          const { accessToken } = await refreshData.json();
          setAccessToken(accessToken);
          const profileData = await api.get('/auth/profile');
          setUser(profileData.user);
        }
      } catch (err) {
        console.log('No active session found on boot.');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleAuthSuccess = (userData) => setUser(userData);
  const handleLogout = () => { setUser(null); setIsSignup(false); navigate('/'); };
  const toggleAuth = () => setIsSignup(!isSignup);

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <AuthLayout>
        {isSignup
          ? <Signup onAuthSuccess={handleAuthSuccess} onToggleAuth={toggleAuth} />
          : <Login  onAuthSuccess={handleAuthSuccess} onToggleAuth={toggleAuth} />
        }
      </AuthLayout>
    );
  }

  const path = currentPath.split('?')[0];
  const params = new URLSearchParams(currentPath.split('?')[1] || '');

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Header user={user} onLogout={handleLogout} currentPath={currentPath} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {path === '/analytics' || path === '/analyts' ? (
          <AnalyticsReport urlId={params.get('id')} onBack={() => navigate('/')} />
        ) : (
          <Dashboard user={user} onLogout={handleLogout} navigate={navigate} />
        )}
      </div>
    </div>
  );
}

export default App;
