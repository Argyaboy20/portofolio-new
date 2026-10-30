<script setup>
import { computed, nextTick, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Code, Dumbbell, Gamepad2, Headphones, MapPin, Quote } from '@lucide/vue'
import { siQuora, siWhatsapp } from 'simple-icons'
import NavbarHalaman from '../../components/NavbarHalaman.vue'
import { useBahasaStore } from '../../stores/bahasa'
import { useBiodataStore } from '../../stores/biodata'
import { vMuncul } from '../../utils/muncul'

const bahasa = useBahasaStore()
const biodata = useBiodataStore()
const route = useRoute()
const data = computed(() => biodata.data)
const tahun = new Date().getFullYear()

const IKON_HOBI = { code: Code, gamepad: Gamepad2, headphones: Headphones, dumbbell: Dumbbell }
const ikonHobi = (kunci) => IKON_HOBI[kunci] ?? Code

const fakta = computed(() =>
  data.value
    ? [
        { angka: `${data.value.fakta.proyek}+`, id: 'Proyek Selesai', en: 'Projects Completed' },
        { angka: `${data.value.fakta.tahunCoding}+`, id: 'Tahun Coding', en: 'Years Coding' },
        { angka: `${data.value.fakta.techStack}+`, id: 'Tech Stack', en: 'Tech Stacks' },
        { angka: '∞', id: 'Cangkir Kopi', en: 'Coffee Cups' },
      ]
    : [],
)

const tautanWa = computed(() => {
  const k = data.value?.kontak
  if (!k) return '#'
  return `https://wa.me/${k.waNomor.replace(/\D/g, '')}?text=${encodeURIComponent(k.waPesan)}`
})
const quoraAman = computed(() => (data.value?.kontak?.quoraUrl ?? '').startsWith('https://'))

onMounted(async () => {
  await biodata.muat()
  if (route.hash === '#kontak') {
    await nextTick()
    document.getElementById('kontak')?.scrollIntoView({ behavior: 'smooth' })
  }
})
</script>

