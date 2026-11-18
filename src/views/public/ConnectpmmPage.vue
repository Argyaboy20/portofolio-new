<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Images,
  Languages,
  MessageCircle,
  Search,
  ShieldCheck,
  User,
} from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import PenampilFoto from '../../components/PenampilFoto.vue'
import { vMuncul } from '../../utils/muncul'
import { useBahasaStore } from '../../stores/bahasa'
import { useConnectpmmStore } from '../../stores/connectpmm'

const bahasa = useBahasaStore()
const connectpmm = useConnectpmmStore()

onMounted(() => connectpmm.muat())

const d = computed(() => connectpmm.data)
const foto = computed(() => d.value?.foto ?? [])
const aktif = ref(0)
const buka = ref(false)
const alatDipilih = ref(0)

const fotoAktif = computed(() => foto.value[aktif.value] ?? null)
const fotoBuka = computed(() => (buka.value ? fotoAktif.value : null))
const judulFoto = (f) => (f ? bahasa.pilih(f.judulId, f.judulEn) : '')
const alatTerpilih = computed(() => d.value?.alat?.[alatDipilih.value] ?? null)

// Isi statis dari handoff PMM Connect (ID, EN)
const PERAN = [
  {
    kunci: 'umum',
    ikon: User,
    nama: ['Umum', 'General'],
    teks: [
      'Berbagi foto dan tulisan, berkomentar, mengikuti, dan membuat Story.',
      'Share photos and posts, comment, follow, and create Stories.',
    ],
  },
  {
    kunci: 'peserta',
    ikon: GraduationCap,
    nama: ['Peserta', 'Participant'],
    teks: [
      'Semua fitur Umum, ditambah membuat Laporan Kegiatan dan mengunduhnya sebagai PDF.',
      'Everything General users can do, plus writing Activity Reports and downloading them as PDF.',
    ],
  },
  {
    kunci: 'koordinator',
    ikon: ShieldCheck,
    nama: ['Koordinator', 'Coordinator'],
    teks: [
      'Memverifikasi pendaftar, menyetujui laporan, dan memoderasi konten.',
      'Verifies sign-ups, approves reports, and moderates content.',
    ],
  },
]
const FITUR = [
  { ikon: Images, nama: ['Feed Post dan Connex', 'Post and Connex feed'] },
  { ikon: Clock, nama: ['Story 24 jam', '24-hour Stories'] },
  { ikon: MessageCircle, nama: ['Komentar dan Pesan', 'Comments and Messages'] },
  { ikon: Bell, nama: ['Notifikasi', 'Notifications'] },
  { ikon: Search, nama: ['Pencarian', 'Search'] },
  { ikon: FileText, nama: ['Laporan Kegiatan', 'Activity Reports'] },
  { ikon: ShieldCheck, nama: ['Moderasi otomatis', 'Automatic moderation'] },
]
const t = (pasangan) => bahasa.pilih(pasangan[0], pasangan[1])

function ganti(arah) {
  const n = foto.value.length
  if (n < 2) return
  aktif.value = (aktif.value + arah + n) % n
}

// Posisi relatif ponsel terhadap yang aktif, melingkar: 0 = tengah
function offset(i) {
  const n = foto.value.length
  const setengah = Math.floor(n / 2)
  return ((i - aktif.value + n + setengah) % n) - setengah
}
function gaya(i) {
  const o = offset(i)
  const a = Math.abs(o)
  if (a > 2)
    return { opacity: 0, pointerEvents: 'none', transform: 'translateX(0) scale(0.5)', zIndex: 0 }
  return {
    zIndex: 10 - a,
    opacity: a === 0 ? 1 : a === 1 ? 0.92 : 0.55,
    transform: `translateX(${o * 64}%) scale(${a === 0 ? 1 : a === 1 ? 0.8 : 0.62}) rotateY(${o * -18}deg)`,
  }
}

// Geser jari atau mouse
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
function klikPonsel(i) {
  if (digeser) {
    digeser = false
    return
  }
  if (i === aktif.value) buka.value = true
  else aktif.value = i
}
function tombol(e) {
  if (e.key === 'ArrowLeft') ganti(-1)
  else if (e.key === 'ArrowRight') ganti(1)
}
</script>

