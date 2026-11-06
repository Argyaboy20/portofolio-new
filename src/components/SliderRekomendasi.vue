<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronLeft, ChevronRight, Star, User } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'

const props = defineProps({ daftar: { type: Array, required: true } })
const bahasa = useBahasaStore()

const trek = ref(null)
const indeks = ref(0)
const BINTANG = [1, 2, 3, 4, 5]
const JEDA_PUTAR_MS = 6000

let timer = null
let jeda = false
let jedaSentuh = null

function saatGulir() {
  const el = trek.value
  if (!el || !el.clientWidth) return
  indeks.value = Math.round(el.scrollLeft / el.clientWidth)
}

function ke(i) {
  const el = trek.value
  if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
}

function geser(arah) {
  ke(Math.min(props.daftar.length - 1, Math.max(0, indeks.value + arah)))
}

function putar() {
  if (jeda || document.hidden || props.daftar.length < 2) return
  ke((indeks.value + 1) % props.daftar.length)
}

function sentuhMulai() {
  jeda = true
  clearTimeout(jedaSentuh)
}
function sentuhSelesai() {
  clearTimeout(jedaSentuh)
  jedaSentuh = setTimeout(() => (jeda = false), 4000)
}

// Setelah ukuran layar berubah, posisi gulir dikembalikan ke kartu yang sedang tampil
function saatUbahUkuran() {
  const el = trek.value
  if (el) el.scrollLeft = indeks.value * el.clientWidth
}

onMounted(() => {
  const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!kurangiGerak && props.daftar.length > 1) timer = setInterval(putar, JEDA_PUTAR_MS)
  window.addEventListener('resize', saatUbahUkuran, { passive: true })
})
onBeforeUnmount(() => {
  clearInterval(timer)
  clearTimeout(jedaSentuh)
  window.removeEventListener('resize', saatUbahUkuran)
})
</script>

<template>
  <div
    class="slider"
    @mouseenter="jeda = true"
    @mouseleave="jeda = false"
    @focusin="jeda = true"
    @focusout="jeda = false"
    @touchstart.passive="sentuhMulai"
    @touchend.passive="sentuhSelesai"
  >
    <div ref="trek" class="trek" @scroll.passive="saatGulir">
      <article v-for="r in daftar" :key="r.id" class="slide">
        <a
          :href="r.link"
          target="_blank"
          rel="noopener noreferrer"
          class="kartu-rek"
          :aria-label="bahasa.pilih('Rekomendasi dari ', 'Recommendation from ') + r.nama"
        >
          <div class="foto">
            <img v-if="r.fotoUrl" :src="r.fotoUrl" :alt="r.nama" draggable="false" loading="lazy" />
            <User v-else :size="30" aria-hidden="true" />
          </div>
          <h3 class="nama">{{ r.nama }}</h3>
          <h4 class="jabatan">{{ r.jabatan }}</h4>
          <p class="teks">{{ bahasa.pilih(r.teksId, r.teksEn) }}</p>
          <div class="bintang" aria-hidden="true">
            <Star v-for="b in BINTANG" :key="b" :size="16" fill="currentColor" />
          </div>
        </a>
      </article>
    </div>

    <template v-if="daftar.length > 1">
      <button
        type="button"
        class="panah kiri"
        :aria-label="bahasa.pilih('Sebelumnya', 'Previous')"
        :disabled="indeks === 0"
        @click="geser(-1)"
      >
        <ChevronLeft :size="22" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="panah kanan"
        :aria-label="bahasa.pilih('Berikutnya', 'Next')"
        :disabled="indeks === daftar.length - 1"
        @click="geser(1)"
      >
        <ChevronRight :size="22" aria-hidden="true" />
      </button>
      <div class="titik-baris">
        <button
          v-for="(r, i) in daftar"
          :key="r.id"
          type="button"
          class="titik"
          :class="{ aktif: i === indeks }"
          :aria-label="bahasa.pilih('Ke rekomendasi ', 'Go to recommendation ') + (i + 1)"
          @click="ke(i)"
        ></button>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop. */
.slider {
  position: relative;
  padding-bottom: 2.25rem;
}
.trek {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.trek::-webkit-scrollbar {
  display: none;
}
.slide {
  flex: 0 0 100%;
  min-width: 0;
  scroll-snap-align: center;
}
.kartu-rek {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 0.25rem 2.25rem 0.5rem;
  color: inherit;
  text-align: center;
  text-decoration: none;
}
.foto {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 60px;
  height: 60px;
  margin-bottom: 0.7rem;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.7);
  background: #243b55;
  border: 3px solid #00c6ff;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(0, 198, 255, 0.4);
}
.foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.nama {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}
.jabatan {
  margin: 0 0 0.7rem;
  font-size: 0.78rem;
  font-weight: 500;
  color: #00c6ff;
}
.teks {
  margin: 0 0 0.9rem;
  font-size: 0.8rem;
  font-style: italic;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
}
.bintang {
  display: flex;
  gap: 2px;
  margin-top: auto;
  color: #ffd700;
}

.panah {
  position: absolute;
  top: calc(50% - 1.1rem);
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  transform: translateY(-50%);
}
.panah:hover:not(:disabled) {
  background: rgba(0, 198, 255, 0.35);
}
.panah:disabled {
  opacity: 0.25;
  cursor: default;
}
.panah.kiri {
  left: 0;
}
.panah.kanan {
  right: 0;
}
.titik-baris {
  position: absolute;
  right: 0;
  bottom: 0.5rem;
  left: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.titik {
  width: 9px;
  height: 9px;
  padding: 0;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  border: 0;
  border-radius: 50%;
}
.titik.aktif {
  background: #00c6ff;
}

@media (min-width: 641px) {
  .slider {
    padding-bottom: 2.5rem;
  }
  .kartu-rek {
    padding: 0.5rem 3.25rem 0.5rem;
  }
  .foto {
    width: 80px;
    height: 80px;
    margin-bottom: 0.9rem;
  }
  .nama {
    font-size: 1.15rem;
  }
  .jabatan {
    font-size: 0.9rem;
  }
  .teks {
    font-size: 0.95rem;
    line-height: 1.6;
  }
  .panah {
    width: 38px;
    height: 38px;
  }
}

@media (min-width: 768px) {
  .kartu-rek {
    max-width: 820px;
    margin: 0 auto;
  }
  .teks {
    font-size: 1rem;
  }
}
</style>
