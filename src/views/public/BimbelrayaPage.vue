<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, ExternalLink, Languages } from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import PenampilFoto from '../../components/PenampilFoto.vue'
import { vMuncul } from '../../utils/muncul'
import { useBahasaStore } from '../../stores/bahasa'
import { useBimbelrayaStore } from '../../stores/bimbelraya'

const bahasa = useBahasaStore()
const bimbel = useBimbelrayaStore()

onMounted(() => bimbel.muat())

const d = computed(() => bimbel.data)
const foto = computed(() => d.value?.foto ?? [])
const aktif = ref(0) // posisi foto utama
const buka = ref(false) // penampil zoom
const trek = ref(null) // deretan thumbnail

const fotoAktif = computed(() => foto.value[aktif.value] ?? foto.value[0] ?? null)
const fotoBuka = computed(() => (buka.value ? fotoAktif.value : null))
const judulFoto = (f) => (f ? bahasa.pilih(f.judulId, f.judulEn) : '')

function ganti(arah) {
  const n = foto.value.length
  if (n < 2) return
  aktif.value = (aktif.value + arah + n) % n
}

// Thumbnail aktif selalu berada di tengah deretan
watch(aktif, async (i) => {
  await nextTick()
  const el = trek.value
  const t = el?.children[i]
  if (!el || !t) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollTo({
    left: t.offsetLeft - (el.clientWidth - t.clientWidth) / 2,
    behavior: reduce ? 'auto' : 'smooth',
  })
})

// Geser jari pada foto utama
let awalX = null
let digeser = false
function turun(e) {
  awalX = e.clientX
  digeser = false
}
function naik(e) {
  if (awalX === null) return
  const dx = e.clientX - awalX
  awalX = null
  if (Math.abs(dx) > 40) {
    digeser = true
    ganti(dx < 0 ? 1 : -1)
  }
}
function klikFoto() {
  if (digeser) {
    digeser = false
    return
  }
  buka.value = true
}

// Kilau kaca mengikuti kursor (hanya mouse)
function sorot(e) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
  el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
}
</script>

