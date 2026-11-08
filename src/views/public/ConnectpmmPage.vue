<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, Languages } from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import PenampilFoto from '../../components/PenampilFoto.vue'
import { vMuncul } from '../../utils/muncul'
import { useBahasaStore } from '../../stores/bahasa'
import { useConnectpmmStore } from '../../stores/connectpmm'

const bahasa = useBahasaStore()
const connectpmm = useConnectpmmStore()

const d = computed(() => connectpmm.data)
const foto = computed(() => d.value?.foto ?? [])

const trek = ref(null)
const indeks = ref(0)
const fotoBuka = ref(null) // { src, alt } untuk penampil zoom
const jeda = ref(false) // true saat hover, fokus, atau disentuh

let timer = null
const kurangiGerak =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function saatGulir() {
  const el = trek.value
  if (!el || !el.clientWidth) return
  indeks.value = Math.round(el.scrollLeft / el.clientWidth)
}

function ke(i) {
  const el = trek.value
  if (el) el.scrollTo({ left: i * el.clientWidth, behavior: kurangiGerak ? 'auto' : 'smooth' })
}

// Berputar: dari foto terakhir kembali ke pertama
function geser(arah) {
  const n = foto.value.length
  if (n < 2) return
  ke((indeks.value + arah + n) % n)
}

