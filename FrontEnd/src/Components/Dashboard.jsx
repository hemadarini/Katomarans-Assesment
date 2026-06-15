import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import QrModal from './QrModal';

// ── Icons ──────────────────────────────────────────────────────────────────
const IconLink   = ({ size=15 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>;
const IconChart  = ({ size=15 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;
const IconQr     = ({ size=14 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>;
const IconRefresh= ({ size=14 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12"/></svg>;
const IconCopy   = ({ size=13 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3"/></svg>;
const IconTrash  = ({ size=14 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
const IconPlus   = ({ size=15 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16m8-8H4"/></svg>;
const IconWarn   = ({ size=14 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>;
const IconCheck  = ({ size=14 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconClock  = ({ size=15 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

function Spinner({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} style={{ opacity: 0.25 }} />
      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// ── KPI Stat Card ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, iconColor, iconBg, accent, loading }) {
  return (
    <div className="card-sm" style={{
      padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent, borderRadius: '8px 0 0 8px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
          {loading ? (
            <div className="skeleton" style={{ height: 30, width: 70 }} />
          ) : (
            <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
              {value}
            </div>
          )}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

// ── Table Skeleton ─────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3].map(n => (
        <tr key={n}>
          <td style={{ padding: '14px 18px' }}><div className="skeleton" style={{ height: 13, width: 200 }} /></td>
          <td style={{ padding: '14px 18px' }}><div className="skeleton" style={{ height: 13, width: 110 }} /></td>
          <td style={{ padding: '14px 18px' }}><div className="skeleton" style={{ height: 20, width: 70, borderRadius: 99 }} /></td>
          <td style={{ padding: '14px 18px' }}><div className="skeleton" style={{ height: 13, width: 80 }} /></td>
          <td style={{ padding: '14px 18px', textAlign: 'center' }}><div className="skeleton" style={{ height: 20, width: 40, borderRadius: 6, margin: '0 auto' }} /></td>
          <td style={{ padding: '14px 18px' }}><div className="skeleton" style={{ height: 28, width: 160, borderRadius: 6, marginLeft: 'auto' }} /></td>
        </tr>
      ))}
    </>
  );
}

// ── Inline action button ───────────────────────────────────────────────────

function ActionBtn({ onClick, children, green }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '5px 11px', borderRadius: 6,
    fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
    border: '1px solid', fontFamily: 'Inter, sans-serif',
    transition: 'all 0.12s ease',
    background: green ? '#f0fdf4' : 'var(--bg-white)',
    borderColor: green ? '#bbf7d0' : 'var(--border-base)',
    color: green ? '#16a34a' : 'var(--text-secondary)',
  };
  return (
    <button style={base} onClick={onClick}
      onMouseOver={e => {
        if (!green) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-muted)'; }
      }}
      onMouseOut={e => {
        if (!green) { e.currentTarget.style.borderColor = 'var(--border-base)'; e.currentTarget.style.background = 'var(--bg-white)'; }
      }}
    >{children}</button>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────

export default function Dashboard({ user, navigate }) {
  const [urls, setUrls]                     = useState([]);
  const [longUrl, setLongUrl]               = useState('');
  const [expiresAt, setExpiresAt]           = useState('');
  const [shortenLoading, setShortenLoading] = useState(false);
  const [fetchLoading, setFetchLoading]     = useState(false);
  const [urlError, setUrlError]             = useState('');
  const [urlSuccess, setUrlSuccess]         = useState('');
  const [copiedId, setCopiedId]             = useState(null);
  const [fetchError, setFetchError]         = useState('');
  const [tableAlert, setTableAlert]         = useState({ type: '', message: '' });
  const [activeQrUrl, setActiveQrUrl]       = useState(null);
  const [activeQrCode, setActiveQrCode]     = useState(null);

  const totalClicks = urls.reduce((a, u) => a + (u.clicks || 0), 0);
  const activeLinks = urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;
  const avgClicks   = urls.length ? Math.round(totalClicks / urls.length) : 0;

  const fetchUrls = useCallback(async () => {
    setFetchLoading(true); setFetchError('');
    try { const d = await api.get('/urls'); setUrls(d.urls || []); }
    catch (err) { setFetchError(err.message || 'Failed to retrieve links.'); }
    finally { setFetchLoading(false); }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const validateUrl = (s) => { try { const p = new URL(s); return p.protocol === 'http:' || p.protocol === 'https:'; } catch { return false; } };

  const handleShorten = async (e) => {
    e.preventDefault();
    setUrlError(''); setUrlSuccess('');
    if (!longUrl) { setUrlError('Please enter a destination URL.'); return; }
    if (!validateUrl(longUrl.trim())) { setUrlError('Invalid URL. Must start with http:// or https://'); return; }
    if (expiresAt && new Date(expiresAt) < new Date()) { setUrlError('Expiry date cannot be in the past.'); return; }
    setShortenLoading(true);
    try {
      const response = await api.post('/urls/shorten', { originalUrl: longUrl.trim(), expiresAt: expiresAt || null });
      setUrlSuccess('Link shortened successfully!');
      setUrls(prev => [response.data, ...prev]);
      setLongUrl(''); setExpiresAt('');
      setTimeout(() => setUrlSuccess(''), 3500);
    } catch (err) { setUrlError(err.message || 'Failed to shorten URL'); }
    finally { setShortenLoading(false); }
  };

  const handleDeleteUrl = async (id) => {
    if (!window.confirm('Delete this shortened link?')) return;
    setTableAlert({ type: '', message: '' });
    try {
      await api.delete(`/urls/${id}`);
      setUrls(prev => prev.filter(item => item.id !== id));
      setTableAlert({ type: 'success', message: 'Link deleted successfully.' });
      setTimeout(() => setTableAlert({ type: '', message: '' }), 3000);
    } catch (err) { setTableAlert({ type: 'error', message: err.message || 'Failed to delete URL' }); }
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });
  };

  const truncate = (text, max = 46) => text.length <= max ? text : text.slice(0, max) + '…';

  return (
    <>
      <main style={{
        width: '100%', maxWidth: 1300, margin: '0 auto',
        padding: '28px 28px 48px',
        display: 'flex', flexDirection: 'column', gap: 24,
        animation: 'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Good to see you, <strong style={{ color: 'var(--text-secondary)' }}>{user?.name?.split(' ')[0]}</strong>. Here's your link activity overview.
            </p>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 99,
            background: 'rgba(79,70,229,0.07)',
            border: '1px solid rgba(79,70,229,0.14)',
            fontSize: 11, fontWeight: 700, color: 'var(--accent-600)',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-600)', opacity: 0.8 }} />
            Live
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
          <StatCard label="Total Links"   value={urls.length}               sub="Shortened links created"  icon={<IconLink size={16}/>}  iconColor="#4f46e5" iconBg="rgba(79,70,229,0.08)"  accent="#4f46e5" loading={fetchLoading && !urls.length} />
          <StatCard label="Total Clicks"  value={totalClicks.toLocaleString()} sub="Redirections across links" icon={<IconChart size={16}/>} iconColor="#0891b2" iconBg="rgba(8,145,178,0.08)"   accent="#0891b2" loading={fetchLoading && !urls.length} />
          <StatCard label="Active Links"  value={activeLinks}               sub="Currently not expired"    icon={<IconCheck size={16}/>} iconColor="#16a34a" iconBg="rgba(22,163,74,0.08)"   accent="#16a34a" loading={fetchLoading && !urls.length} />
          <StatCard label="Avg. Clicks"   value={avgClicks}                 sub="Per shortened link"       icon={<IconChart size={16}/>} iconColor="#b45309" iconBg="rgba(180,83,9,0.08)"    accent="#f59e0b" loading={fetchLoading && !urls.length} />
        </div>

        {/* ── Create Link ── */}
        <div className="card" style={{ padding: '24px 26px' }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Create Shortened Link</h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>Generate a trackable short URL with an optional expiry date.</p>
          </div>

          <form onSubmit={handleShorten} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <label className="form-label">Destination URL</label>
              <div className="input-with-icon">
                <span className="input-icon"><IconLink size={15} /></span>
                <input id="url-input" className="form-input" type="text" value={longUrl}
                  onChange={e => { setLongUrl(e.target.value); if (urlError) setUrlError(''); }}
                  placeholder="https://example.com/your/long/url"
                  disabled={shortenLoading}
                />
              </div>
            </div>

            <div style={{ flex: '0 1 220px' }}>
              <label className="form-label">Expiry (optional)</label>
              <div className="input-with-icon">
                <span className="input-icon"><IconClock size={15} /></span>
                <input id="expiry-input" className="form-input" type="datetime-local" value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  disabled={shortenLoading}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <button id="shorten-url-btn" type="submit" disabled={shortenLoading}
              className="btn-primary" style={{ height: 42, gap: 6, paddingLeft: 20, paddingRight: 20, flexShrink: 0 }}
            >
              {shortenLoading ? <Spinner size={15} /> : <IconPlus size={14} />}
              {shortenLoading ? 'Shortening…' : 'Shorten URL'}
            </button>
          </form>

          {urlError   && <div className="alert-error"   style={{ marginTop: 14 }}><IconWarn size={14}/><span>{urlError}</span></div>}
          {urlSuccess && <div className="alert-success" style={{ marginTop: 14 }}><IconCheck size={14}/><span>{urlSuccess}</span></div>}
        </div>

        {/* ── Links Table ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Panel header */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            alignItems: 'center', padding: '18px 24px', gap: 12,
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--bg-surface)',
          }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Your Shortened Links</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Click any row to view detailed analytics.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge badge-indigo">{urls.length} link{urls.length !== 1 ? 's' : ''}</span>
              <button id="refresh-links-btn" onClick={fetchUrls} disabled={fetchLoading}
                className="btn-secondary"
                style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', minWidth: 'unset' }}
                title="Refresh"
              >
                {fetchLoading ? <Spinner size={13} /> : <IconRefresh size={13} />}
              </button>
            </div>
          </div>

          {/* Table alert */}
          {tableAlert.message && (
            <div style={{ padding: '0 24px' }}>
              <div className={tableAlert.type === 'success' ? 'alert-success' : 'alert-error'} style={{ marginTop: 14 }}>
                {tableAlert.type === 'success' ? <IconCheck size={13}/> : <IconWarn size={13}/>}
                <span>{tableAlert.message}</span>
              </div>
            </div>
          )}

          {/* Content */}
          {fetchError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 14, background: 'var(--error-bg)', border: '1px solid var(--error-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error-text)' }}>
                <IconWarn size={20} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Failed to load links</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300, marginBottom: 20, lineHeight: 1.6 }}>{fetchError}</p>
              <button onClick={fetchUrls} className="btn-secondary">Retry</button>
            </div>
          ) : urls.length === 0 && !fetchLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, marginBottom: 16, background: 'var(--bg-muted)', border: '1px solid var(--border-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <IconLink size={24} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>No links yet</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.6 }}>
                Paste a long URL above to create your first shortened link.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Original URL</th>
                    <th>Short URL</th>
                    <th>Expires</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'center' }}>Clicks</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchLoading && !urls.length ? <TableSkeleton /> : (
                    urls.map(item => {
                      const isExpired = item.expiresAt && new Date() > new Date(item.expiresAt);
                      const handleRowClick = () => navigate(`/analytics?id=${item.id}`);
                      return (
                        <tr key={item.id}>
                          <td onClick={handleRowClick} style={{ cursor: 'pointer', maxWidth: 240 }}>
                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12.5 }}>{truncate(item.originalUrl, 44)}</span>
                          </td>
                          <td onClick={handleRowClick} style={{ cursor: 'pointer' }}>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--accent-600)' }}>{item.shortUrl}</span>
                          </td>
                          <td onClick={handleRowClick} style={{ cursor: 'pointer' }}>
                            {item.expiresAt ? (
                              isExpired
                                ? <span className="badge badge-red">Expired</span>
                                : <span className="badge badge-green">{new Date(item.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Never</span>
                            )}
                          </td>
                          <td onClick={handleRowClick} style={{ cursor: 'pointer', fontSize: 12.5 }}>
                            {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td onClick={handleRowClick} style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              minWidth: 38, padding: '3px 8px', borderRadius: 6,
                              background: 'var(--bg-muted)', border: '1px solid var(--border-base)',
                              fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
                              color: 'var(--text-secondary)',
                            }}>
                              {item.clicks}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                              <ActionBtn onClick={() => handleCopy(item.shortUrl, item.id)} green={copiedId === item.id}>
                                {copiedId === item.id ? '✓ Copied' : <><IconCopy size={12}/> Copy</>}
                              </ActionBtn>
                              <ActionBtn onClick={() => { setActiveQrUrl(item.shortUrl); setActiveQrCode(item.shortCode); }}>
                                <IconQr size={12}/> QR
                              </ActionBtn>
                              <ActionBtn onClick={handleRowClick}>
                                <IconChart size={12}/> Stats
                              </ActionBtn>
                              <button onClick={() => handleDeleteUrl(item.id)} className="btn-danger" style={{ padding: '5px 10px' }} title="Delete">
                                <IconTrash size={13}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {activeQrUrl && (
        <QrModal
          shortUrl={activeQrUrl}
          shortCode={activeQrCode}
          onClose={() => { setActiveQrUrl(null); setActiveQrCode(null); }}
        />
      )}
    </>
  );
}
