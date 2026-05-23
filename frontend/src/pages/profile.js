import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Layout from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { fetchTeams } from '../store/slices/teamsSlice'
import { addToast } from '../store/slices/uiSlice'
import { getInitials, formatCrore } from '../utils/helpers'
import api from '../utils/api'

export default function ProfilePage() {
  const { user } = useAuth('/login')
  const dispatch = useDispatch()
  const teams = useSelector(s => s.teams.list)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user?.name) setName(user.name) }, [user?.name])
  useEffect(() => { if (teams.length === 0) dispatch(fetchTeams()) }, [dispatch, teams.length])

  // Safe team lookup comparing strings
  const myTeamId = user?.team?._id ? String(user.team._id) : user?.team ? String(user.team) : null
  const myTeam = myTeamId ? teams.find(t => String(t._id) === myTeamId) : null

  const roleColors = { admin: '#f59e0b', team_owner: '#00d4ff', viewer: '#94a3b8' }
  const roleColor = roleColors[user?.role] || '#94a3b8'

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await api.put('/auth/profile', { name: name.trim() })
      dispatch(addToast({ type: 'success', message: '✅ Profile updated!' }))
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update profile' }))
    } finally { setSaving(false) }
  }

  if (!user) return null

  return (
    <>
      <Head><title>Profile — IPL Nexus AI</title></Head>
      <Layout>
        <div className="p-6 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-black font-rajdhani gradient-text tracking-wider mb-1">MY PROFILE</h1>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Manage your account and team details</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Avatar */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black font-rajdhani text-white mb-4"
                style={{ background: 'linear-gradient(135deg, var(--neon2), var(--neon))' }}>
                {getInitials(user.name)}
              </div>
              <div className="text-lg font-bold text-white font-rajdhani">{user.name}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{user.email}</div>
              <div className="mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ background: roleColor + '20', color: roleColor, border: `1px solid ${roleColor}40` }}>
                {user.role?.replace('_', ' ')}
              </div>
            </motion.div>

            {/* Edit form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="md:col-span-2 glass-card rounded-2xl p-6">
              <div className="section-label mb-4">Account Details</div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs block mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    className="input-neon w-full rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Email</label>
                  <input value={user.email || ''} disabled
                    className="input-neon w-full rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs block mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text2)' }}>Role</label>
                  <input value={(user.role || '').replace('_', ' ')} disabled
                    className="input-neon w-full rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed capitalize" />
                </div>
                <button onClick={handleSave} disabled={saving || !name.trim()}
                  className="btn-neon w-full py-3 rounded-xl text-sm disabled:opacity-50">
                  {saving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Team info */}
          {myTeam && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-6 rounded-2xl p-6"
              style={{
                background: `linear-gradient(135deg, ${myTeam.primaryColor || '#334155'}15, rgba(0,0,0,0.3))`,
                border: `1px solid ${myTeam.primaryColor || '#334155'}30`
              }}>
              <div className="section-label mb-4">My Franchise</div>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{myTeam.emoji || '🏏'}</div>
                <div className="flex-1">
                  <div className="text-xl font-black font-rajdhani text-white">{myTeam.name}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{myTeam.shortName} · {myTeam.city || ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Purse Remaining</div>
                  <div className="text-2xl font-black font-rajdhani" style={{ color: myTeam.primaryColor || '#00d4ff' }}>
                    {formatCrore(myTeam.purseRemaining)}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Players', value: (myTeam.players || []).length },
                  { label: 'Overseas', value: myTeam.overseasCount || 0 },
                  { label: 'Spent', value: formatCrore(Math.max(0, (myTeam.purseTotal || 100) - (myTeam.purseRemaining || 0))) },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="text-lg font-bold font-rajdhani text-white">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </Layout>
    </>
  )
}
