import { useState } from 'react';

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

export default function QrModal({ shortUrl, shortCode, onClose }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Free secure QR Code Generator API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}&margin=10&color=0B0F19&bgcolor=FFFFFF`;

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
    } catch (error) {
      console.error('QR Code Download Error:', error);
      alert('Failed to download QR code. Please try saving the image manually.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background backdrop overlay with blur */}
      <div 
        className="absolute inset-0 bg-[#040815]/80 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-800/80 bg-[#0a1024]/95 p-6 shadow-2xl shadow-indigo-950/80 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-md">
        
        {/* Close Button X */}
        <button
          onClick={onClose}
          className="absolute top-4.5 right-4.5 p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all outline-none cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            Link QR Code
          </h3>
          <p className="text-xs text-slate-400 mt-1">Scan to redirect to target URL</p>
        </div>

        {/* QR Code Graphic Image Box with Gradient Glowing Outline */}
        <div className="relative p-1.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-indigo-600 max-w-[200px] mx-auto mb-6 shadow-lg shadow-violet-600/10">
          <div className="bg-white p-3 rounded-xl flex items-center justify-center">
            <img 
              src={qrImageUrl} 
              alt={`QR Code for ${shortCode}`} 
              className="w-full h-auto select-none rounded-lg"
              loading="lazy"
            />
          </div>
        </div>

        {/* Link details displaying */}
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-violet-400 truncate select-all">{shortUrl}</span>
            <button
              onClick={handleCopy}
              className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 border rounded-lg transition-all focus:outline-none cursor-pointer ${
                copied 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white border-slate-800'
              }`}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Download Action button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {downloading ? (
              <Spinner size={15} />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download QR Code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
