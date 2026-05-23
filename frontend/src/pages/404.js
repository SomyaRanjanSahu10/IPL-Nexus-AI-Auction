import Link from 'next/link'
import Head from 'next/head'
import { motion } from 'framer-motion'

export default function Custom404() {
  return (
    <>
      <Head><title>404 — IPL Nexus AI</title></Head>
      <div className="min-h-screen stadium-bg flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-8xl mb-6">🏏</div>
          <div className="text-8xl font-black font-rajdhani gradient-text mb-4">404</div>
          <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
          <p className="text-slate-400 mb-8 max-w-sm">Looks like this ball went over the boundary. Let's get you back to the auction.</p>
          <Link href="/"><button className="btn-neon px-8 py-3 rounded-2xl text-base">← Back to Home</button></Link>
        </motion.div>
      </div>
    </>
  )
}
