import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Layout from '../../components/layout/Layout'
import { formatCrore, roleLabel } from '../../utils/helpers'
import api from '../../utils/api'

export default function TeamDetailPage() {
  const { query } = useRouter()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!query.id) return
    setLoading(true)
    api.get(`/teams/${query.id}`)
      .then(({ data }) => setTeam(data.team))
      .catch(e => setError(e.response?.data?.error || 'Failed to load team'))
      .finally(() => setLoading(false))
  }, [query.id])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--text3)' }}>
        <div className="text-center"><div className="text-4xl mb-3 animate-pulse">🏏</div><div>Loading team...</div></div>
      </div>
    </Layout>
  )

  if (error || !team) return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-3">❌</div>
        <div style={{ color: 'var(--text3)' }}>{error || 'Team not found'}</div>
        <Link href="/teams"><button className="mt-4 btn-neon px-4 py-2 rounded-xl text-sm">← Back to Teams</button></Link>
      </div>
    </Layout>
  )

  const players = Array.isArray(team.players) ? team.players : []
  const spent = Math.max(0, (team.purseTotal || 100) - (team.purseRemaining || 0))
  const pct = Math.max(0, Math.min(100, ((team.purseRemaining || 0) / (team.purseTotal || 100)) * 100))
  const color = team.primaryColor || '#334155'

  const roles = ['all', 'BAT', 'BOWL', 'ALL', 'WK-BAT']
  const filtered = activeTab === 'all' ? players : players.filter(p => p.role === activeTab)

  return (
    <>
      <Head><title>{`${team.name} - IPL Nexus AI`}</title></Head>
      <Layout>
        <div className="max-w-5xl mx-auto p-6">
          <Link href="/teams">
            <button className="text-sm mb-4 flex items-center gap-1 transition-colors"
              style={{ color: 'var(--text3)' }}>← Back to Teams</button>
          </Link>

          {/* Team header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden mb-6"
            style={{ background: `linear-gradient(135deg, ${color}18, rgba(0,0,0,0.5))`, border: `1px solid ${color}35` }}>
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}, ${team.secondaryColor || color})` }} />
            <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="text-6xl">{team.emoji || '🏏'}</div>
              <div className="flex-1">
                <h1 className="text-4xl font-black font-rajdhani tracking-wider text-white">{team.name}</h1>
                <div className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{team.shortName} · {team.city || ''}</div>
                {team.owner && (
                  <div className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
                    👤 Owner: {typeof team.owner === 'object' ? team.owner.name : 'Assigned'}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: 'Purse Left', value: formatCrore(team.purseRemaining), c: color },
                  { label: 'Total Spent', value: formatCrore(spent), c: '#f59e0b' },
                  { label: 'Players', value: players.length, c: '#10b981' },
                  { label: 'Overseas', value: team.overseasCount || 0, c: '#7c3aed' },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="text-xl font-bold font-rajdhani" style={{ color: s.c }}>{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 pb-5">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${100 - pct}%`, background: `linear-gradient(90deg, ${color}, ${team.secondaryColor || '#ffffff'})` }} />
              </div>
              <div className="flex justify-between mt-1" style={{ fontSize: '10px', color: 'var(--text3)' }}>
                <span>₹{spent.toFixed(1)} Cr spent</span>
                <span>₹{(team.purseRemaining || 0).toFixed(1)} Cr remaining</span>
              </div>
            </div>
          </motion.div>

          {/* Role filter tabs */}
          <div className="flex gap-1 border-b mb-6" style={{ borderColor: 'var(--border)' }}>
            {roles.map(r => (
              <button key={r} onClick={() => setActiveTab(r)}
                className="px-4 py-2.5 text-sm font-semibold font-rajdhani capitalize transition-all border-b-2"
                style={{
                  color: activeTab === r ? 'var(--neon)' : 'var(--text3)',
                  borderColor: activeTab === r ? 'var(--neon)' : 'transparent'
                }}>
                {r === 'all' ? `All (${players.length})` : `${r} (${players.filter(p => p.role === r).length})`}
              </button>
            ))}
          </div>

          {/* Squad list */}
          {filtered.length === 0 ? (
            <div className="text-center py-14" style={{ color: 'var(--text3)' }}>
              <div className="text-4xl mb-3">🏏</div>
              <div>{activeTab === 'all' ? 'No players signed yet' : `No ${activeTab} players`}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((p, i) => (
                <motion.div key={p._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-2xl">{p.emoji || '🏏'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{p.name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text3)' }}>{roleLabel(p.role)} · {p.country}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold font-mono" style={{ color: '#f59e0b' }}>{formatCrore(p.soldPrice)}</div>
                    {p.isOverseas && <div className="text-[9px] mt-0.5" style={{ color: '#f59e0b' }}>🌍 OS</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