<template>
  <div class="halaman">
    <div class="orb o1" aria-hidden="true"></div>
    <div class="orb o2" aria-hidden="true"></div>
    <div class="orb o3" aria-hidden="true"></div>

    <header class="bilah kaca">
      <RouterLink to="/" class="judul-situs">Maulana Farras <span>Blog's</span></RouterLink>
      <button
        type="button"
        class="terjemah"
        :title="bahasa.kode === 'id' ? 'Translate to English' : 'Terjemahkan ke Indonesia'"
        @click="bahasa.tukar()"
      >
        <Languages :size="16" aria-hidden="true" />
        <span>{{ bahasa.label }}</span>
      </button>
    </header>

    <main v-if="d" class="isi">
      <div class="wadah">
        <!-- Hero -->
        <section class="hero kaca" @pointermove="sorot">
          <span v-if="d.logoUrl" class="lingkar">
            <img :src="d.logoUrl" alt="Logo Bimbel Raya" />
          </span>
          <h1>{{ bahasa.pilih(d.kepala.judul.id, d.kepala.judul.en) }}</h1>
          <p class="tagline">{{ bahasa.pilih(d.ajakan.teks.id, d.ajakan.teks.en) }}</p>
          <a
            v-if="d.tautan.website"
            :href="d.tautan.website"
            target="_blank"
            rel="noopener noreferrer"
            class="tombol"
          >
            {{ bahasa.pilih('Buka Website', 'Open Website') }}
            <ExternalLink :size="16" aria-hidden="true" />
          </a>
        </section>

        <!-- Galeri: foto utama + thumbnail -->
        <section v-if="foto.length" class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Galeri Foto', 'Photo Gallery') }}</h2>
          <div class="galeri">
            <div class="bingkai kaca" @pointermove="sorot">
              <div
                class="layar"
                @pointerdown="turun"
                @pointerup="naik"
                @pointercancel="awalX = null"
              >
                <Transition name="pudar" mode="out-in">
                  <button
                    :key="fotoAktif.id"
                    type="button"
                    class="foto-utama"
                    :aria-label="bahasa.pilih('Perbesar foto', 'Enlarge photo')"
                    @click="klikFoto"
                  >
                    <img :src="fotoAktif.gambarUrl" :alt="judulFoto(fotoAktif)" draggable="false" />
                  </button>
                </Transition>
                <template v-if="foto.length > 1">
                  <button
                    type="button"
                    class="panah kiri"
                    :aria-label="bahasa.pilih('Foto sebelumnya', 'Previous photo')"
                    @pointerdown.stop
                    @click.stop="ganti(-1)"
                  >
                    <ChevronLeft :size="22" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="panah kanan"
                    :aria-label="bahasa.pilih('Foto berikutnya', 'Next photo')"
                    @pointerdown.stop
                    @click.stop="ganti(1)"
                  >
                    <ChevronRight :size="22" aria-hidden="true" />
                  </button>
                </template>
              </div>
              <div class="bar">
                <span v-if="foto.length > 1" class="hitung"
                  >{{ aktif + 1 }} / {{ foto.length }}</span
                >
                <span class="ket">{{ judulFoto(fotoAktif) }}</span>
              </div>
            </div>

            <div v-if="foto.length > 1" ref="trek" class="thumbs">
              <button
                v-for="(f, i) in foto"
                :key="f.id"
                type="button"
                class="thumb"
                :class="{ aktif: i === aktif }"
                :aria-label="bahasa.pilih('Lihat foto ', 'View photo ') + (i + 1)"
                :aria-current="i === aktif"
                @click="aktif = i"
              >
                <img :src="f.kecilUrl" :alt="judulFoto(f)" loading="lazy" draggable="false" />
              </button>
            </div>
          </div>
        </section>

        <!-- Alat dan Pengembangan -->
        <section class="bagian">
          <h2 class="judul-bagian">
            {{ bahasa.pilih('Alat dan Pengembangan', 'Tools and Development') }}
          </h2>
          <div class="grid-alat">
            <div
              v-for="(a, i) in d.alat"
              :key="i"
              v-muncul="i % 4"
              class="alat kaca"
              @pointermove="sorot"
            >
              <span class="ikon-alat"><IkonDinamis :nama="a.ikon" :ukuran="24" /></span>
              <p class="nama-alat">{{ a.nama }}</p>
              <p class="ket-alat">{{ bahasa.pilih(a.deskripsi.id, a.deskripsi.en) }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <main v-else-if="bimbel.galat" class="isi">
      <p class="pesan">
        {{ bimbel.galat }}
        <button type="button" class="coba-lagi" @click="bimbel.muat(true)">
          {{ bahasa.pilih('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>

    <PenampilFoto
      :src="fotoBuka?.gambarUrl ?? null"
      :alt="judulFoto(fotoBuka)"
      :keterangan="judulFoto(fotoBuka)"
      :indeks="aktif"
      :total="foto.length"
      @tutup="buka = false"
      @sebelumnya="ganti(-1)"
      @berikutnya="ganti(1)"
    />
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop, 1024px desktop lebar.
   Tema: gelap + kaca ala iOS, palet brand Bimbel Raya. */
.halaman {
  --biru: #2e87f6;
  --oranye: #f35c2b;
  --krem: #f9eccc;

  position: relative;
  min-height: 100vh;
  color: #fff;
  background: linear-gradient(160deg, #081a38 0%, #0c2a5a 55%, #0a1f45 100%);
}
.halaman *,
.halaman *::before,
.halaman *::after {
  box-sizing: border-box;
}
h1,
h2,
p {
  margin: 0;
}

/* --- Bola cahaya latar --- */
.orb {
  position: fixed;
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(60px);
  will-change: transform;
  animation: melayang 18s ease-in-out infinite alternate;
}
.o1 {
  top: -80px;
  left: -90px;
  width: 300px;
  height: 300px;
  background: var(--biru);
  opacity: 0.55;
}
.o2 {
  top: 38%;
  right: -110px;
  width: 280px;
  height: 280px;
  background: var(--oranye);
  opacity: 0.38;
  animation-delay: -6s;
}
.o3 {
  bottom: -110px;
  left: 18%;
  width: 300px;
  height: 300px;
  background: var(--krem);
  opacity: 0.16;
  animation-delay: -11s;
}
@keyframes melayang {
  to {
    transform: translate(40px, 60px) scale(1.15);
  }
}

/* --- Kaca --- */
.kaca {
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.17), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 22px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    0 10px 30px rgba(0, 0, 0, 0.28);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  backdrop-filter: blur(12px) saturate(160%);
}
/* Kilau yang mengikuti kursor */
.kaca::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  background: radial-gradient(
    circle at var(--mx, 30%) var(--my, 0%),
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0) 55%
  );
}
/* Kilau diagonal tipis */
.kaca::after {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  background: linear-gradient(
    115deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.09) 45%,
    rgba(255, 255, 255, 0) 60%
  );
}
.kaca > * {
  position: relative;
  z-index: 1;
}
/* Cadangan bila browser tanpa backdrop-filter */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .kaca {
    background: rgba(18, 40, 82, 0.9);
  }
}

