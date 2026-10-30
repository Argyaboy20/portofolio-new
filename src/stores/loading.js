import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({ jumlah: 0, pesan: '' }),
  getters: {
    tampil: (s) => s.jumlah > 0,
  },
  actions: {
    mulai(pesan) {
      this.jumlah++
      this.pesan = pesan
    },
    selesai() {
      if (this.jumlah > 0) this.jumlah--
    },
  },
})