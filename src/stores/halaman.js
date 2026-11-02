import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman turunan (itsupport, dst.), disimpan per slug
export const useHalamanStore = defineStore('halaman', {
  state: () => ({ data: {}, galat: {} }),
  actions: {
    async muat(slug, paksa = false) {
      if (this.data[slug] && !paksa) return
      this.galat[slug] = ''
      try {
        this.data[slug] = await api(`/api/halaman/${slug}`, { auth: false })
      } catch (e) {
        this.galat[slug] = e.message
      }
    },
  },
})
