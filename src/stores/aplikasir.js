import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman ApliKasir: header, chip, alat, dan foto galeri
export const useAplikasirStore = defineStore('aplikasir', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/aplikasir', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
