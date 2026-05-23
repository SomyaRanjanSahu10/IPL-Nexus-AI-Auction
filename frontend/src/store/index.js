import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import auctionReducer from './slices/auctionSlice'
import teamsReducer from './slices/teamsSlice'
import playersReducer from './slices/playersSlice'
import aiReducer from './slices/aiSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    auction: auctionReducer,
    teams: teamsReducer,
    players: playersReducer,
    ai: aiReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})
