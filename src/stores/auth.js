import { defineStore } from 'pinia'
import { api } from '../api/http'

const KUNCI_SESI = 'authSession'

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: '', expiresAt: 0, email: '' }),
  getters: {
    isLoggedIn: (s) => !!s.token && Date.now() < s.expiresAt,
  },
  actions: {
    restoreSession() {
      try {
        const data = JSON.parse(localStorage.getItem(KUNCI_SESI) ?? '{}')
        if (data.token && Date.now() < data.expiresAt) {
          this.token = data.token
          this.expiresAt = data.expiresAt
          this.email = data.email ?? ''
        } else {
          localStorage.removeItem(KUNCI_SESI)
        }
      } catch {
        localStorage.removeItem(KUNCI_SESI)
      }
    },
    async login(email, password, kodeAkses) {
      const data = await api('/api/auth/admin/login', {
        method: 'POST',
        body: { email, password, kodeAkses },
        auth: false,
      })
      this.token = data.token
      this.email = data.admin.email
      this.expiresAt = Date.now() + data.expiresInSeconds * 1000
      localStorage.setItem(
        KUNCI_SESI,
        JSON.stringify({ token: this.token, expiresAt: this.expiresAt, email: this.email }),
      )
    },
    logout() {
      this.token = ''
      this.expiresAt = 0
      this.email = ''
      localStorage.removeItem(KUNCI_SESI)
    },
  },
})