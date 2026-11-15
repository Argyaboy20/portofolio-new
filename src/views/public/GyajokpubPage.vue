<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, ExternalLink, Languages } from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import PenampilFoto from '../../components/PenampilFoto.vue'
import { vMuncul } from '../../utils/muncul'
import { useBahasaStore } from '../../stores/bahasa'
import { useGyajokpubStore } from '../../stores/gyajokpub'

const bahasa = useBahasaStore()
const gyajok = useGyajokpubStore()

const d = computed(() => gyajok.data)
const foto = computed(() => d.value?.foto ?? [])
const aktif = ref(0) // foto teratas di tumpukan
const buka = ref(false) // penampil zoom
const progres = ref(0) // 0 sampai 1, bilah baca di atas layar

const fotoAktif = computed(() => foto.value[aktif.value] ?? null)
const fotoBuka = computed(() => (buka.value ? fotoAktif.value : null))
const judulFoto = (f) => (f ? bahasa.pilih(f.judulId, f.judulEn) : '')
const dua = (n) => String(n).padStart(2, '0')

function ganti(arah) {
  const n = foto.value.length
  if (n < 2) return
  aktif.value = (aktif.value + arah + n) % n
}

// Posisi tiap kartu di tumpukan: 0 = teratas
function gaya(i) {
  const n = foto.value.length
  const p = (i - aktif.value + n) % n
  if (p === 0) return { zIndex: 10, transform: 'none', opacity: 1 }
  if (p === 1) return { zIndex: 9, transform: 'translate(14px, 10px) rotate(2.5deg)', opacity: 1 }
  if (p === 2) return { zIndex: 8, transform: 'translate(-12px, 18px) rotate(-3deg)', opacity: 1 }
  return {
    zIndex: 1,
    transform: 'translate(0, 24px) scale(0.92)',
    opacity: 0,
    pointerEvents: 'none',
  }
}

// Geser jari atau mouse pada tumpukan
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
function klikTumpukan() {
  if (digeser) {
    digeser = false
    return
  }
  if (fotoAktif.value) buka.value = true
}
function tombol(e) {
  if (e.key === 'ArrowLeft') ganti(-1)
  else if (e.key === 'ArrowRight') ganti(1)
}

// Bilah progres baca
let rafId = 0
function hitungProgres() {
  rafId = 0
  const el = document.documentElement
  const sisa = el.scrollHeight - el.clientHeight
  progres.value = sisa > 0 ? Math.min(1, Math.max(0, el.scrollTop / sisa)) : 0
}
function saatGulir() {
  if (!rafId) rafId = requestAnimationFrame(hitungProgres)
}

