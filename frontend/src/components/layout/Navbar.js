import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { togglePanel } from '../../store/slices/aiSlice'

export default function Navbar() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth()
  const dispatch = useDispatch()
  const router = useRouter()

  const links = [
    { href: '/auction', label: 'Live Auction', icon: '⚡' },
    { href: '/teams', label: 'Teams', icon: '🏟️' },
    { href: '/players', label: 'Players', icon: '🏏' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: '⚙️' }] : []),
  ]

  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 md:px-6"
      style={{ background: 'rgba(5,10,20,0.97)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>

      <Link href="/" className="flex items-center gap-2 flex-shrink-0">
        <span className="text-lg font-bold font-rajdhani tracking-widest gradient-text">⚡ IPL NEXUS AI</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider text-white"
          style={{ background: '#ef4444' }}>LIVE</span>
      </Link>

      <div className="hidden lg:flex items-center gap-1">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold font-exo transition-all duration-200 ${
              isActive(l.href)
                ? 'text-white border'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            style={isActive(l.href) ? {
              color: 'var(--neon)', background: 'rgba(0,212,255,0.08)', borderColor: 'rgba(0,212,255,0.25)'
            } : {}}>
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <button onClick={() => dispatch(togglePanel())}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold btn-purple">
            <span>🤖</span><span>AI</span>
          </button>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
              <span className="text-[10px] text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</span>
            </div>
            {user?.team && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--neon2), var(--neon))' }}>
                {(user.team?.shortName || 'T').slice(0, 2)}
              </div>
            )}
            <Link href="/profile">
              <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1">
                👤
              </button>
            </Link>
            <button onClick={logout}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10">
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login">
            <button className="btn-neon px-4 py-1.5 rounded-lg text-sm">Sign In</button>
          </Link>
        )}
      </div>
    </nav>
  )
}
