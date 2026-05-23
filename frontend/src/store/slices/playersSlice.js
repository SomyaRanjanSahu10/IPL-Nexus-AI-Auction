import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchPlayers = createAsyncThunk('players/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString()
    const { data } = await api.get(`/players?${query}`)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const createPlayer = createAsyncThunk('players/create', async (playerData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/players', playerData)
    return data.player
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const updatePlayer = createAsyncThunk('players/update', async ({ id, ...body }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/players/${id}`, body)
    return data.player
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const deletePlayer = createAsyncThunk('players/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/players/${id}`)
    return id
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

const playersSlice = createSlice({
  name: 'players',
  initialState: { list: [], total: 0, loading: false, error: null, filters: { status: '', role: '', search: '' } },
  reducers: {
    setFilter(state, action) { state.filters = { ...state.filters, ...action.payload } },
    markPlayerSold(state, action) {
      const { playerId, teamId, amount } = action.payload
      const p = state.list.find(p => p._id === playerId)
      if (p) { p.auctionStatus = 'sold'; p.soldTo = teamId; p.soldPrice = amount }
    },
    markPlayerUnsold(state, action) {
      const p = state.list.find(p => p._id === action.payload)
      if (p) p.auctionStatus = 'unsold'
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayers.pending, (state) => { state.loading = true })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.players
        state.total = action.payload.total
      })
      .addCase(fetchPlayers.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(createPlayer.fulfilled, (state, action) => { state.list.unshift(action.payload) })
      .addCase(updatePlayer.fulfilled, (state, action) => {
        const idx = state.list.findIndex(p => p._id === action.payload._id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(deletePlayer.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p._id !== action.payload)
      })
  }
})

export const { setFilter, markPlayerSold, markPlayerUnsold } = playersSlice.actions
export default playersSlice.reducer