<template>
  <div class="halaman">
    <NavbarHalaman>
      <template #aksi>
        <RouterLink to="/galeri-kehidupan" class="tautan">
          {{ bahasa.pilih('Galeri Kehidupan', 'Life Gallery') }}
        </RouterLink>
      </template>
    </NavbarHalaman>

    <template v-if="data">
      <!-- Hero -->
      <section class="hero">
        <div class="lingkaran l1" aria-hidden="true"></div>
        <div class="lingkaran l2" aria-hidden="true"></div>
        <div class="lingkaran l3" aria-hidden="true"></div>
        <div class="hero-isi">
          <h1>
            {{ bahasa.pilih(data.hero.awalId, data.hero.awalEn) }}
            <span class="gradien">{{ data.nama }}</span>
          </h1>
          <p>{{ bahasa.pilih(data.hero.subjudulId, data.hero.subjudulEn) }}</p>
        </div>
      </section>

      <!-- Perjalananku -->
      <section class="bagian terang">
        <h2 v-muncul class="muncul judul">{{ bahasa.pilih('Perjalananku', 'My Journey') }}</h2>
        <div class="linimasa">
          <div v-for="l in data.linimasa" :key="l.id" v-muncul class="muncul butir">
            <div class="titik" aria-hidden="true"></div>
            <div class="kartu">
              <h3>{{ bahasa.pilih(l.periodeId, l.periodeEn) }}</h3>
              <h4>{{ bahasa.pilih(l.judulId, l.judulEn) }}</h4>
              <p>{{ bahasa.pilih(l.deskripsiId, l.deskripsiEn) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Hobi -->
      <section class="bagian putih">
        <h2 v-muncul class="muncul judul">{{ bahasa.pilih('Hobby dan Ketertarikan', 'Hobbies & Interests') }}</h2>
        <div class="hobi-grid">
          <article v-for="(h, i) in data.hobi" :key="h.id" v-muncul="i + 1" class="muncul hobi">
            <div class="hobi-ikon"><component :is="ikonHobi(h.ikon)" :size="26" aria-hidden="true" /></div>
            <h3>{{ bahasa.pilih(h.judulId, h.judulEn) }}</h3>
            <p>{{ bahasa.pilih(h.deskripsiId, h.deskripsiEn) }}</p>
          </article>
        </div>
      </section>

      <!-- Fakta singkat -->
      <section class="bagian fakta">
        <h2 v-muncul class="muncul judul">{{ bahasa.pilih('Fakta Singkat', 'Quick Facts') }}</h2>
        <div class="fakta-baris">
          <div v-for="(f, i) in fakta" :key="f.id" v-muncul="i + 1" class="muncul fakta-butir">
            <div class="angka">{{ f.angka }}</div>
            <div class="label">{{ bahasa.pilih(f.id, f.en) }}</div>
          </div>
        </div>
      </section>

      <!-- Kutipan -->
      <section class="bagian terang kutipan">
        <div v-muncul class="muncul kutipan-isi">
          <Quote class="kutipan-ikon" :size="64" aria-hidden="true" />
          <blockquote>"{{ data.kutipan.teks }}"</blockquote>
          <cite>- {{ data.kutipan.sumber }}</cite>
        </div>
      </section>

      <!-- Kontak -->
      <section id="kontak" class="kontak">
        <div class="kontak-isi">
          <h2 v-muncul class="muncul kontak-judul">
            {{ bahasa.pilih('Platform Diskusi Saya', 'My Discussion Platforms') }}
          </h2>
          <div v-muncul="1" class="muncul kontak-baris">
            <a :href="tautanWa" class="kontak-butir" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                <path :d="siWhatsapp.path" />
              </svg>
              <strong>{{ bahasa.pilih('Hubungi di sini', 'Contact me here') }}</strong>
            </a>
            <a v-if="quoraAman" :href="data.kontak.quoraUrl" class="kontak-butir" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                <path :d="siQuora.path" />
              </svg>
              <strong>{{ bahasa.pilih('Profil Quora', 'Quora Profile') }}</strong>
            </a>
            <div class="kontak-butir">
              <MapPin :size="24" aria-hidden="true" />
              <span>{{ data.kontak.lokasi }}</span>
            </div>
          </div>
          <p class="hakcipta">
            &copy; {{ tahun }} - {{ bahasa.pilih(data.pengaturan.hakCiptaId, data.pengaturan.hakCiptaEn) }}
          </p>
        </div>
      </section>
    </template>

    <p v-else-if="biodata.galat" class="galat">
      {{ biodata.galat }}
      <button type="button" @click="biodata.muat(true)">Coba lagi</button>
    </p>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px (tablet),
   768px (desktop), dan 1024px (desktop besar). */
.halaman {
  min-height: 100vh;
  background: #f5f7fa;
  color: #333;
}
.galat {
  padding: 2rem 1rem;
  text-align: center;
  color: #c0392b;
}
.galat button {
  margin-left: 0.5rem;
  cursor: pointer;
}

/* --- Hero --- */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  overflow: hidden;
  background: linear-gradient(135deg, #2c3e50, #4a90e2);
}
.hero-isi {
  position: relative;
  z-index: 2;
  padding: 1.5rem;
  text-align: center;
}
.hero h1 {
  margin: 0 0 1rem;
  font-size: 2rem;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
.hero p {
  max-width: 600px;
  margin: 0 auto;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}
.gradien {
  font-weight: 700;
  background: linear-gradient(to right, #50e3c2, #ff6b6b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.lingkaran {
  position: absolute;
  border-radius: 50%;
  opacity: 0.2;
}
.l1 {
  bottom: -150px;
  left: -50px;
  width: 200px;
  height: 200px;
  background: #50e3c2;
  animation: melayang 8s ease-in-out infinite;
}
.l2 {
  top: -100px;
  right: 10%;
  width: 150px;
  height: 150px;
  background: #ff6b6b;
  animation: melayang 6s ease-in-out infinite reverse;
}
.l3 {
  top: 40%;
  right: -50px;
  width: 100px;
  height: 100px;
  background: #4a90e2;
  animation: melayang 7s ease-in-out infinite 1s;
}
@keyframes melayang {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(15px, 15px);
  }
}

/* --- Bagian umum --- */
.bagian {
  padding: 2.5rem 1rem;
}
.terang {
  background: #f5f7fa;
}
.putih {
  background: #fff;
}
.judul {
  position: relative;
  margin: 0 0 1.5rem;
  font-size: 1.8rem;
  text-align: center;
  color: #2c3e50;
}
.judul::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 50px;
  height: 3px;
  background: linear-gradient(to right, #4a90e2, #50e3c2);
  transform: translateX(-50%);
}

/* --- Perjalananku: satu kolom, garis di kiri --- */
.linimasa {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}
.linimasa::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 23px;
  width: 3px;
  background: linear-gradient(to bottom, #4a90e2, #50e3c2);
  transform: translateX(-50%);
}
.butir {
  position: relative;
  margin-bottom: 1.5rem;
  padding: 10px 8px 10px 60px;
  text-align: left;
}
.titik {
  position: absolute;
  top: 15px;
  left: 13px;
  z-index: 1;
  width: 20px;
  height: 20px;
  background: #ff6b6b;
  border: 4px solid #f5f7fa;
  border-radius: 50%;
  transition: transform 0.3s ease;
}
.butir:hover .titik {
  transform: scale(1.2);
}
.kartu {
  padding: 1.2rem 1rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}
.kartu:hover {
  transform: translateY(-5px);
}
.kartu h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #ff6b6b;
}
.kartu h4 {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  color: #4a90e2;
}
.kartu p {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #333;
}

/* --- Hobi --- */
.hobi-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
.hobi {
  position: relative;
  padding: 1.5rem 1rem;
  overflow: hidden;
  text-align: center;
  background: #f5f7fa;
  border-radius: 15px;
}
.hobi::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(to right, #4a90e2, #50e3c2);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.hobi:hover::before {
  opacity: 1;
}
.hobi-ikon {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  margin: 0 auto;
  color: #4a90e2;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.hobi h3 {
  margin: 1rem 0;
  font-size: 1.1rem;
  color: #2c3e50;
}
.hobi p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #666;
}

/* --- Fakta singkat --- */
.fakta {
  color: #fff;
  background: linear-gradient(135deg, #2c3e50, #4a90e2);
}
.fakta .judul {
  color: #fff;
}
.fakta .judul::after {
  background: #50e3c2;
}
.fakta-baris {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto;
}
.fakta-butir {
  flex: 1;
  min-width: 140px;
  padding: 1.2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}
.angka {
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  color: #50e3c2;
}
.label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

/* --- Kutipan --- */
.kutipan {
  padding: 3rem 1rem;
}
.kutipan-isi {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}
.kutipan-ikon {
  position: absolute;
  top: -2.5rem;
  left: 50%;
  color: rgba(74, 144, 226, 0.1);
  transform: translateX(-50%);
}
.kutipan blockquote {
  margin: 0;
  padding: 0 1rem;
  font-size: 1.4rem;
  font-style: italic;
  line-height: 1.6;
  color: #2c3e50;
}
.kutipan cite {
  display: block;
  margin-top: 1.5rem;
  font-style: normal;
  font-weight: 500;
  color: #4a90e2;
}

/* --- Kontak --- */
.kontak {
  padding: 2.5rem 0;
  scroll-margin-top: 4rem;
  background: linear-gradient(135deg, #2c3e50, #4a90e2);
}
.kontak-isi {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}
.kontak-judul {
  position: relative;
  margin: 0 0 2rem;
  padding-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
}
.kontak-judul::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #4a90e2, #50e3c2);
  border-radius: 2px;
  transform: translateX(-50%);
}
.kontak-baris {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
}
.kontak-butir {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  color: #fff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}
a.kontak-butir:hover {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
}
.kontak-butir svg {
  flex-shrink: 0;
}
.hakcipta {
  margin: 0;
  padding-top: 1.5rem;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.9);
  border-top: 2px solid rgba(255, 255, 255, 0.2);
}

@media (prefers-reduced-motion: reduce) {
  .lingkaran {
    animation: none;
  }
  .kartu,
  .titik,
  .kontak-butir {
    transition: none;
  }
}

@media (min-width: 641px) {
  .hero {
    height: 350px;
  }
  .hero h1 {
    font-size: 2.5rem;
  }
  .hero p {
    font-size: 1.1rem;
  }
  .l1 {
    width: 300px;
    height: 300px;
  }
  .l2 {
    width: 200px;
    height: 200px;
  }
  .l3 {
    width: 150px;
    height: 150px;
  }
  .bagian {
    padding: 3rem 1.5rem;
  }
  .judul {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  .linimasa::before {
    left: 30px;
    width: 4px;
  }
  .butir {
    margin-bottom: 2rem;
    padding: 10px 12px 10px 70px;
  }
  .titik {
    left: 20px;
  }
  .kartu {
    padding: 1.5rem 1.2rem;
  }
  .kartu p {
    font-size: 0.9rem;
  }
  .hobi-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  .hobi {
    padding: 2rem 1.5rem;
  }
  .hobi-ikon {
    width: 70px;
    height: 70px;
  }
  .hobi p {
    font-size: 0.9rem;
  }
  .fakta-baris {
    gap: 2rem;
  }
  .fakta-butir {
    min-width: 180px;
    padding: 1.5rem;
  }
  .angka {
    font-size: 2.5rem;
  }
  .label {
    font-size: 1rem;
  }
  .kutipan {
    padding: 4rem 1.5rem;
  }
  .kutipan blockquote {
    padding: 0 1.5rem;
    font-size: 1.6rem;
  }
  .kontak {
    padding: 3rem 0;
  }
  .kontak-isi {
    padding: 0 1.5rem;
  }
  .kontak-judul {
    margin-bottom: 2.5rem;
    font-size: 1.8rem;
  }
  .kontak-baris {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
  }
  .kontak-butir {
    width: auto;
    min-width: 220px;
    padding: 1.2rem 2rem;
    font-size: 1rem;
  }
  .hakcipta {
    font-size: 1rem;
  }
}

@media (min-width: 768px) {
  /* Perjalananku: dua kolom bergantian, garis di tengah */
  .linimasa::before {
    left: 50%;
  }
  .butir {
    width: 50%;
    padding: 10px 40px;
  }
  .butir:nth-child(odd) {
    left: 0;
    text-align: right;
  }
  .butir:nth-child(even) {
    left: 50%;
    text-align: left;
  }
  .titik {
    right: -10px;
    left: auto;
  }
  .butir:nth-child(even) .titik {
    right: auto;
    left: -10px;
  }
  .kartu {
    padding: 1.5rem;
  }
  .hobi-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .hero {
    height: 400px;
  }
  .hero h1 {
    font-size: 3rem;
  }
  .hero p {
    font-size: 1.2rem;
  }
  .bagian {
    padding: 4rem 2rem;
  }
  .judul {
    margin-bottom: 2.5rem;
    font-size: 2.2rem;
  }
  .fakta-butir {
    min-width: 200px;
    padding: 2rem;
  }
  .angka {
    font-size: 3rem;
  }
  .kutipan {
    padding: 6rem 2rem;
  }
  .kutipan blockquote {
    padding: 0 2rem;
    font-size: 1.8rem;
  }
  .kontak {
    padding: 4rem 0;
  }
  .kontak-isi {
    padding: 0 2rem;
  }
  .kontak-judul {
    margin-bottom: 3rem;
    font-size: 2rem;
  }
  .kontak-baris {
    gap: 2rem;
  }
  .kontak-butir {
    min-width: 250px;
    padding: 1.5rem 2.5rem;
    font-size: 1.1rem;
  }
}
</style>