import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getActivePinia } from 'pinia'
import { modeSenyap } from '../api/http'

const JEDA_SIKLUS_MS = 120000 // 2 menit
const SEMBUNYI_MIN_MS = 30000 // tab tersembunyi lebih lama dari ini, lalu kembali: cek langsung
const JEDA_RUTE_MS = 30000 // pindah halaman: cek bila siklus terakhir lebih dari ini

// Memuat ulang isi halaman publik secara senyap dan mendeteksi versi situs yang baru.
// Berlaku untuk semua store yang punya `data`, `galat`, dan `muat(paksa)`; store halaman
// proyek berikutnya otomatis ikut tanpa perubahan di sini.
export function usePembaruanOtomatis() {
  const route = useRoute()
  const versiBaru = ref(false)
  let ditutup = false
  let timer = null
  let sibuk = false
  let terakhir = Date.now()
  let sembunyiSejak = 0

  async function cekVersi() {
    if (import.meta.env.DEV || ditutup) return
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' })
      if (!res.ok) return
      const d = await res.json()
      if (d?.id && d.id !== import.meta.env.VITE_BUILD_ID) versiBaru.value = true
    } catch {
      // gagal jaringan atau bukan JSON: abaikan, dicoba lagi di siklus berikutnya
    }
  }

  // Bila isi sama, objek lama dipertahankan agar tidak ada render ulang
  async function segarkanStore(store) {
    const lama = store.data
    const json = JSON.stringify(lama)
    await store.muat(true)
    if (store.data && JSON.stringify(store.data) === json) store.data = lama
    store.galat = ''
  }

  // Store halaman: data dan galat disimpan per slug, muat(slug, paksa)
  async function segarkanHalaman(store) {
    await Promise.all(
      Object.keys(store.data).map(async (slug) => {
        const lama = store.data[slug]
        const json = JSON.stringify(lama)
        await store.muat(slug, true)
        if (store.data[slug] && JSON.stringify(store.data[slug]) === json) store.data[slug] = lama
        store.galat[slug] = ''
      }),
    )
  }

  async function segarkanData() {
    if (route.path.startsWith('/admin') || route.name === 'loginadmin') return
    const pinia = getActivePinia()
    if (!pinia) return
    const tugas = []
    // api() membaca penanda ini saat dipanggil, jadi cukup aktif selama tugas dimulai
    modeSenyap.aktif = true
    try {
      for (const store of pinia._s.values()) {
        if (typeof store.muat !== 'function') continue
        if (store.$id === 'halaman') {
          if (Object.keys(store.data).length) tugas.push(segarkanHalaman(store))
        } else if (store.data && 'galat' in store) {
          tugas.push(segarkanStore(store))
        }
      }
    } finally {
      modeSenyap.aktif = false
    }
    await Promise.allSettled(tugas)
  }

  async function siklus(minJeda) {
    if (sibuk || Date.now() - terakhir < minJeda) return
    sibuk = true
    terakhir = Date.now()
    try {
      await Promise.all([cekVersi(), segarkanData()])
    } finally {
      sibuk = false
    }
  }

  function saatVisibilitas() {
    if (document.visibilityState === 'hidden') {
      sembunyiSejak = Date.now()
      return
    }
    if (sembunyiSejak && Date.now() - sembunyiSejak > SEMBUNYI_MIN_MS) siklus(0)
    sembunyiSejak = 0
  }

  function tutupBanner() {
    ditutup = true
    versiBaru.value = false
  }

  watch(
    () => route.path,
    () => siklus(JEDA_RUTE_MS),
  )

  onMounted(() => {
    timer = setInterval(() => {
      if (document.visibilityState === 'visible') siklus(0)
    }, JEDA_SIKLUS_MS)
    document.addEventListener('visibilitychange', saatVisibilitas)
  })
  onBeforeUnmount(() => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', saatVisibilitas)
  })

  return { versiBaru, tutupBanner }
}
