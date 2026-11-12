<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'

const props = defineProps({
  src: { type: String, default: null },
  alt: { type: String, default: '' },
  // Opsional, untuk galeri: posisi foto, jumlah foto, dan keterangan
  indeks: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  keterangan: { type: String, default: '' },
})
const emit = defineEmits(['tutup', 'sebelumnya', 'berikutnya'])
const bahasa = useBahasaStore()

/* Zoom ala Google Photos (porting dari situs lama):
   roda mouse / pinch trackpad, cubit dua jari, ketuk dua kali, geser saat di-zoom,
   tombol + - reset, dan klik area kosong untuk menutup. */
const MIN_SCALE = 1
const MAX_SCALE = 8
const MIN_PINCH_SCALE = 0.6 // boleh mengecil sedikit saat cubit, lalu memantul ke 1
const DOUBLE_TAP_SCALE = 2.5
const DOUBLE_TAP_MS = 300
const DOUBLE_TAP_DISTANCE = 30
const TAP_MOVE_TOLERANCE = 8

const area = ref(null)
const gambar = ref(null)
const tombolTutup = ref(null)
const skala = ref(1) // hanya untuk tampilan persen
const diperbesar = ref(false)
const menggeser = ref(false)

let s = 1
let tx = 0
let ty = 0
let sedangGeser = false
let pinchStartDistance = 0
let pinchStartScale = 1
let lastPinchCenter = { x: 0, y: 0 }
let tapStart = null
let lastTap = null
let gestureMoved = false
const pointer = new Map()
let pembersih = []
let fokusSebelumnya = null
let overflowAwal = ''

const tutup = () => emit('tutup')
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

function resetState() {
  s = 1
  tx = 0
  ty = 0
  sedangGeser = false
  pinchStartDistance = 0
  pinchStartScale = 1
  tapStart = null
  lastTap = null
  gestureMoved = false
  pointer.clear()
  skala.value = 1
  diperbesar.value = false
  menggeser.value = false
}

/* Ukuran area dan titik tengah foto saat belum di-zoom atau digeser */
function metrik() {
  const c = area.value
  const img = gambar.value
  if (!c || !img || !img.offsetWidth || !img.offsetHeight) return null
  const r = c.getBoundingClientRect()
  const cs = getComputedStyle(c)
  const pl = parseFloat(cs.paddingLeft) || 0
  const pr = parseFloat(cs.paddingRight) || 0
  const pt = parseFloat(cs.paddingTop) || 0
  const pb = parseFloat(cs.paddingBottom) || 0
  return {
    r,
    lx: r.left + pl + (r.width - pl - pr) / 2,
    ly: r.top + pt + (r.height - pt - pb) / 2,
    w0: img.offsetWidth,
    h0: img.offsetHeight,
  }
}

/* Ubah skala dengan titik (cx, cy) di layar tetap di tempatnya */
function zoomAt(cx, cy, skalaBaru) {
  const m = metrik()
  if (!m) return
  const fx = cx - m.lx
  const fy = cy - m.ly
  const rasio = skalaBaru / s
  tx = fx - (fx - tx) * rasio
  ty = fy - (fy - ty) * rasio
  s = skalaBaru
}

/* Foto tidak boleh keluar dari area */
function batasiGeser() {
  const m = metrik()
  if (!m) return
  if (s <= 1) {
    tx = 0
    ty = 0
    return
  }
  const w = m.w0 * s
  const h = m.h0 * s
  const maxTx = m.r.left - m.lx + w / 2
  const minTx = m.r.right - m.lx - w / 2
  tx = minTx <= maxTx ? clamp(tx, minTx, maxTx) : 0
  const maxTy = m.r.top - m.ly + h / 2
  const minTy = m.r.bottom - m.ly - h / 2
  ty = minTy <= maxTy ? clamp(ty, minTy, maxTy) : 0
}

