import { defineStore } from 'pinia'
import { api } from '../api/http'

// Pengalaman relawan beserta foto galerinya
export const useRelawanStore = defineStore('relawan', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/relawan', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
