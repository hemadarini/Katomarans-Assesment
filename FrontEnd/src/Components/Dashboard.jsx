import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import QrModal from './QrModal';

// ─── Icon Components ──────────────────────────────────────────────────────────

const IconLink = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const IconChart = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconQr = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const IconRefresh = ({ size = 15 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
  </svg>
);

const IconCopy = ({ size = 13 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />
  </svg>
);

const IconTrash = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconPlus = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v16m8-8H4" />
  </svg>
);

const IconWarn = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconCheck = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Spinner = ({ size = 15, color = '#fff' }) => (
  <svg
    width={size} height={size}
    style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}
    viewBox="0 0 24 24" fill="none"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="4" style={{ opacity: 0.25 }} />
    <path fill={color} style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({ label, value, sub, accentColor, icon, iconBg, iconColor, loading }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 shadow-xl hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-2xl transition-all duration-300 group">
      <div 
        className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300"
        style={{ background: accentColor }}
      />
      <div 
        className="absolute -right-4 -bottom-4 w-20 h-20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: accentColor + '15' }}
      />
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label}
          </div>
          {loading ? (
            <div className="h-8 w-24 bg-slate-800 rounded animate-pulse mt-2.5" />
          ) : (
            <div className="text-3xl font-extrabold text-white tracking-tight mt-2.5 font-mono">
              {value}
            </div>
          )}
        </div>
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-4 flex items-center gap-1.5 font-medium">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
        {sub}
      </div>
    </div>
  );
}

// ─── Table Skeleton Loader ───────────────────────────────────────────────────

