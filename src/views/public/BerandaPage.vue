<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, X } from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import BagianBeranda from '../../components/BagianBeranda.vue'
import ProfilSingkat from '../../components/ProfilSingkat.vue'
import DaftarKeahlian from '../../components/DaftarKeahlian.vue'
import DaftarPendidikan from '../../components/DaftarPendidikan.vue'
import FilterTools from '../../components/FilterTools.vue'
import DaftarTools from '../../components/DaftarTools.vue'
import UrutProject from '../../components/UrutProject.vue'
import DaftarProject from '../../components/DaftarProject.vue'
import { useBahasaStore } from '../../stores/bahasa'
import { useBerandaStore } from '../../stores/beranda'

const bahasa = useBahasaStore()
const beranda = useBerandaStore()
const menuBuka = ref(false)

const panelKiri = ref(null)
const mengecil = ref(false)

const layarKecil = window.matchMedia('(max-width: 767px)') // HP dan tablet: efek aktif
const layarHP = window.matchMedia('(max-width: 640px)')
let jadwal = 0

function perbarui() {
  jadwal = 0
  const el = panelKiri.value
  if (!el) return
  // Desktop: tanpa efek, kembalikan ke keadaan besar
  if (!layarKecil.matches) {
    mengecil.value = false
    el.style.removeProperty('--gulir')
    return
  }
  const y = window.scrollY
  const ambang = layarHP.matches ? 10 : 100
  el.style.setProperty('--gulir', String(Math.min(y / ambang, 1)))
  if (layarHP.matches ? y >= ambang : y > 0) mengecil.value = true
  // Kembali besar hanya saat benar-benar di paling atas
  if (y <= 0) mengecil.value = false
}

function jadwalkan() {
  if (!jadwal) jadwal = requestAnimationFrame(perbarui)
}

onMounted(() => {
  beranda.muat()
  window.addEventListener('scroll', jadwalkan, { passive: true })
  layarKecil.addEventListener('change', jadwalkan)
  layarHP.addEventListener('change', jadwalkan)
  perbarui()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', jadwalkan)
  layarKecil.removeEventListener('change', jadwalkan)
  layarHP.removeEventListener('change', jadwalkan)
  if (jadwal) cancelAnimationFrame(jadwal)
})

const profil = computed(() => beranda.data?.profil ?? null)
const kontak = computed(() => beranda.data?.kontak ?? [])
const keahlian = computed(() => beranda.data?.keahlian ?? [])
const pendidikan = computed(() => beranda.data?.pendidikan ?? [])
const tools = computed(() => beranda.data?.tools ?? [])
const filterTool = ref('all')
const urutanProject = ref('newest')
// "YYYY-MM" bisa dibandingkan sebagai teks; selisih bulan sama diurutkan dengan id
const projects = computed(() => {
  const salinan = [...(beranda.data?.projects ?? [])]
  salinan.sort((a, b) => a.mulai.localeCompare(b.mulai) || a.id - b.id)
  return urutanProject.value === 'newest' ? salinan.reverse() : salinan
})

