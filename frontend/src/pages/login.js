import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { login, register, clearError } from '../store/slices/authSlice'
import { fetchTeams } from '../store/slices/teamsSlice'

export default function LoginPage() {
  const router = useRouter()
  const isRegister = router.pathname === '/register'
  const dispatch = useDispatch()
  const { loading, error, token } = useSelector(s => s.auth)
  const { list: teams } = useSelector(s => s.teams)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer', teamId: '' })

  useEffect(() => { if (token) router.push('/auction') }, [token, router])
  useEffect(() => { if (isRegister) dispatch(fetchTeams()) }, [isRegister, dispatch])
  useEffect(() => { dispatch(clearError()) }, [router.pathname, dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isRegister) {
      dispatch(register({ name: form.name, email: form.email, password: form.password, role: form.role, teamId: form.teamId }))
    } else {
      dispatch(login({ email: form.email, password: form.password }))
    }
  }

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <>
      <Head><title>{`${isRegister ? 'Register' : 'Sign In'} - IPL Nexus AI Auction`}</title></Head>
      <div className="min-h-screen stadium-bg flex items-center justify-center px-4 py-12">
        <Link href="/" className="fixed top-4 left-4 text-sm transition-colors"
          style={{ color: 'var(--text3)' }}
          onMouseEnter={e => e.target.style.color = 'var(--neon)'}
          onMouseLeave={e => e.target.style.color = 'var(--text3)'}>
          ← Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-3xl font-black font-rajdhani gradient-text tracking-widest">⚡ IPL NEXUS AI</div>
            <div className="text-sm mt-2" style={{ color: 'var(--text3)' }}>
              {isRegister ? 'Create your account' : 'Sign in to your account'}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 neon-border">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {isRegister && (
                <div>
                  <label className="text-xs block mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Full Name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Your name" required minLength={2}
                    className="input-neon w-full rounded-xl px-4 py-3 text-sm" />
                </div>
              )}

              <div>
                <label className="text-xs block mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com" required
                  className="input-neon w-full rounded-xl px-4 py-3 text-sm" />
              </div>

              <div>
                <label className="text-xs block mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Password</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="input-neon w-full rounded-xl px-4 py-3 text-sm" />
              </div>

              {isRegister && (
                <>
                  <div>
                    <label className="text-xs block mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Role</label>
                    <select value={form.role} onChange={e => set('role', e.target.value)}
                      className="input-neon w-full rounded-xl px-4 py-3 text-sm"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <option value="viewer">👁️ Viewer</option>
                      <option value="team_owner">🏏 Team Owner</option>
                    </select>
                  </div>
                  {form.role === 'team_owner' && (
                    <div>
                      <label className="text-xs block mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Select Your Team</label>
                      <select value={form.teamId} onChange={e => set('teamId', e.target.value)}
                        className="input-neon w-full rounded-xl px-4 py-3 text-sm"
                        style={{ background: 'rgba(255,255,255,0.04)' }} required>
                        <option value="">— Choose franchise —</option>
                        {teams.map(t => (
                          <option key={t._id} value={t._id}>{t.emoji} {t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm rounded-xl px-4 py-3"
                  style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ⚠️ {error}
                </motion.div>
              )}

              <button type="submit" disabled={loading}
                className="btn-neon w-full py-3.5 rounded-xl text-base mt-2 disabled:opacity-50">
                {loading ? '⏳ Please wait...' : isRegister ? '🚀 Create Account' : '⚡ Sign In'}
              </button>
            </form>

            <div className="text-center mt-6 text-sm" style={{ color: 'var(--text3)' }}>
              {isRegister
                ? <span>Already have an account? <Link href="/login" className="text-neon hover:underline" style={{ color: 'var(--neon)' }}>Sign In</Link></span>
                : <span>No account? <Link href="/register" className="hover:underline" style={{ color: 'var(--neon)' }}>Register here</Link></span>
              }
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 rounded-xl" style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>Demo Credentials</div>
              <div className="space-y-1 font-mono" style={{ fontSize: '11px', color: 'var(--text2)' }}>
                <div>Admin: admin@iplnexus.com / Admin@IPL2025!</div>
                <div>MI Owner: owner.mi@iplnexus.com / Owner@IPL2025!</div>
                <div>CSK Owner: owner.csk@iplnexus.com / Owner@IPL2025!</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
