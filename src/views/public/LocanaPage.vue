<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Check, ExternalLink, Languages, MapPin, Maximize2, Smartphone } from '@lucide/vue'
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
const pilih = ref(0)
const aktif = computed(() => fitur.value[Math.min(pilih.value, fitur.value.length - 1)] ?? null)
const terpilih = ref(null) // fitur yang detailnya sedang dibuka
const t = (id, en) => bahasa.pilih(id, en)

// Alur persetujuan Locana (statis, dari handoff)
const LANGKAH = [
  [
    'Minta izin',
    'Request access',
    'Pemantau mengirim permintaan lewat username.',
    'The monitor sends a request by username.',
  ],
  [
    'Setujui',
    'Approve',
    'Pemilik memilih durasi: 1 jam, 8 jam, 24 jam, atau sampai dicabut.',
    'The owner picks a duration: 1 hour, 8 hours, 24 hours, or until revoked.',
  ],
  [
    'Bagikan',
    'Share',
    'GPS perangkat pemilik tampil live di peta.',
    "The owner's device GPS shows live on the map.",
  ],
  [
    'Cabut',
    'Revoke',
    'Izin bisa dicabut kapan saja, akses langsung hilang.',
    'Access can be revoked at any time and ends instantly.',
  ],
]
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
        <span class="pin" aria-hidden="true"><MapPin :size="30" /></span>
        <h1>{{ t(d.kepala.judul.id, d.kepala.judul.en) }}</h1>
        <p class="deskripsi">{{ t(d.kepala.deskripsi.id, d.kepala.deskripsi.en) }}</p>
        <p class="prinsip">
          <Check :size="16" aria-hidden="true" />
          {{ t('Izin dulu, baru dilacak', 'Consent first, then tracking') }}
        </p>
      </section>

      <div class="wadah">
        <section class="bagian">
          <h2 class="judul-bagian">{{ t('Cara Kerja', 'How It Works') }}</h2>
          <ol class="langkah">
            <li v-for="(l, i) in LANGKAH" :key="i" v-muncul="i" class="langkah-item">
              <span class="no">{{ i + 1 }}</span>
              <h3>{{ t(l[0], l[1]) }}</h3>
              <p>{{ t(l[2], l[3]) }}</p>
            </li>
          </ol>
        </section>

        <section v-if="aktif" class="bagian">
          <h2 class="judul-bagian">{{ t('Galeri Fitur', 'Feature Gallery') }}</h2>
          <div class="galeri">
            <div class="tab" role="tablist">
              <button
                v-for="(f, i) in fitur"
                :key="f.id"
                type="button"
                role="tab"
                class="tab-item"
                :class="{ on: f.id === aktif.id }"
                :aria-selected="f.id === aktif.id"
                @click="pilih = i"
              >
                <span class="tab-no">{{ i + 1 }}</span>
                <span class="tab-teks">{{ t(f.judulId, f.judulEn) }}</span>
              </button>
            </div>

            <div class="sisi">
              <div class="browser">
                <div class="browser-atas" aria-hidden="true">
                  <i></i><i></i><i></i>
                  <span>locana-consent.fly.dev</span>
                </div>
                <Transition name="pudar" mode="out-in">
                  <button
                    :key="aktif.id"
                    type="button"
                    class="layar"
                    :aria-label="t('Lihat detail fitur', 'View feature details')"
                    @click="terpilih = aktif"
                  >
                    <img
                      :src="aktif.gambarUrl || aktif.kecilUrl"
                      :alt="t(aktif.judulId, aktif.judulEn)"
                      draggable="false"
                    />
                  </button>
                </Transition>
              </div>
              <div class="caption">
                <div>
                  <h3>{{ t(aktif.judulId, aktif.judulEn) }}</h3>
                  <p>{{ t(aktif.ringkasId, aktif.ringkasEn) }}</p>
                </div>
                <button type="button" class="detail" @click="terpilih = aktif">
                  <Maximize2 :size="15" aria-hidden="true" />
                  {{ t('Detail', 'Details') }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="bagian">
          <h2 class="judul-bagian">{{ t('Alat Pengembangan', 'Development Tools') }}</h2>
          <div class="spek">
            <div v-for="(a, i) in d.alat" :key="i" v-muncul="i % 3" class="spek-baris">
              <span class="spek-nama">
                <span class="ikon-alat"><IkonDinamis :nama="a.ikon" :ukuran="20" /></span>
                {{ a.nama }}
              </span>
              <span class="spek-ket">{{ t(a.deskripsi.id, a.deskripsi.en) }}</span>
            </div>
          </div>
        </section>

        <section v-if="d.tautan.website || d.tautan.android" class="ajakan">
          <h2>{{ t(d.ajakan.judul.id, d.ajakan.judul.en) }}</h2>
          <p>{{ t(d.ajakan.teks.id, d.ajakan.teks.en) }}</p>
          <div class="tombol-baris">
            <a
              v-if="d.tautan.website"
              :href="d.tautan.website"
              target="_blank"
              rel="noopener noreferrer"
              class="tombol utama"
            >
              {{ t('Buka Website', 'Launch Website') }}
              <ExternalLink :size="16" aria-hidden="true" />
            </a>
            <a
              v-if="d.tautan.android"
              :href="d.tautan.android"
              target="_blank"
              rel="noopener noreferrer"
              class="tombol"
            >
              <Smartphone :size="16" aria-hidden="true" />
              {{ t('Unduh Aplikasi', 'Download App') }}
            </a>
          </div>
        </section>
      </div>
    </main>

    <main v-else-if="locana.galat" class="isi">
      <p class="pesan">
        {{ locana.galat }}
        <button type="button" class="coba-lagi" @click="locana.muat(true)">
          {{ t('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>

    <ModalFiturLocana :item="terpilih" @tutup="terpilih = null" />
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop, 1024px desktop lebar.
   Tema: peta terang. Gradien biru-ungu mengikuti landing Locana. */
.halaman {
  --biru: #4171db;
  --ungu: #6863f2;
  --tinta: #1f2547;

  min-height: 100vh;
  overflow-x: clip;
  color: var(--tinta);
  background-color: #f3f5ff;
  background-image:
    linear-gradient(rgba(65, 113, 219, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(65, 113, 219, 0.07) 1px, transparent 1px);
  background-size: 36px 36px;
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
ol {
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
  padding: 0 0.75rem 0 1rem;
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid rgba(65, 113, 219, 0.18);
  backdrop-filter: blur(10px);
}
.judul-situs {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--biru);
  text-decoration: none;
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
  background: linear-gradient(135deg, var(--biru), var(--ungu));
  border: 0;
  border-radius: 999px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1.25rem 3rem;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, var(--biru), var(--ungu));
}
.pin {
  position: relative;
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 50%;
}
.pin::after {
  position: absolute;
  inset: -2px;
  content: '';
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: denyut 2.2s ease-out infinite;
}
@keyframes denyut {
  from {
    opacity: 0.9;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(1.9);
  }
}
.hero h1 {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.15;
}
.deskripsi {
  max-width: 36rem;
  margin: 0.8rem 0 1.2rem;
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.92;
}
.prinsip {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.35rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
}

.wadah {
  max-width: 1100px;
  padding: 0 1rem 3rem;
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
  color: var(--tinta);
}
.judul-bagian::after {
  display: block;
  width: 48px;
  height: 4px;
  margin: 0.5rem auto 0;
  content: '';
  background: linear-gradient(90deg, var(--biru), var(--ungu));
  border-radius: 999px;
}

/* --- Cara kerja --- */
.langkah {
  position: relative;
  display: grid;
  gap: 12px;
  padding: 0;
  list-style: none;
}
.langkah-item {
  padding: 1.1rem 1.1rem 1.1rem 4rem;
  position: relative;
  background: #fff;
  border: 1px solid rgba(65, 113, 219, 0.18);
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(65, 113, 219, 0.08);
}
.no {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--biru), var(--ungu));
  border-radius: 50%;
}
.langkah-item h3 {
  margin-bottom: 0.25rem;
  font-size: 1rem;
}
.langkah-item p {
  font-size: 0.86rem;
  line-height: 1.5;
  color: rgba(31, 37, 71, 0.75);
}

/* --- Galeri A --- */
.galeri {
  display: grid;
  gap: 1rem;
}
.tab {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}
.tab::-webkit-scrollbar {
  display: none;
}
.tab-item {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0.85rem 0.5rem 0.5rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--tinta);
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid rgba(65, 113, 219, 0.25);
  border-radius: 999px;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}
.tab-no {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--biru);
  background: #e8eeff;
  border-radius: 50%;
}
.tab-item.on {
  color: #fff;
  background: linear-gradient(135deg, var(--biru), var(--ungu));
  border-color: transparent;
}
.tab-item.on .tab-no {
  color: var(--ungu);
  background: #fff;
}

