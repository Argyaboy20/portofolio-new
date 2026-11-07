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
const zoom = ref(false)

let fokusSebelumnya = null
let pasang = false

const tutup = () => emit('tutup')

const tanggal = (s) =>
  new Intl.DateTimeFormat(bahasa.kode === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${s}T00:00:00Z`))

function saatTombol(e) {
  // Penampil zoom memakai Esc untuk dirinya sendiri; modal tetap terbuka
  if (e.key === 'Escape' && !zoom.value) tutup()
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
      zoom.value = false
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
            class="gambar"
            :aria-label="p('Perbesar foto', 'Enlarge photo')"
            @click="zoom = true"
          >
            <img :src="item.gambarUrl" :alt="p(item.judulId, item.judulEn)" draggable="false" />
          </button>
          <div class="detail">
            <span class="tgl">{{ tanggal(item.tanggal) }}</span>
            <p class="desk">{{ p(item.deskripsiId, item.deskripsiEn) }}</p>
          </div>
        </div>
      </div>
    </div>

    <PenampilFoto
      :src="zoom ? (item?.gambarUrl ?? null) : null"
      :alt="item ? p(item.judulId, item.judulEn) : ''"
      @tutup="zoom = false"
    />
  </Teleport>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (layar penuh). Override: 768px desktop (dua kolom). */
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
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0.5rem 0.6rem 0.5rem 1rem;
  background: rgba(10, 11, 18, 0.92);
}
.judul {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
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
  background: rgba(255, 255, 255, 0.24);
}
.badan {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}
.gambar {
  flex-shrink: 0;
  width: 100%;
  height: 50vh;
  padding: 0;
  cursor: zoom-in;
  background: transparent;
  border: 0;
}
.gambar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.detail {
  padding: 1rem 1rem 1.5rem;
}
.tgl {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  margin-bottom: 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  border-radius: 999px;
}
.desk {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #d9dcef;
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

/* >= 768px: DESKTOP. Kartu di tengah, foto kiri dan keterangan kanan. */
@media (min-width: 768px) {
  .kartu {
    width: min(1100px, 94vw);
    height: min(86vh, 700px);
    border-radius: 16px;
  }
  .kepala {
    min-height: 64px;
    padding-left: 1.4rem;
  }
  .judul {
    font-size: 1.15rem;
  }
  .badan {
    flex-direction: row;
    overflow: hidden;
  }
  .gambar {
    flex: 1.5;
    height: auto;
    min-width: 0;
  }
  .detail {
    flex: 1;
    min-width: 0;
    padding: 1.4rem;
    overflow-y: auto;
  }
  .desk {
    font-size: 1rem;
    line-height: 1.8;
  }
}
</style>
