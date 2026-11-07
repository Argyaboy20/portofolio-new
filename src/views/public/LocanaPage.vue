<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Globe, Languages, Smartphone } from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import ModalFiturLocana from '../../components/ModalFiturLocana.vue'
import { vMuncul } from '../../utils/muncul'
import { useBahasaStore } from '../../stores/bahasa'
import { useLocanaStore } from '../../stores/locana'

const bahasa = useBahasaStore()
const locana = useLocanaStore()

onMounted(() => locana.muat())

const d = computed(() => locana.data)
const fitur = computed(() => d.value?.fitur ?? [])
const terpilih = ref(null) // fitur yang detailnya sedang dibuka
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

    <main v-if="d" class="isi">
      <div class="wadah">
        <section class="hero">
          <h1 class="judul">{{ bahasa.pilih(d.kepala.judul.id, d.kepala.judul.en) }}</h1>
          <p class="deskripsi">
            {{ bahasa.pilih(d.kepala.deskripsi.id, d.kepala.deskripsi.en) }}
          </p>
        </section>

        <section v-if="fitur.length" class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Galeri Fitur', 'Feature Gallery') }}</h2>
          <div class="grid-fitur">
            <button
              v-for="f in fitur"
              :key="f.id"
              v-muncul
              type="button"
              class="kartu-fitur"
              @click="terpilih = f"
            >
              <span class="bingkai">
                <img
                  :src="f.kecilUrl"
                  :alt="bahasa.pilih(f.judulId, f.judulEn)"
                  loading="lazy"
                  draggable="false"
                />
              </span>
              <span class="info">
                <span class="judul-fitur">{{ bahasa.pilih(f.judulId, f.judulEn) }}</span>
                <span class="ringkas">{{ bahasa.pilih(f.ringkasId, f.ringkasEn) }}</span>
              </span>
            </button>
          </div>
        </section>

        <section class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Alat Pengembangan', 'Development Tools') }}</h2>
          <div class="grid-alat">
            <div v-for="(a, i) in d.alat" :key="i" v-muncul class="alat">
              <span class="ikon-alat"><IkonDinamis :nama="a.ikon" :size="28" /></span>
              <div>
                <h3 class="nama-alat">{{ a.nama }}</h3>
                <p class="ket-alat">{{ bahasa.pilih(a.deskripsi.id, a.deskripsi.en) }}</p>
              </div>
            </div>
          </div>
        </section>

        <section v-if="d.tautan.website || d.tautan.android" class="ajakan">
          <h2 class="judul-ajakan">{{ bahasa.pilih(d.ajakan.judul.id, d.ajakan.judul.en) }}</h2>
          <p class="teks-ajakan">{{ bahasa.pilih(d.ajakan.teks.id, d.ajakan.teks.en) }}</p>
          <div class="tombol-baris">
            <a
              v-if="d.tautan.website"
              :href="d.tautan.website"
              target="_blank"
              rel="noopener noreferrer"
              class="tombol web"
            >
              <Globe :size="18" aria-hidden="true" />
              {{ bahasa.pilih('Buka Website', 'Launch Website') }}
            </a>
            <a
              v-if="d.tautan.android"
              :href="d.tautan.android"
              target="_blank"
              rel="noopener noreferrer"
              class="tombol android"
            >
              <Smartphone :size="18" aria-hidden="true" />
              {{ bahasa.pilih('Unduh Aplikasi', 'Download App') }}
            </a>
          </div>
        </section>
      </div>
    </main>

    <main v-else-if="locana.galat" class="isi">
      <p class="pesan">
        {{ locana.galat }}
        <button type="button" class="coba-lagi" @click="locana.muat(true)">
          {{ bahasa.pilih('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>

    <ModalFiturLocana :item="terpilih" @tutup="terpilih = null" />
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop, 1024px desktop lebar. */
.halaman {
  --biru: #4171db;
  --ungu: #6863f2;
  --aksen: #ff6b6b;

  min-height: 100vh;
  overflow-x: hidden;
  color: #fff;
  background: linear-gradient(135deg, var(--biru), var(--ungu));
  background-attachment: fixed;
}
.halaman *,
.halaman *::before,
.halaman *::after {
  box-sizing: border-box;
}
h1,
h2,
h3,
p {
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
  min-height: 52px;
  padding: 0 0.5rem 0 1rem;
  background: rgba(23, 38, 42, 0.85);
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
  color: var(--aksen);
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
.ikon-terjemah {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--biru);
  background: #fff;
  border-radius: 50%;
}
.teks-terjemah {
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.06em;
}

.wadah {
  max-width: 1200px;
  padding: 0.75rem 0.75rem 2rem;
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
  padding: 1.5rem 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
.judul {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.deskripsi {
  max-width: 800px;
  margin: 0 auto;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* --- Judul bagian --- */
.bagian {
  margin-bottom: 2rem;
}
.judul-bagian {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.judul-bagian::after {
  display: block;
  width: 60px;
  height: 3px;
  margin: 0.5rem auto;
  content: '';
  background: var(--aksen);
  border-radius: 2px;
}

/* --- Galeri fitur --- */
.grid-fitur {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.kartu-fitur {
  display: block;
  padding: 0;
  overflow: hidden;
  font: inherit;
  color: #333;
  text-align: left;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  border: 0;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.kartu-fitur:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
}
.bingkai {
  position: relative;
  display: block;
  height: 200px;
  overflow: hidden;
  background: #e8ecf2;
}
.bingkai img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.kartu-fitur:hover .bingkai img {
  transform: scale(1.05);
}
.info {
  display: block;
  padding: 1rem;
}
.judul-fitur {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}
.ringkas {
  display: block;
  font-size: 0.9rem;
  color: rgba(51, 51, 51, 0.8);
}

/* --- Alat --- */
.grid-alat {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
}
.alat {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  color: #333;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}
.alat:hover {
  transform: translateX(5px);
}
.ikon-alat {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 40px;
  height: 40px;
  margin-right: 0.8rem;
  color: var(--biru);
}
.nama-alat {
  margin-bottom: 0.25rem;
  font-size: 1rem;
  font-weight: 600;
}
.ket-alat {
  font-size: 0.8rem;
  color: rgba(51, 51, 51, 0.8);
}

/* --- Ajakan --- */
.ajakan {
  padding: 1.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(8px);
}
.judul-ajakan {
  margin-bottom: 1rem;
  font-size: 1.4rem;
  font-weight: 600;
}
.teks-ajakan {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  opacity: 0.9;
}
.tombol-baris {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
  max-width: 400px;
  margin: 0 auto;
}
.tombol {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  height: 45px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: filter 0.2s ease;
}
.tombol:hover {
  filter: brightness(1.1);
}
.tombol.web {
  background: #4385f5;
}
.tombol.android {
  background: #3ddc84;
}

@media (prefers-reduced-motion: reduce) {
  .kartu-fitur,
  .alat,
  .terjemah,
  .bingkai img {
    transition: none;
  }
}

/* >= 641px: TABLET. Header ke tengah; galeri dan alat 2 kolom. */
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
    padding: 1rem 1rem 2.5rem;
  }
  .hero {
    padding: 2.5rem 1rem;
    margin-bottom: 2rem;
  }
  .judul {
    font-size: 2rem;
  }
  .deskripsi {
    font-size: 1rem;
  }
  .judul-bagian {
    margin-bottom: 1.25rem;
    font-size: 1.65rem;
  }
  .bagian {
    margin-bottom: 2.5rem;
  }
  .grid-fitur {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  .grid-alat {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .alat {
    padding: 1rem;
  }
  .ikon-alat {
    width: 50px;
    height: 50px;
    margin-right: 1rem;
  }
  .nama-alat {
    font-size: 1.1rem;
  }
  .ket-alat {
    font-size: 0.9rem;
  }
  .ajakan {
    padding: 2rem;
  }
  .judul-ajakan {
    font-size: 1.8rem;
  }
  .teks-ajakan {
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }
  .tombol-baris {
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 1rem;
  }
  .tombol {
    height: 50px;
    font-size: 1rem;
  }
}

/* >= 768px: DESKTOP. Galeri 3 kolom. */
@media (min-width: 768px) {
  .bilah {
    min-height: 60px;
  }
  .judul-situs {
    font-size: 1.15rem;
  }
  .wadah {
    padding: 1.5rem 1.5rem 3rem;
  }
  .hero {
    padding: 3.5rem 1rem;
  }
  .judul {
    font-size: 2.5rem;
  }
  .deskripsi {
    font-size: 1.1rem;
  }
  .judul-bagian {
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
  }
  .bagian {
    margin-bottom: 3rem;
  }
  .grid-fitur {
    grid-template-columns: repeat(3, 1fr);
  }
  .tombol-baris {
    max-width: 440px;
  }
}

/* >= 1024px: DESKTOP LEBAR. Alat 3 kolom. */
@media (min-width: 1024px) {
  .wadah {
    padding: 2rem 2rem 3rem;
  }
  .hero {
    padding: 4rem 1rem;
  }
  .judul {
    font-size: 3rem;
  }
  .deskripsi {
    font-size: 1.2rem;
  }
  .grid-fitur {
    gap: 2rem;
  }
  .bingkai {
    height: 220px;
  }
  .grid-alat {
    grid-template-columns: repeat(3, 1fr);
  }
  .ajakan {
    padding: 2.5rem;
  }
  .tombol-baris {
    max-width: 480px;
  }
}
</style>
