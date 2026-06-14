import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AnalyticsReport({ urlId, onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/urls/${urlId}/analytics`);
      setAnalytics(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch url analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlId) {
      fetchAnalytics();
    }
  }, [urlId]);

  const handleCopyLink = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Format date string to readable format
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Process visits data into clicks-per-day for the last 7 days
  const getChartData = () => {
    if (!analytics || !analytics.recentVisits) {
      return { labels: [], data: [] };
    }

    const days = [];
    // Initialize last 7 days boundaries (starting 6 days ago)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }

    const counts = days.map((day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      // Filter visits matching this calendar day
      const dailyClicks = analytics.recentVisits.filter((visit) => {
        const visitDate = new Date(visit.clickedAt);
        return visitDate >= day && visitDate < nextDay;
      });

      return dailyClicks.length;
    });

    const labels = days.map((d) =>
      d.toLocaleDateString(undefined, { weekday: 'short' })
    );

    return { labels, data: counts };
  };

  // SVG Chart Elements builder for click trend
  const renderSvgChart = () => {
    const { labels, data } = getChartData();
    if (labels.length === 0) return null;

    const maxVal = Math.max(...data, 5); // Minimum scale of 5 to look nice
    const width = 500;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 30;
    const paddingTop = 25;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const getX = (index) => paddingLeft + index * (chartWidth / (labels.length - 1));
    const getY = (val) => paddingTop + chartHeight - (val / maxVal) * chartHeight;

    let linePath = `M ${getX(0)} ${getY(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      linePath += ` L ${getX(i)} ${getY(data[i])}`;
    }

    const areaPath = `${linePath} L ${getX(data.length - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-slate-450">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, index) => {
          const val = Math.round(maxVal * ratio);
          const y = getY(val);
          return (
            <g key={index}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[9px] font-mono fill-slate-500"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area under curve */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Chart Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#A78BFA"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & labels */}
        {data.map((val, i) => {
          const x = getX(i);
          const y = getY(val);
          return (
            <g key={i} className="group">
              <circle
                cx={x}
                cy={y}
                r="4"
                className="fill-violet-400 stroke-slate-950 stroke-[1.5px] hover:r-6 cursor-pointer transition-all"
              />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                className="text-[9px] font-bold fill-violet-300 font-mono"
              >
                {val}
              </text>
              <text
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-semibold"
              >
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Helper icons for devices
  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📟';
      default:
        return '💻';
    }
  };

  // Helper icons for browsers
  const getBrowserIcon = (browser) => {
    switch (browser?.toLowerCase()) {
      case 'chrome':
        return '🌐';
      case 'safari':
        return '🧭';
      case 'firefox':
        return '🦊';
      case 'edge':
        return '🌐';
      default:
        return '🔗';
    }
  };

  const isLinkExpired = analytics?.expiresAt && new Date() > new Date(analytics.expiresAt);
  const totalClicksVal = analytics?.totalClicks || 0;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[350px]">
          <svg className="animate-spin h-10 w-10 text-violet-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-slate-450 text-sm font-semibold tracking-wide">Loading link intelligence report...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 bg-slate-900/20 border border-slate-800 rounded-2xl max-w-md mx-auto shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Error Loading Report</h3>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all focus:outline-none cursor-pointer active:scale-95"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }

    return (
      <>
        {/* URL Meta details block */}
        <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/85 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Destination URL</span>
              <a
                href={analytics?.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-300 hover:text-violet-400 hover:underline break-all outline-none transition-colors"
              >
                {analytics?.originalUrl}
              </a>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Shortened Address</span>
              <div className="flex items-center gap-2">
                <a
                  href={analytics?.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold text-violet-455 hover:text-violet-300 outline-none hover:underline"
                >
                  {analytics?.shortUrl}
                </a>
                <button
                  onClick={() => handleCopyLink(analytics?.shortUrl)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-all text-xs font-medium focus:outline-none active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Link Status Info */}
          <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Link Status</span>
              {analytics?.expiresAt ? (
                isLinkExpired ? (
                  <span className="inline-block px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs font-semibold">Expired Link</span>
                ) : (
                  <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-455 text-xs font-semibold">Active (Expires Soon)</span>
                )
              ) : (
                <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-455 text-xs font-semibold">Active (Permanent)</span>
              )}
            </div>
            {analytics?.expiresAt && (
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Expiration Timeline</span>
                <span className="text-xs font-semibold text-slate-300 font-mono block">
                  {formatDateTime(analytics.expiresAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Clicks card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:border-slate-700/80 transition-all duration-300 shadow-xl">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-violet-600/5 blur-xl rounded-full group-hover:bg-violet-600/10 transition-all pointer-events-none" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Clicks</h3>
            <span className="text-5xl font-black text-white tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mt-2 font-mono">
              {totalClicksVal}
            </span>
            <span className="text-xs text-slate-500 mt-4">Redirections processed</span>
          </div>

          {/* Last Visited card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:border-slate-700/80 transition-all duration-300 shadow-xl">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-600/5 blur-xl rounded-full group-hover:bg-amber-600/10 transition-all pointer-events-none" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Last Visited</h3>
            {analytics?.lastVisited ? (
              <div className="flex flex-col mt-2">
                <span className="text-lg font-bold text-slate-200">
                  {new Date(analytics.lastVisited).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-xs font-mono text-slate-455 mt-0.5">
                  {new Date(analytics.lastVisited).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-slate-500 mt-2">No visits yet</span>
            )}
            <span className="text-xs text-slate-500 mt-4">Last redirect timestamp</span>
          </div>

          {/* Created date card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:border-slate-700/80 transition-all duration-300 shadow-xl">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/5 blur-xl rounded-full group-hover:bg-blue-600/10 transition-all pointer-events-none" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Created Date</h3>
            <div className="flex flex-col mt-2">
              <span className="text-lg font-bold text-slate-200">
                {new Date(analytics?.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-xs font-mono text-slate-450 mt-0.5">
                {new Date(analytics?.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <span className="text-xs text-slate-500 mt-4">Creation timestamp</span>
          </div>
        </div>

        {/* Visual Line Chart Dashboard */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Click Redirection Trend (Last 7 Days)</h3>
          <div className="w-full bg-slate-950/40 p-4 rounded-xl border border-slate-900/80">
            {renderSvgChart()}
          </div>
        </div>

        {/* Device & Browser Distribution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Browser Stats */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-555 mb-5">Visits by Browser</h3>
            {totalClicksVal === 0 || !analytics?.browserStats || analytics.browserStats.length === 0 ? (
              <span className="text-xs text-slate-600 italic block py-4 text-center">No browser data logged yet.</span>
            ) : (
              <div className="space-y-4">
                {analytics.browserStats.map((item) => {
                  const pct = totalClicksVal > 0 ? Math.round((item.count / totalClicksVal) * 100) : 0;
                  return (
                    <div key={item.browser} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="text-base select-none">{getBrowserIcon(item.browser)}</span>
                          {item.browser}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      {/* Horizontal bar */}
                      <div className="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-slate-900/80">
                        <div 
                          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device Stats */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-555 mb-5">Visits by Device</h3>
            {totalClicksVal === 0 || !analytics?.deviceStats || analytics.deviceStats.length === 0 ? (
              <span className="text-xs text-slate-600 italic block py-4 text-center">No device data logged yet.</span>
            ) : (
              <div className="space-y-4">
                {analytics.deviceStats.map((item) => {
                  const pct = totalClicksVal > 0 ? Math.round((item.count / totalClicksVal) * 100) : 0;
                  return (
                    <div key={item.device} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="text-base select-none">{getDeviceIcon(item.device)}</span>
                          {item.device}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      {/* Horizontal bar */}
                      <div className="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-slate-900/80">
                        <div 
                          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Redirection timeline section */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Click Redirection History</h3>
          
          {!analytics?.recentVisits || analytics.recentVisits.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-955/20">
              <svg className="w-10 h-10 text-slate-600 mb-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-slate-450 font-semibold text-sm">No Visit Activity Recorded</h4>
              <p className="text-slate-500 max-w-xs text-xs mt-1">Click the short URL link to test redirection analytics recording.</p>
            </div>
          ) : (
            <div className="max-h-[350px] overflow-y-auto pr-2 scrollbar">
              <div className="border-l border-slate-800 ml-4 pl-6 relative space-y-5 py-2">
                {analytics.recentVisits.map((visit, index) => {
                  const visitNumber = totalClicksVal - index;

                  return (
                    <div key={index} className="relative group animate-in slide-in-from-left-2 duration-200">
                      {/* Timeline bullet indicator */}
                      <div className="absolute -left-[31px] top-2.5 w-2.5 h-2.5 rounded-full bg-violet-500 border border-slate-950 group-hover:scale-125 transition-transform shadow-lg shadow-violet-500/20" />
                      
                      <div className="p-4 rounded-xl bg-[#080e22]/50 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/15">
                            Visit #{visitNumber}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                            via {getBrowserIcon(visit.browser)} <span className="font-bold text-slate-300">{visit.browser}</span> on {getDeviceIcon(visit.device)} <span className="font-bold text-slate-300">{visit.device}</span>
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-500 shrink-0">
                          {formatDateTime(visit.clickedAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col relative z-10">
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
        {analytics && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/80 mb-2">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                Analytics Details
                <span className="bg-violet-500/10 text-violet-400 text-xs px-3 py-1 rounded-full border border-violet-500/20 font-mono">
                  {analytics.shortCode}
                </span>
              </h2>
              <p className="text-slate-450 text-sm mt-1">Detailed visitor profiling and traffic source analysis.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end relative z-20">
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
                </svg>
                <span>Refresh Stats</span>
              </button>

              <button
                onClick={onBack}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900 text-slate-350 hover:text-white text-xs font-bold cursor-pointer transition-all active:scale-95"
              >
                <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to links</span>
              </button>
            </div>
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
}
