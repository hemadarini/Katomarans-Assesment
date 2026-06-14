import { useState, useEffect } from 'react';
import Signup from './Components/Signup';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import AnalyticsReport from './Components/AnalyticsReport';
import Header from './Components/Header';
import { api, setAccessToken, registerLogoutCallback } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(true); // Default to signup page per request
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);

  // Global navigation handler
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Initialize and check existing session
  useEffect(() => {
    // Listen to browser forward/back button clicks
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handleLocationChange);

    // Register global interceptor callback to handle invalid refresh tokens
    registerLogoutCallback(() => {
      setUser(null);
      setIsSignup(false);
      navigate('/');
    });

    const checkSession = async () => {
      try {
        // Try refreshing access token using HTTP-only cookie
        const refreshData = await fetch('http://localhost:5000/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshData.ok) {
          const { accessToken } = await refreshData.json();
          setAccessToken(accessToken);
          
          // Fetch user profile
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

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setIsSignup(false); // Send to login on logout
    navigate('/');
  };

  const toggleAuth = () => {
    setIsSignup(!isSignup);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-violet-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-slate-400 text-sm font-semibold tracking-wide">Securing connection...</span>
        </div>
      </div>
    );
  }

  // Render centered boxed screen in Auth Mode
  if (!user) {
    return (
      <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 md:w-[480px] h-80 md:h-[480px] rounded-full bg-violet-600/10 blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 md:w-[480px] h-80 md:h-[480px] rounded-full bg-fuchsia-600/10 blur-[80px] md:blur-[120px] pointer-events-none" />

        {/* Main Container */}
        <div className="relative z-10 w-full flex items-center justify-center">
          {isSignup ? (
            <Signup onAuthSuccess={handleAuthSuccess} onToggleAuth={toggleAuth} />
          ) : (
            <Login onAuthSuccess={handleAuthSuccess} onToggleAuth={toggleAuth} />
          )}
        </div>
      </div>
    );
  }

  // Render fullscreen screen in App Mode (Dashboard / Analytics)
  const path = currentPath.split('?')[0];
  const params = new URLSearchParams(currentPath.split('?')[1] || '');

  return (
    <div className="min-h-screen bg-[#040815] text-slate-100 font-sans flex flex-col relative overflow-x-hidden">
      {/* Shared Static Header */}
      <Header user={user} onLogout={handleLogout} currentPath={currentPath} />

      {/* Viewport Content */}
      <div className="flex-1 flex flex-col relative z-10">
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