<template>
  <div class="halaman">
    <header class="bilah">
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
      <!-- Hero -->
      <section class="hero">
        <span class="gelembung g1" aria-hidden="true"></span>
        <span class="gelembung g2" aria-hidden="true"></span>
        <div class="hero-isi">
          <p class="label">{{ bahasa.pilih('Aplikasi Komunitas', 'Community App') }}</p>
          <h1>{{ bahasa.pilih(d.kepala.judul.id, d.kepala.judul.en) }}</h1>
          <p class="tagline">{{ bahasa.pilih(d.ajakan.teks.id, d.ajakan.teks.en) }}</p>
          <a
            v-if="d.tautan.website"
            :href="d.tautan.website"
            target="_blank"
            rel="noopener noreferrer"
            class="tombol"
          >
            {{ bahasa.pilih('Kunjungi Aplikasi', 'Visit the App') }}
            <ExternalLink :size="16" aria-hidden="true" />
          </a>
        </div>
      </section>

      <div class="wadah">
        <!-- Galeri: coverflow ponsel -->
        <section v-if="foto.length" class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Tampilan Aplikasi', 'App Screens') }}</h2>
          <div
            class="panggung"
            tabindex="0"
            :aria-label="
              bahasa.pilih(
                'Galeri tampilan aplikasi, gunakan panah kiri dan kanan',
                'App screens gallery, use left and right arrows',
              )
            "
            @pointerdown="turun"
            @pointerup="naik"
            @pointercancel="awalX = null"
            @keydown="tombol"
          >
            <button
              v-for="(f, i) in foto"
              :key="f.id"
              type="button"
              class="ponsel"
              :class="{ jauh: Math.abs(offset(i)) === 2 }"
              :style="gaya(i)"
              :tabindex="i === aktif ? 0 : -1"
              :aria-label="
                i === aktif
                  ? bahasa.pilih('Perbesar foto', 'Enlarge photo')
                  : bahasa.pilih('Lihat foto ', 'View photo ') + (i + 1)
              "
              @click="klikPonsel(i)"
            >
              <span class="takik" aria-hidden="true"></span>
              <img :src="f.kecilUrl" :alt="judulFoto(f)" draggable="false" />
            </button>
          </div>

          <div class="kontrol">
            <button
              v-if="foto.length > 1"
              type="button"
              class="panah"
              :aria-label="bahasa.pilih('Foto sebelumnya', 'Previous photo')"
              @click="ganti(-1)"
            >
              <ChevronLeft :size="20" aria-hidden="true" />
            </button>
            <p class="teks-foto">
              <span v-if="foto.length > 1" class="hitung">{{ aktif + 1 }} / {{ foto.length }}</span>
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
        </section>

        <!-- Peran -->
        <section class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Tiga Jenis Akun', 'Three Account Types') }}</h2>
          <div class="grid-peran">
            <article v-for="p in PERAN" :key="p.kunci" v-muncul class="peran" :class="p.kunci">
              <span class="ikon-peran"
                ><component :is="p.ikon" :size="22" aria-hidden="true"
              /></span>
              <h3>{{ t(p.nama) }}</h3>
              <p>{{ t(p.teks) }}</p>
            </article>
          </div>
        </section>

        <!-- Fitur -->
        <section class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Fitur Utama', 'Key Features') }}</h2>
          <ul class="grid-fitur">
            <li v-for="(f, i) in FITUR" :key="i" v-muncul="i % 4" class="fitur">
              <component :is="f.ikon" :size="20" aria-hidden="true" />
              <span>{{ t(f.nama) }}</span>
            </li>
          </ul>
        </section>

        <!-- Alat -->
        <section class="bagian">
          <h2 class="judul-bagian">
            {{ bahasa.pilih('Alat Pengembangan', 'Development Tools') }}
          </h2>
          <div class="jalur-alat">
            <button
              v-for="(a, i) in d.alat"
              :key="i"
              type="button"
              class="chip"
              :class="{ aktif: i === alatDipilih }"
              :aria-pressed="i === alatDipilih"
              @click="alatDipilih = i"
              @mouseenter="alatDipilih = i"
            >
              <IkonDinamis :nama="a.ikon" :ukuran="18" />
              <span>{{ a.nama }}</span>
            </button>
          </div>
          <p v-if="alatTerpilih" class="ket-alat" aria-live="polite">
            <strong>{{ alatTerpilih.nama }}</strong>
            {{ bahasa.pilih(alatTerpilih.deskripsi.id, alatTerpilih.deskripsi.en) }}
          </p>
        </section>
      </div>
    </main>

    <main v-else-if="connectpmm.galat" class="isi">
      <p class="pesan">
        {{ connectpmm.galat }}
        <button type="button" class="coba-lagi" @click="connectpmm.muat(true)">
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
   Warna mengikuti globals.css PMM Connect: gradien merek biru-keunguan ke ungu. */
