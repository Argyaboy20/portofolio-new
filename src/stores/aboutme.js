import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman Tentang Saya: judul, sapaan, paragraf, dan foto profil
export const useAboutmeStore = defineStore('aboutme', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/aboutme', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
