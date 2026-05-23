import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCrore } from '../../utils/helpers'

export default function BidLog() {
  const { bidLog, currentPlayer } = useSelector(s => s.auction)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">📋 Bid History</span>
        <span className="text-[10px] text-slate-600">({bidLog.length} bids)</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {bidLog.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-3xl mb-2">🤫</div>
            <div className="text-xs text-slate-500">No bids yet. Be the first!</div>
          </div>
        ) : (
          <AnimatePresence>
            {bidLog.map((bid, i) => (
              <motion.div
                key={bid._id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 py-2 px-3 rounded-lg"
                style={{ background: i === 0 ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${i === 0 ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)'}` }}
              >
                {/* Team dot */}
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: bid.team?.primaryColor || '#00d4ff', boxShadow: i === 0 ? `0 0 8px ${bid.team?.primaryColor || '#00d4ff'}` : 'none' }} />

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white">{bid.team?.shortName || bid.team?.name}</span>
                  <span className="text-[10px] text-slate-500 ml-1">bid</span>
                </div>

                <span className={`text-sm font-bold font-mono ${i === 0 ? 'text-neon' : 'text-slate-300'}`}>
                  {formatCrore(bid.amount)}
                </span>

                {i === 0 && (
                  <span className="text-[9px] bg-blue-400/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">LEAD</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
