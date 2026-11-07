import { defineStore } from 'pinia'
import { api } from '../api/http'

// Foto galeri kehidupan (dua tab) dan lagu opsional
export const useGaleriKehidupanStore = defineStore('galeriKehidupan', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/galeri-kehidupan', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
