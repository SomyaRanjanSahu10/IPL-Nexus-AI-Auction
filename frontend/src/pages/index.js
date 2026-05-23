import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const TEAM_BADGES = [
  { abbr: 'MI', color: '#005DA0', emoji: '🔵' },
  { abbr: 'CSK', color: '#F9A825', emoji: '🟡' },
  { abbr: 'RCB', color: '#C8102E', emoji: '🔴' },
  { abbr: 'KKR', color: '#3A225D', emoji: '🟣' },
  { abbr: 'SRH', color: '#FF822A', emoji: '🟠' },
  { abbr: 'DC', color: '#004C93', emoji: '🔷' },
  { abbr: 'RR', color: '#E91E8C', emoji: '🩷' },
  { abbr: 'PBKS', color: '#ED1C24', emoji: '❤️' },
  { abbr: 'LSG', color: '#A72056', emoji: '🟢' },
  { abbr: 'GT', color: '#1C1C5E', emoji: '🏆' },
]

const FEATURES = [
  { icon: '⚡', title: 'Real-Time Bidding', desc: 'Socket.IO powered live auction with instant bid synchronization across all participants.' },
  { icon: '🤖', title: 'GROK AI Strategist', desc: 'AI-powered player analysis, squad recommendations, budget optimization and live commentary.' },
  { icon: '⏱️', title: 'Smart Timer', desc: 'Auto 10-second countdown resets on every bid. SOLD hammer triggers automatically.' },
  { icon: '📊', title: 'Live Analytics', desc: 'Real-time spending graphs, team comparisons, bid heatmaps and auction momentum.' },
  { icon: '💰', title: 'Purse Management', desc: '₹100 Cr per team, auto-deducted on purchase. Prevents overbidding intelligently.' },
  { icon: '🏆', title: '10 IPL Franchises', desc: 'All official IPL 2025 teams with authentic colors, squads and spending strategies.' },
]

const STATS = [
  { label: 'Teams', value: '10' },
  { label: 'Players', value: '30+' },
  { label: 'Crore Purse', value: '₹100' },
  { label: 'AI Powered', value: 'GROK' },
]

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Head>
        <title>IPL Nexus AI Auction — The Future of Cricket Auctions</title>
        <meta name="description" content="AI-powered real-time IPL auction platform with GROK AI analytics, live bidding, and smart squad building." />
      </Head>

      <div className="min-h-screen stadium-bg overflow-x-hidden">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6"
          style={{ background: 'rgba(5,10,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>
          <span className="text-lg font-bold font-rajdhani tracking-widest gradient-text">⚡ IPL NEXUS AI</span>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/auction">
                <button className="btn-neon px-5 py-2 rounded-xl text-sm">Enter Auction →</button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">Sign In</button>
                </Link>
                <Link href="/register">
                  <button className="btn-neon px-5 py-2 rounded-xl text-sm">Get Started →</button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-14 overflow-hidden">
          {/* Spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center top, rgba(0,212,255,0.12) 0%, transparent 70%)' }} />

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 glass-card-blue text-sm">
              <div className="live-dot" />
              <span className="text-slate-300">Powered by GROK AI + Socket.IO</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black font-rajdhani tracking-wider mb-6 leading-tight">
              <span className="gradient-text">IPL NEXUS</span>
              <br />
              <span className="text-white">AI AUCTION</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The most advanced IPL auction platform ever built. Real-time bidding, AI-powered strategies, 
              live analytics and cinematic visuals — all in one platform.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href={isAuthenticated ? '/auction' : '/register'}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="btn-neon px-8 py-4 rounded-2xl text-lg font-rajdhani tracking-wide">
                  ⚡ Enter Auction Arena
                </motion.button>
              </Link>
              <Link href="/teams">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="btn-purple px-8 py-4 rounded-2xl text-lg font-rajdhani tracking-wide">
                  🏟️ View Teams
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Floating team badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex gap-3 mt-16 flex-wrap justify-center">
            {TEAM_BADGES.map((t, i) => (
              <motion.div key={t.abbr}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black font-rajdhani text-white"
                style={{ background: t.color + '33', border: `1px solid ${t.color}66`, boxShadow: `0 0 12px ${t.color}33` }}>
                {t.abbr}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center neon-border">
                <div className="text-3xl font-black font-rajdhani gradient-text">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-3xl font-black font-rajdhani text-center gradient-text mb-12 tracking-wide">
              PLATFORM FEATURES
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="glass-card rounded-2xl p-6 player-card-hover">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="text-lg font-bold font-rajdhani text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="max-w-2xl mx-auto glass-card-purple rounded-3xl p-12">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-3xl font-black font-rajdhani gradient-text mb-4">READY TO AUCTION?</h2>
            <p className="text-slate-400 mb-8">Join as a Team Owner and build your championship squad with AI-powered insights.</p>
            <Link href={isAuthenticated ? '/auction' : '/register'}>
              <button className="btn-neon px-10 py-4 rounded-2xl text-lg font-rajdhani tracking-wider">
                Start Bidding Now ⚡
              </button>
            </Link>
          </motion.div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-600 border-t" style={{ borderColor: 'var(--border)' }}>
          <p>© 2025 IPL Nexus AI Auction — Built with Next.js, Socket.IO & GROK AI</p>
        </footer>
      </div>
    </>
  )
}