.halaman {
  --dari: oklch(0.62 0.17 272);
  --ke: oklch(0.46 0.14 305);
  --lavender: oklch(0.975 0.012 285);
  --tinta: oklch(0.25 0.04 290);
  --lebar: 190px;

  min-height: 100vh;
  color: var(--tinta);
  background: var(--lavender);
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
ul {
  margin: 0;
}

/* --- Header --- */
.bilah {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 0.75rem 0 1rem;
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid oklch(0.9 0.02 285);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
.judul-situs {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ke);
  text-decoration: none;
  white-space: nowrap;
}
.judul-situs span {
  color: var(--dari);
}
.terjemah {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.4rem 0.85rem;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, var(--dari), var(--ke));
  border: 0;
  border-radius: 999px;
}
.terjemah:hover {
  filter: brightness(1.08);
}

.pesan {
  padding: 3rem 1rem;
  text-align: center;
}
.coba-lagi {
  margin-left: 0.5rem;
  padding: 0.3rem 0.9rem;
  font: inherit;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--dari);
  border-radius: 999px;
}

/* --- Hero --- */
.hero {
  position: relative;
  padding: 2.75rem 1.25rem 3.25rem;
  overflow: hidden;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, var(--dari), var(--ke));
}
.gelembung {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  pointer-events: none;
}
.g1 {
  top: -60px;
  right: -50px;
  width: 190px;
  height: 190px;
}
.g2 {
  bottom: -70px;
  left: -40px;
  width: 150px;
  height: 150px;
}
.hero-isi {
  position: relative;
  max-width: 40rem;
  margin: 0 auto;
}
.label {
  display: inline-block;
  padding: 0.25rem 0.8rem;
  margin-bottom: 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
}
.hero h1 {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.1;
}
.tagline {
  margin: 0.9rem 0 1.5rem;
  font-size: 0.98rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.92);
}
.tombol {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.6rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ke);
  text-decoration: none;
  background: #fff;
  border-radius: 999px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}
.tombol:hover {
  transform: translateY(-2px);
}

.isi {
  padding-bottom: 3rem;
}
.wadah {
  max-width: 1000px;
  padding: 0 1rem;
  margin: 0 auto;
}
.bagian {
  margin-top: 2.75rem;
}
.judul-bagian {
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 800;
  text-align: center;
  background: linear-gradient(135deg, var(--dari), var(--ke));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* --- Galeri: coverflow ponsel --- */
.panggung {
  position: relative;
  height: calc(var(--lebar) * 2.1 + 30px);
  margin: 0 auto;
  overflow: hidden;
  perspective: 1000px;
  touch-action: pan-y;
  outline-offset: 4px;
}
.ponsel {
  position: absolute;
  top: 15px;
  left: 50%;
  width: var(--lebar);
  aspect-ratio: 9 / 19;
  padding: 7px;
  margin-left: calc(var(--lebar) / -2);
  cursor: pointer;
  background: oklch(0.2 0.03 290);
  border: 0;
  border-radius: 30px;
  box-shadow: 0 18px 36px rgba(60, 40, 110, 0.35);
  transition:
    transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.4s ease;
}
.ponsel img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  background: #fff;
  border-radius: 23px;
  user-select: none;
}
.takik {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 2;
  width: 34%;
  height: 6px;
  background: oklch(0.2 0.03 290);
  border-radius: 999px;
  transform: translateX(-50%);
}
.ponsel.jauh {
  display: none;
}
.kontrol {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  justify-content: space-between;
  max-width: 440px;
  margin: 1rem auto 0;
}
.teks-foto {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  min-width: 0;
  text-align: center;
}
.hitung {
  padding: 0.12rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--ke);
  background: oklch(0.93 0.04 290);
  border-radius: 999px;
}
.ket {
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.35;
}
.panah {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, var(--dari), var(--ke));
  border: 0;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(80, 50, 140, 0.3);
}
.panah:hover {
  filter: brightness(1.1);
}

