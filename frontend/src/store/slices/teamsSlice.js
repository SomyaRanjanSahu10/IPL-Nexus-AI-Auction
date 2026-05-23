import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchTeams = createAsyncThunk('teams/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/teams')
    return data.teams
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

// Ensure every team always has a safe players array and numeric fields
const normaliseTeam = (team) => ({
  ...team,
  players: Array.isArray(team.players) ? team.players : [],
  overseasCount: team.overseasCount || 0,
  purseRemaining: team.purseRemaining ?? 100,
  purseTotal: team.purseTotal || 100,
  stats: {
    totalSpent: 0,
    battersCount: 0,
    bowlersCount: 0,
    allRoundersCount: 0,
    wicketKeepersCount: 0,
    ...(team.stats || {}),
  },
})

const teamsSlice = createSlice({
  name: 'teams',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    updateTeamPurse(state, action) {
      const { teamId, purse } = action.payload
      const t = state.list.find(t => String(t._id) === String(teamId))
      if (t) t.purseRemaining = purse
    },
    addPlayerToTeam(state, action) {
      const { teamId, player } = action.payload
      const t = state.list.find(t => String(t._id) === String(teamId))
      if (t) {
        if (!Array.isArray(t.players)) t.players = []
        const alreadyIn = t.players.find(p => String(p._id) === String(player._id))
        if (!alreadyIn) {
          t.players = [...t.players, player]
          if (player.isOverseas) t.overseasCount = (t.overseasCount || 0) + 1
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => { state.loading = true })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false
        state.list = (action.payload || []).map(normaliseTeam)
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { updateTeamPurse, addPlayerToTeam } = teamsSlice.actions
export default teamsSlice.reducer
