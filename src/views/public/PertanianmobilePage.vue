<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, Languages } from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import PenampilFoto from '../../components/PenampilFoto.vue'
import { vMuncul } from '../../utils/muncul'
import { useBahasaStore } from '../../stores/bahasa'
import { usePertanianmobileStore } from '../../stores/pertanianmobile'

const bahasa = useBahasaStore()
const pertanian = usePertanianmobileStore()

onMounted(() => pertanian.muat())

const d = computed(() => pertanian.data)
const foto = computed(() => d.value?.foto ?? [])
const trek = ref(null)
const fotoBuka = ref(null) // { src, alt } untuk penampil zoom

// Geser satu layar jalur (sekitar 80% lebar)
function geser(arah) {
  const el = trek.value
  if (el) el.scrollBy({ left: arah * el.clientWidth * 0.8, behavior: 'smooth' })
}
</script>

<template>
  <div class="halaman">
    <header class="bilah">
      <RouterLink to="/" class="judul-situs">
        <span class="utama">Maulana Farras</span><span class="tosca"> Blog's</span>
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
      <div class="wadah">
        <section class="bagian">
          <h1 class="judul-bagian">{{ bahasa.pilih(d.kepala.judul.id, d.kepala.judul.en) }}</h1>

          <div v-if="foto.length" class="galeri">
            <div ref="trek" class="trek">
              <figure v-for="(f, i) in foto" :key="f.id" class="kartu-foto">
                <button
                  type="button"
                  class="foto"
                  :aria-label="bahasa.pilih('Buka foto ', 'Open photo ') + (i + 1)"
                  @click="fotoBuka = { src: f.gambarUrl, alt: bahasa.pilih(f.judulId, f.judulEn) }"
                >
                  <img
                    :src="f.kecilUrl"
                    :alt="bahasa.pilih(f.judulId, f.judulEn)"
                    loading="lazy"
                    draggable="false"
                  />
                </button>
                <figcaption>{{ bahasa.pilih(f.judulId, f.judulEn) }}</figcaption>
              </figure>
            </div>
            <button
              type="button"
              class="panah kiri"
              :aria-label="bahasa.pilih('Geser ke kiri', 'Scroll left')"
              @click="geser(-1)"
            >
              <ChevronLeft :size="20" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="panah kanan"
              :aria-label="bahasa.pilih('Geser ke kanan', 'Scroll right')"
              @click="geser(1)"
            >
              <ChevronRight :size="20" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Alat Pengembangan', 'Development Tools') }}</h2>
          <div class="grid-alat">
            <div v-for="(a, i) in d.alat" :key="i" v-muncul class="alat">
              <span class="ikon-alat"><IkonDinamis :nama="a.ikon" :ukuran="24" /></span>
              <p class="nama-alat">{{ a.nama }}</p>
              <p class="ket-alat">{{ bahasa.pilih(a.deskripsi.id, a.deskripsi.en) }}</p>
            </div>
          </div>
        </section>

        <section v-if="d.tautan.website || d.tautan.android" class="ajakan">
          <h3>{{ bahasa.pilih(d.ajakan.judul.id, d.ajakan.judul.en) }}</h3>
          <p>{{ bahasa.pilih(d.ajakan.teks.id, d.ajakan.teks.en) }}</p>
          <div class="tombol-baris">
            <a
              v-if="d.tautan.website"
              :href="d.tautan.website"
              target="_blank"
              rel="noopener noreferrer"
              class="tombol web"
            >
              {{ bahasa.pilih('Buka Website', 'Open Website') }}
            </a>
            <a
              v-if="d.tautan.android"
              :href="d.tautan.android"
              target="_blank"
              rel="noopener noreferrer"
              class="tombol android"
            >
              {{ bahasa.pilih('Unduh Aplikasi Android', 'Download Android App') }}
            </a>
          </div>
        </section>
      </div>
    </main>

    <main v-else-if="pertanian.galat" class="isi">
      <p class="pesan">
        {{ pertanian.galat }}
        <button type="button" class="coba-lagi" @click="pertanian.muat(true)">
          {{ bahasa.pilih('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>

    <PenampilFoto
      :src="fotoBuka?.src ?? null"
      :alt="fotoBuka?.alt ?? ''"
      @tutup="fotoBuka = null"
    />
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop, 1024px desktop lebar. */
.halaman {
  --biru: #4a90e2;
  --tosca: #50e3c2;
  --gelap: #2c3e50;

  min-height: 100vh;
  color: #333;
  background: #f5f7fa;
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
figure {
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
  background: var(--gelap);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}
.judul-situs {
  font-size: 0.9rem;
  text-decoration: none;
  white-space: nowrap;
}
.judul-situs .utama {
  font-weight: 700;
  color: var(--biru);
}
.judul-situs .tosca {
  font-weight: 700;
  color: var(--tosca);
}
.judul-situs:hover {
  opacity: 0.8;
}
.terjemah {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.4rem 0.8rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--biru);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--biru);
  border-radius: 999px;
  transition:
    color 0.3s ease,
    border-color 0.3s ease;
}
.terjemah:hover {
  color: var(--tosca);
  border-color: var(--tosca);
}

.isi {
  padding: 1rem;
}
.wadah {
  max-width: 1200px;
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
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--biru);
  border-radius: 999px;
}
.bagian {
  margin-bottom: 2rem;
}
.judul-bagian {
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(135deg, var(--biru), var(--tosca));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* --- Galeri jalur geser --- */
.galeri {
  position: relative;
}
.trek {
  display: flex;
  gap: 15px;
  padding: 10px 4px 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.trek::-webkit-scrollbar {
  height: 8px;
}
.trek::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.trek::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--biru), var(--tosca));
  border-radius: 4px;
}
.kartu-foto {
  flex: 0 0 230px;
  overflow: hidden;
  scroll-snap-align: start;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}