onMounted(() => {
  connectpmm.muat()
  if (kurangiGerak) return
  timer = setInterval(() => {
    if (jeda.value || document.hidden || fotoBuka.value) return
    geser(1)
  }, 5000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="halaman">
    <div class="dekor satu" aria-hidden="true"></div>
    <div class="dekor dua" aria-hidden="true"></div>
    <div class="dekor tiga" aria-hidden="true"></div>

    <header class="bilah">
      <RouterLink to="/" class="judul-situs">
        <span class="utama">Maulana Farras</span><span class="kuning"> Blog's</span>
      </RouterLink>
      <button
        type="button"
        class="terjemah"
        :title="bahasa.kode === 'id' ? 'Translate to English' : 'Terjemahkan ke Indonesia'"
        @click="bahasa.tukar()"
      >
        <span class="ikon-terjemah"><Languages :size="16" aria-hidden="true" /></span>
        <span class="teks-terjemah">{{ bahasa.label === 'EN' ? 'EN' : 'ID' }}</span>
      </button>
    </header>

    <main v-if="d" class="isi">
      <section class="bagian">
        <h1 class="judul-halaman">{{ bahasa.pilih(d.kepala.judul.id, d.kepala.judul.en) }}</h1>

        <div
          v-if="foto.length"
          class="galeri"
          @mouseenter="jeda = true"
          @mouseleave="jeda = false"
          @focusin="jeda = true"
          @focusout="jeda = false"
          @touchstart.passive="jeda = true"
          @touchend.passive="jeda = false"
        >
          <div ref="trek" class="trek" @scroll.passive="saatGulir">
            <figure v-for="(f, i) in foto" :key="f.id" class="slide">
              <button
                type="button"
                class="foto"
                :aria-label="bahasa.pilih('Buka foto ', 'Open photo ') + (i + 1)"
                @click="fotoBuka = { src: f.gambarUrl, alt: bahasa.pilih(f.judulId, f.judulEn) }"
              >
                <img
                  :src="f.gambarUrl"
                  :alt="bahasa.pilih(f.judulId, f.judulEn)"
                  :loading="i === 0 ? 'eager' : 'lazy'"
                  draggable="false"
                />
              </button>
              <figcaption class="keterangan">{{ bahasa.pilih(f.judulId, f.judulEn) }}</figcaption>
            </figure>
          </div>

          <template v-if="foto.length > 1">
            <button
              type="button"
              class="panah kiri"
              :aria-label="bahasa.pilih('Foto sebelumnya', 'Previous photo')"
              @click="geser(-1)"
            >
              <ChevronLeft :size="20" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="panah kanan"
              :aria-label="bahasa.pilih('Foto berikutnya', 'Next photo')"
              @click="geser(1)"
            >
              <ChevronRight :size="20" aria-hidden="true" />
            </button>
          </template>
        </div>

        <div v-if="foto.length > 1" class="titik-baris">
          <button
            v-for="(f, i) in foto"
            :key="f.id"
            type="button"
            class="titik"
            :class="{ aktif: i === indeks }"
            :aria-label="bahasa.pilih('Ke foto ', 'Go to photo ') + (i + 1)"
            @click="ke(i)"
          ></button>
        </div>
      </section>

      <section class="bagian">
        <h2 class="judul-bagian">
          {{ bahasa.pilih('Alat Pengembangan', 'Development Tools') }}
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
          {{ bahasa.pilih('Pergi ke Website', 'Go to Website') }}
        </a>
      </section>
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
  --ungu1: #667eea;
  --ungu2: #764ba2;
  --merek: #012c49;
  --kuning: #ffe66d;

  position: relative;
  min-height: 100vh;
  overflow: clip;
  color: #333;
  background: #fff;
  isolation: isolate;
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

/* --- Dekorasi latar --- */
.dekor {
  position: absolute;
  z-index: -1;
  pointer-events: none;
  border-radius: 50%;
  opacity: 0.35;
  filter: blur(40px);
}
.dekor.satu {
  top: -80px;
  right: -80px;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, var(--ungu1), var(--ungu2));
}
.dekor.dua {
  bottom: 12%;
  left: -80px;
  width: 160px;
  height: 160px;
  background: var(--merek);
}
.dekor.tiga {
  right: 15%;
  bottom: 0px;
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, var(--ungu2), var(--merek));
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
  padding: 0 0.5rem 0 1rem;
  background: linear-gradient(135deg, var(--ungu1) 0%, var(--ungu2) 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}
.judul-situs {
  font-size: 1rem;
  text-decoration: none;
  white-space: nowrap;
}
.judul-situs .utama {
  font-weight: 700;
  color: #fff;
}
.judul-situs .kuning {
  font-weight: 700;
  color: var(--kuning);
}
.judul-situs:hover {
  opacity: 0.85;
}
.terjemah {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 2.1rem;
  padding: 0 0.85rem 0 0.28rem;
  font: inherit;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 999px;
  transition: transform 0.25s ease;
}
.terjemah:hover {
  border-color: var(--kuning);
  transform: translateY(-1px);
}
.ikon-terjemah {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--merek);
  background: linear-gradient(135deg, var(--kuning), #50e3c2);
  border-radius: 50%;
}
.teks-terjemah {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.isi {
  padding: 1rem;
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
  border: 1px solid var(--ungu1);
  border-radius: 999px;
}
.bagian {
  margin-bottom: 1.5rem;
  text-align: center;
}
.judul-halaman {
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--merek);
}
.judul-bagian {
  margin: 1.5rem 0 1.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--ungu1), var(--ungu2));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* --- Galeri --- */
.galeri {
  position: relative;
  width: 100%;
  margin: 0 auto;
}
.trek {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.trek::-webkit-scrollbar {
  display: none;
}
.slide {
  flex: 0 0 100%;
  padding: 0 4%;
  margin: 0;
  scroll-snap-align: center;
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
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(1, 44, 73, 0.15);
  user-select: none;
}
.keterangan {
  padding: 10px 0;
  font-size: 0.85rem;
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
  background: linear-gradient(135deg, var(--ungu1), var(--ungu2));
  border: 0;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(1, 44, 73, 0.3);
  transform: translateY(-50%);
}
.panah:hover {
  filter: brightness(1.1);
}
.panah.kiri {
  left: 4px;
}
.panah.kanan {
  right: 4px;
}
.titik-baris {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 4px;
}
.titik {
  width: 8px;
  height: 8px;
  padding: 0;
  cursor: pointer;
  background: #d8d8e8;
  border: 0;
  border-radius: 50%;
  transition:
    background 0.3s ease,
    transform 0.3s ease;
}
.titik.aktif {
  background: linear-gradient(135deg, var(--ungu1), var(--ungu2));
  transform: scale(1.2);
}

/* --- Alat --- */
.grid-alat {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 100%;
  margin: 0 auto;
}
.alat {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(50% - 6px);
  padding: 16px 10px;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(1, 44, 73, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.alat:hover {
  box-shadow: 0 12px 20px rgba(1, 44, 73, 0.15);
  transform: translateY(-5px);
}
.ikon-alat {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 10px;
  color: var(--ungu1);
  background: #f5f7fa;
  border-radius: 50%;
  transition: all 0.3s ease;
}
.alat:hover .ikon-alat {
  color: #fff;
  background: linear-gradient(135deg, var(--ungu1), var(--ungu2));
}
.nama-alat {
  margin-bottom: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}
.ket-alat {
  font-size: 0.78rem;
  line-height: 1.4;
  color: #5c5c5c;
}

/* --- Ajakan --- */
.ajakan {
  max-width: 100%;
  padding: 24px 16px;
  margin: 24px auto 0;
  text-align: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(1, 44, 73, 0.06);
}
.ajakan h3 {
  margin-bottom: 10px;
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--ungu1), var(--ungu2));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.ajakan p {
  margin-bottom: 20px;
  font-size: 0.95rem;
  color: #4d4d4d;
}
.tombol {
  display: block;
  max-width: 280px;
  padding: 0.8rem 1rem;
  margin: 0 auto;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(135deg, var(--ungu1), var(--ungu2));
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: filter 0.2s ease;
}
.tombol:hover {
  filter: brightness(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .alat,
  .terjemah,
  .titik {
    transition: none;
  }
}

/* >= 641px: TABLET. Header ke tengah, kartu alat 150px. */
@media (min-width: 641px) {
  .bilah {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    min-height: 60px;
    padding: 0 0.75rem;
  }
  .judul-situs {
    grid-column: 2;
    font-size: 1.1rem;
  }
  .terjemah {
    grid-column: 3;
    justify-self: end;
  }
  .isi {
    padding: 1.5rem;
  }
  .judul-halaman,
  .judul-bagian {
    font-size: 1.75rem;
  }
  .slide {
    padding: 0 8%;
  }
  .foto img {
    height: 400px;
  }
  .keterangan {
    padding: 12px 0;
    font-size: 0.9rem;
  }
  .panah {
    display: grid;
  }
  .grid-alat {
    gap: 16px;
    max-width: 640px;
  }
  .alat {
    width: 150px;
    padding: 18px 12px;
  }
  .ajakan {
    padding: 28px 24px;
  }
}

/* >= 768px: DESKTOP. Galeri dibatasi lebarnya dan dipusatkan. */
@media (min-width: 768px) {
  .bilah {
    min-height: 64px;
  }
  .judul-situs {
    font-size: 1.2rem;
  }
  .isi {
    padding: 2rem 2.5rem;
  }
  .judul-halaman,
  .judul-bagian {
    font-size: 2rem;
  }
  .galeri,
  .titik-baris {
    max-width: 720px;
    margin-right: auto;
    margin-left: auto;
  }
  .slide {
    padding: 0 6%;
  }
  .foto img {
    height: 440px;
  }
  .grid-alat {
    gap: 20px;
    max-width: 800px;
  }
  .alat {
    width: 160px;
    padding: 20px 15px;
  }
  .ajakan {
    max-width: 720px;
    padding: 36px 32px;
  }
}

/* >= 1024px: DESKTOP LEBAR. */
@media (min-width: 1024px) {
  .judul-situs {
    font-size: 1.3rem;
  }
  .isi {
    padding: 2.5rem 4rem;
  }
  .judul-halaman,
  .judul-bagian {
    font-size: 2.25rem;
  }
  .galeri,
  .titik-baris {
    max-width: 860px;
  }
  .foto img {
    height: 520px;
  }
  .grid-alat {
    gap: 24px;
    max-width: 1000px;
  }
  .alat {
    width: 180px;
    padding: 24px 18px;
  }
  .ajakan {
    max-width: 800px;
    padding: 44px 40px;
  }
}
</style>
