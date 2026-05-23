import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchActiveAuction = createAsyncThunk('auction/fetchActive', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auction/active')
    return data.auction
  } catch (err) {
    return rejectWithValue(err.response?.data?.error)
  }
})

export const placeBid = createAsyncThunk('auction/placeBid', async (bidData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/bids', bidData)
    return data.bid
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Bid failed')
  }
})

export const markSold = createAsyncThunk('auction/markSold', async ({ auctionId, ...body }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/auction/${auctionId}/sold`, body)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const markUnsold = createAsyncThunk('auction/markUnsold', async ({ auctionId, playerId }, { rejectWithValue }) => {
  try {
    await api.post(`/auction/${auctionId}/unsold`, { playerId })
    return playerId
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const nextPlayer = createAsyncThunk('auction/nextPlayer', async (auctionId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/auction/${auctionId}/next-player`)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const pauseAuction = createAsyncThunk('auction/pause', async (id, { rejectWithValue }) => {
  try {
    await api.post(`/auction/${id}/pause`)
    return id
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const resumeAuction = createAsyncThunk('auction/resume', async (id, { rejectWithValue }) => {
  try {
    await api.post(`/auction/${id}/resume`)
    return id
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

const auctionSlice = createSlice({
  name: 'auction',
  initialState: {
    data: null,
    currentPlayer: null,
    currentBid: { amount: 0, team: null },
    bidLog: [],
    status: 'idle',
    timer: 10,
    loading: false,
    bidLoading: false,
    error: null,
    lastSold: null,
    commentary: '',
  },
  reducers: {
    setAuction(state, action) { state.data = action.payload },
    setCurrentPlayer(state, action) {
      state.currentPlayer = action.payload.player
      state.currentBid = { amount: action.payload.basePrice, team: null }
      state.bidLog = []
      state.timer = 10
      state.lastSold = null
    },
    updateBid(state, action) {
      state.currentBid = action.payload.currentBid
      state.bidLog.unshift({ ...action.payload.bid, ts: new Date().toISOString() })
    },
    setTimer(state, action) {
      // If called with null (from interval tick), decrement
      if (action.payload === null) {
        state.timer = Math.max(0, state.timer - 1)
      } else {
        state.timer = action.payload
      }
    },
    setStatus(state, action) { state.status = action.payload },
    setLastSold(state, action) { state.lastSold = action.payload },
    setCommentary(state, action) { state.commentary = action.payload },
    clearError(state) { state.error = null },
    resetTimer(state) { state.timer = 10 },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveAuction.fulfilled, (state, action) => {
        if (action.payload) {
          state.data = action.payload
          state.status = action.payload.status || 'idle'
          state.currentPlayer = action.payload.currentPlayer || null
          state.currentBid = action.payload.currentBid || { amount: 0, team: null }
        } else {
          state.status = 'idle'
        }
      })
      .addCase(placeBid.pending, (state) => { state.bidLoading = true; state.error = null })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.bidLoading = false
        if (action.payload) {
          state.currentBid = {
            amount: action.payload.amount,
            team: action.payload.team,
            bidder: action.payload.bidder,
          }
          state.bidLog.unshift({ ...action.payload, ts: new Date().toISOString() })
        }
      })
      .addCase(placeBid.rejected, (state, action) => { state.bidLoading = false; state.error = action.payload })
      .addCase(markSold.pending, (state) => { state.error = null })
      .addCase(markSold.fulfilled, (state, action) => {
        state.lastSold = {
          player: action.payload?.player,
          team: action.payload?.team,
          amount: action.payload?.player?.soldPrice,
        }
      })
      .addCase(markSold.rejected, (state, action) => { state.error = action.payload })
      .addCase(markUnsold.rejected, (state, action) => { state.error = action.payload })
      .addCase(nextPlayer.fulfilled, (state, action) => {
        if (action.payload?.completed) {
          state.status = 'completed'
          state.currentPlayer = null
          state.currentBid = { amount: 0, team: null }
        } else if (action.payload?.player) {
          state.currentPlayer = action.payload.player
          state.currentBid = {
            amount: action.payload.player.basePrice,
            team: null,
            bidder: null,
          }
          state.bidLog = []
          state.lastSold = null
          state.timer = 10
        }
      })
      .addCase(nextPlayer.rejected, (state, action) => { state.error = action.payload })
      .addCase(pauseAuction.fulfilled, (state) => { state.status = 'paused' })
      .addCase(resumeAuction.fulfilled, (state) => { state.status = 'active' })
  }
})

export const {
  setAuction, setCurrentPlayer, updateBid, setTimer, resetTimer,
  setStatus, setLastSold, setCommentary, clearError
} = auctionSlice.actions

export default auctionSlice.reducer
