import { defineStore } from 'pinia'

const KUNCI = 'bahasa'

function awal() {
  try {
    const v = localStorage.getItem(KUNCI)
    if (v === 'id' || v === 'en') return v
  } catch {
    // penyimpanan diblokir; pakai bawaan
  }
  return 'id'
}

export const useBahasaStore = defineStore('bahasa', {
  state: () => ({ kode: awal() }),
  getters: {
    // Label tombol: menampilkan bahasa TUJUAN
    label: (s) => (s.kode === 'id' ? 'EN' : 'ID'),
    // pilih(id, en): kembalikan teks sesuai bahasa; jatuh ke Indonesia bila Inggris kosong
    pilih: (s) => (id, en) => (s.kode === 'en' && en ? en : id),
  },
  actions: {
    atur(kode) {
      this.kode = kode === 'en' ? 'en' : 'id'
      document.documentElement.lang = this.kode
      try {
        localStorage.setItem(KUNCI, this.kode)
      } catch {
        // abaikan
      }
    },
    tukar() {
      this.atur(this.kode === 'id' ? 'en' : 'id')
    },
  },
})