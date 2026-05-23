import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { getMe, logout } from '../store/slices/authSlice'

export const useAuth = (redirectTo = null) => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { user, token, loading } = useSelector(s => s.auth)

  useEffect(() => {
    if (token && !user) dispatch(getMe())
  }, [token, user, dispatch])

  useEffect(() => {
    if (!loading && !token && redirectTo) {
      router.push(redirectTo)
    }
  }, [loading, token, redirectTo, router])

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  const isAdmin = user?.role === 'admin'
  const isTeamOwner = user?.role === 'team_owner'
  const isAuthenticated = !!token

  return { user, token, loading, isAdmin, isTeamOwner, isAuthenticated, logout: handleLogout }
}

export const useRequireAuth = (requiredRole = null) => {
  const { user, token, loading, isAdmin, isTeamOwner } = useAuth('/login')
  const router = useRouter()

  useEffect(() => {
    if (!loading && token && requiredRole) {
      if (requiredRole === 'admin' && !isAdmin) router.push('/auction')
      if (requiredRole === 'team_owner' && !isTeamOwner && !isAdmin) router.push('/auction')
    }
  }, [loading, token, requiredRole, isAdmin, isTeamOwner, router])

  return { user, loading, isAdmin, isTeamOwner }
}