function terapkan(animasi, durasi = 250) {
  batasiGeser()
  const img = gambar.value
  if (!img) return
  diperbesar.value = s > 1.01
  skala.value = s
  img.style.transformOrigin = 'center center'
  img.style.transition = animasi ? `transform ${durasi}ms cubic-bezier(0.2, 0.8, 0.2, 1)` : 'none'
  img.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`
}

function resetZoom() {
  s = 1
  tx = 0
  ty = 0
  sedangGeser = false
  menggeser.value = false
  terapkan(true)
}

function toggleZoomAt(x, y) {
  if (s > 1.05) {
    resetZoom()
  } else {
    zoomAt(x, y, DOUBLE_TAP_SCALE)
    terapkan(true)
  }
}

function zoomByStep(faktor) {
  const m = metrik()
  if (!m) return
  const baru = clamp(s * faktor, MIN_SCALE, MAX_SCALE)
  if (baru <= 1.02) {
    resetZoom()
    return
  }
  // zoom di tengah area
  zoomAt((m.r.left + m.r.right) / 2, (m.r.top + m.r.bottom) / 2, baru)
  terapkan(true)
}

/* Klik di area kosong (di luar foto) menutup penampil */
function klikArea(e) {
  if (gestureMoved) return // "klik" yang sebenarnya akhir dari geseran atau cubitan
  if (e.target === area.value) tutup()
}

function pasang(c) {
  const turun = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (!gambar.value) return
    pointer.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointer.size === 1) {
      gestureMoved = false
      tapStart = { x: e.clientX, y: e.clientY, time: Date.now() }
      if (s > 1) {
        sedangGeser = true
        menggeser.value = true
      }
    } else if (pointer.size === 2) {
      const [a, b] = Array.from(pointer.values())
      pinchStartDistance = Math.hypot(a.x - b.x, a.y - b.y)
      pinchStartScale = s
      lastPinchCenter = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      gestureMoved = true
      tapStart = null
      sedangGeser = false
      menggeser.value = false
    }
  }

  const gerak = (e) => {
    const p = pointer.get(e.pointerId)
    if (!p) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    p.x = e.clientX
    p.y = e.clientY

    if (pointer.size >= 2) {
      const [a, b] = Array.from(pointer.values())
      const jarak = Math.hypot(a.x - b.x, a.y - b.y)
      const pusat = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      if (pinchStartDistance > 0) {
        const target = clamp(
          pinchStartScale * (jarak / pinchStartDistance),
          MIN_PINCH_SCALE,
          MAX_SCALE,
        )
        zoomAt(pusat.x, pusat.y, target)
        tx += pusat.x - lastPinchCenter.x
        ty += pusat.y - lastPinchCenter.y
        lastPinchCenter = pusat
        terapkan(false)
      }
      e.preventDefault()
      return
    }

    if (
      tapStart &&
      Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > TAP_MOVE_TOLERANCE
    ) {
      gestureMoved = true
      tapStart = null
    }
    if (sedangGeser && s > 1) {
      tx += dx
      ty += dy
      terapkan(false)
      e.preventDefault()
    }
  }

  const naik = (e) => {
    if (!pointer.has(e.pointerId)) return
    const adaCubitan = pointer.size >= 2
    pointer.delete(e.pointerId)

    if (adaCubitan) {
      pinchStartDistance = 0
      if (pointer.size === 1) {
        // sisa satu jari: lanjut geser tanpa lompatan
        sedangGeser = s > 1
        menggeser.value = sedangGeser
      } else if (pointer.size === 0 && s < MIN_SCALE) {
        resetZoom() // terlalu kecil: pantul kembali
      }
      return
    }

    sedangGeser = false
    menggeser.value = false

    const tap = tapStart
    tapStart = null
    if (tap && !gestureMoved && Date.now() - tap.time < DOUBLE_TAP_MS) {
      const sekarang = Date.now()
      const terakhir = lastTap
      if (
        terakhir &&
        sekarang - terakhir.time < DOUBLE_TAP_MS &&
        Math.hypot(e.clientX - terakhir.x, e.clientY - terakhir.y) < DOUBLE_TAP_DISTANCE
      ) {
        lastTap = null
        toggleZoomAt(e.clientX, e.clientY)
      } else {
        lastTap = { x: e.clientX, y: e.clientY, time: sekarang }
      }
    }
  }

  const roda = (e) => {
    if (!gambar.value) return
    e.preventDefault()
    let delta = e.deltaY
    if (e.deltaMode === 1) delta *= 16 // satuan baris (Firefox)
    const kecepatan = e.ctrlKey ? 0.01 : 0.0018
    const baru = clamp(s * Math.exp(-delta * kecepatan), MIN_SCALE, MAX_SCALE)
    if (baru === s) return
    zoomAt(e.clientX, e.clientY, baru)
    // trackpad: tanpa animasi (sudah halus); roda mouse: animasi singkat
    terapkan(!e.ctrlKey, 120)
  }

  const tombol = (e) => {
    if (e.key === 'Escape') tutup()
    else if (props.total > 1 && e.key === 'ArrowLeft') emit('sebelumnya')
    else if (props.total > 1 && e.key === 'ArrowRight') emit('berikutnya')
  }

  c.addEventListener('pointerdown', turun)
  window.addEventListener('pointermove', gerak, { passive: false })
  window.addEventListener('pointerup', naik)
  window.addEventListener('pointercancel', naik)
  c.addEventListener('wheel', roda, { passive: false })
  window.addEventListener('keydown', tombol)
  pembersih = [
    () => c.removeEventListener('pointerdown', turun),
    () => window.removeEventListener('pointermove', gerak),
    () => window.removeEventListener('pointerup', naik),
    () => window.removeEventListener('pointercancel', naik),
    () => c.removeEventListener('wheel', roda),
    () => window.removeEventListener('keydown', tombol),
  ]
}

function bersihkan() {
  pembersih.forEach((f) => f())
  pembersih = []
}

function kunciHalaman(kunci) {
  if (kunci) {
    overflowAwal = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = overflowAwal
  }
}

watch(
  () => props.src,
  async (baru, lama) => {
    bersihkan()
    if (!baru) {
      if (lama) {
        kunciHalaman(false)
        fokusSebelumnya?.focus?.()
        fokusSebelumnya = null
      }
      return
    }
    if (!lama) {
      fokusSebelumnya = document.activeElement
      kunciHalaman(true)
    }
    resetState()
    await nextTick()
    if (area.value) pasang(area.value)
    tombolTutup.value?.focus()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  bersihkan()
  if (props.src) kunciHalaman(false)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="src"
      class="penampil"
      role="dialog"
      aria-modal="true"
      :aria-label="alt || bahasa.pilih('Penampil foto', 'Photo viewer')"
    >
      <div class="kartu">
        <div class="atas">
          <button
            ref="tombolTutup"
            type="button"
            class="tutup"
            :aria-label="bahasa.pilih('Tutup', 'Close')"
            @click="tutup"
          >
            <X :size="22" aria-hidden="true" />
          </button>
        </div>

        <div ref="area" class="area" @click="klikArea">
          <img
            ref="gambar"
            :src="src"
            :alt="alt"
            draggable="false"
            :class="{ diperbesar, menggeser }"
            @dragstart.prevent
          />
        </div>

        <p v-if="total > 1 || keterangan" class="info">
          <span v-if="total > 1" class="hitung">{{ indeks + 1 }} / {{ total }}</span>
          <span v-if="keterangan">{{ keterangan }}</span>
        </p>
        <template v-if="total > 1">
          <button
            type="button"
            class="nav kiri"
            :aria-label="bahasa.pilih('Foto sebelumnya', 'Previous photo')"
            @click.stop="emit('sebelumnya')"
          >
            <ChevronLeft :size="22" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="nav kanan"
            :aria-label="bahasa.pilih('Foto berikutnya', 'Next photo')"
            @click.stop="emit('berikutnya')"
          >
            <ChevronRight :size="22" aria-hidden="true" />
          </button>
        </template>

        <div class="kontrol">
          <button
            type="button"
            :aria-label="bahasa.pilih('Perbesar', 'Zoom in')"
            @click="zoomByStep(1.5)"
          >
            <Plus :size="20" aria-hidden="true" />
          </button>
          <span class="level" aria-live="polite">{{ Math.round(skala * 100) }}%</span>
          <button
            type="button"
            :aria-label="bahasa.pilih('Perkecil', 'Zoom out')"
            @click="zoomByStep(1 / 1.5)"
          >
            <Minus :size="20" aria-hidden="true" />
          </button>
          <button
            type="button"
            :aria-label="bahasa.pilih('Atur ulang zoom', 'Reset zoom')"
            @click="resetZoom()"
          >
            <RotateCcw :size="20" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px): layar penuh. Tablet ke atas: kartu melayang. */
.penampil {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  overscroll-behavior: contain;
  animation: pudar 0.25s ease-out;
}
.kartu {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(circle at 50% 0%, #1b1d2e 0%, #05050a 70%);
}

/* Tombol tutup melayang */
.atas {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: calc(10px + env(safe-area-inset-top, 0px)) 12px 24px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
  pointer-events: none;
}
.tutup {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
  backdrop-filter: blur(8px);
  cursor: pointer;
  pointer-events: auto;
}
.tutup:hover {
  background: rgba(255, 255, 255, 0.26);
}

/* Area foto: mengisi seluruh kartu, foto di tengah dan selalu utuh */
.area {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: calc(60px + env(safe-area-inset-top, 0px)) 12px
    calc(84px + env(safe-area-inset-bottom, 0px));
  overflow: hidden;
  touch-action: none;
}
.area img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  cursor: zoom-in;
  user-select: none;
  -webkit-user-drag: none;
  touch-action: none;
  will-change: transform;
  animation: pudar 0.4s ease-out;
}
.area img.diperbesar {
  cursor: grab;
}
.area img.menggeser {
  cursor: grabbing;
}

/* Kontrol zoom: pil kaca di bawah */
.kontrol {
  position: absolute;
  left: 50%;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  background: rgba(20, 20, 28, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(14px);
  transform: translateX(-50%);
}
.kontrol button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  color: #fff;
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}
.kontrol button:hover {
  background: rgba(255, 255, 255, 0.16);
}
.level {
  min-width: 52px;
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #fff;
  text-align: center;
}
/* Penghitung, keterangan, dan panah antar foto (hanya bila total > 1) */
.info {
  position: absolute;
  top: calc(14px + env(safe-area-inset-top, 0px));
  left: 16px;
  right: 72px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  font-size: 0.85rem;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}
.info .hitung {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.nav {
  position: absolute;
  top: 50%;
  z-index: 6;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: rgba(20, 20, 28, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(8px);
  transform: translateY(-50%);
}
.nav:hover {
  background: rgba(255, 255, 255, 0.22);
}
.nav.kiri {
  left: 8px;
}
.nav.kanan {
  right: 8px;
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
  .penampil,
  .area img {
    animation: none;
  }
}

@media (min-width: 641px) {
  .kartu {
    width: 94%;
    height: 90%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.7);
  }
  .atas {
    padding: 14px 16px 28px;
  }
  .tutup {
    width: 44px;
    height: 44px;
  }
  .area {
    padding: 68px 20px 88px;
  }
  .area img {
    border-radius: 14px;
  }
  .kontrol {
    bottom: 20px;
  }
}

@media (min-width: 768px) {
  .kartu {
    width: min(1100px, 92vw);
    height: min(88vh, 820px);
    border-radius: 28px;
  }
  .atas {
    padding: 16px 20px 32px;
  }
  .area {
    padding: 76px 28px 92px;
  }
  .area img {
    border-radius: 16px;
  }
  .kontrol {
    bottom: 24px;
    padding: 8px 12px;
  }
  .kontrol button {
    width: 42px;
    height: 42px;
  }
  .nav {
    width: 46px;
    height: 46px;
  }
  .nav.kiri {
    left: 16px;
  }
  .nav.kanan {
    right: 16px;
  }
}

@media (min-width: 1024px) {
  .kartu {
    width: min(1400px, 90vw);
    height: min(88vh, 920px);
  }
  .atas {
    padding: 20px 24px 36px;
  }
  .tutup {
    width: 48px;
    height: 48px;
  }
  .area {
    padding: 84px 36px 100px;
  }
  .area img {
    border-radius: 18px;
  }
  .kontrol {
    bottom: 28px;
  }
}
</style>
