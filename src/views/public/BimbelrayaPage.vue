<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ExternalLink, Languages } from '@lucide/vue'
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
const indeks = ref(null) // posisi foto yang dibuka di penampil; null = tertutup

const fotoBuka = computed(() => (indeks.value === null ? null : (foto.value[indeks.value] ?? null)))
const judulFoto = (f) => (f ? bahasa.pilih(f.judulId, f.judulEn) : '')

function berikutnya() {
  indeks.value = (indeks.value + 1) % foto.value.length
}
function sebelumnya() {
  indeks.value = (indeks.value - 1 + foto.value.length) % foto.value.length
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
        <section class="bagian kepala">
          <img v-if="d.logoUrl" :src="d.logoUrl" alt="Logo Bimbel Raya" class="logo" />
          <h1 class="judul-bagian">{{ bahasa.pilih(d.kepala.judul.id, d.kepala.judul.en) }}</h1>
        </section>

        <section v-if="foto.length" class="bagian">
          <h2 class="judul-bagian">{{ bahasa.pilih('Galeri Foto', 'Photo Gallery') }}</h2>
          <div class="mosaik">
            <button
              v-for="(f, i) in foto"
              :key="f.id"
              v-muncul
              type="button"
              class="petak"
              :class="{ besar: i === 0, tinggi: i > 0 && i % 7 === 3 }"
              :aria-label="bahasa.pilih('Buka foto ', 'Open photo ') + (i + 1)"
              @click="indeks = i"
            >
              <img :src="f.kecilUrl" :alt="judulFoto(f)" loading="lazy" draggable="false" />
              <span class="label">{{ judulFoto(f) }}</span>
            </button>
          </div>
        </section>

        <section class="bagian">
          <h2 class="judul-bagian">
            {{ bahasa.pilih('Alat dan Pengembangan', 'Tools and Development') }}
          </h2>
          <div class="grid-alat">
            <div v-for="(a, i) in d.alat" :key="i" v-muncul class="alat">
              <span class="ikon-alat"><IkonDinamis :nama="a.ikon" :ukuran="24" /></span>
              <p class="nama-alat">{{ a.nama }}</p>
              <p class="ket-alat">{{ bahasa.pilih(a.deskripsi.id, a.deskripsi.en) }}</p>
            </div>
          </div>
        </section>

        <section v-if="d.tautan.website" class="ajakan">
          <h3>{{ bahasa.pilih(d.ajakan.judul.id, d.ajakan.judul.en) }}</h3>
          <p>{{ bahasa.pilih(d.ajakan.teks.id, d.ajakan.teks.en) }}</p>
          <a :href="d.tautan.website" target="_blank" rel="noopener noreferrer" class="tombol">
            {{ bahasa.pilih('Buka Website', 'Open Website') }}
            <ExternalLink :size="16" aria-hidden="true" />
          </a>
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
      :indeks="indeks ?? 0"
      :total="foto.length"
      @tutup="indeks = null"
      @sebelumnya="sebelumnya"
      @berikutnya="berikutnya"
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
.judul-situs .utama,
.judul-situs .tosca {
  font-weight: 700;
}
.judul-situs .utama {
  color: var(--biru);
}
.judul-situs .tosca {
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
.kepala {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo {
  display: block;
  max-width: 160px;
  max-height: 100px;
  margin-bottom: 0.75rem;
  object-fit: contain;
}
.kepala .judul-bagian {
  margin-bottom: 0;
}

/* --- Galeri mosaik --- */
.mosaik {
  display: grid;
  grid-auto-flow: dense;
  grid-auto-rows: 120px;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.petak {
  position: relative;
  display: block;
  padding: 0;
  overflow: hidden;
  cursor: zoom-in;
  background: #e8ecf2;
  border: 0;
  border-radius: 12px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
}
.petak.besar {
  grid-column: span 2;
  grid-row: span 2;
}
.petak.tinggi {
  grid-row: span 2;
}
.petak img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  transition: transform 0.4s ease;
}
.petak:hover img {
  transform: scale(1.06);
}
.label {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 1.5rem 0.6rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  text-align: left;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
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
.tombol {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.6rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(135deg, var(--biru), var(--tosca));
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  transition: filter 0.2s ease;
}
.tombol:hover {
  filter: brightness(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .petak img,
  .alat,
  .terjemah {
    transition: none;
  }
}

/* >= 641px: TABLET. Header ke tengah, mosaik 3 kolom. */
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
  .mosaik {
    grid-auto-rows: 150px;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
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

/* >= 768px: DESKTOP. Mosaik 4 kolom. */
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
  .logo {
    max-width: 200px;
    max-height: 120px;
  }
  .mosaik {
    grid-auto-rows: 170px;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .label {
    font-size: 0.9rem;
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
}

/* >= 1024px: DESKTOP LEBAR. */
@media (min-width: 1024px) {
  .mosaik {
    grid-auto-rows: 200px;
  }
}
</style>
