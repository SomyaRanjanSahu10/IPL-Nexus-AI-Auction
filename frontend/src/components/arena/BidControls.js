import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { placeBid, markSold, markUnsold, nextPlayer, pauseAuction, resumeAuction } from '../../store/slices/auctionSlice'
import { addToast } from '../../store/slices/uiSlice'
import { formatCrore, nextBidAmount } from '../../utils/helpers'
import { useAuth } from '../../hooks/useAuth'

const getId = (value) => {
  if (!value) return null
  if (typeof value === 'object') return String(value._id || value.id || '')
  return String(value)
}

export default function BidControls({ onBidPlaced }) {
  const dispatch = useDispatch()
  const { user, isAdmin } = useAuth()
  const { data: auction, currentPlayer, currentBid, status, bidLoading, error } = useSelector(s => s.auction)

  // Compare as strings to handle ObjectId vs string mismatch
  const myTeamId = getId(user?.team)

  const myTeam = useSelector(s =>
    myTeamId ? s.teams.list.find(t => String(t._id) === myTeamId) : null
  )

  if (!currentPlayer || !auction) return null

  const leadingTeamId = getId(currentBid.team)

  const isMyTeamLeading = !!(myTeamId && myTeamId === leadingTeamId)
  const nextAmt = nextBidAmount(currentBid.amount || currentPlayer.basePrice)
  const canAfford = myTeam ? myTeam.purseRemaining >= nextAmt : false
  const isActive = status === 'active'

  const handleBid = async () => {
    if (!myTeamId) return dispatch(addToast({ type: 'error', message: 'You need a team to bid!' }))
    if (isMyTeamLeading) return dispatch(addToast({ type: 'warning', message: 'You are already leading!' }))
    if (!canAfford) return dispatch(addToast({ type: 'error', message: `Insufficient purse. Need ${formatCrore(nextAmt)}` }))

    const result = await dispatch(placeBid({
      auctionId: auction._id,
      playerId: currentPlayer._id,
      amount: nextAmt,
    }))
    if (!result.error) onBidPlaced?.()
  }

  const handleSold = async () => {
    if (!leadingTeamId) return dispatch(addToast({ type: 'warning', message: 'No bids placed — mark as unsold' }))
    const result = await dispatch(markSold({
      auctionId: auction._id,
      playerId: currentPlayer._id,
      teamId: leadingTeamId,
      amount: currentBid.amount,
    }))
    if (result.error) {
      dispatch(addToast({ type: 'error', message: result.payload || 'Failed to mark player sold' }))
    } else {
      dispatch(addToast({ type: 'success', message: `${currentPlayer.name} sold successfully` }))
    }
  }

  const handleUnsold = async () => {
    const result = await dispatch(markUnsold({ auctionId: auction._id, playerId: currentPlayer._id }))
    if (result.error) {
      dispatch(addToast({ type: 'error', message: result.payload || 'Failed to mark player unsold' }))
    }
  }

  const handleNext = async () => {
    const result = await dispatch(nextPlayer(auction._id))
    if (result.error) {
      dispatch(addToast({ type: 'error', message: result.payload || 'Failed to bring next player' }))
    }
  }

  return (
    <div className="px-5 py-3 flex flex-wrap items-center gap-3 border-t"
      style={{ borderColor: 'var(--border)', background: 'rgba(0,0,0,0.3)' }}>

      {/* BID NOW — team owners only */}
      {!isAdmin && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleBid}
          disabled={!isActive || bidLoading || isMyTeamLeading || !canAfford}
          className="btn-neon px-6 py-2.5 rounded-xl text-sm flex flex-col items-center min-w-[120px]"
        >
          <span>{bidLoading ? '⏳ PLACING...' : isMyTeamLeading ? '✅ LEADING' : '⚡ BID NOW'}</span>
          <span className="text-[10px] font-normal opacity-80 mt-0.5">{formatCrore(nextAmt)}</span>
        </motion.button>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <>
          <button onClick={handleSold}
            className="px-4 py-2 rounded-xl text-sm font-bold font-rajdhani tracking-wide transition-all
              bg-green-500/15 border border-green-500/40 text-green-400 hover:bg-green-500/25">
            🔨 SOLD
          </button>
          <button onClick={handleUnsold}
            className="px-4 py-2 rounded-xl text-sm font-bold font-rajdhani tracking-wide transition-all
              bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25">
            ✕ UNSOLD
          </button>
          <button onClick={handleNext}
            className="px-4 py-2 rounded-xl text-sm font-bold font-rajdhani tracking-wide transition-all
              bg-slate-500/15 border border-slate-500/40 text-slate-400 hover:bg-slate-500/25">
            → NEXT
          </button>
          <button
            onClick={() => status === 'paused'
              ? dispatch(resumeAuction(auction._id))
              : dispatch(pauseAuction(auction._id))}
            className="px-4 py-2 rounded-xl text-sm font-bold font-rajdhani tracking-wide transition-all
              bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25">
            {status === 'paused' ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
        </>
      )}

      {/* My team purse */}
      {myTeam && (
        <div className="ml-auto text-right">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">My Purse</div>
          <div className={`text-lg font-bold font-rajdhani ${myTeam.purseRemaining < 10 ? 'text-red-400' : 'text-neon-green'}`}>
            {formatCrore(myTeam.purseRemaining)}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="w-full text-xs text-red-400 text-center py-1">
          ⚠️ {error}
        </motion.div>
      )}
    </div>
  )
}
