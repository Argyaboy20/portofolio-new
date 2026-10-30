import { defineStore } from 'pinia'
import { api } from '../api/http'

export const useBiodataStore = defineStore('biodata', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/biodata', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})