import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman Bimbel Raya: judul, logo, alat, ajakan, tautan, dan foto galeri
export const useBimbelrayaStore = defineStore('bimbelraya', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/bimbelraya', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
