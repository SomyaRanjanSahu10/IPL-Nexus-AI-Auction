import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '../../../components/layout/Layout'
import { formatCrore, roleLabel } from '../../../utils/helpers'
import api from '../../../utils/api'

export default function AuctionResultsPage() {
  const { query } = useRouter()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTeam, setActiveTeam] = useState(null)

  useEffect(() => {
    if (!query.id) return
    api.get(`/auction/${query.id}/results`)
      .then(({ data }) => {
        setResults(data)
        setActiveTeam(data.teams?.[0]?._id)
      })
      .finally(() => setLoading(false))
  }, [query.id])

  if (loading) return (
    <Layout><div className="flex items-center justify-center h-64 text-slate-500">Loading results...</div></Layout>
  )
  if (!results) return (
    <Layout><div className="flex items-center justify-center h-64 text-slate-500">Results not found</div></Layout>
  )

  const { auction, soldPlayers, unsoldPlayers, teams, totalBids } = results
  const activeTeamData = teams?.find(t => t._id === activeTeam)

  const handleExport = () => {
    const csv = [
      ['Player', 'Role', 'Country', 'Base Price', 'Sold Price', 'Team'],
      ...soldPlayers.map(p => [p.name, p.role, p.country, p.basePrice, p.soldPrice, p.soldTo?.name]),
      ...unsoldPlayers.map(p => [p.name, p.role, p.country, p.basePrice, 'UNSOLD', '—'])
    ].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `auction-results-${auction?.season || '2025'}.csv`; a.click()
  }

  return (
    <>
      <Head><title>Auction Results — IPL Nexus AI</title></Head>
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black font-rajdhani gradient-text tracking-wider mb-1">AUCTION RESULTS</h1>
              <p className="text-slate-500 text-sm">{auction?.name} · Season {auction?.season}</p>
            </div>
            <button onClick={handleExport}
              className="px-4 py-2 rounded-xl text-sm font-semibold glass-card text-slate-300 hover:text-neon transition-colors border border-transparent hover:border-blue-400/30">
              📥 Export CSV
            </button>
          </motion.div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: '🔨', label: 'Players Sold', value: soldPlayers?.length || 0, color: '#10b981' },
              { icon: '❌', label: 'Unsold', value: unsoldPlayers?.length || 0, color: '#ef4444' },
              { icon: '⚡', label: 'Total Bids', value: totalBids || 0, color: '#00d4ff' },
              { icon: '💰', label: 'Total Spent', value: formatCrore(auction?.stats?.totalAmountSpent), color: '#f59e0b' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-4 text-center" style={{ border: `1px solid ${s.color}25` }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-xl font-black font-rajdhani" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Highest sale highlight */}
          {auction?.stats?.highestSale?.amount > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="rounded-2xl p-5 mb-8 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))', border: '1px solid rgba(0,212,255,0.2)' }}>
              <div className="text-3xl mb-2">👑</div>
              <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Highest Sale</div>
              <div className="text-2xl font-black font-rajdhani text-white">{auction.stats.highestSale.player?.name}</div>
              <div className="text-3xl font-black font-rajdhani gradient-text mt-1">{formatCrore(auction.stats.highestSale.amount)}</div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team selector */}
            <div>
              <div className="section-label mb-3">Teams</div>
              <div className="space-y-2">
                {teams?.map(team => (
                  <button key={team._id} onClick={() => setActiveTeam(team._id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                      activeTeam === team._id ? 'neon-border' : 'glass-card hover:border-slate-600'
                    }`}
                    style={activeTeam === team._id ? { background: 'rgba(0,212,255,0.06)' } : {}}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: team.primaryColor }} />
                    <span className="text-sm font-semibold text-white flex-1">{team.shortName}</span>
                    <span className="text-xs text-slate-500">{team.players?.length || 0} players</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Team squad */}
            <div className="lg:col-span-2">
              {activeTeamData && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ background: activeTeamData.primaryColor }} />
                    <h3 className="font-bold font-rajdhani text-white text-lg tracking-wide">{activeTeamData.name}</h3>
                    <span className="text-sm text-slate-500 ml-auto">
                      {formatCrore((activeTeamData.purseTotal || 100) - activeTeamData.purseRemaining)} spent
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(activeTeamData.players || []).length === 0 ? (
                      <div className="text-center py-10 text-slate-500">No players signed</div>
                    ) : (activeTeamData.players || []).map((p, i) => (
                      <motion.div key={p._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                        <span className="text-xl">{p.emoji || '🏏'}</span>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-500">{roleLabel(p.role)} · {p.country}</div>
                        </div>
                        <div className="text-sm font-bold text-amber-400 font-mono">{formatCrore(p.soldPrice)}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Unsold players */}
          {unsoldPlayers?.length > 0 && (
            <div className="mt-8">
              <div className="section-label mb-3">Unsold Players ({unsoldPlayers.length})</div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {unsoldPlayers.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="glass-card rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{p.emoji || '🏏'}</div>
                    <div className="text-xs font-bold text-slate-300 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{p.role}</div>
                    <div className="text-[10px] text-red-400 mt-1 font-bold">UNSOLD</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