onMounted(() => {
  gyajok.muat()
  window.addEventListener('scroll', saatGulir, { passive: true })
  hitungProgres()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', saatGulir)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div class="halaman">
    <div class="progres" aria-hidden="true">
      <span :style="{ transform: `scaleX(${progres})` }"></span>
    </div>

    <header class="masthead">
      <div class="masthead-isi">
        <RouterLink to="/" class="judul-situs">Maulana Farras <span>Blog's</span></RouterLink>
        <button
          type="button"
          class="terjemah"
          :title="bahasa.kode === 'id' ? 'Translate to English' : 'Terjemahkan ke Indonesia'"
          @click="bahasa.tukar()"
        >
          <Languages :size="15" aria-hidden="true" />
          <span>{{ bahasa.label }}</span>
        </button>
      </div>
    </header>

    <main v-if="d" class="isi">
      <div class="wadah">
        <!-- Sampul -->
        <section class="sampul">
          <p class="edisi">{{ bahasa.pilih('Studi Kasus Project', 'Project Case Study') }}</p>
          <img v-if="d.logoUrl" :src="d.logoUrl" alt="Logo GyaJokPub" class="logo" />
          <h1>{{ bahasa.pilih(d.kepala.judul.id, d.kepala.judul.en) }}</h1>
          <p class="tagline">Publication Made Simpler</p>
          <p class="ringkas">{{ bahasa.pilih(d.ajakan.teks.id, d.ajakan.teks.en) }}</p>

          <div class="stempel" aria-hidden="true">
            <span>{{ bahasa.pilih('PROSES CEPAT', 'FAST PROCESS') }}</span>
            <i></i>
            <span>{{ bahasa.pilih('AMANAH', 'TRUSTWORTHY') }}</span>
            <i></i>
            <span>{{ bahasa.pilih('TERPERCAYA', 'RELIABLE') }}</span>
          </div>

          <a
            v-if="d.tautan.website"
            :href="d.tautan.website"
            target="_blank"
            rel="noopener noreferrer"
            class="pengesahan"
          >
            {{ bahasa.pilih('Kunjungi Website', 'Visit Website') }}
            <ExternalLink :size="16" aria-hidden="true" />
          </a>
        </section>

        <!-- Galeri: tumpukan kartu -->
        <section v-if="foto.length" class="bagian">
          <h2 class="judul-bagian">
            <span class="no">01</span>
            {{ bahasa.pilih('Galeri', 'Gallery') }}
          </h2>

          <div class="galeri">
            <div
              class="tumpukan"
              tabindex="0"
              :aria-label="
                bahasa.pilih(
                  'Tumpukan foto, gunakan panah kiri dan kanan',
                  'Photo stack, use left and right arrows',
                )
              "
              @pointerdown="turun"
              @pointerup="naik"
              @pointercancel="awalX = null"
              @keydown="tombol"
            >
              <figure
                v-for="(f, i) in foto"
                :key="f.id"
                class="kartu-foto"
                :style="gaya(i)"
                :aria-hidden="i !== aktif"
              >
                <button
                  type="button"
                  class="foto"
                  :tabindex="i === aktif ? 0 : -1"
                  :aria-label="bahasa.pilih('Perbesar foto', 'Enlarge photo')"
                  @click="i === aktif && klikTumpukan()"
                >
                  <img :src="f.kecilUrl" :alt="judulFoto(f)" draggable="false" />
                </button>
              </figure>
            </div>

            <div class="sitasi">
              <button
                v-if="foto.length > 1"
                type="button"
                class="panah"
                :aria-label="bahasa.pilih('Foto sebelumnya', 'Previous photo')"
                @click="ganti(-1)"
              >
                <ChevronLeft :size="20" aria-hidden="true" />
              </button>
              <p class="teks-sitasi">
                <span class="nomor-gambar">
                  {{ bahasa.pilih('Gambar', 'Figure') }} {{ aktif + 1 }}
                  {{ bahasa.pilih('dari', 'of') }} {{ foto.length }}
                </span>
                <span class="ket">{{ judulFoto(fotoAktif) }}</span>
              </p>
              <button
                v-if="foto.length > 1"
                type="button"
                class="panah"
                :aria-label="bahasa.pilih('Foto berikutnya', 'Next photo')"
                @click="ganti(1)"
              >
                <ChevronRight :size="20" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <!-- Alat: daftar isi -->
        <section class="bagian">
          <h2 class="judul-bagian">
            <span class="no">{{ foto.length ? '02' : '01' }}</span>
            {{ bahasa.pilih('Alat dan Pengembangan', 'Tools and Development') }}
          </h2>
          <ol class="daftar-isi">
            <li v-for="(a, i) in d.alat" :key="i" v-muncul="i % 4" class="baris">
              <span class="nomor">{{ dua(i + 1) }}</span>
              <span class="ikon-alat"><IkonDinamis :nama="a.ikon" :ukuran="18" /></span>
              <span class="nama-alat">{{ a.nama }}</span>
              <span class="titik" aria-hidden="true"></span>
              <span class="ket-alat">{{ bahasa.pilih(a.deskripsi.id, a.deskripsi.en) }}</span>
            </li>
          </ol>
        </section>

        <!-- Penutup -->
        <section v-if="d.tautan.website" class="penutup">
          <h3>{{ bahasa.pilih(d.ajakan.judul.id, d.ajakan.judul.en) }}</h3>
          <p>{{ bahasa.pilih(d.ajakan.teks.id, d.ajakan.teks.en) }}</p>
          <a :href="d.tautan.website" target="_blank" rel="noopener noreferrer" class="pengesahan">
            {{ bahasa.pilih('Buka Website', 'Open Website') }}
            <ExternalLink :size="16" aria-hidden="true" />
          </a>
        </section>
      </div>
    </main>

    <main v-else-if="gyajok.galat" class="isi">
      <p class="pesan">
        {{ gyajok.galat }}
        <button type="button" class="coba-lagi" @click="gyajok.muat(true)">
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
   Tema: editorial jurnal akademik. Kertas krem, huruf serif (Georgia), garis tipis, aksen emas. */
.halaman {
  --kertas: #faf6ec;
  --kertas-gelap: #f1ead8;
  --tinta: #1c2b33;
  --navy: #0f4c5c;
  --emas: #b8892b;
  --garis: rgba(28, 43, 51, 0.28);

  min-height: 100vh;
  font-family: Georgia, 'Times New Roman', serif;
  color: var(--tinta);
  background: var(--kertas);
}
.halaman *,
.halaman *::before,
.halaman *::after {
  box-sizing: border-box;
}
h1,
h2,
h3,
p,
ol,
figure {
  margin: 0;
}

/* --- Bilah progres baca --- */
.progres {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  height: 3px;
  background: transparent;
}
.progres span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--navy), var(--emas));
  transform: scaleX(0);
  transform-origin: left;
}

