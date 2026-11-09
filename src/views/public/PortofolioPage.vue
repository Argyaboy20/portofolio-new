<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ExternalLink, Languages } from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import ModalFiturLocana from '../../components/ModalFiturLocana.vue'
import PenampilFoto from '../../components/PenampilFoto.vue'
import { useBahasaStore } from '../../stores/bahasa'
import { usePortofolioStore } from '../../stores/portofolio'

const bahasa = useBahasaStore()
const portofolio = usePortofolioStore()

onMounted(() => portofolio.muat())

const d = computed(() => portofolio.data)
const foto = computed(() => d.value?.foto ?? [])
const terpilih = ref(null) // foto yang detailnya sedang dibuka
const fotoLaporan = ref(null) // { src, alt } untuk penampil zoom laporan

// Bilah progres terisi sekali saat bagian alat terlihat di layar
const wadahAlat = ref(null)
const alatTampil = ref(false)
let pengamat = null

watch(
  () => d.value,
  async (nilai) => {
    if (!nilai || alatTampil.value) return
    await nextTick()
    const el = wadahAlat.value
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      alatTampil.value = true
      return
    }
    pengamat = new IntersectionObserver(
      (entri) => {
        if (entri.some((e) => e.isIntersecting)) {
          alatTampil.value = true
          pengamat?.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    pengamat.observe(el)
  },
)

onBeforeUnmount(() => pengamat?.disconnect())
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
        <Languages :size="16" aria-hidden="true" />
        <span>{{ bahasa.label }}</span>
      </button>
    </header>

    <main v-if="d" class="isi">
      <section class="hero">
        <span class="lingkar satu" aria-hidden="true"></span>
        <span class="lingkar dua" aria-hidden="true"></span>
        <h1>{{ bahasa.pilih(d.kepala.judul.id, d.kepala.judul.en) }}</h1>
        <p>{{ bahasa.pilih(d.kepala.subjudul.id, d.kepala.subjudul.en) }}</p>
        <ul class="chip-baris">
          <li v-for="(a, i) in d.alat.slice(0, 3)" :key="i" class="chip">
            <IkonDinamis :nama="a.ikon" :ukuran="16" />
            {{ a.nama }}
          </li>
        </ul>
      </section>

      <div class="wadah">
        <section v-if="foto.length" class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Tampilan UI/UX', 'UI/UX View') }}</h2>
          <div class="grid-foto">
            <button
              v-for="f in foto"
              :key="f.id"
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
                  <span>{{ bahasa.pilih('Lihat detail', 'View details') }}</span>
                </span>
              </span>
              <span class="judul-kartu">{{ bahasa.pilih(f.judulId, f.judulEn) }}</span>
            </button>
          </div>
        </section>

        <section v-if="d.kecepatan.gambarUrl || d.kecepatan.tautan" class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Kecepatan Web', 'Web Performance') }}</h2>
          <div class="kartu-kecepatan">
            <button
              v-if="d.kecepatan.gambarUrl"
              type="button"
              class="gambar-kecepatan"
              :aria-label="bahasa.pilih('Buka gambar laporan', 'Open report image')"
              @click="
                fotoLaporan = {
                  src: d.kecepatan.gambarUrl,
                  alt: bahasa.pilih(d.kecepatan.deskripsi.id, d.kecepatan.deskripsi.en),
                }
              "
            >
              <img
                :src="d.kecepatan.gambarUrl"
                :alt="bahasa.pilih(d.kecepatan.deskripsi.id, d.kecepatan.deskripsi.en)"
                loading="lazy"
                draggable="false"
              />
            </button>
            <div class="teks-kecepatan">
              <p>{{ bahasa.pilih(d.kecepatan.deskripsi.id, d.kecepatan.deskripsi.en) }}</p>
              <a
                v-if="d.kecepatan.tautan"
                :href="d.kecepatan.tautan"
                target="_blank"
                rel="noopener noreferrer"
                class="tombol-laporan"
              >
                {{ bahasa.pilih(d.kecepatan.tombol.id, d.kecepatan.tombol.en) }}
                <ExternalLink :size="16" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section class="bagian">
          <h2 class="judul-bagian">
            {{ bahasa.pilih('Alat Pengembangan', 'Development Tools') }}
          </h2>
          <div ref="wadahAlat" class="grid-alat">
            <div v-for="(a, i) in d.alat" :key="i" class="alat">
              <span class="ikon-alat"><IkonDinamis :nama="a.ikon" :ukuran="26" /></span>
              <h3>{{ a.nama }}</h3>
              <div
                class="jalur"
                role="progressbar"
                :aria-valuenow="a.level"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="a.nama"
              >
                <span
                  class="isi-jalur"
                  :style="{
                    width: (alatTampil ? a.level : 0) + '%',
                    transitionDelay: i * 80 + 'ms',
                  }"
                ></span>
              </div>
              <span class="persen">{{ a.level }}%</span>
            </div>
          </div>
        </section>
      </div>
    </main>

    <main v-else-if="portofolio.galat" class="isi">
      <p class="pesan">
        {{ portofolio.galat }}
        <button type="button" class="coba-lagi" @click="portofolio.muat(true)">
          {{ bahasa.pilih('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>

    <ModalFiturLocana :item="terpilih" @tutup="terpilih = null" />
    <PenampilFoto
      :src="fotoLaporan?.src ?? null"
      :alt="fotoLaporan?.alt ?? ''"
      @tutup="fotoLaporan = null"
    />
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop, 1024px desktop lebar. */
.halaman {
  --biru: #4a90e2;
  --tosca: #50e3c2;
  --slate: #2c3e50;
  --gelap: #1f2d3d;

  min-height: 100vh;
  color: #2d3748;
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
  background: #000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}
.judul-situs {
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  background: linear-gradient(90deg, var(--biru), var(--tosca));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.terjemah {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.4rem 0.85rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--tosca);
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(80, 227, 194, 0.6);
  border-radius: 999px;
  transition:
    background 0.25s ease,
    color 0.25s ease;
}
.terjemah:hover {
  color: #000;
  background: var(--tosca);
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

/* --- Hero --- */
.hero {
  position: relative;
  padding: 3rem 1rem 2.5rem;
  overflow: hidden;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, var(--slate) 0%, #34506b 55%, #2f6fa8 100%);
}
.lingkar {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(30px);
}
.lingkar.satu {
  top: -70px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: rgba(74, 144, 226, 0.45);
}
.lingkar.dua {
  bottom: -80px;
  left: -50px;
  width: 190px;
  height: 190px;
  background: rgba(80, 227, 194, 0.3);
}
.hero h1 {
  position: relative;
  margin-bottom: 0.6rem;
  font-size: 2rem;
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.hero p {
  position: relative;
  max-width: 640px;
  margin: 0 auto;
  font-size: 0.95rem;
  opacity: 0.92;
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
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.35rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  backdrop-filter: blur(6px);
}

/* --- Isi --- */
.wadah {
  max-width: 1200px;
  padding: 1.5rem 1rem 3rem;
  margin: 0 auto;
}
.bagian {
  margin-bottom: 2.5rem;
}
.judul-bagian {
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--gelap);
  text-align: center;
}
.judul-bagian::after {
  display: block;
  width: 64px;
  height: 4px;
  margin: 0.6rem auto 0;
  content: '';
  background: linear-gradient(90deg, var(--biru), var(--tosca));
  border-radius: 2px;
}

/* --- Galeri foto --- */
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
  border: 0;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(31, 45, 61, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.kartu-foto:hover,
.kartu-foto:focus-visible {
  box-shadow: 0 14px 30px rgba(31, 45, 61, 0.18);
  transform: translateY(-5px);
}
.bingkai {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #e8ecf2;
}
.bingkai img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  transition: transform 0.5s ease;
}
.kartu-foto:hover .bingkai img {
  transform: scale(1.05);
}
.tindih {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(transparent 40%, rgba(31, 45, 61, 0.85));
  opacity: 0;
  transition: opacity 0.3s ease;
}
.kartu-foto:hover .tindih,
.kartu-foto:focus-visible .tindih {
  opacity: 1;
}
.judul-kartu {
  display: block;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gelap);
}

/* --- Kecepatan --- */
.kartu-kecepatan {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
  max-width: 1000px;
  padding: 1.25rem;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(31, 45, 61, 0.1);
}
.gambar-kecepatan {
  width: 100%;
  padding: 0;
  cursor: zoom-in;
  background: transparent;
  border: 0;
}
.gambar-kecepatan img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}
.teks-kecepatan {
  text-align: center;
}
.teks-kecepatan p {
  margin-bottom: 0.9rem;
  font-size: 0.95rem;
  color: #4a5568;
}
.tombol-laporan {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  padding: 0.65rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, var(--biru), var(--tosca));
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(74, 144, 226, 0.35);
  transition: filter 0.2s ease;
}
.tombol-laporan:hover {
  filter: brightness(0.95);
}

/* --- Alat --- */
.grid-alat {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
}
.alat {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.4rem 0.9rem;
  align-items: center;
  padding: 1rem;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(31, 45, 61, 0.08);
}
.ikon-alat {
  display: grid;
  grid-row: span 2;
  place-items: center;
  width: 48px;
  height: 48px;
  color: var(--biru);
  background: #eef4fc;
  border-radius: 12px;
}
.alat h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gelap);
}
.persen {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--biru);
}
.jalur {
  grid-column: 2 / 4;
  height: 8px;
  overflow: hidden;
  background: #e3e9f1;
  border-radius: 4px;
}
.isi-jalur {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--biru), var(--tosca));
  border-radius: 4px;
  transition: width 0.9s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .kartu-foto,
  .bingkai img,
  .tindih,
  .isi-jalur,
  .terjemah {
    transition: none;
  }
}

