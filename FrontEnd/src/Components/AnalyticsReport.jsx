import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AnalyticsReport({ urlId, onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true); setError('');
    try { const r = await api.get(`/urls/${urlId}/analytics`); setAnalytics(r.data); }
    catch (err) { setError(err.message || 'Failed to fetch analytics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (urlId) fetchAnalytics(); }, [urlId]);

  const handleCopyLink = (text) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); });
  };

  const formatDateTime = (s) => {
    if (!s) return 'N/A';
    return new Date(s).toLocaleString(undefined, { weekday:'short', year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
  };

  const getChartData = () => {
    if (!analytics?.recentVisits) return { labels: [], data: [] };
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0); return d; });
    const counts = days.map(day => {
      const next = new Date(day); next.setDate(next.getDate() + 1);
      return analytics.recentVisits.filter(v => { const vd = new Date(v.clickedAt); return vd >= day && vd < next; }).length;
    });
    return { labels: days.map(d => d.toLocaleDateString(undefined, { weekday: 'short' })), data: counts };
  };

  const renderSvgChart = () => {
    const { labels, data } = getChartData();
    if (!labels.length) return null;
    const maxVal = Math.max(...data, 5);
    const W = 500, H = 190, pL = 42, pR = 24, pT = 22, pB = 32;
    const cW = W - pL - pR, cH = H - pT - pB;
    const gX = (i) => pL + i * (cW / (labels.length - 1));
    const gY = (v) => pT + cH - (v / maxVal) * cH;
    let line = `M ${gX(0)} ${gY(data[0])}`;
    for (let i = 1; i < data.length; i++) line += ` L ${gX(i)} ${gY(data[i])}`;
    const area = `${line} L ${gX(data.length-1)} ${pT+cH} L ${gX(0)} ${pT+cH} Z`;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((r, idx) => {
          const v = Math.round(maxVal * r), y = gY(v);
          return (
            <g key={idx}>
              <line x1={pL} y1={y} x2={W-pR} y2={y} stroke="#e8e0d4" strokeWidth={1} strokeDasharray="3 4"/>
              <text x={pL-6} y={y+4} textAnchor="end" fill="#b0a89e" fontSize={9} fontFamily="JetBrains Mono, monospace">{v}</text>
            </g>
          );
        })}
        <path d={area} fill="url(#aGrad)"/>
        <path d={line} fill="none" stroke="#4f46e5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        {data.map((v, i) => {
          const x = gX(i), y = gY(v);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={4.5} fill="white" stroke="#4f46e5" strokeWidth={2.5}/>
              {v > 0 && <text x={x} y={y-10} textAnchor="middle" fill="#4f46e5" fontSize={9} fontWeight={700} fontFamily="JetBrains Mono, monospace">{v}</text>}
              <text x={x} y={H-6} textAnchor="middle" fill="#b0a89e" fontSize={10} fontWeight={600}>{labels[i]}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  const getDeviceIcon  = (d) => ({ mobile:'📱', tablet:'📟' }[d?.toLowerCase()] || '💻');
  const getBrowserIcon = (b) => ({ chrome:'🌐', safari:'🧭', firefox:'🦊', edge:'🌐' }[b?.toLowerCase()] || '🔗');

  const CHART_COLORS = [
    '#4f46e5', // Indigo
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#fbbf24', // Amber
    '#f43f5e', // Rose
    '#8b5cf6', // Purple
    '#f97316', // Orange
  ];

  function DonutChart({ items, total, keyField }) {
    const radius = 38;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    return (
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="var(--bg-muted)"
          strokeWidth={strokeWidth}
        />
        {items.map((item, idx) => {
          const pct = total ? (item.count / total) * 100 : 0;
          if (pct <= 0) return null;
          const strokeLength = (pct / 100) * circumference;
          const offset = -accumulatedOffset;
          accumulatedOffset += strokeLength;
          const color = CHART_COLORS[idx % CHART_COLORS.length];

          return (
            <circle
              key={item[keyField]}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeLength} ${circumference}`}
              strokeDashoffset={offset}
              transform="rotate(-90 50 50)"
              style={{
                transition: 'stroke-dashoffset 0.5s ease, stroke-dasharray 0.5s ease',
              }}
            />
          );
        })}
        <text x="50" y="47" textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize="13" fontWeight="800" fontFamily="Inter, sans-serif">
          {total}
        </text>
        <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" fill="var(--text-muted)" fontSize="7" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" fontFamily="Inter, sans-serif">
          {total === 1 ? 'Visit' : 'Visits'}
        </text>
      </svg>
    );
  }

  const isLinkExpired  = analytics?.expiresAt && new Date() > new Date(analytics.expiresAt);
  const totalClicksVal = analytics?.totalClicks || 0;

  // Shared card style
  const cs = {
    background: 'var(--bg-white)',
    border: '1px solid var(--border-light)',
    borderRadius: 14, padding: 22,
    boxShadow: 'var(--shadow-sm)',
  };

  const renderContent = () => {
    if (loading) return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:'var(--accent-600)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', boxShadow:'var(--shadow-accent)' }}>
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          <div style={{ position:'absolute', inset:-6, borderRadius:20, border:'2px solid transparent', borderTopColor:'rgba(79,70,229,0.4)', animation:'spin 1s linear infinite' }}/>
        </div>
        <span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:500 }}>Loading analytics report…</span>
      </div>
    );

    if (error) return (
      <div style={{ ...cs, maxWidth:420, margin:'0 auto', textAlign:'center', padding:'48px 32px' }}>
        <div style={{ width:48, height:48, borderRadius:12, margin:'0 auto 14px', background:'var(--error-bg)', border:'1px solid var(--error-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--error-text)' }}>
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>Failed to Load Report</h3>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:22, lineHeight:1.6 }}>{error}</p>
        <button onClick={onBack} className="btn-secondary">← Back to Dashboard</button>
      </div>
    );

    return (
      <>
        {/* Meta block */}
        <div style={{ ...cs }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:24 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:5 }}>Destination URL</div>
                <a href={analytics?.originalUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:'var(--text-secondary)', wordBreak:'break-all', textDecoration:'none' }}
                  onMouseOver={e=>e.currentTarget.style.color='var(--accent-600)'}
                  onMouseOut={e=>e.currentTarget.style.color='var(--text-secondary)'}>{analytics?.originalUrl}</a>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:5 }}>Shortened Address</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <a href={analytics?.shortUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:14, fontWeight:700, color:'var(--accent-600)', fontFamily:'JetBrains Mono, monospace', textDecoration:'none' }}
                    onMouseOver={e=>e.currentTarget.style.textDecoration='underline'}
                    onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>{analytics?.shortUrl}</a>
                  <button onClick={()=>handleCopyLink(analytics?.shortUrl)} className="btn-secondary"
                    style={{ padding:'4px 10px', fontSize:11, height:'auto' }}>
                    {copiedLink ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ paddingLeft:24, borderLeft:'1px solid var(--border-light)', display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>Link Status</div>
                {analytics?.expiresAt
                  ? isLinkExpired
                    ? <span className="badge badge-red">Expired</span>
                    : <span className="badge badge-amber">Active · Expires Soon</span>
                  : <span className="badge badge-green">Active · Permanent</span>
                }
              </div>
              {analytics?.expiresAt && (
                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:5 }}>Expiration</div>
                  <span style={{ fontSize:12, fontFamily:'JetBrains Mono, monospace', color:'var(--text-secondary)', fontWeight:600 }}>{formatDateTime(analytics.expiresAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(175px,1fr))', gap:14 }}>
          {[
            { label:'Total Clicks', value: totalClicksVal, sub:'Redirections processed', accent:'#4f46e5' },
            { label:'Last Visited', value: analytics?.lastVisited
                ? new Date(analytics.lastVisited).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})
                : 'No visits yet',
              sub: analytics?.lastVisited ? new Date(analytics.lastVisited).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}) : '',
              accent:'#b45309' },
            { label:'Created', value: new Date(analytics?.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}),
              sub: new Date(analytics?.createdAt).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}), accent:'#0891b2' },
          ].map((kpi, idx) => (
            <div key={idx} style={{ ...cs, transition:'all 0.2s', position:'relative', overflow:'hidden' }}
              onMouseOver={e=>{e.currentTarget.style.boxShadow='var(--shadow-lg)';e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseOut={e=>{e.currentTarget.style.boxShadow='var(--shadow-sm)';e.currentTarget.style.transform='none';}}>
              <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:kpi.accent, borderRadius:'8px 0 0 8px' }} />
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>{kpi.label}</div>
              <div style={{ fontSize: idx===0 ? 38 : 20, fontWeight:900, color:'var(--text-primary)', fontFamily:'JetBrains Mono, monospace', letterSpacing:'-0.02em', lineHeight:1 }}>{kpi.value}</div>
              {kpi.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:8, fontFamily:idx>0?'JetBrains Mono, monospace':'Inter, sans-serif' }}>{kpi.sub}</div>}
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={cs}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:16 }}>
            Click Trend — Last 7 Days
          </div>
          <div style={{ background:'var(--bg-page)', borderRadius:10, border:'1px solid var(--border-light)', padding:'16px 12px 8px' }}>
            {renderSvgChart()}
          </div>
        </div>

        {/* Browser & Device */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px,1fr))', gap:16 }}>
          {[
            { title:'Visits by Browser', items: analytics?.browserStats || [], keyField:'browser', iconFn: getBrowserIcon },
            { title:'Visits by Device',  items: analytics?.deviceStats  || [], keyField:'device',  iconFn: getDeviceIcon },
          ].map((section, si) => (
            <div key={si} style={cs}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:18 }}>{section.title}</div>
              {!totalClicksVal || !section.items.length ? (
                <p style={{ fontSize:12, color:'var(--text-placeholder)', fontStyle:'italic', textAlign:'center', padding:'16px 0' }}>No data recorded yet.</p>
              ) : (
                <div style={{ display:'flex', gap:24, flexWrap:'wrap', alignItems:'center' }}>
                  {/* Chart Column */}
                  <div style={{ width:110, height:110, flexShrink:0, margin:'0 auto' }}>
                    <DonutChart items={section.items} total={totalClicksVal} keyField={section.keyField} />
                  </div>
                  {/* Legend Column */}
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12, minWidth:180 }}>
                    {section.items.map((item, idx) => {
                      const pct = totalClicksVal ? Math.round((item.count / totalClicksVal) * 100) : 0;
                      const key = item[section.keyField];
                      const color = CHART_COLORS[idx % CHART_COLORS.length];
                      return (
                        <div key={key}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12.5, fontWeight:600, marginBottom:6 }}>
                            <span style={{ display:'flex', alignItems:'center', gap:7, color:'var(--text-secondary)' }}>
                              <span style={{ width:8, height:8, borderRadius:'50%', backgroundColor:color, display:'inline-block', flexShrink:0 }} />
                              <span style={{ fontSize:15 }}>{section.iconFn(key)}</span>{key}
                            </span>
                            <span style={{ color:'var(--text-muted)', fontFamily:'JetBrains Mono, monospace', fontSize:11.5 }}>{item.count} ({pct}%)</span>
                          </div>
                          <div className="progress-track"><div className="progress-fill" style={{ width:`${pct}%`, background:color }}/></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Visit Timeline */}
        <div style={cs}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:20, letterSpacing:'-0.01em' }}>Click Redirection History</div>
          {!analytics?.recentVisits?.length ? (
            <div style={{ padding:'40px 24px', textAlign:'center', border:'1px dashed var(--border-base)', borderRadius:10, background:'var(--bg-page)', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
              <svg width={36} height={36} fill="none" viewBox="0 0 24 24" stroke="rgba(176,168,158,0.8)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <p style={{ fontSize:13.5, fontWeight:600, color:'var(--text-muted)' }}>No visit activity recorded</p>
              <p style={{ fontSize:12, color:'var(--text-placeholder)', maxWidth:260 }}>Click the short URL to test redirection analytics recording.</p>
            </div>
          ) : (
            <div style={{ maxHeight:360, overflowY:'auto', paddingRight:8 }}>
              <div style={{ position:'relative', paddingLeft:28, marginLeft:10 }}>
                <div style={{ position:'absolute', left:0, top:0, bottom:0, width:1, background:'var(--border-light)' }}/>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {analytics.recentVisits.map((visit, idx) => (
                    <div key={idx} className="animate-slide-right" style={{ animationDelay:`${idx*0.04}s`, position:'relative' }}>
                      <div style={{ position:'absolute', left:-34, top:14, width:9, height:9, borderRadius:'50%', background:'var(--accent-600)', border:'2px solid var(--bg-base)' }}/>
                      <div style={{ padding:'11px 15px', borderRadius:10, background:'var(--bg-page)', border:'1px solid var(--border-light)', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:8, transition:'border-color 0.15s' }}
                        onMouseOver={e=>e.currentTarget.style.borderColor='var(--border-strong)'}
                        onMouseOut={e=>e.currentTarget.style.borderColor='var(--border-light)'}
                      >
                        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--accent-600)', background:'var(--accent-bg)', border:'1px solid var(--accent-border)', padding:'2px 8px', borderRadius:99 }}>
                            Visit #{totalClicksVal - idx}
                          </span>
                          <span style={{ fontSize:12.5, color:'var(--text-secondary)' }}>
                            via {getBrowserIcon(visit.browser)} <strong style={{ color:'var(--text-primary)' }}>{visit.browser}</strong>
                            {' '}on {getDeviceIcon(visit.device)} <strong style={{ color:'var(--text-primary)' }}>{visit.device}</strong>
                          </span>
                        </div>
                        <span style={{ fontSize:11, fontFamily:'JetBrains Mono, monospace', color:'var(--text-muted)', flexShrink:0 }}>{formatDateTime(visit.clickedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <main style={{
        width:'100%', maxWidth:1300, margin:'0 auto',
        padding:'28px 28px 48px',
        display:'flex', flexDirection:'column', gap:20,
        flex:1,
        animation:'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {analytics && (
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:16, paddingBottom:22, borderBottom:'1px solid var(--border-light)' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:5 }}>
                <h1 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.025em' }}>Analytics Report</h1>
                <span className="badge badge-indigo" style={{ fontFamily:'JetBrains Mono, monospace' }}>{analytics.shortCode}</span>
              </div>
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>Visitor profiling and traffic source analysis.</p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button id="refresh-analytics-btn" onClick={fetchAnalytics} className="btn-secondary" style={{ gap:6 }}>
                <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12"/></svg>
                Refresh
              </button>
              <button id="back-to-dashboard-btn" onClick={onBack} className="btn-secondary" style={{ gap:6 }}>
                <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Back to Links
              </button>
            </div>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
}
