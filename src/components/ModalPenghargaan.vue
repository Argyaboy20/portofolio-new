<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'

const props = defineProps({
  buka: { type: Boolean, default: false },
  daftar: { type: Array, default: () => [] },
})
const emit = defineEmits(['tutup'])
const bahasa = useBahasaStore()

const tombolTutup = ref(null)
let fokusSebelumnya = null
let overflowAwal = ''

const tutup = () => emit('tutup')
const tombol = (e) => {
  if (e.key === 'Escape') tutup()
}

watch(
  () => props.buka,
  async (baru, lama) => {
    if (baru) {
      fokusSebelumnya = document.activeElement
      overflowAwal = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', tombol)
      await nextTick()
      tombolTutup.value?.focus()
    } else if (lama) {
      window.removeEventListener('keydown', tombol)
      document.body.style.overflow = overflowAwal
      fokusSebelumnya?.focus?.()
      fokusSebelumnya = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', tombol)
  if (props.buka) document.body.style.overflow = overflowAwal
})
</script>

<template>
  <Teleport to="body">
    <div v-if="buka" class="latar" @click.self="tutup">
      <div
        class="lembar"
        role="dialog"
        aria-modal="true"
        :aria-label="bahasa.pilih('Sertifikat Penghargaan', 'Award Certificates')"
      >
        <div class="kepala">
          <h2 class="judul">{{ bahasa.pilih('Sertifikat Penghargaan', 'Award Certificates') }}</h2>
          <button ref="tombolTutup" type="button" class="tutup" :aria-label="bahasa.pilih('Tutup', 'Close')" @click="tutup">
            <X :size="26" aria-hidden="true" />
          </button>
        </div>

        <div class="isi">
          <div class="kisi">
            <article v-for="a in daftar" :key="a.id" class="slide">
              <div class="gambar">
                <img
                  v-if="a.gambarUrl"
                  :src="a.gambarUrl"
                  :alt="bahasa.pilih(a.judulId, a.judulEn)"
                  loading="lazy"
                />
              </div>
              <div class="info">
                <h3>{{ bahasa.pilih(a.judulId, a.judulEn) }}</h3>
                <p>{{ bahasa.pilih(a.deskripsiId, a.deskripsiEn) }}</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px): lembar yang naik dari bawah.
   Tablet ke atas: kartu di tengah. */
.latar {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  overscroll-behavior: contain;
  animation: pudar 0.25s ease-out;
}
.lembar {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 90%;
  overflow: hidden;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  animation: naik 0.3s ease-out;
}
.kepala {
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
/* Pegangan lembar (hanya mobile) */
.kepala::before {
  content: '';
  position: absolute;
  top: 6px;
  left: 50%;
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
  transform: translateX(-50%);
  pointer-events: none;
}
.judul {
  flex: 1;
  margin: 0;
  padding-right: 32px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
}
.tutup {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}
/* Urutan penting (mobile): :active dulu, baru :hover */
.tutup:active {
  transform: scale(0.95);
}
.tutup:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg) scale(0.95);
}

.isi {
  flex: 1;
  padding: 20px 12px;
  overflow-y: auto;
  background: #1a1a1a;
  overscroll-behavior: contain;
}
.kisi {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
.slide {
  padding: 1rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.slide:hover {
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
  transform: translateY(-8px);
}
.gambar {
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
}
.gambar img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 60vh;
  object-fit: contain;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 16px;
}
.info h3 {
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}
.info p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
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
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
@keyframes muncul-tengah {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .latar,
  .lembar {
    animation: none;
  }
  .slide,
  .tutup {
    transition: none;
  }
}

@media (min-width: 641px) {
  .latar {
    align-items: center;
  }
  .lembar {
    width: 94%;
    height: 90%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.7);
    animation: muncul-tengah 0.3s ease-out;
  }
  .kepala {
    padding: 20px 24px;
  }
  .kepala::before {
    display: none;
  }
  .judul {
    padding-right: 40px;
    font-size: 1.3rem;
  }
  .tutup {
    width: 40px;
    height: 40px;
  }
  /* Urutan penting (tablet ke atas): :hover dulu, baru :active */
  .tutup:hover {
    transform: scale(1.05);
  }
  .tutup:active {
    transform: scale(0.95);
  }
  .isi {
    padding: 24px 16px;
  }
  .kisi {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
  .slide {
    padding: 1.2rem;
  }
  .info {
    padding: 0.8rem;
  }
  .info h3 {
    font-size: 1.1rem;
  }
  .info p {
    font-size: 0.98rem;
  }
}

@media (min-width: 768px) {
  .lembar {
    width: min(1100px, 92vw);
    height: min(88vh, 820px);
    border-radius: 28px;
  }
  .judul {
    font-size: 1.5rem;
  }
  .isi {
    padding: 30px 20px;
  }
  .kisi {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 30px;
  }
  .slide {
    padding: 0;
  }
  .info {
    padding: 20px;
  }
  .info h3 {
    font-size: 1.2rem;
  }
  .info p {
    font-size: 0.95rem;
  }
}

@media (min-width: 1024px) {
  .lembar {
    width: min(1400px, 90vw);
    height: min(88vh, 920px);
  }
}
</style>