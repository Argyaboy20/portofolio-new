<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, Languages } from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import PenampilFoto from '../../components/PenampilFoto.vue'
import { vMuncul } from '../../utils/muncul'
import { useBahasaStore } from '../../stores/bahasa'
import { useSocialvitStore } from '../../stores/socialvit'

const bahasa = useBahasaStore()
const socialvit = useSocialvitStore()

const d = computed(() => socialvit.data)
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

// Berputar: dari foto terakhir kembali ke pertama, seperti situs lama
function geser(arah) {
  const n = foto.value.length
  if (n < 2) return
  ke((indeks.value + arah + n) % n)
}

onMounted(() => {
  socialvit.muat()
  if (kurangiGerak) return
  timer = setInterval(() => {
    if (jeda.value || document.hidden || fotoBuka.value) return
    geser(1)
  }, 10000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
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
      <section class="kaca hero">
        <h1 class="judul">{{ bahasa.pilih(d.kepala.judul.id, d.kepala.judul.en) }}</h1>
        <p class="subjudul">
          {{ bahasa.pilih(d.kepala.deskripsi.id, d.kepala.deskripsi.en) }}
        </p>
      </section>

      <section v-if="foto.length" class="kaca bagian">
        <h2 class="judul-bagian">{{ bahasa.pilih('Galeri Foto', 'Photo Gallery') }}</h2>

        <div
          class="karusel"
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
              <figcaption class="tindih">
                <h3>{{ bahasa.pilih(f.judulId, f.judulEn) }}</h3>
                <p>{{ bahasa.pilih(f.ringkasId, f.ringkasEn) }}</p>
              </figcaption>
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
            <div class="titik-baris">
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
          </template>
        </div>
      </section>

      <section class="kaca bagian">
        <h2 class="judul-bagian">{{ bahasa.pilih('Teknologi yang Digunakan', 'Tech Stack') }}</h2>
        <div class="grid-teknologi">
          <div v-for="(t, i) in d.teknologi" :key="i" v-muncul class="teknologi">
            <span class="ikon-tek"><IkonDinamis :nama="t.ikon" :ukuran="28" /></span>
            <h3>{{ t.nama }}</h3>
            <p>{{ bahasa.pilih(t.deskripsi.id, t.deskripsi.en) }}</p>
          </div>
        </div>
      </section>

      <section class="bagian tim">
        <h2 class="judul-bagian">{{ bahasa.pilih('Tim Pengembang', 'Development Team') }}</h2>
        <div v-muncul class="kartu-tim">
          <h3>{{ bahasa.pilih(d.tim.judul.id, d.tim.judul.en) }}</h3>
          <p>{{ bahasa.pilih(d.tim.teks.id, d.tim.teks.en) }}</p>
          <span class="lencana">{{ bahasa.pilih(d.tim.lencana.id, d.tim.lencana.en) }}</span>
        </div>
      </section>
    </main>

    <main v-else-if="socialvit.galat" class="isi">
      <p class="pesan">
        {{ socialvit.galat }}
        <button type="button" class="coba-lagi" @click="socialvit.muat(true)">
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
  --merah: #fe2948;
  --biru: #3655f8;
  --oranye: #ea9c2b;

  min-height: 100vh;
  overflow-x: hidden;
  color: #fff;
  background: linear-gradient(135deg, var(--merah) 0%, var(--biru) 50%, var(--oranye) 100%);
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
  padding: 0 0.5rem 0 0.75rem;
  background: linear-gradient(135deg, rgba(254, 41, 72, 0.88), rgba(54, 85, 248, 0.88));
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(14px);
}
.judul-situs {
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
}
.judul-situs:hover {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
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

.isi {
  padding-bottom: 2rem;
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

/* --- Kartu kaca --- */
.kaca {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}
.hero {
  padding: 1.9rem 0.75rem 1.25rem;
  margin: 0.75rem;
  text-align: center;
}
.judul {
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.subjudul {
  max-width: 600px;
  margin: 0 auto;
  font-size: 0.9rem;
  line-height: 1.6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.bagian {
  max-width: 1200px;
  padding: 1.9rem 0.75rem;
  margin: 1.5rem 0.75rem 0;
}
.judul-bagian {
  position: relative;
  margin-bottom: 1.75rem;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
}
.judul-bagian::after {
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 80px;
  height: 3px;
  content: '';
  background: linear-gradient(90deg, var(--merah), var(--biru), var(--oranye));
  border-radius: 2px;
  transform: translateX(-50%);
}

/* --- Karusel --- */
.karusel {
  position: relative;
  height: 250px;
  overflow: hidden;
  border: 2px solid rgba(234, 156, 43, 0.5);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(254, 41, 72, 0.3);
}
.trek {
  display: flex;
  height: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.trek::-webkit-scrollbar {
  display: none;
}
.slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
  margin: 0;
  scroll-snap-align: center;
  background: #0d0d16;
}
.foto {
  position: absolute;
  inset: 0;
  padding: 0;
  cursor: zoom-in;
  background: transparent;
  border: 0;
}
.foto img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}
.tindih {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 0.9rem 0.9rem 1.7rem;
  pointer-events: none;
  background: linear-gradient(transparent, rgba(254, 41, 72, 0.9) 30%, rgba(54, 85, 248, 0.9));
}
.tindih h3 {
  margin-bottom: 0.3rem;
  font-size: 1rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
.tindih p {
  font-size: 0.78rem;
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
.panah {
  position: absolute;
  top: 40%;
  z-index: 5;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(45deg, rgba(254, 41, 72, 0.8), rgba(54, 85, 248, 0.8));
  border: 2px solid var(--oranye);
  border-radius: 50%;
  transform: translateY(-50%);
  transition: transform 0.2s ease;
}
.panah:hover {
  transform: translateY(-50%) scale(1.1);
}
.panah.kiri {
  left: 8px;
}
.panah.kanan {
  right: 8px;
}
.titik-baris {
  position: absolute;
  right: 0;
  bottom: 10px;
  left: 0;
  z-index: 5;
  display: flex;
  gap: 8px;
  justify-content: center;
  pointer-events: none;
}
.titik {
  width: 10px;
  height: 10px;
  padding: 0;
  pointer-events: auto;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.4);
  border: 0;
  border-radius: 50%;
}
.titik.aktif {
  background: var(--oranye);
  transform: scale(1.2);
}

/* --- Teknologi --- */
.grid-teknologi {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.teknologi {
  padding: 1.5rem 1.25rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(254, 41, 72, 0.2), rgba(54, 85, 248, 0.2));
  border: 1px solid rgba(234, 156, 43, 0.3);
  border-radius: 12px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}
.teknologi:hover {
  border-color: var(--oranye);
  box-shadow: 0 20px 40px rgba(254, 41, 72, 0.4);
  transform: translateY(-8px);
}
.ikon-tek {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 1rem;
  color: #fff;
  background: linear-gradient(45deg, var(--merah), var(--biru));
  border-radius: 50%;
}
.teknologi h3 {
  margin-bottom: 0.6rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--oranye);
}
.teknologi p {
  font-size: 0.85rem;
  line-height: 1.6;
  opacity: 0.92;
}

/* --- Tim --- */
.bagian.tim {
  max-width: 800px;
  padding: 1.9rem 0.75rem;
  margin-right: auto;
  margin-left: auto;
  background: none;
  border: 0;
  backdrop-filter: none;
}
.kartu-tim {
  padding: 1.5rem 1.25rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(254, 41, 72, 0.15), rgba(54, 85, 248, 0.15));
  border: 2px solid rgba(234, 156, 43, 0.5);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(254, 41, 72, 0.3);
  backdrop-filter: blur(15px);
}
.kartu-tim h3 {
  margin-bottom: 0.9rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--oranye);
}
.kartu-tim p {
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
  line-height: 1.7;
}
.lencana {
  display: inline-block;
  padding: 0.6rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(45deg, var(--merah), var(--biru));
  border: 2px solid var(--oranye);
  border-radius: 25px;
  box-shadow: 0 8px 16px rgba(234, 156, 43, 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .teknologi,
  .terjemah,
  .panah {
    transition: none;
  }
}

/* >= 641px: TABLET. Header ke tengah, galeri lebih tinggi, teknologi 2 kolom. */
@media (min-width: 641px) {
  .bilah {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    min-height: 56px;
    padding: 0 0.75rem;
  }
  .judul-situs {
    grid-column: 2;
    font-size: 0.95rem;
  }
  .terjemah {
    grid-column: 3;
    justify-self: end;
  }
  .hero {
    padding: 2.5rem 1rem 1.9rem;
    margin: 1rem;
  }
  .judul {
    font-size: 2rem;
  }
  .subjudul {
    font-size: 1rem;
  }
  .bagian {
    padding: 2.5rem 1rem;
    margin: 2rem 1rem 0;
  }
  .judul-bagian {
    margin-bottom: 2.1rem;
    font-size: 1.5rem;
  }
  .karusel {
    height: 300px;
  }
  .tindih {
    padding: 1.1rem 1.1rem 2rem;
  }
  .tindih h3 {
    font-size: 1.15rem;
  }
  .tindih p {
    font-size: 0.85rem;
  }
  .panah {
    width: 40px;
    height: 40px;
  }
  .grid-teknologi {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  .kartu-tim {
    padding: 1.9rem 1.5rem;
  }
  .kartu-tim p {
    font-size: 1rem;
  }
}

/* >= 768px: DESKTOP. */
@media (min-width: 768px) {
  .judul-situs {
    font-size: 1.05rem;
  }
  .hero {
    padding: 3.25rem 1.25rem 2.25rem;
    margin: 1.25rem;
  }
  .judul {
    font-size: 2.25rem;
  }
  .bagian {
    padding: 3.25rem 1.25rem;
    margin: 2.5rem 1.25rem 0;
  }
  .judul-bagian {
    font-size: 1.75rem;
  }
  .karusel {
    height: 400px;
  }
  .tindih {
    padding: 1.5rem 1.5rem 2.4rem;
  }
  .tindih h3 {
    font-size: 1.3rem;
  }
  .tindih p {
    font-size: 0.9rem;
  }
  .panah {
    width: 50px;
    height: 50px;
  }
  .panah.kiri {
    left: 20px;
  }
  .panah.kanan {
    right: 20px;
  }
  .grid-teknologi {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }
}

/* >= 1024px: DESKTOP LEBAR. Galeri paling tinggi, section dipusatkan. */
@media (min-width: 1024px) {
  .hero {
    max-width: 1200px;
    padding: 3.75rem 1.25rem 2.5rem;
    margin: 1.5rem auto 0;
  }
  .judul {
    font-size: 2.5rem;
  }
  .subjudul {
    font-size: 1.1rem;
  }
  .bagian {
    margin-right: auto;
    margin-left: auto;
  }
  .bagian:not(.tim) {
    padding: 3.75rem 1.5rem;
  }
  .judul-bagian {
    font-size: 2rem;
  }
  .karusel {
    height: 460px;
  }
  .titik {
    width: 14px;
    height: 14px;
  }
  .panah {
    width: 56px;
    height: 56px;
  }
}
</style>
