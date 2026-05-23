import { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Layout from '../../components/layout/Layout'
import { fetchTeams } from '../../store/slices/teamsSlice'
import { formatCrore } from '../../utils/helpers'

function TeamCard({ team, i }) {
  const players = Array.isArray(team.players) ? team.players : []
  const spent = Math.max(0, (team.purseTotal || 100) - (team.purseRemaining || 0))
  const pct = Math.max(0, Math.min(100, ((team.purseRemaining || 0) / (team.purseTotal || 100)) * 100))
  const color = team.primaryColor || '#334155'

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}>
      <Link href={`/teams/${team._id}`}>
        <div className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 h-full"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}25` }}
          onMouseEnter={e => e.currentTarget.style.borderColor = color + '70'}
          onMouseLeave={e => e.currentTarget.style.borderColor = color + '25'}>
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${team.secondaryColor || color}88)` }} />
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-2xl mb-1">{team.emoji || '🏏'}</div>
                <h3 className="text-lg font-black font-rajdhani tracking-wide text-white">{team.name}</h3>
                <div className="text-xs font-mono" style={{ color: 'var(--text3)' }}>{team.shortName} · {team.city || ''}</div>
              </div>
              <div className="text-right">
                <div className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Purse Left</div>
                <div className="text-xl font-bold font-rajdhani" style={{ color }}>{formatCrore(team.purseRemaining)}</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between mb-1" style={{ fontSize: '10px', color: 'var(--text3)' }}>
                <span>Budget Used</span><span>{Math.round(100 - pct)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${100 - pct}%`, background: `linear-gradient(90deg, ${color}, ${team.secondaryColor || '#ffffff'})` }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label: 'Players', value: players.length },
                { label: 'Overseas', value: team.overseasCount || 0 },
                { label: 'Spent (Cr)', value: spent.toFixed(1) },
              ].map(s => (
                <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-base font-bold font-rajdhani text-white">{s.value}</div>
                  <div className="uppercase tracking-wider mt-0.5" style={{ fontSize: '9px', color: 'var(--text3)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {team.owner && (
              <div className="mt-3 flex items-center gap-1" style={{ fontSize: '10px', color: 'var(--text3)' }}>
                <span>👤</span>
                <span>{typeof team.owner === 'object' ? team.owner.name : 'Assigned'}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function TeamsPage() {
  const dispatch = useDispatch()
  const { list: teams, loading } = useSelector(s => s.teams)

  useEffect(() => { dispatch(fetchTeams()) }, [dispatch])

  const totalSpent = teams.reduce((acc, t) => acc + Math.max(0, (t.purseTotal || 100) - (t.purseRemaining || 0)), 0)

  return (
    <>
      <Head><title>IPL Teams — IPL Nexus AI Auction</title></Head>
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-black font-rajdhani gradient-text tracking-wider mb-2">IPL FRANCHISES</h1>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>All 10 teams · IPL Mega Auction 2025</p>
            <div className="flex gap-6 mt-4 text-sm">
              <div><span style={{ color: 'var(--text3)' }}>Total Teams: </span><span className="font-bold text-white">{teams.length}</span></div>
              <div><span style={{ color: 'var(--text3)' }}>Total Spent: </span><span className="font-bold" style={{ color: '#f59e0b' }}>{formatCrore(totalSpent)}</span></div>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl h-52 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--text3)' }}>
              <div className="text-5xl mb-4">🏟️</div>
              <div>No teams found. Run the seed script to populate data.</div>
              <code className="text-xs mt-2 block opacity-60">cd backend && npm run seed</code>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {teams.map((t, i) => <TeamCard key={t._id} team={t} i={i} />)}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
