import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTimer } from '../store/slices/auctionSlice'

export const useAuctionTimer = ({ onExpire, duration = 10 }) => {
  const dispatch = useDispatch()
  const timer = useSelector(s => s.auction.timer)
  const status = useSelector(s => s.auction.status)
  const intervalRef = useRef(null)
  const timerRef = useRef(timer)

  timerRef.current = timer

  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    dispatch(setTimer(duration))
    if (status !== 'active') return
    intervalRef.current = setInterval(() => {
      const next = timerRef.current - 1
      dispatch(setTimer(next))
      if (next <= 0) {
        clearInterval(intervalRef.current)
        onExpire?.()
      }
    }, 1000)
  }, [dispatch, duration, status, onExpire])

  const stopTimer = useCallback(() => { clearInterval(intervalRef.current) }, [])
  const pauseTimer = useCallback(() => { clearInterval(intervalRef.current) }, [])

  useEffect(() => {
    if (status === 'paused' || status === 'idle') clearInterval(intervalRef.current)
  }, [status])

  useEffect(() => { return () => clearInterval(intervalRef.current) }, [])

  const timerColor = timer <= 3 ? '#ef4444' : timer <= 6 ? '#f59e0b' : '#00d4ff'
  const timerPct = timer / duration
  const circumference = 2 * Math.PI * 30
  const dashOffset = circumference * (1 - timerPct)

  return { timer, resetTimer, stopTimer, pauseTimer, timerColor, circumference, dashOffset }
}
