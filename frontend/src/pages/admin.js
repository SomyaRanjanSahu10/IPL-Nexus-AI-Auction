import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/layout/Layout'
import { useRequireAuth } from '../hooks/useAuth'
import { fetchPlayers, createPlayer, updatePlayer, deletePlayer } from '../store/slices/playersSlice'
import { fetchTeams } from '../store/slices/teamsSlice'
import { addToast } from '../store/slices/uiSlice'
import { formatCrore, roleLabel } from '../utils/helpers'
import api from '../utils/api'

const EMPTY_PLAYER = {
  name: '', country: 'India', isOverseas: false, role: 'BAT',
  basePrice: 2, emoji: '🏏', order: 99,
  iplStats: { matches: 0, runs: 0, average: 0, strikeRate: 0, wickets: 0, economy: 0 },
  demandLevel: 'medium', popularityScore: 50, injuryStatus: 'fit'
}

function PlayerFormModal({ player, onClose, onSave }) {
  const [form, setForm] = useState(player || EMPTY_PLAYER)
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const setStat = (k, v) => setForm(prev => ({ ...prev, iplStats: { ...prev.iplStats, [k]: v } }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto neon-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black font-rajdhani text-white tracking-wide">
            {player?._id ? '✏️ Edit Player' : '➕ Add Player'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-red-400 text-lg">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="col-span-2">
            <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="input-neon w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Player name" />
          </div>

          {/* Country */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Country</label>
            <input value={form.country} onChange={e => set('country', e.target.value)}
              className="input-neon w-full rounded-xl px-4 py-2.5 text-sm" />
          </div>

          {/* Role */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Role</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}
              className="input-neon w-full rounded-xl px-4 py-2.5 text-sm bg-transparent">
              {['BAT', 'BOWL', 'ALL', 'WK-BAT'].map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
            </select>
          </div>

          {/* Base price */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Base Price (Cr ₹)</label>
            <input type="number" min="0.2" max="15" step="0.1" value={form.basePrice}
              onChange={e => set('basePrice', parseFloat(e.target.value))}
              className="input-neon w-full rounded-xl px-4 py-2.5 text-sm" />
          </div>

          {/* Overseas */}
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="overseas" checked={form.isOverseas}
              onChange={e => { set('isOverseas', e.target.checked); set('country', e.target.checked ? form.country : 'India') }}
              className="w-4 h-4 accent-blue-400" />
            <label htmlFor="overseas" className="text-sm text-slate-300">🌍 Overseas Player</label>
          </div>

          {/* Emoji */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Emoji</label>
            <input value={form.emoji} onChange={e => set('emoji', e.target.value)}
              className="input-neon w-full rounded-xl px-4 py-2.5 text-sm" placeholder="🏏" maxLength={2} />
          </div>

          {/* Order */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Auction Order</label>
            <input type="number" value={form.order} onChange={e => set('order', parseInt(e.target.value))}
              className="input-neon w-full rounded-xl px-4 py-2.5 text-sm" />
          </div>

          {/* Demand */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Demand Level</label>
            <select value={form.demandLevel} onChange={e => set('demandLevel', e.target.value)}
              className="input-neon w-full rounded-xl px-4 py-2.5 text-sm bg-transparent">
              {['low', 'medium', 'high', 'extreme'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Injury */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Injury Status</label>
            <select value={form.injuryStatus} onChange={e => set('injuryStatus', e.target.value)}
              className="input-neon w-full rounded-xl px-4 py-2.5 text-sm bg-transparent">
              {['fit', 'doubtful', 'injured'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Stats section */}
          <div className="col-span-2">
            <div className="section-label mb-3">IPL Statistics</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'matches', label: 'Matches' },
                { key: 'runs', label: 'Runs' },
                { key: 'average', label: 'Batting Avg' },
                { key: 'strikeRate', label: 'Strike Rate' },
                { key: 'wickets', label: 'Wickets' },
                { key: 'economy', label: 'Economy' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wider">{label}</label>
                  <input type="number" step="0.1" value={form.iplStats?.[key] || 0}
                    onChange={e => setStat(key, parseFloat(e.target.value) || 0)}
                    className="input-neon w-full rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm glass-card text-slate-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(form)}
            className="flex-1 btn-neon py-2.5 rounded-xl text-sm">
            {player?._id ? '✅ Update Player' : '➕ Add Player'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useRequireAuth('admin')
  const dispatch = useDispatch()
  const { list: players, loading } = useSelector(s => s.players)
  const { list: teams } = useSelector(s => s.teams)
  const [activeTab, setActiveTab] = useState('players')
  const [modal, setModal] = useState(null) // null | 'add' | player object
  const [users, setUsers] = useState([])

  useEffect(() => {
    dispatch(fetchPlayers({ limit: 50 }))
    dispatch(fetchTeams())
    if (isAdmin) {
      api.get('/auth/users').then(({ data }) => setUsers(data.users || []))
    }
  }, [dispatch, isAdmin])

  const handleSavePlayer = async (form) => {
    if (form._id) {
      const { _id, ...body } = form
      await dispatch(updatePlayer({ id: _id, ...body }))
      dispatch(addToast({ type: 'success', message: '✅ Player updated!' }))
    } else {
      await dispatch(createPlayer(form))
      dispatch(addToast({ type: 'success', message: '✅ Player added!' }))
    }
    setModal(null)
    dispatch(fetchPlayers({ limit: 50 }))
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    await dispatch(deletePlayer(id))
    dispatch(addToast({ type: 'success', message: `🗑️ ${name} deleted` }))
  }

  const handleResetTeam = async (teamId, teamName) => {
    if (!confirm(`Reset ${teamName} purse and squad?`)) return
    try {
      await api.post(`/teams/${teamId}/reset`)
      dispatch(fetchTeams())
      dispatch(addToast({ type: 'success', message: `✅ ${teamName} reset` }))
    } catch {
      dispatch(addToast({ type: 'error', message: 'Reset failed' }))
    }
  }

  if (authLoading) return null

  const tabs = [
    { id: 'players', label: '🏏 Players', count: players.length },
    { id: 'teams', label: '🏟️ Teams', count: teams.length },
    { id: 'users', label: '👥 Users', count: users.length },
  ]

  return (
    <>
      <Head><title>Admin Dashboard — IPL Nexus AI</title></Head>
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black font-rajdhani gradient-text-fire tracking-wider mb-1">⚙️ ADMIN PANEL</h1>
              <p className="text-slate-500 text-sm">Manage players, teams, users and auction</p>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 border-b mb-6" style={{ borderColor: 'var(--border)' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-5 py-2.5 text-sm font-semibold font-rajdhani transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === t.id ? 'text-amber-400 border-amber-400' : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}>
                {t.label}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text3)' }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Players tab */}
          {activeTab === 'players' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-400">{players.length} total players</span>
                <button onClick={() => setModal('add')}
                  className="btn-neon px-4 py-2 rounded-xl text-sm">➕ Add Player</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Player', 'Role', 'Country', 'Base Price', 'Status', 'Order', 'Actions'].map(h => (
                        <th key={h} className="text-left py-2.5 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p, i) => (
                      <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border)' }}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{p.emoji || '🏏'}</span>
                            <span className="font-semibold text-white">{p.name}</span>
                            {p.isOverseas && <span className="text-[9px] text-amber-500">🌍</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{p.role}</td>
                        <td className="py-3 px-3 text-slate-400">{p.country}</td>
                        <td className="py-3 px-3 text-amber-400 font-mono">{formatCrore(p.basePrice)}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-bold ${
                            p.auctionStatus === 'available' ? 'text-green-400 bg-green-400/10' :
                            p.auctionStatus === 'sold' ? 'text-blue-400 bg-blue-400/10' :
                            'text-red-400 bg-red-400/10'
                          }`}>{p.auctionStatus}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{p.order}</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <button onClick={() => setModal(p)}
                              className="text-xs px-2 py-1 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors">Edit</button>
                            <button onClick={() => handleDelete(p._id, p.name)}
                              className="text-xs px-2 py-1 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">Del</button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Teams tab */}
          {activeTab === 'teams' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team, i) => (
                <motion.div key={team._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-5"
                  style={{ border: `1px solid ${team.primaryColor}25` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{team.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{team.name}</div>
                      <div className="text-xs text-slate-500">{team.shortName} · {team.players?.length || 0} players</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-rajdhani" style={{ color: team.primaryColor }}>
                        {formatCrore(team.purseRemaining)}
                      </div>
                      <div className="text-[10px] text-slate-500">remaining</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleResetTeam(team._id, team.name)}
                      className="text-xs px-3 py-1.5 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-colors border border-amber-400/20">
                      🔄 Reset Purse
                    </button>
                    {!team.owner && (
                      <span className="text-xs text-slate-500 italic self-center">No owner assigned</span>
                    )}
                    {team.owner && (
                      <span className="text-xs text-slate-400 self-center">👤 {team.owner.name}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Users tab */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'Email', 'Role', 'Team', 'Logins', 'Joined'].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border)' }}>
                      <td className="py-3 px-3 font-semibold text-white">{u.name}</td>
                      <td className="py-3 px-3 text-slate-400">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                          u.role === 'admin' ? 'text-amber-400 bg-amber-400/10' :
                          u.role === 'team_owner' ? 'text-blue-400 bg-blue-400/10' :
                          'text-slate-400 bg-slate-400/10'
                        }`}>{u.role?.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{u.team?.shortName || '—'}</td>
                      <td className="py-3 px-3 text-slate-500">{u.loginCount || 0}</td>
                      <td className="py-3 px-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Layout>

      {/* Player modal */}
      <AnimatePresence>
        {modal && (
          <PlayerFormModal
            player={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSavePlayer}
          />
        )}
      </AnimatePresence>
    </>
  )
}