/* --- Masthead --- */
.masthead {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--kertas);
  border-bottom: 3px double var(--garis);
}
.masthead-isi {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  min-height: 52px;
  padding: 0 1rem;
  margin: 0 auto;
}
.judul-situs {
  font-size: 0.95rem;
  font-weight: 700;
  font-style: italic;
  color: var(--navy);
  text-decoration: none;
  white-space: nowrap;
}
.judul-situs span {
  color: var(--emas);
}
.terjemah {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  padding: 0.3rem 0.75rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--navy);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--navy);
  border-radius: 2px;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}
.terjemah:hover {
  color: var(--kertas);
  background: var(--navy);
}

.isi {
  padding: 1.5rem 1rem 3rem;
}
.wadah {
  max-width: 900px;
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
  color: var(--navy);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--navy);
}

/* --- Sampul --- */
.sampul {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0 2.25rem;
  text-align: center;
  border-bottom: 1px solid var(--garis);
}
.edisi {
  margin-bottom: 1.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--emas);
  text-transform: uppercase;
  letter-spacing: 0.25em;
}
.logo {
  display: block;
  max-width: 140px;
  max-height: 90px;
  margin-bottom: 1rem;
  object-fit: contain;
}
.sampul h1 {
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--navy);
}
.tagline {
  margin-top: 0.4rem;
  font-size: 1.05rem;
  font-style: italic;
  color: var(--emas);
}
.ringkas {
  max-width: 32rem;
  margin: 1rem 0 1.5rem;
  font-size: 0.98rem;
  line-height: 1.65;
}
.stempel {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: center;
  justify-content: center;
  width: 128px;
  height: 128px;
  margin-bottom: 1.75rem;
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--emas);
  letter-spacing: 0.14em;
  border: 2px solid var(--emas);
  border-radius: 50%;
  outline: 1px solid var(--emas);
  outline-offset: -7px;
  transform: rotate(-8deg);
}
.stempel i {
  width: 22px;
  height: 1px;
  background: var(--emas);
}
.pengesahan {
  display: inline-flex;
  gap: 0.55rem;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.6rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--kertas);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--navy);
  border: 2px solid var(--navy);
  outline: 1px solid var(--navy);
  outline-offset: 3px;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}
.pengesahan:hover {
  color: var(--navy);
  background: transparent;
}

/* --- Judul bagian --- */
.bagian {
  margin-top: 2.5rem;
}
.judul-bagian {
  display: flex;
  gap: 0.7rem;
  align-items: baseline;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--navy);
  border-bottom: 1px solid var(--garis);
}
.judul-bagian .no {
  font-size: 0.85rem;
  font-style: italic;
  font-weight: 400;
  color: var(--emas);
  letter-spacing: 0.1em;
}