/* --- Peran --- */
.grid-peran {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.peran {
  padding: 1.25rem;
  background: #fff;
  border: 1px solid oklch(0.92 0.02 285);
  border-radius: 18px;
  box-shadow: 0 6px 16px rgba(60, 40, 110, 0.07);
}
.ikon-peran {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 0.75rem;
  border-radius: 50%;
}
.peran h3 {
  margin-bottom: 0.35rem;
  font-size: 1.05rem;
  font-weight: 800;
}
.peran p {
  font-size: 0.88rem;
  line-height: 1.55;
  color: oklch(0.45 0.03 290);
}
.peran.umum .ikon-peran {
  color: oklch(0.45 0 0);
  background: oklch(0.94 0 0);
}
.peran.peserta .ikon-peran {
  color: oklch(0.42 0.14 250);
  background: oklch(0.92 0.05 245);
}
.peran.koordinator .ikon-peran {
  color: oklch(0.4 0.1 165);
  background: oklch(0.9 0.09 165);
}

/* --- Fitur --- */
.grid-fitur {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0;
  list-style: none;
}
.fitur {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  padding: 0.8rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ke);
  background: #fff;
  border: 1px solid oklch(0.92 0.02 285);
  border-radius: 14px;
}
.fitur span {
  color: var(--tinta);
}

/* --- Alat: chip --- */
.jalur-alat {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.chip {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  padding: 0.5rem 0.9rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ke);
  cursor: pointer;
  background: #fff;
  border: 1px solid oklch(0.88 0.04 285);
  border-radius: 999px;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}
.chip:hover {
  transform: translateY(-2px);
}
.chip.aktif {
  color: #fff;
  background: linear-gradient(135deg, var(--dari), var(--ke));
  border-color: transparent;
}
.ket-alat {
  max-width: 34rem;
  min-height: 3.2rem;
  padding: 0.9rem 1rem;
  margin: 1.1rem auto 0;
  font-size: 0.9rem;
  line-height: 1.55;
  text-align: center;
  background: #fff;
  border: 1px dashed oklch(0.8 0.07 285);
  border-radius: 14px;
}
.ket-alat strong {
  display: block;
  margin-bottom: 0.15rem;
  color: var(--ke);
}

@media (prefers-reduced-motion: reduce) {
  .ponsel,
  .chip,
  .tombol {
    transition: none;
  }
}

/* >= 641px: TABLET */
@media (min-width: 641px) {
  .halaman {
    --lebar: 220px;
  }
  .bilah {
    padding: 0 1.25rem;
  }
  .judul-situs {
    font-size: 1.05rem;
  }
  .hero {
    padding: 3.5rem 2rem 4rem;
  }
  .hero h1 {
    font-size: 3rem;
  }
  .tagline {
    font-size: 1.08rem;
  }
  .wadah {
    padding: 0 1.5rem;
  }
  .judul-bagian {
    font-size: 1.7rem;
  }
  .ponsel.jauh {
    display: block;
  }
  .grid-peran {
    grid-template-columns: repeat(3, 1fr);
  }
  .grid-fitur {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* >= 768px: DESKTOP */
@media (min-width: 768px) {
  .halaman {
    --lebar: 250px;
  }
  .hero {
    padding: 4.25rem 2rem 4.75rem;
  }
  .hero h1 {
    font-size: 3.6rem;
  }
  .grid-fitur {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* >= 1024px: DESKTOP LEBAR */
@media (min-width: 1024px) {
  .halaman {
    --lebar: 270px;
  }
  .g1 {
    width: 300px;
    height: 300px;
  }
  .g2 {
    width: 240px;
    height: 240px;
  }
}
</style>