.kartu-foto:hover {
  transform: translateY(-5px);
}
.foto {
  display: block;
  width: 100%;
  padding: 0;
  cursor: zoom-in;
  background: transparent;
  border: 0;
}
.foto img {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
  user-select: none;
}
.kartu-foto figcaption {
  padding: 12px;
  font-size: 0.9rem;
  text-align: center;
}
.panah {
  position: absolute;
  top: 40%;
  display: none;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, var(--biru), var(--tosca));
  border: 0;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transform: translateY(-50%);
}
.panah.kiri {
  left: -6px;
}
.panah.kanan {
  right: -6px;
}

/* --- Alat --- */
.grid-alat {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-width: 700px;
  margin: 0 auto;
}
.alat {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  padding: 15px 10px;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.alat:hover {
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}
.ikon-alat {
  display: grid;
  place-items: center;
  width: 45px;
  height: 45px;
  margin-bottom: 10px;
  color: var(--biru);
  background: #f5f7fa;
  border-radius: 50%;
  transition: all 0.3s ease;
}
.alat:hover .ikon-alat {
  color: #fff;
  background: linear-gradient(135deg, var(--biru), var(--tosca));
}
.nama-alat {
  margin-bottom: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}
.ket-alat {
  font-size: 0.75rem;
  line-height: 1.4;
  color: #5c5c5c;
}

/* --- Ajakan --- */
.ajakan {
  max-width: 100%;
  padding: 20px 15px;
  margin: 30px auto 0;
  text-align: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}
.ajakan h3 {
  margin-bottom: 10px;
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--biru), var(--tosca));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.ajakan p {
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #4d4d4d;
}
.tombol-baris {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 250px;
  margin: 0 auto;
}
.tombol {
  display: block;
  padding: 0.8rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 25px;
  transition: filter 0.2s ease;
}
.tombol:hover {
  filter: brightness(0.95);
}
.tombol.web {
  background: linear-gradient(135deg, var(--biru), var(--tosca));
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}
.tombol.android {
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .kartu-foto,
  .alat,
  .terjemah {
    transition: none;
  }
}

/* >= 641px: TABLET. Header ke tengah, panah tampil. */
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
  .judul-bagian {
    font-size: 1.6rem;
  }
  .panah {
    display: grid;
  }
  .kartu-foto {
    flex-basis: 250px;
  }
  .foto img {
    height: 170px;
  }
  .alat {
    width: 120px;
  }
  .ikon-alat {
    width: 50px;
    height: 50px;
  }
  .nama-alat {
    font-size: 0.9rem;
  }
  .ket-alat {
    font-size: 0.8rem;
  }
  .ajakan {
    padding: 25px 15px;
  }
}

/* >= 768px: DESKTOP. */
@media (min-width: 768px) {
  .judul-situs {
    font-size: 1.15rem;
  }
  .isi {
    padding: 1.5rem 1.25rem;
  }
  .judul-bagian {
    font-size: 2rem;
  }
  .kartu-foto {
    flex-basis: 280px;
  }
  .foto img {
    height: 200px;
  }
  .grid-alat {
    gap: 20px;
    max-width: 800px;
  }
  .alat {
    width: 140px;
    padding: 20px 15px;
  }
  .ikon-alat {
    width: 60px;
    height: 60px;
  }
  .nama-alat {
    font-size: 1rem;
  }
  .ket-alat {
    font-size: 0.85rem;
  }
  .ajakan {
    max-width: 720px;
    padding: 30px 20px;
  }
  .ajakan h3 {
    font-size: 1.8rem;
  }
  .ajakan p {
    font-size: 1.1rem;
  }
  .tombol-baris {
    max-width: 300px;
  }
}
</style>
