import { useEffect, useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import Layout from '../components/layout/Layout'
import { formatCrore } from '../utils/helpers'
import api from '../utils/api'

const MEDAL = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('players')

  useEffect(() => {
    Promise.all([
      api.get('/analytics/leaderboard'),
      api.get('/teams')
    ])
      .then(([lb, t]) => {
        setPlayers(lb.data.leaderboard || [])
        setTeams(t.data.teams || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const sortedTeams = [...teams].sort((a, b) => (b.stats?.totalSpent || 0) - (a.stats?.totalSpent || 0))

  return (
    <>
      <Head><title>Leaderboard — IPL Nexus AI Auction</title></Head>
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-black font-rajdhani gradient-text tracking-wider mb-1">🏆 LEADERBOARD</h1>
            <p className="text-slate-500 text-sm">Top sold players and team rankings</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 border-b mb-6" style={{ borderColor: 'var(--border)' }}>
            {['players', 'teams'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-5 py-2.5 text-sm font-semibold font-rajdhani capitalize transition-all border-b-2 ${
                  activeTab === t ? 'text-neon border-neon' : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}>{t === 'players' ? '🏏 Top Sold Players' : '🏟️ Team Rankings'}</button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="glass-card rounded-xl h-16 animate-pulse" />
              ))}
            </div>
          ) : activeTab === 'players' ? (
            <div className="space-y-3">
              {players.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <div className="text-5xl mb-3">🔨</div>
                  <div>No players sold yet. Auction hasn't started.</div>
                </div>
              ) : players.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    i < 3 ? 'neon-border' : 'glass-card'
                  }`}
                  style={i < 3 ? { background: 'rgba(0,212,255,0.05)' } : {}}
                >
                  {/* Rank */}
                  <div className="w-10 text-center flex-shrink-0">
                    {i < 3
                      ? <span className="text-2xl">{MEDAL[i]}</span>
                      : <span className="text-lg font-bold font-rajdhani text-slate-500">#{i + 1}</span>
                    }
                  </div>

                  {/* Player emoji */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {p.emoji || '🏏'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.role} · {p.country}</div>
                  </div>

                  {/* Team */}
                  {p.soldTo && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: p.soldTo.primaryColor }} />
                      <span className="text-xs text-slate-400 font-semibold">{p.soldTo.shortName}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-black font-rajdhani ${i === 0 ? 'gradient-text' : 'text-amber-400'}`}>
                      {formatCrore(p.soldPrice)}
                    </div>
                    {p.basePrice && (
                      <div className="text-[10px] text-slate-600">
                        base {formatCrore(p.basePrice)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTeams.map((team, i) => {
                const spent = team.stats?.totalSpent || 0
                const pct = (spent / 100) * 100
                return (
                  <motion.div
                    key={team._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-2xl glass-card"
                  >
                    <div className="w-8 text-center flex-shrink-0">
                      {i < 3
                        ? <span className="text-xl">{MEDAL[i]}</span>
                        : <span className="text-sm font-bold text-slate-500">#{i + 1}</span>
                      }
                    </div>

                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: team.primaryColor }} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-white">{team.name}</span>
                        <span className="text-sm font-bold text-amber-400 font-rajdhani">{formatCrore(spent)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: team.primaryColor }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>{team.players?.length || 0} players</span>
                        <span>{formatCrore(team.purseRemaining)} left</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
