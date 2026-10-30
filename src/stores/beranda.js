import { defineStore } from 'pinia'
import { api } from '../api/http'

export const useBerandaStore = defineStore('beranda', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/beranda', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})