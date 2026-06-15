import { useState } from 'react';
import { api, setAccessToken } from '../services/api';

const IconUser = () => (
  <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
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

function PasswordStrength({ password }) {
  if (!password) return null;
  const getStrength = () => {
    if (password.length < 6) return { level: 1, label: 'Too short', color: '#be123c' };
    if (password.length < 8) return { level: 2, label: 'Weak', color: '#c2410c' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { level: 3, label: 'Fair', color: '#b45309' };
    return { level: 4, label: 'Strong', color: '#15803d' };
  };
  const { level, label, color } = getStrength();
  return (
    <div style={{ marginTop: 7 }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= level ? color : 'var(--bg-muted)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

export default function Signup({ onAuthSuccess, onToggleAuth }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;
    if (!name || !email || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const data = await api.post('/auth/signup', { name, email, password });
      setSuccess('Account created successfully!');
      setAccessToken(data.accessToken);
      setTimeout(() => onAuthSuccess(data.user), 900);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-scale-in">
      {/* Logo + Brand */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
          Create your account
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6 }}>
          Start managing your links with URLytics 
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div className="alert-error"><IconAlert /><span>{error}</span></div>}
          {success && <div className="alert-success"><IconCheckCircle /><span>{success}</span></div>}

          <div>
            <label className="form-label" htmlFor="signup-name">Full name</label>
            <div className="input-with-icon">
              <span className="input-icon"><IconUser /></span>
              <input id="signup-name" type="text" name="name"
                value={formData.name} onChange={handleChange}
                placeholder="Jane Doe" className="form-input"
                required disabled={loading} autoComplete="name" />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="signup-email">Email address</label>
            <div className="input-with-icon">
              <span className="input-icon"><IconMail /></span>
              <input id="signup-email" type="email" name="email"
                value={formData.email} onChange={handleChange}
                placeholder="you@example.com" className="form-input"
                required disabled={loading} autoComplete="email" />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="signup-password">Password</label>
            <div className="input-with-icon">
              <span className="input-icon"><IconLock /></span>
              <input id="signup-password" type="password" name="password"
                value={formData.password} onChange={handleChange}
                placeholder="Min. 6 characters" className="form-input"
                required disabled={loading} autoComplete="new-password" />
            </div>
            <PasswordStrength password={formData.password} />
          </div>

          <div>
            <label className="form-label" htmlFor="signup-confirm">Confirm password</label>
            <div className="input-with-icon">
              <span className="input-icon"><IconLock /></span>
              <input id="signup-confirm" type="password" name="confirmPassword"
                value={formData.confirmPassword} onChange={handleChange}
                placeholder="••••••••" className="form-input"
                required disabled={loading} autoComplete="new-password" />
            </div>
          </div>

          <button id="signup-submit" type="submit" disabled={loading}
            className="btn-primary"
            style={{ width: '100%', height: 44, marginTop: 4 }}
          >
            {loading ? <Spinner /> : 'Create account'}
          </button>
        </form>

        <div style={{
          marginTop: 22, paddingTop: 20,
          borderTop: '1px solid var(--border-light)',
          textAlign: 'center', fontSize: 13.5,
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <button id="toggle-to-login" onClick={onToggleAuth} disabled={loading}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent-600)', fontWeight: 700, fontSize: 13.5,
              fontFamily: 'Inter, sans-serif', padding: 0,
            }}
          >
            Sign in
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-placeholder)', marginTop: 18 }}>
        URLytics  · URL Intelligence Platform
      </p>
    </div>
  );
}
