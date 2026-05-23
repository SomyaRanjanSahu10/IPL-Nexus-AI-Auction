import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { formatCrore, roleLabel, roleBorderColor, roleColor, demandColor, demandWidth } from '../../utils/helpers'
import TimerRing from './TimerRing'

const roleEmoji = { BAT: '🏏', BOWL: '🎯', ALL: '⚔️', 'WK-BAT': '🧤' }

function StatBox({ label, value, highlight }) {
  return (
    <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className={`text-lg font-bold font-rajdhani ${highlight ? 'text-neon' : 'text-white'}`}>{value || '—'}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

export default function PlayerShowcase({ lastSold }) {
  const { currentPlayer: player, currentBid } = useSelector(s => s.auction)

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🏟️</div>
        <div className="text-xl font-rajdhani font-bold text-slate-400">Waiting for next player...</div>
        <div className="text-sm text-slate-600 mt-2">Admin will introduce the next player shortly</div>
      </div>
    )
  }

  const s = player.iplStats || {}
  const isBatter = player.role === 'BAT' || player.role === 'WK-BAT'
  const isBowler = player.role === 'BOWL'
  const stats = isBatter
    ? [
        { label: 'Matches', value: s.matches },
        { label: 'Runs', value: s.runs },
        { label: 'Avg', value: s.average?.toFixed(1) },
        { label: 'Strike Rate', value: s.strikeRate?.toFixed(1) },
      ]
    : isBowler
    ? [
        { label: 'Matches', value: s.matches },
        { label: 'Wickets', value: s.wickets },
        { label: 'Economy', value: s.economy?.toFixed(2) },
        { label: 'Avg', value: s.bowlingAvg?.toFixed(1) },
      ]
    : [
        { label: 'Matches', value: s.matches },
        { label: 'Runs', value: s.runs },
        { label: 'Wickets', value: s.wickets },
        { label: 'SR', value: s.strikeRate?.toFixed(1) },
      ]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={player._id}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="p-5 flex gap-5"
      >
        {/* Left: Player visual */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-40 rounded-xl flex items-center justify-center text-6xl overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${roleColor(player.role)}, rgba(0,0,0,0.4))`,
                border: `2px solid ${roleBorderColor(player.role)}`,
                boxShadow: `0 0 24px ${roleBorderColor(player.role)}`
              }}>
              {player.image
                ? <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                : <span>{player.emoji || roleEmoji[player.role] || '🏏'}</span>
              }
            </div>
            {/* Role badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-white whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, var(--neon2), var(--neon))' }}>
              {roleLabel(player.role)}
            </div>
          </div>

          {/* Demand meter */}
          <div className="mt-4 w-full">
            <div className="flex justify-between text-[9px] text-slate-500 mb-1">
              <span>DEMAND</span>
              <span className="uppercase font-bold" style={{ color: demandColor(player.demandLevel) }}>
                {player.demandLevel}
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full demand-bar rounded-full transition-all duration-500"
                style={{ width: demandWidth(player.demandLevel) }} />
            </div>
          </div>

          {/* Injury */}
          <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            player.injuryStatus === 'fit' ? 'text-green-400 bg-green-400/10' :
            player.injuryStatus === 'doubtful' ? 'text-amber-400 bg-amber-400/10' :
            'text-red-400 bg-red-400/10'
          }`}>
            {player.injuryStatus === 'fit' ? '✅ FIT' : player.injuryStatus === 'doubtful' ? '⚠️ DOUBTFUL' : '🚑 INJURED'}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex-1 min-w-0">
          {/* Name & country */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h2 className="text-2xl font-bold font-rajdhani tracking-wide text-white leading-tight">{player.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-slate-400">{player.country}</span>
                {player.isOverseas && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>🌍 OVERSEAS</span>
                )}
                {player.tags?.slice(0,2).map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded text-slate-500" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <TimerRing size={68} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {stats.map((st, i) => <StatBox key={i} {...st} highlight={i === 0} />)}
          </div>

          {/* Bid info */}
          <div className="rounded-xl p-4 flex items-center justify-between"
            style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                {currentBid.team ? 'CURRENT BID' : 'BASE PRICE'}
              </div>
              <div className="text-3xl font-black font-rajdhani gradient-text">
                {formatCrore(currentBid.amount || player.basePrice)}
              </div>
              {currentBid.team && (
                <div className="text-xs text-slate-400 mt-1">
                  Leader: <span className="font-bold text-neon-green">{currentBid.team?.name || currentBid.team?.shortName}</span>
                </div>
              )}
            </div>

            {/* AI predicted value */}
            {player.aiPredictedValue && (
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">🤖 AI VALUE</div>
                <div className="text-xl font-bold font-rajdhani text-purple-400">{formatCrore(player.aiPredictedValue)}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">predicted</div>
              </div>
            )}
          </div>

          {/* Popularity */}
          {player.popularityScore && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Popularity</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${player.popularityScore}%`, background: 'linear-gradient(90deg, var(--neon2), var(--neon))' }} />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{player.popularityScore}/100</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
