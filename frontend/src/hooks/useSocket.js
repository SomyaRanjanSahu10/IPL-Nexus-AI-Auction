import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import {
  setCurrentPlayer, updateBid, setStatus, setLastSold
} from '../store/slices/auctionSlice'
import { updateTeamPurse, addPlayerToTeam } from '../store/slices/teamsSlice'
import { markPlayerSold, markPlayerUnsold } from '../store/slices/playersSlice'
import { addToast, triggerConfetti, addBidFlash } from '../store/slices/uiSlice'

let socketInstance = null

export const useSocket = (auctionId) => {
  const dispatch = useDispatch()
  const { token } = useSelector(s => s.auth)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!auctionId) return

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

    if (socketInstance) {
      socketInstance.disconnect()
      socketInstance = null
    }

    socketInstance = io(SOCKET_URL, {
      auth: token ? { token } : {},
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socketInstance

    socketInstance.emit('join:auction', auctionId)

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id)
    })

    socketInstance.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason)
    })

    socketInstance.on('auction:started', () => {
      dispatch(setStatus('active'))
      dispatch(addToast({ type: 'success', message: '🎉 Auction has started!' }))
    })

    socketInstance.on('auction:paused', () => {
      dispatch(setStatus('paused'))
      dispatch(addToast({ type: 'warning', message: '⏸ Auction paused' }))
    })

    socketInstance.on('auction:resumed', () => {
      dispatch(setStatus('active'))
      dispatch(addToast({ type: 'info', message: '▶️ Auction resumed!' }))
    })

    socketInstance.on('auction:completed', () => {
      dispatch(setStatus('completed'))
      dispatch(addToast({ type: 'success', message: '🏆 Auction completed!' }))
      dispatch(triggerConfetti())
    })

    socketInstance.on('auction:player_up', ({ player, basePrice }) => {
      dispatch(setCurrentPlayer({ player, basePrice }))
    })

    socketInstance.on('auction:new_bid', ({ bid, currentBid }) => {
      dispatch(updateBid({ bid, currentBid }))
      const teamName = bid?.team?.shortName || bid?.team?.name || 'Team'
      const amount = currentBid?.amount != null ? `₹${Number(currentBid.amount).toFixed(2)} Cr` : ''
      dispatch(addBidFlash({
        text: `⚡ ${teamName} bid ${amount}`,
        color: bid?.team?.primaryColor || '#00d4ff'
      }))
    })

    socketInstance.on('auction:sold', ({ player, team, amount, teamPurse }) => {
      dispatch(setLastSold({ player, team, amount }))
      if (player?.id) dispatch(markPlayerSold({ playerId: player.id, teamId: team?.id, amount }))
      if (team?.id && teamPurse != null) dispatch(updateTeamPurse({ teamId: team.id, purse: teamPurse }))
      if (team?.id && player) dispatch(addPlayerToTeam({ teamId: team.id, player }))
      dispatch(triggerConfetti())
      dispatch(addToast({
        type: 'success',
        message: `🔨 ${player?.name || 'Player'} SOLD to ${team?.name || 'Team'} for ₹${Number(amount).toFixed(2)} Cr!`,
        duration: 5000
      }))
    })

    socketInstance.on('auction:unsold', ({ playerId }) => {
      if (playerId) dispatch(markPlayerUnsold(playerId))
      dispatch(addToast({ type: 'error', message: '❌ Player went UNSOLD' }))
    })

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
        socketInstance = null
      }
    }
  }, [auctionId, token, dispatch])

  return { socket: socketRef.current }
}

export const getSocket = () => socketInstance
