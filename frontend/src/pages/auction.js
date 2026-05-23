import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/layout/Layout'
import PlayerShowcase from '../components/arena/PlayerShowcase'
import BidControls from '../components/arena/BidControls'
import BidLog from '../components/arena/BidLog'
import TeamsSidebar from '../components/arena/TeamsSidebar'
import SoldBanner from '../components/arena/SoldBanner'
import { fetchActiveAuction, nextPlayer, setTimer } from '../store/slices/auctionSlice'
import { fetchTeams } from '../store/slices/teamsSlice'
import { fetchPlayers } from '../store/slices/playersSlice'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../hooks/useAuth'
import { addToast } from '../store/slices/uiSlice'
import api from '../utils/api'

function AuctionHeader({ status }) {
  const statusMap = {
    active: { label: 'LIVE', color: '#10b981', pulse: true },
    paused: { label: 'PAUSED', color: '#f59e0b', pulse: false },
    completed: { label: 'ENDED', color: '#64748b', pulse: false },
    idle: { label: 'WAITING', color: '#475569', pulse: false },
  }
  const s = statusMap[status] || statusMap.idle
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
      style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 px-3 py-1 rounded-full"
        style={{ background: s.color + '20', border: `1px solid ${s.color}40` }}>
        <div className="w-2 h-2 rounded-full"
          style={{ background: s.color, animation: s.pulse ? 'pulse 1.5s infinite' : 'none' }} />
        <span className="text-[11px] font-bold tracking-wider" style={{ color: s.color }}>{s.label}</span>
      </div>
      <span className="text-sm font-bold font-rajdhani tracking-wide text-white">IPL MEGA AUCTION 2025</span>
      <span className="text-xs text-slate-500 ml-auto">Socket.IO + GROK AI</span>
    </div>
  )
}

function AdminStartPanel({ onStart, creating, mode = 'start', onRecover }) {
  const { isAdmin, isAuthenticated, user } = useAuth()
  const isRecover = mode === 'recover'

  if (isAuthenticated && !user) return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-5xl mb-4">â³</div>
      <div className="text-lg font-rajdhani font-bold text-slate-400">Checking admin session...</div>
    </div>
  )

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-5xl mb-4">⏳</div>
      <div className="text-lg font-rajdhani font-bold text-slate-400">Waiting for auction to start</div>
      <div className="text-sm text-slate-600 mt-2">The admin will launch the auction shortly</div>
    </div>
  )
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="text-5xl">🎬</div>
      <div className="text-xl font-rajdhani font-bold text-white">
        {isRecover ? 'Resume Auction Setup' : 'Start the Auction'}
      </div>
      <div className="text-sm text-slate-500">
        {isRecover ? 'An auction exists, but no player is currently up.' : 'Create and start a new auction to begin bidding'}
      </div>
      <button disabled={creating} onClick={isRecover ? onRecover : onStart}
        className="btn-neon px-8 py-3 rounded-xl text-base mt-2 disabled:opacity-50">
        {creating ? 'Starting...' : isRecover ? 'Bring Next Player' : 'Launch Auction'}
      </button>
    </div>
  )
}

