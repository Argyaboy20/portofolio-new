<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, X } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'
import PenampilFoto from './PenampilFoto.vue'

const props = defineProps({ item: { type: Object, default: null } })
const emit = defineEmits(['tutup'])
const bahasa = useBahasaStore()

const p = (id, en) => bahasa.pilih(id, en)

const trek = ref(null)
const tombolTutup = ref(null)
const indeks = ref(0)
const fotoBuka = ref(null) // { src, alt } untuk penampil zoom

let fokusSebelumnya = null
let pasang = false

const tutup = () => emit('tutup')

function saatTombol(e) {
  // Penampil foto memakai Esc untuk dirinya sendiri; galeri tetap terbuka
  if (e.key === 'Escape' && !fotoBuka.value) tutup()
}

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
  if (!props.item) return
  ke(Math.min(props.item.foto.length - 1, Math.max(0, indeks.value + arah)))
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
        class="kartu"
        role="dialog"
        aria-modal="true"
        :aria-label="p('Galeri Foto', 'Photo Gallery')"
      >
        <header class="kepala">
          <h2 class="judul">{{ p('Galeri Foto', 'Photo Gallery') }}</h2>
          <button
            ref="tombolTutup"
            type="button"
            class="tutup"
            :aria-label="p('Tutup', 'Close')"
            @click="tutup"
          >
            <X :size="20" aria-hidden="true" />
          </button>
        </header>

        <div class="badan">
          <div ref="trek" class="trek" @scroll.passive="saatGulir">
            <figure v-for="(f, i) in item.foto" :key="f.id" class="slide">
              <button
                type="button"
                class="foto"
                :aria-label="p('Buka foto ', 'Open photo ') + (i + 1)"
                @click="fotoBuka = { src: f.gambarUrl, alt: p(f.keteranganId, f.keteranganEn) }"
              >
                <img
                  :src="f.gambarUrl"
                  :alt="p(f.keteranganId, f.keteranganEn)"
                  draggable="false"
                  loading="lazy"
                />
              </button>
              <figcaption class="keterangan">{{ p(f.keteranganId, f.keteranganEn) }}</figcaption>
            </figure>
          </div>

          <template v-if="item.foto.length > 1">
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
              :disabled="indeks === item.foto.length - 1"
              @click="geser(1)"
            >
              <ChevronRight :size="22" aria-hidden="true" />
            </button>
            <div class="titik-baris">
              <button
                v-for="(f, i) in item.foto"
                :key="f.id"
                type="button"
                class="titik"
                :class="{ aktif: i === indeks }"
                :aria-label="p('Ke foto ', 'Go to photo ') + (i + 1)"
                @click="ke(i)"
              ></button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <PenampilFoto
      :src="fotoBuka?.src ?? null"
      :alt="fotoBuka?.alt ?? ''"
      @tutup="fotoBuka = null"
    />
  </Teleport>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px): layar penuh, panah disembunyikan (cukup geser).
   Tablet ke atas: kartu di tengah layar dengan panah bulat. */
.tabir {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  overscroll-behavior: contain;
  animation: pudar 0.2s ease-out;
}
.kartu {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #fff;
  background: #0a0b12;
  background-image: radial-gradient(circle at 50% 0%, #1c1f3a 0%, #0a0b12 65%);
}
.kepala {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.6rem 0.5rem 1rem;
  min-height: 56px;
  background: rgba(10, 11, 18, 0.92);
}
.judul {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
.tutup {
  display: grid;
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
  background: rgba(255, 255, 255, 0.24);
}
.badan {
  position: relative;
  flex: 1;
  min-height: 0;
}
.trek {
  display: flex;
  height: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.trek::-webkit-scrollbar {
  display: none;
}
.slide {
  display: flex;
  flex: 0 0 100%;
  flex-direction: column;
  align-items: center;
  height: 100%;
  min-height: 0;
  padding: 12px 12px 44px;
  margin: 0;
  scroll-snap-align: center;
}
.foto {
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: 0;
  cursor: zoom-in;
  background: transparent;
  border: 0;
}
.foto img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.45));
  user-select: none;
}
.keterangan {
  flex-shrink: 0;
  max-width: 100%;
  padding: 8px 14px;
  margin-top: 12px;
  font-size: 0.8rem;
  line-height: 1.45;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}
.panah {
  position: absolute;
  top: 50%;
  display: none;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translateY(-50%);
  backdrop-filter: blur(8px);
}
.panah:hover:not(:disabled) {
  background: rgba(255, 126, 103, 0.55);
}
.panah:disabled {
  opacity: 0.3;
  cursor: default;
}
.panah.kiri {
  left: 14px;
}
.panah.kanan {
  right: 14px;
}
.titik-baris {
  position: absolute;
  right: 0;
  bottom: 12px;
  left: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
}
.titik {
  width: 8px;
  height: 8px;
  padding: 0;
  cursor: pointer;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.3);
  border: 0;
  border-radius: 50%;
}
.titik.aktif {
  background: #fff;
}

@keyframes pudar {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tabir {
    animation: none;
  }
}

@media (min-width: 641px) {
  .kartu {
    width: min(760px, 92vw);
    height: min(88%, 900px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  }
  .kepala {
    min-height: 64px;
    padding: 0.5rem 1rem 0.5rem 1.5rem;
  }
  .judul {
    font-size: 1.1rem;
  }
  .tutup {
    width: 40px;
    height: 40px;
  }
  .panah {
    display: grid;
  }
  .slide {
    padding: 16px 68px 48px;
  }
  .keterangan {
    padding: 10px 18px;
    margin-top: 14px;
    font-size: 0.9rem;
  }
}

@media (min-width: 768px) {
  .kartu {
    width: min(980px, 90vw);
    height: min(88%, 760px);
  }
  .kepala {
    min-height: 68px;
    padding-left: 1.75rem;
  }
  .judul {
    font-size: 1.2rem;
  }
  .slide {
    padding: 20px 80px 52px;
  }
  .keterangan {
    max-width: 720px;
    font-size: 0.95rem;
  }
}

@media (min-width: 1024px) {
  .kartu {
    width: min(1200px, 88vw);
    height: min(86%, 840px);
    border-radius: 28px;
  }
  .kepala {
    min-height: 72px;
    padding-left: 2rem;
  }
  .judul {
    font-size: 1.3rem;
  }
  .slide {
    padding: 24px 100px 56px;
  }
  .keterangan {
    max-width: 840px;
    font-size: 1.05rem;
  }
}
</style>
