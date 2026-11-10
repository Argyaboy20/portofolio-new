<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Languages } from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import ModalAplikasir from '../../components/ModalAplikasir.vue'
import { vMuncul } from '../../utils/muncul'
import { useBahasaStore } from '../../stores/bahasa'
import { useAplikasirStore } from '../../stores/aplikasir'

const bahasa = useBahasaStore()
const aplikasir = useAplikasirStore()

onMounted(() => aplikasir.muat())

const d = computed(() => aplikasir.data)
const foto = computed(() => d.value?.foto ?? [])
const terpilih = ref(null) // foto yang detailnya sedang dibuka
</script>

<template>
  <div class="halaman">
    <header class="bilah">
      <RouterLink to="/" class="judul-situs">
        <span class="utama">Maulana Farras</span><span class="merah"> Blog's</span>
      </RouterLink>
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
      <section class="hero">
        <span class="blok" aria-hidden="true"></span>
        <h1>{{ bahasa.pilih(d.kepala.judul.id, d.kepala.judul.en) }}</h1>
        <p>{{ bahasa.pilih(d.kepala.subjudul.id, d.kepala.subjudul.en) }}</p>
        <ul v-if="d.chip.length" class="chip-baris">
          <li v-for="(c, i) in d.chip" :key="i" class="chip">{{ c }}</li>
        </ul>
      </section>

      <div class="wadah">
        <section v-if="foto.length" class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Galeri Project', 'Project Gallery') }}</h2>
          <div class="grid-foto">
            <button
              v-for="f in foto"
              :key="f.id"
              v-muncul
              type="button"
              class="kartu-foto"
              @click="terpilih = f"
            >
              <span class="bingkai">
                <img
                  :src="f.kecilUrl"
                  :alt="bahasa.pilih(f.judulId, f.judulEn)"
                  loading="lazy"
                  draggable="false"
                />
                <span class="tindih">
                  <span class="tombol-lihat">{{
                    bahasa.pilih('Lihat Project', 'View Project')
                  }}</span>
                </span>
              </span>
              <span class="judul-kartu">{{ bahasa.pilih(f.judulId, f.judulEn) }}</span>
            </button>
          </div>
        </section>

        <section class="bagian">
          <h2 class="judul-bagian">
            {{ bahasa.pilih('Alat Pengembangan', 'Development Tools') }}
          </h2>
          <div class="grid-alat">
            <div v-for="(a, i) in d.alat" :key="i" v-muncul class="alat">
              <span class="ikon-alat"><IkonDinamis :nama="a.ikon" :ukuran="26" /></span>
              <h3>{{ a.nama }}</h3>
              <p>{{ bahasa.pilih(a.deskripsi.id, a.deskripsi.en) }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <main v-else-if="aplikasir.galat" class="isi">
      <p class="pesan">
        {{ aplikasir.galat }}
        <button type="button" class="coba-lagi" @click="aplikasir.muat(true)">
          {{ bahasa.pilih('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>

    <ModalAplikasir :item="terpilih" @tutup="terpilih = null" />
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop, 1024px desktop lebar. */
.halaman {
  --krem: #fbf7f2;
  --merah: #d6203f;
  --arang: #2b2a33;

  min-height: 100vh;
  color: var(--arang);
  background: var(--krem);
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
  background: var(--arang);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}
.judul-situs {
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}
.judul-situs .utama {
  color: #fff;
}
.judul-situs .merah {
  color: #ff6b81;
}
.terjemah {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.4rem 0.85rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: var(--merah);
  border: 0;
  border-radius: 999px;
  transition: filter 0.2s ease;
}
.terjemah:hover {
  filter: brightness(1.12);
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
  border: 1px solid var(--merah);
  border-radius: 999px;
}

/* --- Hero --- */
.hero {
  position: relative;
  padding: 3rem 1rem 2.5rem;
  overflow: hidden;
  text-align: center;
  background: var(--krem);
}
.blok {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 190px;
  height: 190px;
  pointer-events: none;
  background: var(--merah);
  border-radius: 28px;
  opacity: 0.9;
  transform: rotate(18deg);
}
.hero h1 {
  position: relative;
  margin-bottom: 0.4rem;
  font-size: 2.3rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.hero p {
  position: relative;
  font-size: 1.05rem;
  color: rgba(43, 42, 51, 0.75);
}
.chip-baris {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  padding: 0;
  margin-top: 1.25rem;
  list-style: none;
}
.chip {
  padding: 0.35rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--merah);
  background: #fff;
  border: 1px solid rgba(214, 32, 63, 0.4);
  border-radius: 999px;
}

/* --- Isi --- */
.wadah {
  max-width: 1200px;
  padding: 1rem 1rem 3rem;
  margin: 0 auto;
}
.bagian {
  margin-bottom: 2.5rem;
}
.judul-bagian {
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 800;
  text-align: center;
}
.judul-bagian::after {
  display: block;
  width: 56px;
  height: 4px;
  margin: 0.6rem auto 0;
  content: '';
  background: var(--merah);
  border-radius: 2px;
}

/* --- Galeri --- */
.grid-foto {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.kartu-foto {
  display: block;
  padding: 0;
  overflow: hidden;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #efe8df;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(43, 42, 51, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.kartu-foto:hover,
.kartu-foto:focus-visible {
  box-shadow: 0 14px 28px rgba(214, 32, 63, 0.18);
  transform: translateY(-5px);
}
.bingkai {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #ebe6df;
}
.bingkai img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.tindih {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(43, 42, 51, 0.72);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.kartu-foto:hover .tindih,
.kartu-foto:focus-visible .tindih {
  opacity: 1;
}
.tombol-lihat {
  padding: 0.55rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  background: var(--merah);
  border-radius: 999px;
}
.judul-kartu {
  display: block;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  font-weight: 700;
}

/* --- Alat --- */
.grid-alat {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.alat {
  padding: 1.25rem;
  text-align: center;
  background: #fff;
  border: 1px solid #efe8df;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(43, 42, 51, 0.06);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.alat:hover {
  box-shadow: 0 12px 24px rgba(214, 32, 63, 0.14);
  transform: translateY(-4px);
}
.ikon-alat {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin: 0 auto 0.8rem;
  color: var(--merah);
  background: rgba(214, 32, 63, 0.1);
  border-radius: 14px;
}
.alat h3 {
  margin-bottom: 0.4rem;
  font-size: 1rem;
  font-weight: 700;
}
.alat p {
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(43, 42, 51, 0.72);
}

@media (prefers-reduced-motion: reduce) {
  .kartu-foto,
  .alat,
  .tindih,
  .terjemah {
    transition: none;
  }
}

/* >= 641px: TABLET. Header ke tengah, galeri dan alat 2 kolom. */
@media (min-width: 641px) {
  .bilah {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    min-height: 60px;
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
    padding: 4rem 1.5rem 3rem;
  }
  .blok {
    top: -70px;
    right: -40px;
    width: 250px;
    height: 250px;
  }
  .hero h1 {
    font-size: 3.2rem;
  }
  .wadah {
    padding: 1.5rem 1.5rem 3.5rem;
  }
  .judul-bagian {
    font-size: 1.75rem;
  }
  .grid-foto,
  .grid-alat {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

/* >= 768px: DESKTOP. */
@media (min-width: 768px) {
  .judul-situs {
    font-size: 1.15rem;
  }
  .hero {
    padding: 5rem 2rem 3.5rem;
  }
  .hero h1 {
    font-size: 4rem;
  }
  .hero p {
    font-size: 1.25rem;
  }
}

/* >= 1024px: DESKTOP LEBAR. Galeri 3 kolom, alat 4 kolom. */
@media (min-width: 1024px) {
  .wadah {
    padding: 2rem 2rem 4rem;
  }
  .grid-foto {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .grid-alat {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }
}
</style>
