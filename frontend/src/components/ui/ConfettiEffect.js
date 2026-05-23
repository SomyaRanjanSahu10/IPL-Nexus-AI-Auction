import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { stopConfetti } from '../../store/slices/uiSlice'

export default function ConfettiEffect() {
  const confetti = useSelector(s => s.ui.confetti)
  const dispatch = useDispatch()
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!confetti) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 8 + Math.random() * 8,
      h: 4 + Math.random() * 4,
      color: ['#00d4ff','#7c3aed','#f59e0b','#10b981','#ef4444','#ec4899'][Math.floor(Math.random()*6)],
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
    }))

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotSpeed
        ctx.save()
        ctx.translate(p.x + p.w/2, p.y + p.h/2)
        ctx.rotate(p.rot * Math.PI / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, 1 - frame/180)
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h)
        ctx.restore()
      })
      frame++
      if (frame < 200) rafRef.current = requestAnimationFrame(animate)
      else { ctx.clearRect(0,0,canvas.width,canvas.height); dispatch(stopConfetti()) }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(rafRef.current); ctx?.clearRect(0,0,canvas.width,canvas.height) }
  }, [confetti, dispatch])

  return (
    <canvas ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[999]"
      style={{ display: confetti ? 'block' : 'none' }}
    />
  )
}
