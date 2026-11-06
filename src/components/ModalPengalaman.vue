<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, X } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'
import PenampilFoto from './PenampilFoto.vue'

const props = defineProps({ item: { type: Object, default: null } })
const emit = defineEmits(['tutup'])
const bahasa = useBahasaStore()

const p = (id, en) => bahasa.pilih(id, en)
const baris = (s) =>
  (s ?? '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)

const trek = ref(null)
const tombolTutup = ref(null)
const indeks = ref(0)
const fotoBuka = ref(null) // alamat foto yang sedang dibuka di penampil zoom

let fokusSebelumnya = null
let pasang = false

const tutup = () => emit('tutup')

function saatTombol(e) {
  // Penampil foto memakai Esc untuk dirinya sendiri; modal tetap terbuka
  if (e.key === 'Escape' && !fotoBuka.value) tutup()
}

function saatGulir() {
  const el = trek.value
  if (!el || !el.clientWidth) return
  indeks.value = Math.round(el.scrollLeft / el.clientWidth)
}

function geser(arah) {
  const el = trek.value
  if (!el || !props.item) return
  const tujuan = Math.min(props.item.gambar.length - 1, Math.max(0, indeks.value + arah))
  el.scrollTo({ left: tujuan * el.clientWidth, behavior: 'smooth' })
}

function keFoto(i) {
  const el = trek.value
  if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
}

// Kunci gulir hanya pada html (bukan body), supaya elemen sticky tidak lepas
function kunci(nilai) {
  document.documentElement.style.overflow = nilai ? 'hidden' : ''
}

watch(
  () => props.item,
  async (baru) => {
    if (baru) {
      fokusSebelumnya = document.activeElement
      indeks.value = 0
      fotoBuka.value = null
      kunci(true)
      if (!pasang) {
        window.addEventListener('keydown', saatTombol)
        pasang = true
      }
      await nextTick()
      if (trek.value) trek.value.scrollLeft = 0
      tombolTutup.value?.focus()
    } else {
      kunci(false)
      if (pasang) {
        window.removeEventListener('keydown', saatTombol)
        pasang = false
      }
      fokusSebelumnya?.focus?.()
      fokusSebelumnya = null
    }
  },
)

onBeforeUnmount(() => {
  if (pasang) window.removeEventListener('keydown', saatTombol)
  if (props.item) kunci(false)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="item" class="tabir" @click.self="tutup">
      <div
        class="lembar"
        role="dialog"
        aria-modal="true"
        :aria-label="p(item.judulId, item.judulEn)"
      >
        <header class="kepala">
          <h2 class="judul">{{ p(item.judulId, item.judulEn) }}</h2>
          <button
            ref="tombolTutup"
            type="button"
            class="tutup"
            :aria-label="p('Tutup', 'Close')"
            @click="tutup"
          >
            <X :size="22" aria-hidden="true" />
          </button>
        </header>

        <div class="badan">
          <div v-if="item.gambar.length" class="slider">
            <div ref="trek" class="trek" @scroll.passive="saatGulir">
              <button
                v-for="(g, i) in item.gambar"
                :key="g"
                type="button"
                class="slide"
                :aria-label="p('Buka foto ', 'Open photo ') + (i + 1)"
                @click="fotoBuka = g"
              >
                <img
                  :src="g"
                  :alt="p(item.proyekId, item.proyekEn)"
                  draggable="false"
                  loading="lazy"
                />
              </button>
            </div>
            <template v-if="item.gambar.length > 1">
              <button
                type="button"
                class="panah kiri"
                :aria-label="p('Foto sebelumnya', 'Previous photo')"
                :disabled="indeks === 0"
                @click="geser(-1)"
              >
                <ChevronLeft :size="22" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="panah kanan"
                :aria-label="p('Foto berikutnya', 'Next photo')"
                :disabled="indeks === item.gambar.length - 1"
                @click="geser(1)"
              >
                <ChevronRight :size="22" aria-hidden="true" />
              </button>
              <div class="titik-baris">
                <button
                  v-for="(g, i) in item.gambar"
                  :key="g"
                  type="button"
                  class="titik"
                  :class="{ aktif: i === indeks }"
                  :aria-label="p('Ke foto ', 'Go to photo ') + (i + 1)"
                  @click="keFoto(i)"
                ></button>
              </div>
              <span class="hitung">{{ indeks + 1 }} / {{ item.gambar.length }}</span>
            </template>
          </div>

          <div class="detail">
            <h3 class="proyek">{{ p(item.proyekId, item.proyekEn) }}</h3>
            <p class="meta">{{ item.perusahaan }} | {{ p(item.periodeId, item.periodeEn) }}</p>
            <p class="pembuka">{{ p(item.pembukaId, item.pembukaEn) }}</p>

            <h4 class="sub">{{ p(item.daftarJudulId, item.daftarJudulEn) }}</h4>
            <ul class="daftar">
              <li v-for="(b, i) in baris(p(item.daftarId, item.daftarEn))" :key="i">{{ b }}</li>
            </ul>

            <template v-if="item.teknologi.length">
              <h4 class="sub">{{ p('Teknologi yang Digunakan', 'Technologies Used') }}</h4>
              <div class="chip-baris">
                <span v-for="(tk, i) in item.teknologi" :key="i" class="chip">{{ tk }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <PenampilFoto
      :src="fotoBuka"
      :alt="p(item?.proyekId ?? '', item?.proyekEn ?? '')"
      @tutup="fotoBuka = null"
    />
  </Teleport>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px): lembar naik dari bawah. Tablet ke atas: kartu di tengah layar. */
.tabir {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  overscroll-behavior: contain;
  animation: pudar 0.2s ease-out;
}
.lembar {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 92vh;
  overflow: hidden;
  color: #fff;
  background: #141e30;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.4);
  animation: naik 0.3s ease-out;
}
.kepala {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #141e30, #243b55);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.judul {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.35;
}
.tutup {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.12);
  border: 0;
  border-radius: 50%;
}
.tutup:hover {
  background: rgba(255, 255, 255, 0.22);
}
.badan {
  padding: 1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* --- Slider foto --- */
.slider {
  position: relative;
  margin-bottom: 1rem;
  overflow: hidden;
  background: #0b1220;
  border-radius: 10px;
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
  display: grid;
  flex: 0 0 100%;
  place-items: center;
  height: 220px;
  padding: 0;
  cursor: zoom-in;
  background: transparent;
  border: 0;
  scroll-snap-align: center;
}
.slide img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
}
.panah {
  position: absolute;
  top: 50%;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  transform: translateY(-50%);
}
.panah:disabled {
  opacity: 0.3;
  cursor: default;
}
.panah.kiri {
  left: 8px;
}
.panah.kanan {
  right: 8px;
}
.titik-baris {
  position: absolute;
  right: 0;
  bottom: 8px;
  left: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  pointer-events: none;
}
.titik {
  width: 8px;
  height: 8px;
  padding: 0;
  cursor: pointer;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.45);
  border: 0;
  border-radius: 50%;
}
.titik.aktif {
  background: #00c6ff;
}
.hitung {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 0.15rem 0.55rem;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 999px;
}

/* --- Detail --- */
.proyek {
  margin: 0 0 0.3rem;
  font-size: 1.15rem;
  font-weight: 700;
}
.meta {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}
.pembuka {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}
.sub {
  margin: 1.25rem 0 0.6rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #00c6ff;
}
.daftar {
  padding-left: 1.2rem;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}
.daftar li {
  margin-bottom: 0.4rem;
}
.chip-baris {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.chip {
  padding: 0.25rem 0.7rem;
  font-size: 0.78rem;
  color: #4a90e2;
  border: 1px solid #4a90e2;
  border-radius: 999px;
}

@keyframes pudar {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes naik {
  from {
    transform: translateY(40px);
  }
  to {
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tabir,
  .lembar {
    animation: none;
  }
}

@media (min-width: 641px) {
  .tabir {
    align-items: center;
  }
  .lembar {
    width: 90%;
    max-width: 760px;
    max-height: 90vh;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  }
  .kepala {
    padding: 0.9rem 1.25rem;
  }
  .judul {
    font-size: 1.1rem;
  }
  .badan {
    padding: 1.25rem;
  }
  .slide {
    height: 320px;
  }
}

@media (min-width: 768px) {
  .slide {
    height: 380px;
  }
  .proyek {
    font-size: 1.3rem;
  }
  .pembuka,
  .daftar {
    font-size: 0.95rem;
  }
}

@media (min-width: 1024px) {
  .lembar {
    max-width: 860px;
  }
  .slide {
    height: 420px;
  }
}
</style>
