import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { removeToast } from '../../store/slices/uiSlice'

const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
const colors = {
  success: 'border-green-500/40 bg-green-500/10',
  error: 'border-red-500/40 bg-red-500/10',
  warning: 'border-amber-500/40 bg-amber-500/10',
  info: 'border-blue-400/40 bg-blue-400/10',
}

function Toast({ toast }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration || 3500)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, dispatch])

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`glass-card border rounded-xl px-4 py-3 flex items-start gap-3 max-w-sm cursor-pointer shadow-card ${colors[toast.type] || colors.info}`}
      onClick={() => dispatch(removeToast(toast.id))}
    >
      <span className="text-base flex-shrink-0 mt-0.5">{icons[toast.type] || 'ℹ️'}</span>
      <p className="text-sm text-slate-200 leading-relaxed">{toast.message}</p>
    </motion.div>
  )
}

export default function ToastContainer() {
  const toasts = useSelector(s => s.ui.toasts)

  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
