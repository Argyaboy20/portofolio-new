<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'
import PenampilFoto from './PenampilFoto.vue'

const props = defineProps({ item: { type: Object, default: null } })
const emit = defineEmits(['tutup'])
const bahasa = useBahasaStore()
const p = (id, en) => bahasa.pilih(id, en)

const tombolTutup = ref(null)
const fotoBuka = ref(null) // { src, alt } untuk penampil zoom

let fokusSebelumnya = null
let pasang = false

const tutup = () => emit('tutup')

function saatTombol(e) {
  // Penampil foto memakai Esc untuk dirinya sendiri; modal tetap terbuka
  if (e.key === 'Escape' && !fotoBuka.value) tutup()
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
      fotoBuka.value = null
      kunci(true)
      if (!pasang) {
        window.addEventListener('keydown', saatTombol)
        pasang = true
      }
      await nextTick()
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
            <X :size="20" aria-hidden="true" />
          </button>
        </header>

        <div class="badan">
          <button
            type="button"
            class="foto"
            :aria-label="p('Buka foto', 'Open photo')"
            @click="fotoBuka = { src: item.gambarUrl, alt: p(item.judulId, item.judulEn) }"
          >
            <img :src="item.gambarUrl" :alt="p(item.judulId, item.judulEn)" draggable="false" />
          </button>

          <h3 class="sub">{{ p('Detail Fitur', 'Feature Details') }}</h3>
          <p class="teks">{{ p(item.deskripsiId, item.deskripsiEn) }}</p>

          <template v-if="(p(item.butirId, item.butirEn) ?? []).length">
            <h3 class="sub">{{ p('Fitur Unggulan', 'Key Features') }}</h3>
            <ul class="butir">
              <li v-for="(b, i) in p(item.butirId, item.butirEn)" :key="i">{{ b }}</li>
            </ul>
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
   Dasar = mobile (<=640px): layar penuh. Tablet ke atas: kartu di tengah. */
.tabir {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  overscroll-behavior: contain;
  animation: pudar 0.2s ease-out;
}
.kartu {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #333;
  background: #f9f9f9;
}
.kepala {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 56px;
  padding: 0.5rem 0.6rem 0.5rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.judul {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}
.tutup {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #555;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.06);
  border: 0;
  border-radius: 50%;
}
.tutup:hover {
  background: rgba(0, 0, 0, 0.12);
}
.badan {
  flex: 1;
  min-height: 0;
  padding: 1rem;
  overflow-y: auto;
}
.foto {
  position: relative;
  display: block;
  width: 100%;
  height: 40vh;
  padding: 0;
  margin-bottom: 1rem;
  overflow: hidden;
  cursor: zoom-in;
  background: #e8ecf2;
  border: 0;
  border-radius: 10px;
}
.foto img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.sub {
  margin: 0 0 0.6rem;
  font-size: 1rem;
  font-weight: 600;
}
.teks {
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(51, 51, 51, 0.85);
  white-space: pre-line;
}
.butir {
  padding-left: 1.1rem;
  margin: 0;
}
.butir li {
  margin-bottom: 0.45rem;
  font-size: 0.9rem;
  color: rgba(51, 51, 51, 0.85);
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
    width: 85%;
    height: 80%;
    border-radius: 16px;
    box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
  }
  .kepala {
    padding: 0.5rem 1rem 0.5rem 1.5rem;
  }
  .judul {
    font-size: 1.3rem;
  }
  .badan {
    padding: 1.5rem;
  }
  .foto {
    height: 45%;
  }
  .teks,
  .butir li {
    font-size: 1rem;
  }
}

@media (min-width: 768px) {
  .kartu {
    width: 80%;
    height: 85%;
    max-width: 1100px;
  }
  .foto {
    height: 50%;
  }
}
</style>