/* --- Header: pil melayang --- */
.bilah {
  position: sticky;
  top: 10px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 20px);
  max-width: 760px;
  min-height: 52px;
  padding: 0 0.6rem 0 1.1rem;
  margin: 10px auto 0;
  border-radius: 999px;
}
.judul-situs {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--krem);
  text-decoration: none;
  white-space: nowrap;
}
.judul-situs span {
  color: var(--oranye);
}
.terjemah {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.4rem 0.8rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  transition: background 0.25s ease;
}
.terjemah:hover {
  background: rgba(255, 255, 255, 0.26);
}

.isi {
  position: relative;
  z-index: 1;
  padding: 1.25rem 1rem 3rem;
}
.wadah {
  max-width: 1100px;
  margin: 0 auto;
}
.pesan {
  padding: 3rem 1rem;
  text-align: center;
}
.coba-lagi {
  margin-left: 0.5rem;
  padding: 0.3rem 0.9rem;
  font: inherit;
  color: #fff;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
}

/* --- Hero --- */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.25rem;
  text-align: center;
}
.lingkar {
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.3);
}
.lingkar img {
  width: 68%;
  height: 68%;
  object-fit: contain;
}
.hero h1 {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.15;
  color: var(--krem);
}
.tagline {
  max-width: 34rem;
  margin: 0.75rem 0 1.5rem;
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.82);
}
.tombol {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.7rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  letter-spacing: 0.5px;
  background: linear-gradient(180deg, #ff7a45, var(--oranye));
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 8px 22px rgba(243, 92, 43, 0.45);
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}
.tombol:hover {
  filter: brightness(1.06);
  transform: translateY(-2px);
}

/* --- Judul bagian --- */
.bagian {
  margin-top: 2.5rem;
}
.judul-bagian {
  margin-bottom: 1.25rem;
  font-size: 1.4rem;
  font-weight: 800;
  text-align: center;
  color: var(--krem);
}
.judul-bagian::after {
  display: block;
  width: 44px;
  height: 4px;
  margin: 0.5rem auto 0;
  content: '';
  background: linear-gradient(90deg, var(--biru), var(--oranye));
  border-radius: 999px;
}

/* --- Galeri --- */
.galeri {
  max-width: 860px;
  margin: 0 auto;
}
.bingkai {
  padding: 8px;
  border-radius: 24px;
}
.layar {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  touch-action: pan-y;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 16px;
}
.foto-utama {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  cursor: zoom-in;
  background: transparent;
  border: 0;
}
.foto-utama img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
}
.pudar-enter-active,
.pudar-leave-active {
  transition: opacity 0.25s ease;
}
.pudar-enter-from,
.pudar-leave-to {
  opacity: 0;
}
.panah {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: rgba(20, 30, 55, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  transform: translateY(-50%);
  transition: background 0.2s ease;
}
.panah:hover {
  background: rgba(255, 255, 255, 0.28);
}
.panah.kiri {
  left: 8px;
}
.panah.kanan {
  right: 8px;
}
.bar {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  min-height: 44px;
  padding: 0.55rem 0.5rem 0.25rem;
}
.hitung {
  flex-shrink: 0;
  padding: 0.15rem 0.6rem;
  font-size: 0.78rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--krem);
  background: rgba(243, 92, 43, 0.3);
  border: 1px solid rgba(243, 92, 43, 0.55);
  border-radius: 999px;
}
.ket {
  min-width: 0;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.35;
}
.thumbs {
  position: relative;
  display: flex;
  gap: 8px;
  padding: 12px 2px 6px;
  overflow-x: auto;
  scrollbar-width: none;
}
.thumbs::-webkit-scrollbar {
  display: none;
}
.thumb {
  flex: 0 0 auto;
  width: 72px;
  height: 52px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 10px;
  opacity: 0.6;
  transition:
    opacity 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}