const TableSkeleton = () => (
  <>
    {[1, 2, 3].map((n) => (
      <tr key={n} className="animate-pulse border-b border-slate-850/60">
        <td className="px-6 py-4.5"><div className="h-4 bg-slate-800 rounded w-48" /></td>
        <td className="px-6 py-4.5"><div className="h-4 bg-slate-800 rounded w-32" /></td>
        <td className="px-6 py-4.5"><div className="h-4 bg-slate-800 rounded w-20" /></td>
        <td className="px-6 py-4.5"><div className="h-4 bg-slate-800 rounded w-24" /></td>
        <td className="px-6 py-4.5 text-center"><div className="h-4 bg-slate-800 rounded w-8 mx-auto" /></td>
        <td className="px-6 py-4.5 text-right"><div className="h-8 bg-slate-800 rounded w-40 ml-auto" /></td>
      </tr>
    ))}
  </>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard({ user, navigate }) {
  const [urls, setUrls]                 = useState([]);
  const [longUrl, setLongUrl]           = useState('');
  const [expiresAt, setExpiresAt]       = useState('');
  const [shortenLoading, setShortenLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [urlError, setUrlError]         = useState('');
  const [urlSuccess, setUrlSuccess]     = useState('');
  const [copiedId, setCopiedId]         = useState(null);
  const [fetchError, setFetchError]     = useState('');
  const [tableAlert, setTableAlert]     = useState({ type: '', message: '' });

  // QR Modal
  const [activeQrUrl, setActiveQrUrl]   = useState(null);
  const [activeQrCode, setActiveQrCode] = useState(null);

  // Computed stats
  const totalClicks  = urls.reduce((a, u) => a + (u.clicks || 0), 0);
  const activeLinks  = urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;
  const avgClicks    = urls.length ? Math.round(totalClicks / urls.length) : 0;

  // API: fetch URLs
  const fetchUrls = useCallback(async () => {
    setFetchLoading(true);
    setFetchError('');
    try {
      const data = await api.get('/urls');
      setUrls(data.urls || []);
    } catch (err) {
      setFetchError(err.message || 'Failed to retrieve shortened links.');
      console.error('Failed to fetch URLs:', err.message);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  // URL Validation
  const validateUrl = (urlStr) => {
    try {
      const parsed = new URL(urlStr);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // API: Shorten
  const handleShorten = async (e) => {
    e.preventDefault();
    setUrlError('');
    setUrlSuccess('');

    if (!longUrl) { setUrlError('Please enter a destination URL.'); return; }
    if (!validateUrl(longUrl.trim())) { setUrlError('Invalid URL. Must start with http:// or https://'); return; }
    if (expiresAt && new Date(expiresAt) < new Date()) { setUrlError('Expiry date cannot be in the past.'); return; }

    setShortenLoading(true);
    try {
      const response = await api.post('/urls/shorten', {
        originalUrl: longUrl.trim(),
        expiresAt: expiresAt || null,
      });
      setUrlSuccess('Link shortened successfully!');
      setUrls((prev) => [response.data, ...prev]);
      setLongUrl('');
      setExpiresAt('');
      setTimeout(() => setUrlSuccess(''), 3000);
    } catch (err) {
      setUrlError(err.message || 'Failed to shorten URL');
    } finally {
      setShortenLoading(false);
    }
  };

  // API: Delete
  const handleDeleteUrl = async (id) => {
    if (!window.confirm('Delete this shortened link?')) return;
    setTableAlert({ type: '', message: '' });
    try {
      await api.delete(`/urls/${id}`);
      setUrls((prev) => prev.filter((item) => item.id !== id));
      setTableAlert({ type: 'success', message: 'Shortened link was deleted successfully.' });
      setTimeout(() => setTableAlert({ type: '', message: '' }), 3000);
    } catch (err) {
      setTableAlert({ type: 'error', message: err.message || 'Failed to delete URL' });
    }
  };

  // Copy
  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const truncate = (text, max = 42) =>
    text.length <= max ? text : text.slice(0, max) + '…';

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(.5); }
      `}</style>

      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[550px] h-[550px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 translate-x-1/2 w-[550px] h-[550px] rounded-full bg-fuchsia-600/5 blur-[120px] pointer-events-none z-0" />

      {/* ── MAIN WORKSPACE ── */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Stats KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Total Links" 
            value={urls.length} 
            sub="Links Shortened"
            accentColor="#6366f1"
            icon={<IconLink size={18} />}
            iconBg="rgba(99, 102, 241, 0.1)" 
            iconColor="#818cf8"
            loading={fetchLoading && urls.length === 0}
          />
          <StatCard
            label="Total Clicks" 
            value={totalClicks.toLocaleString()} 
            sub="Across All Short links"
            accentColor="#06b6d4"
            icon={<IconChart size={18} />}
            iconBg="rgba(6, 182, 212, 0.1)" 
            iconColor="#22d3ee"
            loading={fetchLoading && urls.length === 0}
          />
          <StatCard
            label="Active Links" 
            value={activeLinks} 
            sub="Currently Not Expired"
            accentColor="#10b981"
            icon={<IconCheck size={18} />}
            iconBg="rgba(16, 185, 129, 0.1)" 
            iconColor="#34d399"
            loading={fetchLoading && urls.length === 0}
          />
          <StatCard
            label="Avg. Clicks" 
            value={avgClicks} 
            sub="Redirections Per Link"
            accentColor="#f59e0b"
            icon={<IconChart size={18} />}
            iconBg="rgba(245, 158, 11, 0.1)" 
            iconColor="#fbbf24"
            loading={fetchLoading && urls.length === 0}
          />
        </div>

        {/* Create Link Section */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 md:p-8 backdrop-blur shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-violet-600/5 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Create Shortened Link</h3>
              <p className="text-slate-450 text-sm mt-1">Generate clean, trackable short URLs and configure expiry limits.</p>
            </div>

            <form onSubmit={handleShorten} className="flex flex-col lg:flex-row gap-5 items-end">
              <div className="w-full lg:flex-1 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Destination URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <IconLink size={16} />
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all font-sans text-sm"
                    type="text"
                    value={longUrl}
                    onChange={(e) => { setLongUrl(e.target.value); if (urlError) setUrlError(''); }}
                    placeholder="https://example.com/very/long/path/to/your/page"
                    disabled={shortenLoading}
                  />
                </div>
              </div>

              <div className="w-full lg:w-72 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Link Expiry (optional)</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all text-sm"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  disabled={shortenLoading}
                />
              </div>

              <button 
                type="submit" 
                disabled={shortenLoading} 
                className="w-full lg:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 h-[46px] cursor-pointer"
              >
                {shortenLoading ? <Spinner size={15} /> : <IconPlus size={14} />}
                {shortenLoading ? 'Shortening…' : 'Shorten URL'}
              </button>
            </form>

            {urlError && (
              <div className="flex items-center gap-3 p-4 rounded-xl text-sm bg-rose-500/10 border border-rose-500/20 text-rose-300 mt-5 animate-in fade-in slide-in-from-top-1 duration-200">
                <IconWarn size={16} />
                <span>{urlError}</span>
              </div>
            )}
            {urlSuccess && (
              <div className="flex items-center gap-3 p-4 rounded-xl text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 mt-5 animate-in fade-in slide-in-from-top-1 duration-200">
                <IconCheck size={16} />
                <span>{urlSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* Links Listing Panel */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 overflow-hidden shadow-2xl backdrop-blur flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-800 gap-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Your Shortened Links</h3>
              <p className="text-slate-455 text-sm mt-1">Manage, copy, display QR codes, and trace user redirect reports. Click columns to view stats.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400">
                {urls.length} Shortened Link{urls.length !== 1 ? 's' : ''}
              </span>
              
              <button
                onClick={fetchUrls}
                disabled={fetchLoading}
                className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/65 cursor-pointer text-slate-400 hover:text-white flex items-center justify-center transition-all hover:scale-[1.05] active:scale-95 shadow-lg animate-in"
                title="Refresh List"
              >
                {fetchLoading ? <Spinner size={14} color="#8892A4" /> : <IconRefresh size={15} />}
              </button>
            </div>
          </div>

          {/* Table Alert Toasts */}
          {tableAlert.message && (
            <div className={`mx-6 mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200 ${
              tableAlert.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-350' 
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-350'
            }`}>
              {tableAlert.type === 'success' ? <IconCheck size={14} /> : <IconWarn size={14} />}
              <span>{tableAlert.message}</span>
            </div>
          )}

          {/* Table Error View */}
          {fetchError ? (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-950/10 border-t border-slate-850">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-455 mb-4 shadow-md">
                <IconWarn size={20} />
              </div>
              <h4 className="text-lg font-bold text-slate-350">Failed to load links</h4>
              <p className="text-slate-500 text-sm max-w-sm mt-1 mb-6 leading-relaxed">{fetchError}</p>
              <button
                onClick={fetchUrls}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all active:scale-95 shadow-lg"
              >
                Retry Connection
              </button>
            </div>
          ) : urls.length === 0 && !fetchLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-center border-t border-slate-850 bg-slate-950/10">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-5 shadow-inner">
                <IconLink size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-350">No shortened links yet</h4>
              <p className="text-slate-500 text-sm max-w-sm mt-2 leading-relaxed">
                You haven't shortened any links yet. Enter a destination URL above to populate your tracking console.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar">
              <table className="w-full border-collapse text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/30 text-slate-450 text-xs font-bold uppercase tracking-wider select-none">
                    <th className="px-6 py-4">Original URL</th>
                    <th className="px-6 py-4">Short URL</th>
                    <th className="px-6 py-4">Expires</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-center">Clicks</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 bg-slate-950/5">
                  {fetchLoading && urls.length === 0 ? (
                    <TableSkeleton />
                  ) : (
                    urls.map((item) => {
                      const isExpired = item.expiresAt && new Date() > new Date(item.expiresAt);
                      const handleRowClick = () => navigate(`/analytics?id=${item.id}`);

                      return (
                        <tr key={item.id} className="hover:bg-slate-850/15 transition-colors group">
                          {/* Original URL */}
                          <td 
                            onClick={handleRowClick}
                            className="px-6 py-4.5 max-w-xs md:max-w-md cursor-pointer select-none text-slate-400 group-hover:text-slate-200 transition-colors"
                          >
                            <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                              {truncate(item.originalUrl, 45)}
                            </span>
                          </td>

                          {/* Short Link */}
                          <td 
                            onClick={handleRowClick}
                            className="px-6 py-4.5 cursor-pointer select-none font-semibold font-mono text-sm text-violet-450 group-hover:text-violet-300 transition-colors"
                          >
                            {item.shortUrl}
                          </td>

                          {/* Expiry */}
                          <td 
                            onClick={handleRowClick}
                            className="px-6 py-4.5 cursor-pointer select-none text-sm"
                          >
                            {item.expiresAt ? (
                              isExpired ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-450">
                                  Expired
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-450">
                                  {new Date(item.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )
                            ) : (
                              <span className="text-slate-550 italic text-xs">Never</span>
                            )}
                          </td>

                          {/* Created */}
                          <td 
                            onClick={handleRowClick}
                            className="px-6 py-4.5 cursor-pointer select-none text-slate-400 text-sm group-hover:text-slate-300 transition-colors"
                          >
                            {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>

                          {/* Clicks */}
                          <td 
                            onClick={handleRowClick}
                            className="px-6 py-4.5 cursor-pointer select-none text-center"
                          >
                            <span className="inline-flex items-center justify-center font-mono text-xs font-bold text-slate-350 px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800 min-w-[44px] group-hover:border-slate-700 transition-colors">
                              {item.clicks}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4.5 text-right relative z-20">
                            <div className="flex gap-2 justify-end">
                              {/* Copy */}
                              <button
                                onClick={() => handleCopy(item.shortUrl, item.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950/40 border transition-all cursor-pointer ${
                                  copiedId === item.id 
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold' 
                                    : 'border-slate-800 hover:border-slate-705 text-slate-400 hover:text-white'
                                }`}
                              >
                                {copiedId === item.id ? (
                                  <span>Copied!</span>
                                ) : (
                                  <>
                                    <IconCopy size={12} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {/* QR Code */}
                              <button
                                onClick={() => { setActiveQrUrl(item.shortUrl); setActiveQrCode(item.shortCode); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950/40 border border-slate-800 hover:border-slate-705 text-slate-400 hover:text-white transition-all cursor-pointer"
                              >
                                <IconQr size={12} />
                                <span>QR</span>
                              </button>

                              {/* Statistics */}
                              <button
                                onClick={handleRowClick}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950/40 border border-slate-800 hover:border-slate-705 text-slate-400 hover:text-white transition-all cursor-pointer"
                              >
                                <IconChart size={12} />
                                <span>Stats</span>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUrl(item.id)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 text-rose-455 transition-all cursor-pointer"
                                title="Delete Link"
                              >
                                <IconTrash size={13} />
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

      {/* QR Modal Overlay */}
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