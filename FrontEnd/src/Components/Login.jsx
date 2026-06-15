import { useState } from 'react';
import { api, setAccessToken } from '../services/api';

const IconMail = () => (
  <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconLock = () => (
  <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconAlert = () => (
  <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconCheckCircle = () => (
  <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function Spinner() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} style={{ opacity: 0.25 }} />
      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function Login({ onAuthSuccess, onToggleAuth }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password) { setError('Please enter both email and password'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const data = await api.post('/auth/login', { email, password });
      setSuccess('Logged in successfully!');
      setAccessToken(data.accessToken);
      setTimeout(() => onAuthSuccess(data.user), 900);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-scale-in">
      {/* Logo + Brand */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
          background: 'var(--accent-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-accent)',
        }}>
          <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6, fontWeight: 400 }}>
          Sign in to your URLytics  account
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div className="alert-error"><IconAlert /><span>{error}</span></div>
          )}
          {success && (
            <div className="alert-success"><IconCheckCircle /><span>{success}</span></div>
          )}

          <div>
            <label className="form-label" htmlFor="login-email">Email address</label>
            <div className="input-with-icon">
              <span className="input-icon"><IconMail /></span>
              <input
                id="login-email"
                type="email" name="email"
                value={formData.email} onChange={handleChange}
                placeholder="you@example.com"
                className="form-input"
                required disabled={loading} autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Password</label>
            </div>
            <div className="input-with-icon">
              <span className="input-icon"><IconLock /></span>
              <input
                id="login-password"
                type="password" name="password"
                value={formData.password} onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                required disabled={loading} autoComplete="current-password"
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', height: 44, marginTop: 2 }}
          >
            {loading ? <Spinner /> : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--border-light)', textAlign: 'center', fontSize: 13.5 }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <button
            id="toggle-to-signup"
            onClick={onToggleAuth} disabled={loading}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent-600)', fontWeight: 700, fontSize: 13.5,
              fontFamily: 'Inter, sans-serif',
              padding: 0,
            }}
          >
            Create account
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-placeholder)', marginTop: 18 }}>
        URLytics  · URL Intelligence Platform
      </p>
    </div>
  );
}
