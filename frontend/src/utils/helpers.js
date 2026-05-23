export const formatCrore = (val) => {
  if (val == null) return '—'
  return `₹${Number(val).toFixed(2)} Cr`
}

export const formatShortCrore = (val) => {
  if (val == null) return '—'
  return `₹${Number(val).toFixed(1)}Cr`
}

export const roleLabel = (role) => {
  const map = { BAT: 'Batter', BOWL: 'Bowler', ALL: 'All-Rounder', 'WK-BAT': 'Wicket-Keeper' }
  return map[role] || role
}

export const roleColor = (role) => {
  const map = {
    BAT: 'rgba(0,212,255,0.15)',
    BOWL: 'rgba(239,68,68,0.15)',
    ALL: 'rgba(245,158,11,0.15)',
    'WK-BAT': 'rgba(16,185,129,0.15)',
  }
  return map[role] || 'rgba(255,255,255,0.08)'
}

export const roleBorderColor = (role) => {
  const map = {
    BAT: 'rgba(0,212,255,0.4)',
    BOWL: 'rgba(239,68,68,0.4)',
    ALL: 'rgba(245,158,11,0.4)',
    'WK-BAT': 'rgba(16,185,129,0.4)',
  }
  return map[role] || 'rgba(255,255,255,0.15)'
}

export const demandColor = (level) => {
  const map = { low: '#64748b', medium: '#f59e0b', high: '#00d4ff', extreme: '#ef4444' }
  return map[level] || '#64748b'
}

export const demandWidth = (level) => {
  const map = { low: '25%', medium: '50%', high: '75%', extreme: '100%' }
  return map[level] || '50%'
}

export const timeAgo = (ts) => {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

export const getInitials = (name) =>
  name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'

export const teamColors = {
  MI: '#005DA0', CSK: '#F9A825', RCB: '#C8102E', KKR: '#3A225D',
  SRH: '#FF822A', DC: '#004C93', RR: '#E91E8C', PBKS: '#ED1C24',
  LSG: '#A72056', GT: '#1C1C5E',
}

export const nextBidAmount = (current, increment = 0.15) =>
  parseFloat((current + increment).toFixed(2))

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)
