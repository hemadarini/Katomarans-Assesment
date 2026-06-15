import { useState } from 'react';

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} style={{ opacity: 0.25 }} />
      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function QrModal({ shortUrl, shortCode, onClose }) {
  const [copied, setCopied]         = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Free secure QR Code Generator API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}&margin=12&color=1a1714&bgcolor=ffffff`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr_${shortCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('QR Download Error:', err);
      alert('Failed to download. Try saving the image manually.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(26,23,20,0.45)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 360,
        background: 'var(--bg-white)',
        border: '1px solid var(--border-light)',
        borderRadius: 18, padding: '28px 24px',
        boxShadow: 'var(--shadow-xl)',
        animation: 'scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        {/* Close button */}
        <button
          id="qr-modal-close"
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-base)', borderRadius: 8,
            background: 'var(--bg-page)', color: 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-page)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, margin: '0 auto 12px',
            background: 'var(--accent-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>QR Code</h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>Scan to redirect to the destination URL</p>
        </div>

        {/* QR code image */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            padding: 12, borderRadius: 14,
            border: '1px solid var(--border-base)',
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}>
            <img
              src={qrImageUrl}
              alt={`QR Code for ${shortCode}`}
              style={{ width: 168, height: 168, display: 'block', borderRadius: 8 }}
              loading="lazy"
            />
          </div>
        </div>

        {/* Short URL + copy */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          padding: '10px 14px', borderRadius: 9,
          background: 'var(--bg-page)', border: '1px solid var(--border-base)',
          marginBottom: 14,
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600,
            color: 'var(--accent-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {shortUrl}
          </span>
          <button
            id="qr-copy-btn"
            onClick={handleCopy}
            style={{
              flexShrink: 0, fontSize: 11, fontWeight: 700,
              padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid',
              transition: 'all 0.15s',
              background: copied ? '#f0fdf4' : 'var(--bg-white)',
              borderColor: copied ? '#bbf7d0' : 'var(--border-base)',
              color: copied ? '#16a34a' : 'var(--text-secondary)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* Download */}
        <button
          id="qr-download-btn"
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary"
          style={{ width: '100%', height: 43 }}
        >
          {downloading ? <Spinner size={15} /> : (
            <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {downloading ? 'Downloading…' : 'Download QR Code'}
        </button>
      </div>
    </div>
  );
}
