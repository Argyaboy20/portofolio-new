<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronUp, Languages, ShieldCheck, User } from '@lucide/vue'
import { useBahasaStore } from '../../stores/bahasa'
import { useAboutmeStore } from '../../stores/aboutme'
import { useBerandaStore } from '../../stores/beranda'

const bahasa = useBahasaStore()
const aboutme = useAboutmeStore()
const beranda = useBerandaStore()

const d = computed(() => aboutme.data)
const tahun = new Date().getFullYear()
const hakCipta = computed(() => beranda.data?.pengaturan?.footerTeks ?? null)

const tampilAtas = ref(false)
function saatGulir() {
  tampilAtas.value = window.scrollY > 200
}
function keAtas() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  aboutme.muat()
  window.addEventListener('scroll', saatGulir, { passive: true })
  saatGulir()
})
onBeforeUnmount(() => window.removeEventListener('scroll', saatGulir))
</script>

<template>
  <div class="halaman">
    <header class="bilah">
      <RouterLink to="/" class="judul-situs">Maulana Farras Blog's</RouterLink>
      <div class="kanan">
        <RouterLink to="/biodata" class="tautan">Biodata</RouterLink>
        <button
          type="button"
          class="terjemah"
          :title="bahasa.kode === 'id' ? 'Translate to English' : 'Terjemahkan ke Indonesia'"
          @click="bahasa.tukar()"
        >
          <Languages :size="16" aria-hidden="true" />
          <span>{{ bahasa.label }}</span>
        </button>
      </div>
    </header>

    <main v-if="d" class="isi">
      <div class="wadah">
        <aside class="samping">
          <div class="foto">
            <img v-if="d.fotoUrl" :src="d.fotoUrl" alt="" draggable="false" />
            <User v-else :size="72" aria-hidden="true" />
          </div>
        </aside>

        <article class="teks">
          <h1>{{ bahasa.pilih(d.judul.id, d.judul.en) }}</h1>
          <h2>{{ bahasa.pilih(d.sapaan.id, d.sapaan.en) }}</h2>
          <p v-for="(p, i) in d.paragraf" :key="i" :class="{ pembuka: i === 0 }">
            {{ bahasa.pilih(p.id, p.en) }}
          </p>

          <RouterLink to="/privacypolicy" class="kartu-privasi">
            <ShieldCheck :size="22" aria-hidden="true" />
            <span>{{ bahasa.pilih('Kebijakan Privasi', 'Privacy Policy') }}</span>
            <span aria-hidden="true">→</span>
          </RouterLink>
        </article>
      </div>
    </main>

    <main v-else-if="aboutme.galat" class="isi">
      <p class="pesan">
        {{ aboutme.galat }}
        <button type="button" class="coba-lagi" @click="aboutme.muat(true)">
          {{ bahasa.pilih('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>

    <footer class="kaki">
      <p>{{ hakCipta ?? `© ${tahun} Maulana Farras` }}</p>
    </footer>

    <button
      v-if="tampilAtas"
      type="button"
      class="atas"
      :aria-label="bahasa.pilih('Ke atas', 'Back to top')"
      @click="keAtas"
    >
      <ChevronUp :size="20" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop, 1024px desktop lebar. */
.halaman {
  --tulang: #faf8f5;
  --arang: #26262b;
  --teal: #2a9d8f;
  --amber: #e9a23b;

  min-height: 100vh;
  color: var(--arang);
  background: var(--tulang);
}
.halaman *,
.halaman *::before,
.halaman *::after {
  box-sizing: border-box;
}
h1,
h2,
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
  padding: 0 0.6rem 0 1rem;
  background: var(--arang);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}
.judul-situs {
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
}
.kanan {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.tautan {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--amber);
  text-decoration: none;
}
.terjemah {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  padding: 0.35rem 0.75rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: var(--teal);
  border: 0;
  border-radius: 999px;
  transition: filter 0.2s ease;
}
.terjemah:hover {
  filter: brightness(1.1);
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
  border: 1px solid var(--teal);
  border-radius: 999px;
}

/* --- Isi --- */
.wadah {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 1100px;
  padding: 2rem 1.25rem 2.5rem;
  margin: 0 auto;
}
.samping {
  display: flex;
  justify-content: center;
}
.foto {
  display: grid;
  place-items: center;
  width: 168px;
  height: 168px;
  overflow: hidden;
  color: var(--teal);
  background: #e9f3f1;
  border: 5px solid var(--tulang);
  border-radius: 50%;
  box-shadow:
    0 0 0 4px var(--teal),
    0 12px 28px rgba(42, 157, 143, 0.25);
}
.foto img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.teks h1 {
  display: inline-block;
  padding-bottom: 0.45rem;
  margin-bottom: 0.9rem;
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.3px;
  border-bottom: 4px solid var(--amber);
}
.teks h2 {
  margin-bottom: 1.1rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--teal);
}
.teks p {
  max-width: 70ch;
  margin-bottom: 1.1rem;
  font-size: 0.97rem;
  line-height: 1.75;
  color: rgba(38, 38, 43, 0.88);
}
.teks p.pembuka {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--arang);
}
.kartu-privasi {
  display: inline-flex;
  gap: 0.7rem;
  align-items: center;
  padding: 0.85rem 1.2rem;
  margin-top: 0.8rem;
  font-weight: 700;
  color: var(--teal);
  text-decoration: none;
  background: #fff;
  border: 1px solid rgba(42, 157, 143, 0.4);
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(38, 38, 43, 0.06);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.kartu-privasi:hover {
  box-shadow: 0 12px 24px rgba(42, 157, 143, 0.2);
  transform: translateY(-3px);
}

/* --- Footer --- */
.kaki {
  padding: 1rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  background: var(--arang);
}
.atas {
  position: fixed;
  right: 14px;
  bottom: 18px;
  z-index: 60;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: var(--amber);
  border: 0;
  border-radius: 50%;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

@media (prefers-reduced-motion: reduce) {
  .kartu-privasi,
  .terjemah {
    transition: none;
  }
}

/* >= 641px: TABLET. */
@media (min-width: 641px) {
  .bilah {
    min-height: 56px;
    padding: 0 1rem;
  }
  .judul-situs {
    font-size: 1rem;
  }
  .kanan {
    gap: 1rem;
  }
  .tautan,
  .terjemah {
    font-size: 0.9rem;
  }
  .wadah {
    padding: 2.5rem 2rem 3rem;
  }
  .foto {
    width: 200px;
    height: 200px;
  }
  .teks h1 {
    font-size: 2.3rem;
  }
  .teks p {
    font-size: 1.02rem;
  }
  .teks p.pembuka {
    font-size: 1.18rem;
  }
}

/* >= 768px: DESKTOP. Foto menempel di kiri, teks di kanan. */
@media (min-width: 768px) {
  .wadah {
    grid-template-columns: 260px 1fr;
    gap: 3rem;
    padding: 3.5rem 2rem 4rem;
  }
  .samping {
    position: sticky;
    top: 84px;
    align-self: start;
  }
  .foto {
    width: 240px;
    height: 240px;
  }
  .teks h1 {
    font-size: 2.8rem;
  }
}

/* >= 1024px: DESKTOP LEBAR. */
@media (min-width: 1024px) {
  .wadah {
    grid-template-columns: 300px 1fr;
    gap: 4rem;
  }
  .foto {
    width: 280px;
    height: 280px;
  }
  .teks h1 {
    font-size: 3.2rem;
  }
}
</style>
