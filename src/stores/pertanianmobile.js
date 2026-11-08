import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman Pertanian Mobile: judul, alat, ajakan, tautan, dan foto galeri
export const usePertanianmobileStore = defineStore('pertanianmobile', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/pertanianmobile', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