const namaLengkap = computed(() =>
  profil.value ? `${profil.value.nama}${profil.value.gelar ? ', ' + profil.value.gelar : ''}` : '',
)
const inisial = computed(() =>
  (profil.value?.nama ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join(''),
)

function tautanKontak(k) {
  return k.jenis === 'email' ? `mailto:${k.url}` : k.url
}
</script>

<template>
  <div class="halaman">
    <header class="navbar">
      <div class="navbar-isi">
        <RouterLink to="/" class="judul">
          <span class="p">Maulana Farras</span><span class="s"> Blog's</span>
        </RouterLink>

        <nav class="menu-desktop" aria-label="Menu utama">
          <RouterLink to="/aboutme" class="tautan">About Me</RouterLink>
        </nav>

        <div class="aksi">
          <RouterLink to="/biodata" class="tautan">Biodata</RouterLink>
          <button type="button" class="tautan" @click="bahasa.tukar()">{{ bahasa.label }}</button>
          <button
            type="button"
            class="hamburger"
            :aria-expanded="menuBuka"
            aria-label="Buka menu"
            @click="menuBuka = !menuBuka"
          >
            <X v-if="menuBuka" :size="22" />
            <Menu v-else :size="22" />
          </button>
        </div>
      </div>

      <nav v-if="menuBuka" class="menu-mobile" aria-label="Menu seluler">
        <RouterLink to="/aboutme" @click="menuBuka = false">About Me</RouterLink>
        <RouterLink to="/privacypolicy" @click="menuBuka = false">Privacy Policy</RouterLink>
      </nav>
    </header>

    <div class="isi">
      <aside ref="panelKiri" class="panel-kiri" :class="{ mengecil }">
        <template v-if="profil">
          <div class="kepala">
            <div class="foto" aria-hidden="true">
              <img v-if="profil.fotoUrl" :src="profil.fotoUrl" alt="" />
              <span v-else>{{ inisial }}</span>
            </div>

            <div class="info">
              <h1 class="nama">{{ namaLengkap }}</h1>
              <p class="jabatan">{{ bahasa.pilih(profil.jabatanId, profil.jabatanEn) }}</p>
            </div>

            <RouterLink to="/itsupport" class="support">
              {{ bahasa.pilih(profil.labelSupportId, profil.labelSupportEn) }}
            </RouterLink>

            <a v-if="profil.cvUrl" class="cv" :href="profil.cvUrl" target="_blank" rel="noopener noreferrer">
              {{ bahasa.pilih('Lihat CV', 'View CV') }}
            </a>
          </div>

          <div class="kontak">
            <div class="kontak-isi">
              <h2>{{ bahasa.pilih('Kontak Pribadi', 'Contact Person') }}</h2>
              <div class="ikon-kontak">
                <a
                  v-for="k in kontak"
                  :key="k.id"
                  :href="tautanKontak(k)"
                  :aria-label="k.jenis"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IkonDinamis :nama="k.jenis" ukuran="1.35rem" />
                </a>
              </div>
            </div>
          </div>
        </template>

        <p v-else-if="beranda.galat" class="galat">
          {{ beranda.galat }}
          <button type="button" @click="beranda.muat(true)">Coba lagi</button>
        </p>
      </aside>

      <main class="panel-kanan">
        <template v-if="profil">
          <BagianBeranda id="about" :judul="bahasa.pilih('Profil Singkat', 'Brief Profile')">
            <ProfilSingkat :profil="profil" />
          </BagianBeranda>

          <BagianBeranda v-if="pendidikan.length" id="education" :judul="bahasa.pilih('Pendidikan', 'Education')">
            <DaftarPendidikan :daftar="pendidikan" />
          </BagianBeranda>

          <BagianBeranda id="skills" :judul="bahasa.pilih('Keahlian', 'Skills')">
            <template #default="{ tampil }">
              <DaftarKeahlian :daftar="keahlian" :tampil="tampil" />
            </template>
          </BagianBeranda>

          <BagianBeranda
            v-if="tools.length"
            id="tools"
            :judul="bahasa.pilih('Alat dan Teknologi', 'Tools and Technologies')"
          >
            <template #aksi>
              <FilterTools v-model="filterTool" />
            </template>
            <DaftarTools :tools="tools" :filter="filterTool" />
          </BagianBeranda>

          <BagianBeranda
            v-if="projects.length"
            id="projects"
            :judul="bahasa.pilih('Project Terbaru', 'Latest Projects')"
          >
            <template #aksi>
              <UrutProject v-model="urutanProject" />
            </template>
            <DaftarProject :daftar="projects" />
          </BagianBeranda>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px (tablet),
   768px (desktop, split screen), dan 1024px (desktop besar). */
.halaman {
  min-height: 100vh;
  background: #f5f7fa;
  color: #333;
}

/* --- Navbar --- */
.navbar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: #000;
}
.navbar-isi {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 3.5rem;
  padding: 0 1rem;
}
.judul {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-decoration: none;
}
.p {
  color: #4a90e2;
}
.s {
  color: #50e3c2;
}
.menu-desktop {
  display: none;
}
.aksi {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.tautan {
  padding: 0.4rem 0.6rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  color: #4a90e2;
  text-decoration: none;
  text-transform: uppercase;
  background: none;
  border: 0;
  cursor: pointer;
}
.tautan:hover {
  color: #50e3c2;
}
.hamburger {
  display: grid;
  place-items: center;
  padding: 0.4rem;
  color: #fff;
  background: none;
  border: 0;
  cursor: pointer;
}
.menu-mobile {
  display: flex;
  flex-direction: column;
  background: #2c3e50;
}
.menu-mobile a {
  padding: 0.9rem 1rem;
  color: #fff;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

/* --- Isi: satu kolom di mobile --- */
.isi {
  display: block;
}
.panel-kiri {
  position: sticky;
  top: 3.5rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(1.5rem - 0.8rem * var(--gulir, 0)) 1.5rem;
  color: #fff;
  text-align: center;
  background: #2c3e50;
  transition: padding 0.4s ease, box-shadow 0.4s ease;
}
.kepala {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.info {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.foto {
  display: grid;
  place-items: center;
  width: 130px;
  height: 130px;
  margin-bottom: 1rem;
  overflow: hidden;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #4a90e2, #50e3c2);
  border: 3px solid #50e3c2;
  border-radius: 50%;
  flex-shrink: 0;
  transition: width 0.4s ease, height 0.4s ease, margin 0.4s ease, font-size 0.4s ease;
}
.foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 70%;
}
.nama {
  margin: 0 0 0.1rem;
  font-size: 1.5rem;
  font-weight: 700;
}
.jabatan {
  margin: 0 0 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}
.support {
  max-height: 2rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: max-height 0.4s ease, opacity 0.4s ease, margin 0.4s ease;
}
.support:hover {
  color: #fff;
}
.cv {
  margin: 0.5rem 0 0.3rem;
  padding: 0.4rem 1rem;
  color: rgba(255, 255, 255, 0.95);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
}
.cv:hover {
  background: rgba(255, 255, 255, 0.15);
}
.kontak {
  display: grid;
  grid-template-rows: 1fr;
  width: 100%;
  margin-top: 0.8rem;
  transition: grid-template-rows 0.4s ease, opacity 0.4s ease, margin-top 0.4s ease;
}
.kontak-isi {
  min-height: 0;
  padding-top: 4px;
  overflow: hidden;
}
.kontak h2 {
  margin: 0 0 0.4rem;
  font-size: 1.2rem;
  color: #50e3c2;
}
.ikon-kontak {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.ikon-kontak a {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin: 0.3rem 0.45rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: background 0.3s, transform 0.3s;
}
.ikon-kontak a:hover {
  background: #4a90e2;
  transform: translateY(-3px);
}
/* --- Keadaan mengecil (HP dan tablet saja; JS tidak memasangnya di desktop) --- */
.panel-kiri.mengecil {
  padding: 10px 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
.mengecil .kepala {
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
}
.mengecil .foto {
  width: 45px;
  height: 45px;
  margin: 0;
  font-size: 1rem;
  border-width: 2px;
}
.mengecil .info {
  flex: 1;
  min-width: 0;
  align-items: flex-start;
  text-align: left;
}
.mengecil .nama {
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  font-size: clamp(12px, 3.8vw, 14px);
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mengecil .jabatan {
  max-width: 100%;
  margin: 2px 0 0;
  overflow: hidden;
  font-size: clamp(9px, 2.8vw, 10px);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mengecil .support {
  flex: 0 0 0;
  width: 0;
  max-height: 0;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  opacity: 0;
}
.mengecil .cv {
  flex-shrink: 0;
  margin: 0;
  padding: 5px 12px;
  font-size: 10px;
}
.mengecil .kontak {
  grid-template-rows: 0fr;
  margin-top: 0;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .panel-kiri,
  .foto,
  .support,
  .kontak {
    transition: none;
  }
}
.galat {
  color: #ffb4b4;
}
.galat button {
  margin-left: 0.5rem;
  cursor: pointer;
}
.panel-kanan {
  padding: 1.25rem;
}
.menyusul {
  color: #777;
}

@media (min-width: 641px) {
  .judul {
    font-size: 0.9rem;
  }
  .panel-kiri {
    padding: calc(1.75rem - 0.8rem * var(--gulir, 0)) 2rem;
  }
  .foto {
    width: 155px;
    height: 155px;
  }
  .nama {
    font-size: 1.75rem;
  }
  .panel-kanan {
    padding: 1.5rem;
  }
}

@media (min-width: 768px) {
  .judul {
    font-size: 1rem;
  }
  .menu-desktop {
    display: block;
    margin-right: auto;
    margin-left: 1rem;
  }
  .hamburger,
  .menu-mobile {
    display: none;
  }
  .isi {
    display: grid;
    grid-template-columns: 38% 1fr;
  }
  .panel-kiri {
    position: sticky;
    top: 3.5rem;
    align-self: start;
    justify-content: center;
    height: calc(100vh - 3.5rem);
    padding: 1.5rem 1.25rem;
    overflow-y: auto;
  }
  .foto {
    width: 170px;
    height: 170px;
  }
  .nama {
    font-size: 1.8rem;
  }
  .panel-kanan {
    padding: 2rem 2.5rem;
  }
}

@media (min-width: 1024px) {
  .isi {
    grid-template-columns: 35% 1fr;
  }
  .panel-kiri {
    padding: 2rem 1.9rem;
  }
  .panel-kanan {
    padding: 2rem 3rem;
  }
}
</style>