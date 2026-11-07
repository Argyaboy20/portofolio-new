import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman Locana: header, alat, ajakan, tautan, dan galeri fitur
export const useLocanaStore = defineStore('locana', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/locana', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