/* >= 641px: TABLET. Header ke tengah, foto 2 kolom, alat 2 kolom. */
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
    padding: 4rem 1.5rem 3.25rem;
  }
  .hero h1 {
    font-size: 2.6rem;
  }
  .hero p {
    font-size: 1.05rem;
  }
  .wadah {
    padding: 2rem 1.5rem 3.5rem;
  }
  .judul-bagian {
    font-size: 1.75rem;
  }
  .grid-foto {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  .grid-alat {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .kartu-kecepatan {
    padding: 1.5rem;
  }
}

/* >= 768px: DESKTOP. Foto 3 kolom, gambar dan teks kecepatan berdampingan. */
@media (min-width: 768px) {
  .judul-situs {
    font-size: 1.15rem;
  }
  .hero {
    padding: 5rem 2rem 4rem;
  }
  .hero h1 {
    font-size: 3.2rem;
  }
  .grid-foto {
    grid-template-columns: repeat(3, 1fr);
  }
  .kartu-kecepatan {
    flex-direction: row;
    gap: 2rem;
    padding: 2rem;
  }
  .gambar-kecepatan {
    flex: 1 1 55%;
  }
  .teks-kecepatan {
    flex: 1 1 45%;
    text-align: left;
  }
  .teks-kecepatan p {
    font-size: 1.05rem;
  }
}

/* >= 1024px: DESKTOP LEBAR. Foto 4 kolom, alat 3 kolom. */
@media (min-width: 1024px) {
  .wadah {
    padding: 2.5rem 2rem 4rem;
  }
  .grid-foto {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
  .grid-alat {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}
</style>
