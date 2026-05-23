import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
    modal: null,
    sidebarOpen: true,
    theme: 'dark',
    confetti: false,
    bidFlashes: [],
  },
  reducers: {
    addToast(state, action) {
      const toast = {
        id: Date.now(),
        type: 'info',
        duration: 3000,
        ...action.payload,
      }
      state.toasts.push(toast)
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter(t => t.id !== action.payload)
    },
    openModal(state, action) { state.modal = action.payload },
    closeModal(state) { state.modal = null },
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen },
    triggerConfetti(state) {
      state.confetti = true
      setTimeout(() => {}, 3000)
    },
    stopConfetti(state) { state.confetti = false },
    addBidFlash(state, action) {
      state.bidFlashes.push({ id: Date.now(), ...action.payload })
    },
    clearBidFlash(state, action) {
      state.bidFlashes = state.bidFlashes.filter(f => f.id !== action.payload)
    },
  }
})

export const {
  addToast, removeToast, openModal, closeModal,
  toggleSidebar, triggerConfetti, stopConfetti, addBidFlash, clearBidFlash
} = uiSlice.actions

export default uiSlice.reducer
