import { useSelector } from 'react-redux'

export default function TimerRing({ size = 72, strokeWidth = 5, duration = 10 }) {
  const timer = useSelector(s => s.auction.timer)
  const r = (size / 2) - strokeWidth
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, timer / duration)
  const offset = circ * (1 - pct)
  const color = timer <= 3 ? '#ef4444' : timer <= 6 ? '#f59e0b' : '#00d4ff'
  const urgent = timer <= 3

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="timer-ring-path"
          style={{ filter: urgent ? `drop-shadow(0 0 6px ${color})` : 'none' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-rajdhani font-bold ${urgent ? 'animate-pulse' : ''}`}
          style={{ fontSize: size * 0.28, color, lineHeight: 1 }}>
          {timer}
        </span>
      </div>
    </div>
  )
}