/* --- Galeri: tumpukan kartu --- */
.galeri {
  max-width: 560px;
  margin: 0 auto;
}
.tumpukan {
  position: relative;
  aspect-ratio: 4 / 3;
  margin: 0 18px 34px;
  touch-action: pan-y;
  outline-offset: 6px;
}
.kartu-foto {
  position: absolute;
  inset: 0;
  padding: 8px;
  background: #fff;
  border: 1px solid var(--garis);
  box-shadow: 0 8px 22px rgba(28, 43, 51, 0.22);
  transition:
    transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.35s ease;
}
.foto {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  cursor: zoom-in;
  background: var(--kertas-gelap);
  border: 0;
}
.foto img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
}
.sitasi {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--garis);
}
.teks-sitasi {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  text-align: center;
}
.nomor-gambar {
  font-size: 0.72rem;
  font-style: italic;
  color: var(--emas);
  letter-spacing: 0.08em;
}
.ket {
  font-size: 0.92rem;
  line-height: 1.4;
}
.panah {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  color: var(--navy);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--navy);
  border-radius: 50%;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}
.panah:hover {
  color: var(--kertas);
  background: var(--navy);
}

/* --- Alat: daftar isi --- */
.daftar-isi {
  padding: 0;
  list-style: none;
}
.baris {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 0.6rem;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--garis);
  transition: background 0.25s ease;
}
.baris:hover {
  background: rgba(184, 137, 43, 0.14);
}
.nomor {
  min-width: 1.6rem;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--emas);
}
.ikon-alat {
  display: inline-grid;
  place-items: center;
  color: var(--navy);
}
.nama-alat {
  font-size: 1.02rem;
  font-weight: 700;
}
.titik {
  display: none;
}
.ket-alat {
  flex-basis: 100%;
  padding-left: 2.2rem;
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(28, 43, 51, 0.78);
}

/* --- Penutup --- */
.penutup {
  padding: 1.75rem 1rem 0;
  margin-top: 3rem;
  text-align: center;
  border-top: 3px double var(--garis);
}
.penutup h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--navy);
}
.penutup p {
  max-width: 30rem;
  margin: 0.6rem auto 1.4rem;
  font-size: 0.95rem;
  line-height: 1.6;
}

@media (prefers-reduced-motion: reduce) {
  .kartu-foto,
  .baris,
  .pengesahan,
  .terjemah,
  .panah {
    transition: none;
  }
}

/* >= 641px: TABLET */
@media (min-width: 641px) {
  .masthead-isi {
    min-height: 58px;
    padding: 0 1.5rem;
  }
  .judul-situs {
    font-size: 1.1rem;
  }
  .isi {
    padding: 2rem 1.5rem 3.5rem;
  }
  .sampul h1 {
    font-size: 3.1rem;
  }
  .ringkas {
    font-size: 1.05rem;
  }
  .logo {
    max-width: 170px;
    max-height: 110px;
  }
  .judul-bagian {
    font-size: 1.6rem;
  }
  .tumpukan {
    margin: 0 26px 40px;
  }
  .ket {
    font-size: 1rem;
  }
  .nama-alat {
    font-size: 1.1rem;
  }
}

/* >= 768px: DESKTOP. Daftar isi satu baris dengan titik penghubung. */
@media (min-width: 768px) {
  .stempel {
    width: 144px;
    height: 144px;
    font-size: 0.68rem;
  }
  .sampul h1 {
    font-size: 3.6rem;
  }
  .baris {
    flex-wrap: nowrap;
    gap: 0.7rem;
    padding: 0.85rem 0.75rem;
  }
  .titik {
    display: block;
    flex: 1;
    min-width: 1.5rem;
    height: 1px;
    align-self: flex-end;
    margin-bottom: 0.45rem;
    border-bottom: 2px dotted var(--garis);
  }
  .ket-alat {
    flex: 0 1 46%;
    padding-left: 0;
    font-size: 0.88rem;
    text-align: right;
  }
}

/* >= 1024px: DESKTOP LEBAR */
@media (min-width: 1024px) {
  .wadah {
    max-width: 980px;
  }
  .galeri {
    max-width: 620px;
  }
}
</style>