export default function AuctionPage() {
  const dispatch = useDispatch()
  const { user, isAdmin } = useAuth('/login')
  const { data: auction, status, currentPlayer, timer } = useSelector(s => s.auction)
  const { bidFlashes } = useSelector(s => s.ui)
  const timerRef = useRef(null)
  const [activeTab, setActiveTab] = useState('arena')
  const [playerQueue, setPlayerQueue] = useState([])
  const [creating, setCreating] = useState(false)

  useSocket(auction?._id)

  useEffect(() => {
    dispatch(fetchActiveAuction())
    dispatch(fetchTeams())
    dispatch(fetchPlayers({ status: 'available', limit: 20 }))
  }, [dispatch])

  useEffect(() => {
    api.get('/players?status=available&limit=10')
      .then(({ data }) => setPlayerQueue(data.players || []))
      .catch(() => {})
  }, [])

  // Timer countdown - simple interval, no thunk dispatch
  useEffect(() => {
    clearInterval(timerRef.current)
    if (status !== 'active' || !currentPlayer) return
    timerRef.current = setInterval(() => {
      dispatch(setTimer(null)) // handled by reducer
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [status, currentPlayer?._id, dispatch])

  const handleBidPlaced = () => dispatch(setTimer(10))

  const handleStartAuction = async () => {
    setCreating(true)
    try {
      const { data: created } = await api.post('/auction', { name: 'IPL Mega Auction 2025', season: '2025' })
      await api.post(`/auction/${created.auction._id}/start`)
      dispatch(fetchActiveAuction())
      dispatch(addToast({ type: 'success', message: '🎉 Auction started!' }))
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.error || 'Failed to start auction' }))
    } finally {
      setCreating(false)
    }
  }

  const handleRecoverAuction = async () => {
    if (!auction?._id) return
    setCreating(true)
    try {
      const result = await dispatch(nextPlayer(auction._id))
      if (result.error) {
        dispatch(addToast({ type: 'error', message: result.payload || 'Failed to bring next player' }))
      } else {
        dispatch(fetchActiveAuction())
        dispatch(addToast({ type: 'success', message: 'Next player is up!' }))
      }
    } finally {
      setCreating(false)
    }
  }

  const tabs = [
    { id: 'arena', label: '⚡ Arena' },
    { id: 'bidlog', label: '📋 Bids' },
    { id: 'queue', label: '🎯 Queue' },
  ]

  return (
    <>
      <Head><title>Live Auction — IPL Nexus AI</title></Head>
      <Layout showAi>
        <div className="flex h-[calc(100vh-56px)]">
          {/* Left: Teams sidebar */}
          <div className="hidden lg:block w-[230px] flex-shrink-0 h-full overflow-hidden">
            <TeamsSidebar />
          </div>

          {/* Center: Arena */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <AuctionHeader status={status} />

            {/* Tabs */}
            <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-5 py-2.5 text-sm font-semibold font-rajdhani tracking-wide transition-all border-b-2 ${
                    activeTab === t.id ? 'text-neon border-neon' : 'text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                  style={activeTab === t.id ? { color: 'var(--neon)', borderColor: 'var(--neon)' } : {}}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto relative">
              {/* SOLD banner overlay */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                <SoldBanner />
              </div>

              {activeTab === 'arena' && (
                <div className="flex flex-col h-full">
                  {!auction || status === 'idle' ? (
                    <AdminStartPanel onStart={handleStartAuction} creating={creating} />
                  ) : !currentPlayer ? (
                    <AdminStartPanel
                      mode="recover"
                      onRecover={handleRecoverAuction}
                      creating={creating}
                    />
                  ) : (
                    <PlayerShowcase />
                  )}
                </div>
              )}

              {activeTab === 'bidlog' && (
                <div className="h-full"><BidLog /></div>
              )}

              {activeTab === 'queue' && (
                <div className="p-4">
                  <div className="section-label mb-3">Upcoming Players</div>
                  {playerQueue.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">No upcoming players</div>
                  ) : playerQueue.map((p) => (
                    <div key={p._id} className="glass-card rounded-xl px-4 py-3 mb-2 flex items-center gap-3">
                      <span className="text-2xl">{p.emoji || '🏏'}</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{p.role} · {p.country}</div>
                      </div>
                      <div className="text-sm font-bold font-mono text-amber-400">₹{p.basePrice} Cr</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bid controls */}
            {auction && status !== 'completed' && (
              <BidControls onBidPlaced={handleBidPlaced} />
            )}

            {/* Bid flash notifications */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-2 pointer-events-none">
              <AnimatePresence>
                {bidFlashes.slice(-3).map(f => (
                  <motion.div key={f.id}
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="px-4 py-2 rounded-xl text-sm font-bold font-rajdhani text-white backdrop-blur-sm"
                    style={{ background: (f.color || '#00d4ff') + '33', border: `1px solid ${f.color || '#00d4ff'}66` }}>
                    {f.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

AuctionPage.getLayout = (page) => page
