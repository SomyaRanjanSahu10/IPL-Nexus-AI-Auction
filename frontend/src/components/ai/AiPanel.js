import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { sendAiMessage, addUserMessage, clearMessages, setOpen } from '../../store/slices/aiSlice'

const QUICK = [
  'Best buy under ₹5 Cr?',
  'Analyze my squad gaps',
  'Predict top sold players',
  'Best overseas options?',
  'Budget optimization tips',
]

function TypingDots() {
  return (
    <div className="flex gap-1 px-3 py-2">
      {[0,1,2].map(i => (
        <div key={i} className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
      ))}
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] px-3 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'rounded-br-none'
          : 'rounded-bl-none'
      }`}
        style={isUser
          ? { background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--text)' }
          : { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--text)' }
        }>
        {!isUser && <span className="text-purple-400 font-bold text-[10px] block mb-1">🤖 NEXUS AI</span>}
        {msg.content}
      </div>
    </motion.div>
  )
}

export default function AiPanel() {
  const dispatch = useDispatch()
  const { messages, loading, isOpen } = useSelector(s => s.ai)
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    dispatch(addUserMessage(msg))
    dispatch(sendAiMessage({
      message: msg,
      history: messages.slice(-6).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    }))
  }

  const handleQuick = (q) => {
    if (loading) return
    dispatch(addUserMessage(q))
    dispatch(sendAiMessage({ message: q, history: [] }))
  }

  if (!isOpen) return null

  return (
    <motion.aside
      initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-14 bottom-0 w-[320px] flex flex-col z-40"
      style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--neon2), var(--neon))' }}>🤖</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold font-rajdhani tracking-wider text-white">NEXUS AI</div>
          <div className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text3)' }}>AI Auction Strategist</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => dispatch(clearMessages())}
            className="text-[10px] px-1.5 py-1 rounded transition-colors hover:text-amber-400"
            style={{ color: 'var(--text3)' }}>Clear</button>
          <button onClick={() => dispatch(setOpen(false))}
            className="text-sm px-1 transition-colors hover:text-red-400"
            style={{ color: 'var(--text3)' }}>✕</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
        <AnimatePresence>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl rounded-bl-none"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-3 py-2 border-t flex flex-wrap gap-1.5" style={{ borderColor: 'var(--border)' }}>
        {QUICK.map(p => (
          <button key={p} onClick={() => handleQuick(p)} disabled={loading}
            className="text-[10px] px-2.5 py-1 rounded-full transition-all disabled:opacity-40"
            style={{ border: '1px solid var(--border)', color: 'var(--text2)' }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.color = '#a78bfa' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text2)' }}>
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t flex gap-2 flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask your AI strategist..."
          className="input-neon flex-1 rounded-lg px-3 py-2 text-xs"
          disabled={loading} />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="btn-neon px-3 py-2 rounded-lg text-xs disabled:opacity-40">
          {loading ? '…' : '↑'}
        </button>
      </div>
    </motion.aside>
  )
}