.browser {
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(65, 113, 219, 0.3);
  border-radius: 14px;
  box-shadow: 0 16px 36px rgba(65, 90, 190, 0.22);
}
.browser-atas {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #eef1fb;
  border-bottom: 1px solid rgba(65, 113, 219, 0.2);
}
.browser-atas i {
  width: 9px;
  height: 9px;
  background: #c7cff0;
  border-radius: 50%;
}
.browser-atas span {
  min-width: 0;
  padding: 0.12rem 0.7rem;
  margin-left: 0.5rem;
  overflow: hidden;
  font-size: 0.7rem;
  color: rgba(31, 37, 71, 0.6);
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #fff;
  border-radius: 999px;
}
.layar {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  padding: 0;
  cursor: zoom-in;
  background: #f6f8ff;
  border: 0;
}
.layar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
}
.pudar-enter-active,
.pudar-leave-active {
  transition: opacity 0.25s ease;
}
.pudar-enter-from,
.pudar-leave-to {
  opacity: 0;
}

.caption {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.9rem 0.25rem 0;
}
.caption h3 {
  margin-bottom: 0.2rem;
  font-size: 1.05rem;
}
.caption p {
  font-size: 0.88rem;
  line-height: 1.5;
  color: rgba(31, 37, 71, 0.75);
}
.detail {
  display: inline-flex;
  flex-shrink: 0;
  gap: 0.35rem;
  align-items: center;
  padding: 0.4rem 0.8rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--biru);
  cursor: pointer;
  background: #fff;
  border: 1px solid var(--biru);
  border-radius: 999px;
}
.detail:hover {
  color: #fff;
  background: var(--biru);
}

