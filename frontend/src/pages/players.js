import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Layout from '../components/layout/Layout'
import { fetchPlayers, setFilter } from '../store/slices/playersSlice'
import { formatCrore, roleLabel, roleBorderColor } from '../utils/helpers'

const ROLES = ['', 'BAT', 'BOWL', 'ALL', 'WK-BAT']
const STATUSES = ['', 'available', 'sold', 'unsold']
const STATUS_COLORS = { available: '#10b981', sold: '#00d4ff', unsold: '#ef4444' }
const DEMAND_W = { low: '25%', medium: '50%', high: '75%', extreme: '100%' }

function PlayerCard({ player, i }) {
  const sc = STATUS_COLORS[player.auctionStatus] || '#64748b'
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.02 }} whileHover={{ y: -3 }}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${roleBorderColor(player.role)}` }}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${roleBorderColor(player.role)}` }}>
              {player.emoji || '🏏'}
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">{player.name}</div>
              <div className="text-[11px]" style={{ color: 'var(--text3)' }}>{player.country}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
              style={{ background: sc + '20', color: sc, border: `1px solid ${sc}40` }}>
              {player.auctionStatus}
            </span>
            {player.isOverseas && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>🌍</span>
            )}
          </div>
        </div>

        <div className="text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mb-3 tracking-wider"
          style={{ background: roleBorderColor(player.role) + '25', color: roleBorderColor(player.role), border: `1px solid ${roleBorderColor(player.role)}` }}>
          {roleLabel(player.role)}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text3)' }}>
              {player.auctionStatus === 'sold' ? 'Sold For' : 'Base Price'}
            </div>
            <div className="text-base font-bold font-rajdhani" style={{ color: '#f59e0b' }}>
              {formatCrore(player.soldPrice || player.basePrice)}
            </div>
          </div>
          {player.auctionStatus === 'sold' && player.soldTo && (
            <div className="text-[10px]" style={{ color: 'var(--text2)' }}>
              → <span className="font-bold text-white">{player.soldTo?.shortName || ''}</span>
            </div>
          )}
          {player.aiPredictedValue && player.auctionStatus === 'available' && (
            <div className="text-right">
              <div className="text-[9px]" style={{ color: 'var(--text3)' }}>🤖 AI</div>
              <div className="text-xs font-bold" style={{ color: '#a78bfa' }}>{formatCrore(player.aiPredictedValue)}</div>
            </div>
          )}
        </div>

        {player.auctionStatus === 'available' && player.demandLevel && (
          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full demand-bar rounded-full" style={{ width: DEMAND_W[player.demandLevel] || '50%' }} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function PlayersPage() {
  const dispatch = useDispatch()
  const { list: players, loading, total, filters } = useSelector(s => s.players)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.role) params.role = filters.role
    dispatch(fetchPlayers(params))
  }, [filters, dispatch])

  const handleSearch = () => {
    dispatch(fetchPlayers({ search, ...(filters.status ? { status: filters.status } : {}), ...(filters.role ? { role: filters.role } : {}) }))
  }

  return (
    <>
      <Head><title>Players — IPL Nexus AI Auction</title></Head>
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <h1 className="text-4xl font-black font-rajdhani gradient-text tracking-wider mb-1">PLAYER POOL</h1>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>{total} players · IPL Mega Auction 2025</p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex gap-2 flex-1 min-w-[200px]">
              <input value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="🔍 Search players..."
                className="input-neon rounded-xl px-4 py-2.5 text-sm flex-1" />
              <button onClick={handleSearch} className="btn-neon px-4 py-2.5 rounded-xl text-sm flex-shrink-0">Search</button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {ROLES.map(role => (
                <button key={role} onClick={() => dispatch(setFilter({ role }))}
                  className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: filters.role === role ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${filters.role === role ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: filters.role === role ? 'var(--neon)' : 'var(--text3)',
                  }}>
                  {role || 'All Roles'}
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => (
                <button key={s} onClick={() => dispatch(setFilter({ status: s }))}
                  className="px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={{
                    background: filters.status === s ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${filters.status === s ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: filters.status === s ? '#a78bfa' : 'var(--text3)',
                  }}>
                  {s || 'All Status'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array(15).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl h-40 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🏏</div>
              <div style={{ color: 'var(--text3)' }}>No players found</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {players.map((p, i) => <PlayerCard key={p._id} player={p} i={i} />)}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
