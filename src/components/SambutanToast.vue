<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Languages, Sparkles, X } from '@lucide/vue'

// Pasangan Indonesia dan Inggris. Tambah baris di sini untuk pesan baru.
const PESAN = [
  { id: 'Hai! Selamat datang di website pribadiku.', en: 'Hi! Welcome to my personal website.' },
  { id: 'Halo! Senang kamu mampir ke sini.', en: 'Hello! Glad you stopped by.' },
  {
    id: 'Yuhuu, selamat datang! Semoga betah ya.',
    en: 'Yoohoo, welcome! Hope you enjoy your stay.',
  },
  { id: 'Hei, makasih sudah berkunjung!', en: 'Hey, thanks for visiting!' },
  {
    id: 'Selamat datang! Jangan sungkan buat menjelajah ya.',
    en: 'Welcome! Feel free to explore.',
  },
]

const KUNCI = 'sambutan-tampil'
const DURASI = 7000
const route = useRoute()
const tampil = ref(false)
const inggris = ref(false)
const pesan = ref(PESAN[0])
let timer = null

function sudahTampil() {
  try {
    return sessionStorage.getItem(KUNCI) === '1'
  } catch {
    return false
  }
}
function tandai() {
  try {
    sessionStorage.setItem(KUNCI, '1')
  } catch {
    /* tanpa penyimpanan sesi, notifikasi bisa muncul lagi; tidak berbahaya */
  }
}

function mulaiTimer() {
  clearTimeout(timer)
  timer = setTimeout(tutup, DURASI)
}

function tutup() {
  tampil.value = false
  clearTimeout(timer)
}

function terjemahkan() {
  inggris.value = true
  mulaiTimer() // beri waktu baca ulang
}

// route.name (bukan path): sebelum rute pertama selesai dimuat, path-nya masih '/'
watch(
  () => route.name,
  (nama) => {
    if (nama !== 'beranda') {
      tutup()
      return
    }
    if (sudahTampil()) return
    tandai()
    pesan.value = PESAN[Math.floor(Math.random() * PESAN.length)]
    inggris.value = false
    tampil.value = true
    mulaiTimer()
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Transition name="turun">
    <div v-if="tampil" class="toast" role="status" aria-live="polite">
      <span class="ikon"><Sparkles :size="18" aria-hidden="true" /></span>
      <div class="isi">
        <p class="teks" :lang="inggris ? 'en' : 'id'">{{ inggris ? pesan.en : pesan.id }}</p>
        <button v-if="!inggris" type="button" class="terjemah" @click="terjemahkan">
          <Languages :size="14" aria-hidden="true" />
          Translate to English
        </button>
      </div>
      <button type="button" class="tutup" aria-label="Tutup" @click="tutup">
        <X :size="16" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px ke atas. */
.toast {
  position: fixed;
  top: 12px;
  left: 50%;
  z-index: 1500;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  width: min(92vw, 420px);
  padding: 0.85rem 0.9rem;
  color: #fff;
  background: rgba(31, 45, 61, 0.94);
  border: 1px solid rgba(80, 227, 194, 0.45);
  border-radius: 14px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  transform: translateX(-50%);
}
.ikon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 34px;
  height: 34px;
  color: #0b0b0b;
  background: linear-gradient(135deg, #4a90e2, #50e3c2);
  border-radius: 50%;
}
.isi {
  flex: 1;
  min-width: 0;
}
.teks {
  margin: 0.15rem 0 0;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.45;
}
.terjemah {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  padding: 0.28rem 0.7rem;
  margin-top: 0.55rem;
  font: inherit;
  font-size: 0.74rem;
  font-weight: 600;
  color: #50e3c2;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(80, 227, 194, 0.55);
  border-radius: 999px;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}
.terjemah:hover {
  color: #0b0b0b;
  background: #50e3c2;
}
.tutup {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.12);
  border: 0;
  border-radius: 50%;
}
.tutup:hover {
  background: rgba(255, 255, 255, 0.24);
}

/* Turun dari atas dengan halus, naik lagi saat hilang */
.turun-enter-active {
  transition:
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.5s ease;
}
.turun-leave-active {
  transition:
    transform 0.45s cubic-bezier(0.55, 0, 0.8, 0.4),
    opacity 0.35s ease;
}
.turun-enter-from,
.turun-leave-to {
  opacity: 0;
  transform: translate(-50%, -140%);
}

@media (prefers-reduced-motion: reduce) {
  .turun-enter-active,
  .turun-leave-active {
    transition: opacity 0.3s ease;
  }
  .turun-enter-from,
  .turun-leave-to {
    transform: translateX(-50%);
  }
  .terjemah {
    transition: none;
  }
}

@media (min-width: 641px) {
  .toast {
    top: 20px;
    padding: 1rem 1.1rem;
  }
  .teks {
    font-size: 1rem;
  }
  .terjemah {
    font-size: 0.78rem;
  }
}
</style>