/* --- Alat: tabel spesifikasi --- */
.spek {
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(65, 113, 219, 0.2);
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(65, 113, 219, 0.08);
}
.spek-baris {
  display: grid;
  gap: 0.25rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(65, 113, 219, 0.12);
}
.spek-baris:last-child {
  border-bottom: 0;
}
.spek-baris:nth-child(odd) {
  background: #f8f9ff;
}
.spek-nama {
  display: inline-flex;
  gap: 0.6rem;
  align-items: center;
  font-weight: 700;
}
.ikon-alat {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: var(--biru);
  background: #e8eeff;
  border-radius: 8px;
}
.spek-ket {
  padding-left: 2.6rem;
  font-size: 0.85rem;
  color: rgba(31, 37, 71, 0.75);
}

/* --- Ajakan --- */
.ajakan {
  padding: 1.75rem 1.25rem;
  margin-top: 2.75rem;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, var(--biru), var(--ungu));
  border-radius: 20px;
}
.ajakan h2 {
  font-size: 1.4rem;
  font-weight: 800;
}
.ajakan p {
  max-width: 32rem;
  margin: 0.6rem auto 1.3rem;
  font-size: 0.92rem;
  opacity: 0.92;
}
.tombol-baris {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}
.tombol {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
}
.tombol.utama {
  color: var(--ungu);
  background: #fff;
  border-color: #fff;
}
.tombol:hover {
  filter: brightness(1.05);
}

@media (prefers-reduced-motion: reduce) {
  .pin::after {
    animation: none;
  }
  .tab-item,
  .pudar-enter-active,
  .pudar-leave-active {
    transition: none;
  }
}

/* >= 641px: TABLET */
@media (min-width: 641px) {
  .bilah {
    padding: 0 1.25rem;
  }
  .judul-situs {
    font-size: 1.05rem;
  }
  .hero {
    padding: 3.25rem 2rem 3.75rem;
  }
  .hero h1 {
    font-size: 2.8rem;
  }
  .deskripsi {
    font-size: 1.05rem;
  }
  .wadah {
    padding: 0 1.5rem 3.5rem;
  }
  .judul-bagian {
    font-size: 1.7rem;
  }
  .langkah {
    grid-template-columns: repeat(2, 1fr);
  }
  .spek-baris {
    grid-template-columns: 14rem 1fr;
    align-items: center;
    gap: 1rem;
  }
  .spek-ket {
    padding-left: 0;
  }
}

/* >= 768px: DESKTOP. Tab jadi daftar di kiri. */
@media (min-width: 768px) {
  .hero {
    padding: 4rem 2rem 4.5rem;
  }
  .hero h1 {
    font-size: 3.4rem;
  }
  .galeri {
    grid-template-columns: 230px 1fr;
    align-items: start;
    gap: 1.5rem;
  }
  .tab {
    flex-direction: column;
    overflow: visible;
  }
  .tab-item {
    width: 100%;
    border-radius: 14px;
  }
  .caption h3 {
    font-size: 1.15rem;
  }
}

/* >= 1024px: DESKTOP LEBAR */
@media (min-width: 1024px) {
  .langkah {
    grid-template-columns: repeat(4, 1fr);
  }
  .langkah-item {
    padding: 4rem 1.1rem 1.1rem;
  }
  .galeri {
    grid-template-columns: 260px 1fr;
  }
}
</style>
