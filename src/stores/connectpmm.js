import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman PMM Connect: judul, alat, ajakan, tautan, dan foto galeri
export const useConnectpmmStore = defineStore('connectpmm', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/connectpmm', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
