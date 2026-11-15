import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman GyaJokPub: judul, logo, alat, ajakan, tautan, dan foto galeri
export const useGyajokpubStore = defineStore('gyajokpub', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/gyajokpub', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
