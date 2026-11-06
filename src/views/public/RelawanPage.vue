<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BookOpen, Clock, Heart, HeartHandshake, Languages, Sparkles } from '@lucide/vue'
import ModalGaleriRelawan from '../../components/ModalGaleriRelawan.vue'
import { useBahasaStore } from '../../stores/bahasa'
import { useRelawanStore } from '../../stores/relawan'

const bahasa = useBahasaStore()
const relawan = useRelawanStore()

onMounted(() => relawan.muat())

const daftar = computed(() => relawan.data?.relawan ?? [])
const galat = computed(() => relawan.galat)
const terpilih = ref(null) // pengalaman yang galerinya sedang dibuka
const tahun = new Date().getFullYear()
const butir = (s) =>
  (s ?? '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)

// Ikon melayang di latar: posisi, ukuran, dan jeda tetap supaya tidak berubah tiap render
const LATAR = [
  { j: 'hati', x: 6, y: 12, u: 34, d: 0 },
  { j: 'buku', x: 88, y: 8, u: 40, d: 2 },
  { j: 'tangan', x: 20, y: 36, u: 38, d: 4 },
  { j: 'hati', x: 78, y: 30, u: 28, d: 1 },
  { j: 'buku', x: 8, y: 60, u: 36, d: 3 },
  { j: 'tangan', x: 90, y: 56, u: 42, d: 5 },
  { j: 'hati', x: 30, y: 82, u: 32, d: 2 },
  { j: 'buku', x: 70, y: 84, u: 30, d: 4 },
  { j: 'tangan', x: 50, y: 18, u: 26, d: 6 },
  { j: 'hati', x: 55, y: 66, u: 36, d: 1 },
]
const WARNA = ['#6da0e1', '#ede2e0', '#ff7e67']
const IKON_LATAR = { hati: Heart, buku: BookOpen, tangan: HeartHandshake }
</script>

<template>
  <div class="halaman">
    <div class="latar" aria-hidden="true">
      <span
        v-for="(l, i) in LATAR"
        :key="i"
        class="melayang"
        :style="{
          left: l.x + '%',
          top: l.y + '%',
          color: WARNA[i % WARNA.length],
          animationDelay: -l.d + 's',
        }"
      >
        <component :is="IKON_LATAR[l.j]" :size="l.u" />
      </span>
    </div>

    <header class="bilah">
      <RouterLink to="/" class="judul-situs">Maulana Farras Blog's</RouterLink>
      <button
        type="button"
        class="terjemah"
        :title="bahasa.kode === 'id' ? 'Translate to English' : 'Terjemahkan ke Indonesia'"
        @click="bahasa.tukar()"
      >
        <span class="ikon-terjemah"><Languages :size="16" aria-hidden="true" /></span>
        <span class="teks-terjemah">{{ bahasa.label }}</span>
      </button>
    </header>

    <main v-if="relawan.data" class="isi">
      <div class="wadah">
        <h1 class="judul">{{ bahasa.pilih('Pengalaman Relawan', 'Volunteer Experience') }}</h1>

        <article v-for="r in daftar" :key="r.id" class="kartu">
          <h2 class="posisi">
            {{ bahasa.pilih('Posisi: ', 'Position: ') }}{{ bahasa.pilih(r.posisiId, r.posisiEn) }}
          </h2>
          <p class="organisasi">
            {{ bahasa.pilih('Organisasi: ', 'Organization: ') }}{{ r.organisasi }}
          </p>
          <p class="periode">
            <Clock :size="14" aria-hidden="true" />
            {{ bahasa.pilih('Periode: ', 'Period: ') }}{{ bahasa.pilih(r.periodeId, r.periodeEn) }}
          </p>

          <ul v-if="r.bentuk === 'daftar'" class="deskripsi daftar">
            <li v-for="(b, i) in butir(bahasa.pilih(r.deskripsiId, r.deskripsiEn))" :key="i">
              <Sparkles :size="14" class="bintang" aria-hidden="true" />
              <span>{{ b }}</span>
            </li>
          </ul>
          <p v-else class="deskripsi paragraf">{{ bahasa.pilih(r.deskripsiId, r.deskripsiEn) }}</p>

          <button type="button" class="galeri" :disabled="!r.foto.length" @click="terpilih = r">
            {{ bahasa.pilih('Lihat Galeri Foto', 'View Photo Gallery') }}
          </button>
        </article>

        <p v-if="!daftar.length" class="kosong">
          {{ bahasa.pilih('Belum ada pengalaman.', 'No experience yet.') }}
        </p>

        <footer class="kaki">
          <p>
            © {{ tahun }} -
            {{ bahasa.pilih('Portofolio Pengalaman Relawan', 'Volunteer Experience Portfolio') }}
          </p>
        </footer>
      </div>
    </main>

    <main v-else-if="galat" class="isi">
      <p class="pesan">
        {{ galat }}
        <button type="button" class="coba-lagi" @click="relawan.muat(true)">
          {{ bahasa.pilih('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>

    <ModalGaleriRelawan :item="terpilih" @tutup="terpilih = null" />
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop, 1024px desktop lebar. */
.halaman {
  --utama: #5b62b3;
  --sekunder: #6da0e1;
  --terang: #f7f4f3;
  --aksen: #ff7e67;

  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--terang);
  background: var(--utama);
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

/* --- Latar ikon melayang --- */
.latar {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.melayang {
  position: absolute;
  opacity: 0.35;
  animation: melayang 14s ease-in-out infinite;
}
@keyframes melayang {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(14px, -22px) rotate(10deg);
  }
  50% {
    transform: translate(-10px, -34px) rotate(-8deg);
  }
  75% {
    transform: translate(-18px, -12px) rotate(6deg);
  }
}

/* --- Header --- */
.bilah {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0 0.5rem 0 1rem;
  background: rgba(91, 98, 179, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(14px);
}
.judul-situs {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
}
.judul-situs:hover {
  color: var(--sekunder);
}
.terjemah {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 2rem;
  padding: 0 0.75rem 0 0.25rem;
  font: inherit;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  transition: transform 0.25s ease;
}
.terjemah:hover {
  transform: translateY(-1px);
}
.terjemah:active {
  transform: scale(0.96);
}
.ikon-terjemah {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--utama);
  background: #fff;
  border-radius: 50%;
}
.teks-terjemah {
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.06em;
}

.isi {
  position: relative;
  z-index: 1;
}
.wadah {
  max-width: 1200px;
  padding: 0.75rem 0.75rem 1.5rem;
  margin: 0 auto;
}
.judul {
  margin: 0.4rem 0 0.9rem;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(45deg, var(--sekunder), var(--terang));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.pesan,
.kosong {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--terang);
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

/* --- Kartu pengalaman --- */
.kartu {
  position: relative;
  padding: 1rem;
  margin: 0.6rem 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
}
.kartu::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--sekunder), var(--aksen));
}
.kartu:hover {
  background: rgba(255, 255, 255, 0.11);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}
.posisi {
  margin-bottom: 0.3rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
}
.organisasi {
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #ffb3a6;
}
.periode {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
  font-size: 0.72rem;
  opacity: 0.85;
}
.deskripsi {
  font-size: 0.78rem;
  line-height: 1.5;
  color: #fff;
}
.daftar {
  padding: 0;
  margin: 0;
  list-style: none;
}
.daftar li {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-bottom: 0.4rem;
}
.bintang {
  flex-shrink: 0;
  margin-top: 0.15rem;
  color: var(--sekunder);
}
.paragraf {
  text-align: justify;
}
.galeri {
  width: 100%;
  padding: 0.65rem 1rem;
  margin-top: 0.9rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  background: #3880ff;
  border: 0;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: filter 0.2s ease;
}
.galeri:hover:not(:disabled) {
  filter: brightness(1.1);
}
.galeri:disabled {
  cursor: default;
  opacity: 0.45;
}
.kaki {
  padding: 0.6rem;
  margin-top: 1.5rem;
  font-size: 0.65rem;
  text-align: center;
  opacity: 0.7;
}

@media (prefers-reduced-motion: reduce) {
  .melayang {
    animation: none;
  }
  .kartu,
  .terjemah,
  .galeri {
    transition: none;
  }
}

/* >= 641px: TABLET. Header ke tengah, kartu lebih lega. */
@media (min-width: 641px) {
  .bilah {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    min-height: 56px;
    padding: 0 0.75rem;
  }
  .judul-situs {
    grid-column: 2;
    font-size: 1.05rem;
  }
  .terjemah {
    grid-column: 3;
    justify-self: end;
  }
  .wadah {
    max-width: 95%;
    padding: 1.2rem 1rem 2rem;
  }
  .judul {
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }
  .kartu {
    padding: 1.4rem;
    margin: 1rem 0 1.5rem;
    border-radius: 12px;
  }
  .kartu::before {
    height: 4px;
  }
  .posisi {
    font-size: 1.2rem;
  }
  .organisasi {
    font-size: 1rem;
  }
  .periode {
    font-size: 0.8rem;
  }
  .deskripsi {
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .galeri {
    margin-top: 1rem;
    font-size: 0.85rem;
  }
  .kaki {
    margin-top: 2rem;
    font-size: 0.7rem;
  }
}

/* >= 768px: DESKTOP. */
@media (min-width: 768px) {
  .bilah {
    min-height: 60px;
  }
  .judul-situs {
    font-size: 1.15rem;
  }
  .wadah {
    max-width: 1200px;
    padding: 2rem;
  }
  .judul {
    margin-bottom: 2rem;
    font-size: 2.5rem;
  }
  .kartu {
    margin-bottom: 2rem;
    border-radius: 16px;
  }
  .kartu::before {
    height: 5px;
  }
  .posisi {
    font-size: 1.5rem;
  }
  .organisasi {
    font-size: 1.2rem;
  }
  .periode {
    font-size: 0.9rem;
  }
  .deskripsi {
    font-size: 1rem;
  }
  .paragraf {
    line-height: 1.8;
  }
  .kaki {
    margin-top: 3rem;
    font-size: 0.8rem;
  }
}

/* >= 1024px: DESKTOP LEBAR. */
@media (min-width: 1024px) {
  .wadah {
    max-width: 1280px;
    padding: 2.5rem;
  }
  .judul {
    margin-bottom: 2.5rem;
    font-size: 3rem;
  }
  .posisi {
    font-size: 1.65rem;
  }
  .organisasi {
    font-size: 1.3rem;
  }
  .periode {
    font-size: 1rem;
  }
  .deskripsi {
    font-size: 1.05rem;
  }
  .paragraf {
    line-height: 1.85;
  }
  .kaki {
    font-size: 0.85rem;
  }
}
</style>
