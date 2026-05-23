import { useEffect, useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import Layout from '../components/layout/Layout'
import { formatCrore } from '../utils/helpers'
import api from '../utils/api'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-300 font-bold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1 ? formatCrore(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

const COLORS = ['#005DA0', '#F9A825', '#C8102E', '#3A225D', '#FF822A', '#004C93', '#E91E8C', '#ED1C24', '#A72056', '#1C1C5E']

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/overview')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout><div className="flex items-center justify-center h-64 text-slate-500">Loading analytics...</div></Layout>
  )

  const teams = data?.teams || []
  const overview = data?.overview || {}

  const spendingData = teams.map(t => ({
    name: t.shortName, spent: t.totalSpent, remaining: t.purseRemaining
  }))

  const roleData = teams.reduce((acc, t) => {
    acc[0].value += t.playerBreakdown?.batters || 0
    acc[1].value += t.playerBreakdown?.bowlers || 0
    acc[2].value += t.playerBreakdown?.allRounders || 0
    acc[3].value += t.playerBreakdown?.keepers || 0
    return acc
  }, [
    { name: 'Batters', value: 0 },
    { name: 'Bowlers', value: 0 },
    { name: 'All-Rounders', value: 0 },
    { name: 'Keepers', value: 0 },
  ])

  const statCards = [
    { label: 'Total Sold', value: overview.soldPlayers || 0, icon: '🔨', color: '#10b981' },
    { label: 'Total Unsold', value: overview.unsoldPlayers || 0, icon: '❌', color: '#ef4444' },
    { label: 'Total Bids', value: overview.totalBids || 0, icon: '⚡', color: '#00d4ff' },
    { label: 'Total Spent', value: formatCrore(overview.totalSpent), icon: '💰', color: '#f59e0b' },
  ]

  return (
    <>
      <Head><title>Analytics — IPL Nexus AI Auction</title></Head>
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-black font-rajdhani gradient-text tracking-wider mb-1">AUCTION ANALYTICS</h1>
            <p className="text-slate-500 text-sm">Live statistics and spending analysis</p>
          </motion.div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-5 text-center"
                style={{ border: `1px solid ${s.color}30` }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-black font-rajdhani" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Team spending bar chart */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Team Spending (Crore ₹)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={spendingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="spent" name="Spent" radius={[4, 4, 0, 0]}>
                    {spendingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Purse remaining */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Purse Remaining (Crore ₹)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={spendingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="remaining" name="Remaining" radius={[4, 4, 0, 0]}>
                    {spendingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length] + 'aa'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Player role distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Player Role Distribution</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {roleData.map((_, i) => <Cell key={i} fill={['#00d4ff', '#ef4444', '#f59e0b', '#10b981'][i]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2">
                  {roleData.map((r, i) => (
                    <div key={r.name} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ background: ['#00d4ff', '#ef4444', '#f59e0b', '#10b981'][i] }} />
                      <span className="text-slate-400">{r.name}</span>
                      <span className="font-bold text-white ml-auto">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Team leaderboard */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Spending Leaderboard</h3>
              <div className="flex flex-col gap-2">
                {[...teams].sort((a, b) => b.totalSpent - a.totalSpent).map((t, i) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-600 w-4">{i + 1}</div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[teams.indexOf(t)] }} />
                    <div className="text-xs text-slate-300 flex-1 font-semibold">{t.shortName}</div>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(t.totalSpent / 100) * 100}%`, background: COLORS[teams.indexOf(t)] }} />
                    </div>
                    <div className="text-xs font-mono text-amber-400 w-20 text-right">{formatCrore(t.totalSpent)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  )
}
