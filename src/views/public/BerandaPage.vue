<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, X } from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import { useBahasaStore } from '../../stores/bahasa'
import { useBerandaStore } from '../../stores/beranda'

const bahasa = useBahasaStore()
const beranda = useBerandaStore()
const menuBuka = ref(false)

onMounted(() => beranda.muat())

const profil = computed(() => beranda.data?.profil ?? null)
const kontak = computed(() => beranda.data?.kontak ?? [])

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
      <aside class="panel-kiri">
        <template v-if="profil">
          <div class="foto" aria-hidden="true">
            <img v-if="profil.fotoUrl" :src="profil.fotoUrl" alt="" />
            <span v-else>{{ inisial }}</span>
          </div>

          <h1 class="nama">{{ namaLengkap }}</h1>
          <p class="jabatan">{{ bahasa.pilih(profil.jabatanId, profil.jabatanEn) }}</p>

          <RouterLink to="/itsupport" class="support">
            {{ bahasa.pilih(profil.labelSupportId, profil.labelSupportEn) }}
          </RouterLink>

          <a v-if="profil.cvUrl" class="cv" :href="profil.cvUrl" target="_blank" rel="noopener noreferrer">
            {{ bahasa.pilih('Lihat CV', 'View CV') }}
          </a>

          <div class="kontak">
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
        </template>

        <p v-else-if="beranda.galat" class="galat">
          {{ beranda.galat }}
          <button type="button" @click="beranda.muat(true)">Coba lagi</button>
        </p>
      </aside>

      <main class="panel-kanan">
        <p class="menyusul">Bagian konten menyusul.</p>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  color: #fff;
  text-align: center;
  background: #2c3e50;
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
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
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
  width: 100%;
  margin-top: 0.8rem;
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