import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman SocialVit: header, teknologi, tim, dan foto galeri
export const useSocialvitStore = defineStore('socialvit', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/socialvit', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
