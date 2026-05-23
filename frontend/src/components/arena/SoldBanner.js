import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { formatCrore } from '../../utils/helpers'

export default function SoldBanner() {
  const lastSold = useSelector(s => s.auction.lastSold)

  return (
    <AnimatePresence>
      {lastSold && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 1.2, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl z-20 backdrop-blur-md"
          style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.5)' }}
        >
          <motion.div
            initial={{ y: -20 }} animate={{ y: 0 }}
            className="text-6xl mb-3">🔨</motion.div>
          <div className="text-4xl font-black font-rajdhani tracking-widest text-neon-green mb-2">SOLD!</div>
          <div className="text-xl font-bold text-white mb-1">{lastSold.player?.name}</div>
          <div className="text-2xl font-black font-rajdhani gradient-text">{formatCrore(lastSold.amount)}</div>
          <div className="text-sm text-slate-400 mt-2">
            → <span className="font-bold text-neon-green">{lastSold.team?.name}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
