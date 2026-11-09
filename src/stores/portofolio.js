import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman Portofolio: header, kecepatan web, alat, dan foto galeri
export const usePortofolioStore = defineStore('portofolio', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/portofolio', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
