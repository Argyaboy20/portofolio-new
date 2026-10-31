<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { Activity, CodeXml, ExternalLink, LayoutDashboard, LogOut, Mail, Menu, Quote, User, X } from '@lucide/vue'
import { api } from '../../api/http'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const buka = ref(false) // laci menu di HP dan tablet

const kelompok = [
  { judul: null, butir: [{ ke: '/admin/dashboard', label: 'Dashboard', ikon: LayoutDashboard }] },
  {
    judul: 'Beranda',
    butir: [
      { ke: '/admin/beranda/profil', label: 'Profil', ikon: User },
      { ke: '/admin/beranda/kontak', label: 'Kontak', ikon: Mail },
      { ke: '/admin/beranda/keahlian', label: 'Keahlian', ikon: Activity },
      { ke: '/admin/beranda/tools', label: 'Alat dan Teknologi', ikon: CodeXml },
      { ke: '/admin/beranda/publikasi', label: 'Publikasi', ikon: Quote },
    ],
  },
]

function keluar() {
  auth.logout()
  router.push('/')
}

function saatTombol(e) {
  if (e.key === 'Escape') buka.value = false
}

watch(() => route.path, () => (buka.value = false))
// Kunci html saja (bukan body): mengunci body membuat elemen sticky lepas dari layar
watch(buka, (nilai) => {
  document.documentElement.style.overflow = nilai ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', saatTombol)
  // Memastikan sesi masih sah di server; 401 ditangani api() (sesi dibersihkan lalu ke beranda)
  api('/api/admin/me', { loading: false }).catch(() => {})
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', saatTombol)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div class="admin">
    <div v-if="buka" class="tabir" @click="buka = false"></div>

    <aside class="samping" :class="{ buka }" aria-label="Menu admin">
      <div class="merek">
        <span>Admin Portofolio</span>
        <button type="button" class="tutup" aria-label="Tutup menu" @click="buka = false">
          <X :size="20" aria-hidden="true" />
        </button>
      </div>
      <nav class="menu">
        <template v-for="k in kelompok" :key="k.judul ?? 'utama'">
          <p v-if="k.judul" class="grup">{{ k.judul }}</p>
          <RouterLink v-for="b in k.butir" :key="b.ke" :to="b.ke" class="butir" active-class="aktif">
            <component :is="b.ikon" :size="18" aria-hidden="true" />
            {{ b.label }}
          </RouterLink>
        </template>
      </nav>
      <div class="kaki">
        <a href="/" target="_blank" rel="noopener" class="butir">
          <ExternalLink :size="18" aria-hidden="true" /> Lihat situs
        </a>
        <button type="button" class="butir" @click="keluar">
          <LogOut :size="18" aria-hidden="true" /> Keluar
        </button>
      </div>
    </aside>

    <div class="kanan">
      <header class="bar">
        <button type="button" class="hamburger" :aria-expanded="buka" aria-label="Buka menu" @click="buka = !buka">
          <Menu :size="22" aria-hidden="true" />
        </button>
        <span class="email">{{ auth.email }}</span>
      </header>
      <main class="isi">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px): menu berupa laci yang digeser dari kiri.
   Override: min-width 641px (ruang isi lebih lega), 1024px (menu tetap di kiri). */
.admin {
  min-height: 100vh;
  color: #222;
  background: #f3f5f9;
}
.kanan {
  min-width: 0;
}
.bar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: #fff;
  border-bottom: 1px solid #e3e7ee;
}
.hamburger {
  display: grid;
  place-items: center;
  padding: 0.35rem;
  color: #1f2d3d;
  background: none;
  border: 0;
  cursor: pointer;
}
.email {
  max-width: 60vw;
  margin-left: auto;
  overflow: hidden;
  font-size: 0.8rem;
  color: #6b7686;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.isi {
  padding: 1rem;
}

.tabir {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: rgba(0, 0, 0, 0.45);
}
.samping {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 300;
  display: flex;
  flex-direction: column;
  width: 16rem;
  max-width: 85vw;
  color: #fff;
  background: #1f2d3d;
  transform: translateX(-100%);
  transition: transform 0.25s ease;
}
.samping.buka {
  transform: none;
}
.merek {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.tutup {
  display: grid;
  place-items: center;
  color: #fff;
  background: none;
  border: 0;
  cursor: pointer;
}
.menu {
  flex: 1;
  padding: 0.75rem 0.5rem;
  overflow-y: auto;
}
.grup {
  margin: 1rem 0.75rem 0.3rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #8fa0b5;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.butir {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  font: inherit;
  font-size: 0.9rem;
  color: #dbe3ee;
  text-align: left;
  text-decoration: none;
  background: none;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.butir:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}
.butir.aktif {
  color: #fff;
  background: #2e87f6;
}
.kaki {
  padding: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

@media (prefers-reduced-motion: reduce) {
  .samping {
    transition: none;
  }
}

@media (min-width: 641px) {
  .isi {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .admin {
    display: grid;
    grid-template-columns: 16rem 1fr;
  }
  .samping {
    position: sticky;
    top: 0;
    z-index: auto;
    width: auto;
    max-width: none;
    height: 100vh;
    transform: none;
  }
  .hamburger,
  .tutup,
  .tabir {
    display: none;
  }
  .isi {
    padding: 2rem 2.5rem;
  }
}
</style>