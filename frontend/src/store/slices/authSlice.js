import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed')
  }
})

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed')
  }
})

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me')
    // Save fresh user data to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error)
  }
})

const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token') || null
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStoredUser(),
    token: getStoredToken(),
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },
    clearError(state) { state.error = null },
    setInitialized(state) { state.initialized = true },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(register.rejected, rejected)
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.initialized = true
        state.loading = false
      })
      .addCase(getMe.rejected, (state) => {
        state.initialized = true
        state.loading = false
        // If getMe fails, token is invalid - clear it
        state.token = null
        state.user = null
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      })
  }
})

export const { logout, clearError, setInitialized } = authSlice.actions
export default authSlice.reducer
