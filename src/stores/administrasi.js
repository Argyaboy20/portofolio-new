import { defineStore } from 'pinia'
import { api } from '../api/http'

// Isi halaman Administrasi: dokumen, berkas, daftar Pengalaman, dan daftar Rekomendasi
export const useAdministrasiStore = defineStore('administrasi', {
  state: () => ({ data: null, galat: '' }),
  actions: {
    async muat(paksa = false) {
      if (this.data && !paksa) return
      this.galat = ''
      try {
        this.data = await api('/api/administrasi', { auth: false })
      } catch (e) {
        this.galat = e.message
      }
    },
  },
})
