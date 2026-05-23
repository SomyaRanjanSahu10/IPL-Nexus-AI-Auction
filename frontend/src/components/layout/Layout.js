import Navbar from './Navbar'
import ToastContainer from '../ui/ToastContainer'
import AiPanel from '../ai/AiPanel'
import ConfettiEffect from '../ui/ConfettiEffect'
import { useSelector } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'

export default function Layout({ children, showAi = true }) {
  const { isAuthenticated } = useAuth()
  const aiOpen = useSelector(s => s.ai?.isOpen ?? true)

  return (
    <div className="min-h-screen stadium-bg">
      <Navbar />
      <div className="pt-14 flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          showAi && isAuthenticated && aiOpen ? 'mr-[320px]' : ''
        }`}>
          {children}
        </main>
        {showAi && isAuthenticated && <AiPanel />}
      </div>
      <ToastContainer />
      <ConfettiEffect />
    </div>
  )
}
