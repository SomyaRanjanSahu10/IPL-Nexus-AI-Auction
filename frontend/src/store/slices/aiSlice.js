import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const sendAiMessage = createAsyncThunk('ai/sendMessage', async ({ message, history }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/ai/chat', { message, history })
    return data.reply
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'AI service unavailable')
  }
})

export const analyzePlayer = createAsyncThunk('ai/analyzePlayer', async (playerId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/ai/analyze/${playerId}`)
    return { playerId, analysis: data.analysis }
  } catch (err) {
    return rejectWithValue(err.response?.data?.error)
  }
})

export const getSquadRecommendation = createAsyncThunk('ai/squadRecommendation', async (teamId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/ai/squad/${teamId}`)
    return data.recommendation
  } catch (err) {
    return rejectWithValue(err.response?.data?.error)
  }
})

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    messages: [
      {
        role: 'assistant',
        content: '👋 Welcome to **IPL Nexus AI Auction**! I\'m your GROK-powered AI strategist. Ask me anything about players, squad building, budget optimization, or live auction strategy! 🏏',
        ts: new Date().toISOString(),
      }
    ],
    loading: false,
    error: null,
    playerAnalysis: {},
    squadRecommendation: '',
    isOpen: true,
  },
  reducers: {
    addUserMessage(state, action) {
      state.messages.push({ role: 'user', content: action.payload, ts: new Date().toISOString() })
    },
    clearMessages(state) {
      state.messages = state.messages.slice(0, 1)
    },
    togglePanel(state) { state.isOpen = !state.isOpen },
    setOpen(state, action) { state.isOpen = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAiMessage.pending, (state) => { state.loading = true; state.error = null })
      .addCase(sendAiMessage.fulfilled, (state, action) => {
        state.loading = false
        state.messages.push({ role: 'assistant', content: action.payload, ts: new Date().toISOString() })
      })
      .addCase(sendAiMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.messages.push({ role: 'assistant', content: `⚠️ ${action.payload || 'AI unavailable. Try again.'}`, ts: new Date().toISOString() })
      })
      .addCase(analyzePlayer.fulfilled, (state, action) => {
        state.playerAnalysis[action.payload.playerId] = action.payload.analysis
      })
      .addCase(getSquadRecommendation.fulfilled, (state, action) => {
        state.squadRecommendation = action.payload
      })
  }
})

export const { addUserMessage, clearMessages, togglePanel, setOpen } = aiSlice.actions
export default aiSlice.reducer
