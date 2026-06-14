const IconLink = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const IconLogout = ({ size = 13 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 7v1" />
  </svg>
);

export default function Header({ user, onLogout, currentPath }) {
  const isAnalytics = currentPath && (currentPath.startsWith('/analytics') || currentPath.startsWith('/analyts'));

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#070d1e]/85 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
          {isAnalytics ? (
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ) : (
            <IconLink size={20} />
          )}
        </div>
        <div>
          <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-350 bg-clip-text text-transparent">
            Katomarn
          </div>
          <div className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">
            {isAnalytics ? 'URL Intelligence Report' : 'URL Management Platform'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Profile Details */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-200">{user?.name}</span>
            <span className="text-[10px] text-slate-500 font-medium">{user?.email}</span>
          </div>

          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-xs text-white shadow-md select-none">
            {initials}
          </div>
        </div>

        <div className="w-px h-6 bg-slate-805" />

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-350 transition-all text-xs font-bold cursor-pointer"
        >
          <IconLogout size={13} />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
}
