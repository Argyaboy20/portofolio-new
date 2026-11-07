<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Camera, Languages, Music, X } from '@lucide/vue'
import ModalFotoGaleri from '../../components/ModalFotoGaleri.vue'
import { useBahasaStore } from '../../stores/bahasa'
import { useGaleriKehidupanStore } from '../../stores/galeriKehidupan'

const bahasa = useBahasaStore()
const galeri = useGaleriKehidupanStore()

onMounted(() => galeri.muat())

const TAB = [
  { kode: 'cerita-hidup', id: 'Cerita Hidup', en: 'Life Stories' },
  { kode: 'pmm-life', id: 'Kisah PMM', en: 'PMM Story' },
]
const tab = ref(TAB[0].kode)
const terpilih = ref(null) // foto yang modalnya sedang dibuka
const laguBuka = ref(false)
const tahun = new Date().getFullYear()

const galat = computed(() => galeri.galat)
const lagu = computed(() => galeri.data?.lagu ?? null)
const tinggiLagu = computed(() => (lagu.value?.embedUrl.includes('spotify.com') ? 152 : 200))
const foto = computed(() => (galeri.data?.foto ?? []).filter((f) => f.kategori === tab.value))

const tanggal = (s) =>
  new Intl.DateTimeFormat(bahasa.kode === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${s}T00:00:00Z`))
</script>

<template>
  <div class="halaman">
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

    <section class="hero">
      <div class="logo"><Camera :size="22" aria-hidden="true" /></div>
      <h1 class="judul">{{ bahasa.pilih('Galeri Kehidupan', 'Life Gallery') }}</h1>
      <p class="sub">{{ bahasa.pilih('Abadikan Momen-Momenku', 'Capture My Moments') }}</p>

      <div v-if="lagu" class="lagu">
        <button type="button" class="chip" :aria-expanded="laguBuka" @click="laguBuka = !laguBuka">
          <Music :size="16" aria-hidden="true" />
          <span class="chip-teks">
            <strong>{{ lagu.judul }}</strong>
            <small>{{ lagu.artis }}</small>
          </span>
          <X v-if="laguBuka" :size="14" aria-hidden="true" />
        </button>
        <!-- Pemutar baru dimuat setelah chip diklik -->
        <iframe
          v-if="laguBuka"
          class="pemutar"
          :src="lagu.embedUrl"
          :height="tinggiLagu"
          :title="lagu.judul + ' - ' + lagu.artis"
          loading="lazy"
          allow="autoplay; encrypted-media; clipboard-write"
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      </div>
    </section>

    <main v-if="galeri.data" class="isi">
      <div class="wadah">
        <div class="tab-baris" role="tablist">
          <button
            v-for="t in TAB"
            :key="t.kode"
            type="button"
            role="tab"
            class="tab"
            :class="{ aktif: tab === t.kode }"
            :aria-selected="tab === t.kode"
            @click="tab = t.kode"
          >
            {{ bahasa.pilih(t.id, t.en) }}
          </button>
        </div>

        <Transition name="pudar" mode="out-in">
          <div :key="tab" class="grid">
            <button v-for="f in foto" :key="f.id" type="button" class="foto" @click="terpilih = f">
              <span class="dalam">
                <span class="depan">
                  <img :src="f.kecilUrl" :alt="bahasa.pilih(f.judulId, f.judulEn)" loading="lazy" />
                  <span class="nama">{{ bahasa.pilih(f.judulId, f.judulEn) }}</span>
                </span>
                <span class="belakang">
                  <span class="tgl">{{ tanggal(f.tanggal) }}</span>
                  <span class="desk">{{ bahasa.pilih(f.deskripsiId, f.deskripsiEn) }}</span>
                </span>
              </span>
            </button>
          </div>
        </Transition>

        <p v-if="!foto.length" class="kosong">
          {{ bahasa.pilih('Belum ada foto.', 'No photos yet.') }}
        </p>

        <footer class="kaki">
          <p>© {{ tahun }} - {{ bahasa.pilih('Galeri Kehidupan', 'Life Gallery') }}</p>
        </footer>
      </div>
    </main>

    <main v-else-if="galat" class="isi">
      <p class="pesan">
        {{ galat }}
        <button type="button" class="coba-lagi" @click="galeri.muat(true)">
          {{ bahasa.pilih('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>

    <ModalFotoGaleri :item="terpilih" @tutup="terpilih = null" />
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop, 1024px desktop lebar. */
.halaman {
  --utama: #5b62b3;
  --sekunder: #6da0e1;
  --terang: #f7f4f3;

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
p {
  margin: 0;
}

/* --- Bilah atas (sama dengan halaman lain) --- */
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

/* --- Hero --- */
.hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.4rem 1rem 1.6rem;
  text-align: center;
  background: linear-gradient(135deg, #6366f1, #3b82f6);
}
.logo {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 0.6rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.judul {
  font-size: 1.45rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}
.sub {
  margin-top: 0.3rem;
  font-size: 0.8rem;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.9);
}
.lagu {
  width: 100%;
  max-width: 420px;
  margin-top: 0.9rem;
}
.chip {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.35rem 0.9rem 0.35rem 0.7rem;
  font: inherit;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border: 0;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}
.chip-teks {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.25;
}
.chip-teks strong {
  font-size: 0.75rem;
}
.chip-teks small {
  font-size: 0.65rem;
  opacity: 0.85;
}
.pemutar {
  display: block;
  width: 100%;
  margin-top: 0.7rem;
  border: 0;
  border-radius: 12px;
}

/* --- Isi --- */
.isi {
  position: relative;
  z-index: 1;
}
.wadah {
  max-width: 1200px;
  padding: 0.9rem 0.75rem 1.5rem;
  margin: 0 auto;
}
.pesan,
.kosong {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--terang);
}
.coba-lagi {
  padding: 0.3rem 0.9rem;
  margin-left: 0.5rem;
  font: inherit;
  color: #fff;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
}

/* --- Tab --- */
.tab-baris {
  display: flex;
  gap: 0.4rem;
  padding: 0.25rem;
  margin: 0 auto 1rem;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
}
.tab {
  flex: 1;
  padding: 0.55rem 0.8rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 999px;
  transition: background 0.25s ease;
}
.tab.aktif {
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

/* --- Grid kartu --- */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}
.pudar-enter-active,
.pudar-leave-active {
  transition: opacity 0.2s ease;
}
.pudar-enter-from,
.pudar-leave-to {
  opacity: 0;
}
.foto {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: none;
  border: 0;
  aspect-ratio: 1;
  perspective: 1000px;
}
.dalam {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
}
.depan,
.belakang {
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
  border-radius: 12px;
  backface-visibility: hidden;
}
.depan {
  background: #4a5099;
}
.depan img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.nama {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 1.6rem 0.6rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.3;
  color: #fff;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}
.belakang {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.8rem;
  background: linear-gradient(145deg, #6366f1, #3b82f6);
  transform: rotateY(180deg);
}
.tgl {
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
}
.desk {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.78rem;
  line-height: 1.5;
  color: #fff;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
}
/* Putar kartu hanya di perangkat yang punya hover; di HP cukup ketuk */
@media (hover: hover) {
  .foto:hover .dalam,
  .foto:focus-visible .dalam {
    transform: rotateY(180deg);
  }
}
.kaki {
  padding: 0.6rem;
  margin-top: 1.5rem;
  font-size: 0.65rem;
  text-align: center;
  opacity: 0.7;
}

@media (prefers-reduced-motion: reduce) {
  .dalam,
  .terjemah,
  .tab,
  .pudar-enter-active,
  .pudar-leave-active {
    transition: none;
  }
}

/* >= 641px: TABLET. Header ke tengah. */
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
  .hero {
    padding: 1.8rem 1rem 2rem;
  }
  .judul {
    font-size: 1.8rem;
  }
  .sub {
    font-size: 0.9rem;
  }
  .wadah {
    padding: 1.2rem 1rem 2rem;
  }
  .grid {
    gap: 0.9rem;
  }
  .nama {
    font-size: 0.85rem;
  }
  .desk {
    font-size: 0.85rem;
  }
}

/* >= 768px: DESKTOP. Grid 3 kolom. */
@media (min-width: 768px) {
  .bilah {
    min-height: 60px;
  }
  .judul-situs {
    font-size: 1.15rem;
  }
  .hero {
    padding: 2.2rem 1rem 2.4rem;
  }
  .judul {
    font-size: 2.2rem;
  }
  .wadah {
    padding: 2rem;
  }
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.1rem;
  }
  .kaki {
    margin-top: 3rem;
    font-size: 0.8rem;
  }
}

/* >= 1024px: DESKTOP LEBAR. Grid 4 kolom. */
@media (min-width: 1024px) {
  .judul {
    font-size: 2.6rem;
  }
  .wadah {
    padding: 2.5rem;
  }
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }
}
</style>
