import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { formatShortCrore } from '../../utils/helpers'
import Link from 'next/link'

export default function TeamsSidebar() {
  const teams = useSelector(s => s.teams.list)
  const { currentBid } = useSelector(s => s.auction)
  const leadingTeamId = currentBid.team?._id || currentBid.team

  return (
    <aside className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}>
      <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="section-label">IPL Franchises</div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {teams.map((team, i) => {
          const spent = (team.purseTotal || 100) - team.purseRemaining
          const pct = (team.purseRemaining / (team.purseTotal || 100)) * 100
          const isLeading = team._id === leadingTeamId

          return (
            <motion.div
              key={team._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/teams/${team._id}`}>
                <div className={`rounded-xl p-3 mb-2 cursor-pointer transition-all duration-200 player-card-hover
                  ${isLeading ? 'neon-border-green' : 'glass-card hover:border-slate-600'}`}
                  style={isLeading ? { background: 'rgba(16,185,129,0.08)' } : {}}>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: team.primaryColor, boxShadow: isLeading ? `0 0 8px ${team.primaryColor}` : 'none' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold font-rajdhani tracking-wide text-white truncate">{team.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{team.shortName} · {team.players?.length || 0} players</div>
                    </div>
                    {isLeading && (
                      <span className="text-[9px] bg-green-400/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                        LEAD
                      </span>
                    )}
                  </div>

                  {/* Purse bar */}
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: pct > 50 ? team.primaryColor : pct > 20 ? '#f59e0b' : '#ef4444' }} />
                  </div>

                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-slate-400">{formatShortCrore(team.purseRemaining)} left</span>
                    <span className="text-slate-600">{Math.round(100-pct)}% spent</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </aside>
  )
}