.thumb:hover {
  opacity: 0.9;
}
.thumb.aktif {
  border-color: var(--oranye);
  opacity: 1;
  transform: translateY(-2px);
}
.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- Alat --- */
.grid-alat {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.alat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.7rem;
  text-align: center;
  border-radius: 18px;
  transition: transform 0.3s ease;
}
.alat:hover {
  transform: translateY(-5px);
}
.ikon-alat {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 0.65rem;
  color: var(--krem);
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50%;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition:
    color 0.3s ease,
    background 0.3s ease;
}
.alat:hover .ikon-alat {
  color: #fff;
  background: linear-gradient(180deg, #ff7a45, var(--oranye));
}
.nama-alat {
  margin-bottom: 0.3rem;
  font-size: 0.88rem;
  font-weight: 700;
}
.ket-alat {
  font-size: 0.75rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.72);
}

@media (prefers-reduced-motion: reduce) {
  .orb {
    animation: none;
  }
  .alat,
  .tombol,
  .thumb,
  .pudar-enter-active,
  .pudar-leave-active {
    transition: none;
  }
}

/* >= 641px: TABLET */
@media (min-width: 641px) {
  .bilah {
    min-height: 56px;
    padding: 0 0.7rem 0 1.4rem;
  }
  .judul-situs {
    font-size: 1.05rem;
  }
  .isi {
    padding: 1.75rem 1.25rem 3.5rem;
  }
  .hero {
    padding: 2.75rem 2rem;
  }
  .lingkar {
    width: 108px;
    height: 108px;
  }
  .hero h1 {
    font-size: 2.6rem;
  }
  .tagline {
    font-size: 1.05rem;
  }
  .judul-bagian {
    font-size: 1.7rem;
  }
  .bingkai {
    padding: 10px;
  }
  .ket {
    font-size: 0.95rem;
  }
  .thumb {
    width: 92px;
    height: 62px;
  }
  .grid-alat {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .alat {
    padding: 1.25rem 0.9rem;
  }
  .nama-alat {
    font-size: 0.95rem;
  }
  .ket-alat {
    font-size: 0.8rem;
  }
}

/* >= 768px: DESKTOP */
@media (min-width: 768px) {
  .hero {
    padding: 3.25rem 2.5rem;
  }
  .hero h1 {
    font-size: 3rem;
  }
  .grid-alat {
    grid-template-columns: repeat(4, 1fr);
  }
  .panah {
    width: 46px;
    height: 46px;
  }
  .panah.kiri {
    left: 14px;
  }
  .panah.kanan {
    right: 14px;
  }
  .kaca {
    -webkit-backdrop-filter: blur(18px) saturate(170%);
    backdrop-filter: blur(18px) saturate(170%);
  }
}

/* >= 1024px: DESKTOP LEBAR */
@media (min-width: 1024px) {
  .grid-alat {
    grid-template-columns: repeat(5, 1fr);
  }
  .o1 {
    width: 460px;
    height: 460px;
  }
  .o2 {
    width: 420px;
    height: 420px;
  }
}
</style>
