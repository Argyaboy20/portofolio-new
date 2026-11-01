<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useBahasaStore } from '../stores/bahasa'

const props = defineProps({
  // [{ id, gambarUrl, keteranganId, keteranganEn }]
  foto: { type: Array, default: () => [] },
})
const bahasa = useBahasaStore()

const DURASI = 5000 // 5 detik per foto
const LANGKAH = 50 // bar progres diperbarui tiap 50 ms

const akar = ref(null)
const indeks = ref(0)
const persen = ref(0)
const total = computed(() => props.foto.length)
const aktif = computed(() => props.foto[indeks.value] ?? props.foto[0] ?? null)

let progres = 0
let pewaktu = null
let dilihat = false
let pengamat = null

// Muat foto berikutnya lebih dulu supaya pergantian tidak tersendat
function praMuat() {
  if (total.value < 2) return
  const berikut = props.foto[(indeks.value + 1) % total.value]
  if (berikut?.gambarUrl) new Image().src = berikut.gambarUrl
}

function mulai() {
  if (pewaktu || total.value < 2) return
  pewaktu = setInterval(() => {
    progres += LANGKAH
    persen.value = Math.min(100, (progres / DURASI) * 100)
    if (progres >= DURASI) {
      indeks.value = (indeks.value + 1) % total.value
      progres = 0
      persen.value = 0
      praMuat()
    }
  }, LANGKAH)
}

function henti() {
  if (pewaktu) {
    clearInterval(pewaktu)
    pewaktu = null
  }
}

// Berputar hanya saat bagian ini terlihat dan tab sedang aktif
function sinkron() {
  if (dilihat && !document.hidden) mulai()
  else henti()
}

watch(total, () => {
  indeks.value = 0
  progres = 0
  persen.value = 0
  praMuat()
  sinkron()
})

onMounted(() => {
  praMuat()
  document.addEventListener('visibilitychange', sinkron)
  if ('IntersectionObserver' in window && akar.value) {
    pengamat = new IntersectionObserver(
      ([e]) => {
        dilihat = e.isIntersecting
        sinkron()
      },
      { threshold: 0.2 },
    )
    pengamat.observe(akar.value)
  } else {
    dilihat = true
    sinkron()
  }
})

onBeforeUnmount(() => {
  henti()
  pengamat?.disconnect()
  document.removeEventListener('visibilitychange', sinkron)
})
</script>

<template>
  <div ref="akar" class="galeri-berputar">
    <div class="bingkai">
      <Transition name="pudar" mode="out-in">
        <img
          v-if="aktif"
          :key="aktif.id"
          :src="aktif.gambarUrl"
          :alt="bahasa.pilih(aktif.keteranganId, aktif.keteranganEn)"
          class="foto"
        />
      </Transition>
      <div v-if="aktif" class="keterangan">{{ bahasa.pilih(aktif.keteranganId, aktif.keteranganEn) }}</div>
      <div v-if="total > 1" class="progres" aria-hidden="true">
        <div class="batang" :style="{ width: persen + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px): lebar penuh. Tablet ke atas: bingkai potret di tengah. */
.galeri-berputar {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}
.bingkai {
  position: relative;
  height: 500px;
  overflow: hidden;
  background: #1f2937;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}
.foto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.keterangan {
  position: absolute;
  right: 0;
  bottom: 20px;
  left: 0;
  padding: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
}
.progres {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 5px;
  background: rgba(255, 255, 255, 0.3);
}
.batang {
  height: 100%;
  background: linear-gradient(90deg, #4e54c8, #8f94fb);
  transition: width 0.05s linear;
}

.pudar-enter-active,
.pudar-leave-active {
  transition: opacity 0.25s ease;
}
.pudar-enter-from,
.pudar-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .pudar-enter-active,
  .pudar-leave-active,
  .batang {
    transition: none;
  }
}

@media (min-width: 641px) {
  .galeri-berputar {
    max-width: 500px;
  }
  .bingkai {
    height: 800px;
    border-radius: 20px;
  }
  .keterangan {
    bottom: 30px;
    padding: 10px;
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .galeri-berputar {
    max-width: 600px;
  }
  .keterangan {
    padding: 12px;
    font-size: 1.1rem;
  }
}
</style>