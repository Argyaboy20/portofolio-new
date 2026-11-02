<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Calendar,
  CircleAlert,
  CircleCheck,
  Clock,
  CodeXml,
  GraduationCap,
  Languages,
  Lightbulb,
  MoveRight,
  Server,
} from '@lucide/vue'
import { useBahasaStore } from '../../stores/bahasa'
import { useHalamanStore } from '../../stores/halaman'
import { IKON_HALAMAN } from '../../utils/ikonHalaman'

const SLUG = 'itsupport'
const bahasa = useBahasaStore()
const halaman = useHalamanStore()

onMounted(() => halaman.muat(SLUG))

const k = computed(() => halaman.data[SLUG]?.konten ?? null)
const fotoHero = computed(() => halaman.data[SLUG]?.gambar?.hero ?? null)
const galat = computed(() => halaman.galat[SLUG] ?? '')
const t = (o) => bahasa.pilih(o.id, o.en)
</script>

<template>
  <div class="halaman">
    <header class="bilah">
      <RouterLink to="/" class="judul-situs">Maulana Farras Blog</RouterLink>
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

    <main v-if="k" class="isi">
      <!-- Hero -->
      <section class="hero-banner">
        <div class="hero-lapisan"></div>
        <div class="hero-grid" :class="{ 'tanpa-foto': !fotoHero }">
          <div class="hero-teks">
            <div class="lencana">
              <CodeXml :size="16" aria-hidden="true" />
              <span>{{ t(k.hero.lencana) }}</span>
            </div>
            <h1 class="judul-utama">{{ t(k.hero.judul) }}</h1>
            <p class="deskripsi-utama">{{ t(k.hero.deskripsi) }}</p>
            <div class="stat-baris">
              <div v-for="(s, i) in k.hero.stat" :key="i" class="stat">
                <div class="stat-angka">{{ s.angka }}</div>
                <div class="stat-label">{{ t(s.label) }}</div>
              </div>
            </div>
          </div>
          <div v-if="fotoHero" class="hero-foto">
            <div class="bingkai">
              <img
                :src="fotoHero"
                :alt="bahasa.pilih('Pengalaman IT Support', 'IT Support Experience')"
                class="foto"
              />
              <div class="cahaya"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Studi kasus -->
      <section class="cerita">
        <div class="wadah">
          <div class="cerita-kepala">
            <div class="tag-kategori">
              <Server :size="16" aria-hidden="true" />
              {{ t(k.cerita.tag) }}
            </div>
            <h2 class="cerita-judul">{{ t(k.cerita.judul) }}</h2>
            <div class="cerita-meta">
              <span class="meta">
                <Calendar :size="16" aria-hidden="true" />
                {{ t(k.cerita.tanggal) }}
              </span>
              <span class="pemisah" aria-hidden="true">•</span>
              <span class="meta">
                <Clock :size="16" aria-hidden="true" />
                {{ t(k.cerita.waktuBaca) }}
              </span>
            </div>
          </div>

          <!-- Latar belakang -->
          <div class="kartu kartu-intro">
            <div class="ikon-kotak cyan"><Lightbulb :size="28" aria-hidden="true" /></div>
            <div class="kartu-isi">
              <h3 class="kartu-judul">{{ t(k.cerita.latarBelakang.judul) }}</h3>
              <p class="kartu-teks">{{ t(k.cerita.latarBelakang.teks) }}</p>
            </div>
          </div>

          <!-- Tantangan -->
          <div class="sorot">
            <div class="ikon-kotak merah"><CircleAlert :size="28" aria-hidden="true" /></div>
            <div class="sorot-isi">
              <h3 class="sorot-judul">{{ t(k.cerita.tantangan.judul) }}</h3>
              <p class="sorot-teks">{{ t(k.cerita.tantangan.teks) }}</p>
              <div class="metrik-grid">
                <div v-for="(m, i) in k.cerita.tantangan.metrik" :key="i" class="metrik">
                  <div class="metrik-nilai" :class="m.nada">{{ m.nilai }}</div>
                  <div class="metrik-label">{{ t(m.label) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tahapan -->
          <div class="bagian-sub">
            <h3 class="sub-judul">{{ t(k.cerita.fase.judul) }}</h3>
            <div class="linimasa">
              <div v-for="(f, i) in k.cerita.fase.item" :key="i" class="fase">
                <div class="penanda">
                  <div class="titik"></div>
                  <div v-if="i < k.cerita.fase.item.length - 1" class="garis"></div>
                </div>
                <div class="fase-isi">
                  <div class="lencana-fase" :class="`fase-${(i % 4) + 1}`">
                    {{ bahasa.pilih('Fase', 'Phase') }} {{ i + 1 }}
                  </div>
                  <h4 class="fase-judul">{{ t(f.judul) }}</h4>
                  <p class="fase-teks">{{ t(f.deskripsi) }}</p>
                  <div class="tag-daftar">
                    <span v-for="(tg, j) in f.tag" :key="j" class="tag">{{ tg }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Hasil -->
          <div class="bagian-sub">
            <h3 class="sub-judul">{{ t(k.cerita.hasil.judul) }}</h3>
            <div class="hasil-grid">
              <div v-for="(h, i) in k.cerita.hasil.item" :key="i" class="hasil">
                <div class="hasil-ikon">
                  <component :is="IKON_HALAMAN[h.ikon]" :size="28" aria-hidden="true" />
                </div>
                <div class="hasil-data">
                  <div class="hasil-banding">
                    <span class="nilai-lama">{{ h.lama }}</span>
                    <MoveRight :size="18" class="panah" aria-hidden="true" />
                    <span class="nilai-baru">{{ h.baru }}</span>
                  </div>
                  <div class="hasil-label">{{ t(h.label) }}</div>
                  <div class="hasil-perubahan">{{ t(h.perubahan) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pembelajaran -->
          <div class="belajar">
            <div class="belajar-kepala">
              <GraduationCap :size="32" class="belajar-ikon" aria-hidden="true" />
              <h3 class="belajar-judul">{{ t(k.cerita.pembelajaran.judul) }}</h3>
            </div>
            <div class="belajar-daftar">
              <div v-for="(b, i) in k.cerita.pembelajaran.item" :key="i" class="belajar-butir">
                <CircleCheck :size="22" class="centang" aria-hidden="true" />
                <p>{{ t(b) }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Keahlian -->
      <section class="keahlian">
        <div class="wadah lebar">
          <div class="keahlian-kepala">
            <h2 class="keahlian-judul">{{ t(k.keahlian.judul) }}</h2>
            <p class="keahlian-deskripsi">{{ t(k.keahlian.deskripsi) }}</p>
          </div>
          <div class="keahlian-grid">
            <div v-for="(a, i) in k.keahlian.item" :key="i" class="keahlian-kartu">
              <div class="keahlian-ikon">
                <component :is="IKON_HALAMAN[a.ikon]" :size="32" aria-hidden="true" />
              </div>
              <h3 class="keahlian-nama">{{ t(a.judul) }}</h3>
              <p class="keahlian-teks">{{ t(a.deskripsi) }}</p>
              <div class="lencana-daftar">
                <span v-for="(l, j) in a.lencana" :key="j" class="lencana-skill">{{ l }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="spasi-bawah"></div>
    </main>

    <main v-else-if="galat" class="isi">
      <p class="pesan">
        {{ galat }}
        <button type="button" class="coba-lagi" @click="halaman.muat(SLUG, true)">
          {{ bahasa.pilih('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<641px). Breakpoint hanya menaikkan ukuran atau mengubah tata letak:
   641px = tablet, 768px = desktop, 1024px = desktop lebar. */
.halaman {
  --bg-primary: #0f0f1e;
  --bg-secondary: #1a1a2e;
  --bg-tertiary: #16213e;
  --accent-blue: #00d4ff;
  --accent-cyan: #00ffff;
  --accent-green: #00ff88;
  --accent-purple: #a78bfa;
  --text-white: #ffffff;
  --text-light: #e0e0e0;
  --text-gray: #a0a0a0;
  --text-dark: #666666;
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-border: rgba(255, 255, 255, 0.15);
  --gradient-cyan: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  --gradient-green: linear-gradient(135deg, #00ff88 0%, #00cc70 100%);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(0, 212, 255, 0.3);
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 24px;

  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--text-white);
  background: linear-gradient(
    180deg,
    var(--bg-primary) 0%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 100%
  );
}
.halaman::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(167, 139, 250, 0.08) 0%, transparent 50%);
}
.halaman *,
.halaman *::before,
.halaman *::after {
  box-sizing: border-box;
}
h1,
h2,
h3,
h4,
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
  padding: 0 0.5rem 0 1rem;
  background: rgba(15, 15, 30, 0.95);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px) saturate(180%);
}
.judul-situs {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-white);
  letter-spacing: -0.5px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.judul-situs:hover {
  color: var(--accent-blue);
  transform: translateY(-1px);
}
.terjemah {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 2.25rem;
  padding: 0 0.8rem 0 0.3rem;
  font: inherit;
  color: var(--text-white);
  cursor: pointer;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.22) 0%, rgba(167, 139, 250, 0.22) 100%);
  border: 1px solid rgba(0, 212, 255, 0.45);
  border-radius: 999px;
  box-shadow:
    0 2px 10px rgba(0, 212, 255, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}
.terjemah:hover {
  border-color: rgba(0, 255, 255, 0.8);
  box-shadow:
    0 4px 16px rgba(0, 212, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}
.terjemah:active {
  transform: scale(0.96);
}
.ikon-terjemah {
  display: grid;
  place-items: center;
  width: 1.65rem;
  height: 1.65rem;
  color: var(--bg-primary);
  background: var(--gradient-cyan);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  transition: transform 0.25s ease;
}
.terjemah:hover .ikon-terjemah {
  transform: rotate(20deg);
}
.teks-terjemah {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.06em;
}

.isi {
  position: relative;
  z-index: 1;
}
.pesan {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-light);
}
.coba-lagi {
  margin-left: 0.5rem;
  padding: 0.3rem 0.9rem;
  font: inherit;
  color: var(--accent-cyan);
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(0, 212, 255, 0.5);
  border-radius: 999px;
}

/* --- Hero --- */
.hero-banner {
  position: relative;
  padding: 2.5rem 1rem;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(15, 15, 30, 0.9) 0%, rgba(26, 26, 46, 0.8) 100%);
}
.hero-lapisan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 30% 20%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(167, 139, 250, 0.15) 0%, transparent 50%);
}
.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}
.hero-teks {
  text-align: center;
}
.lencana {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0.45rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-cyan);
  background: rgba(0, 212, 255, 0.15);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}
.judul-utama {
  margin-bottom: 1rem;
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--text-white) 0%, var(--accent-cyan) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.deskripsi-utama {
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-gray);
}
.stat-baris {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.stat {
  text-align: center;
}
.stat-angka {
  margin-bottom: 0.5rem;
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
  color: var(--accent-cyan);
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}
.stat-label {
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--text-light);
}
.hero-foto {
  position: relative;
  width: 100%;
}
.bingkai {
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}
.foto {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.cahaya {
  position: absolute;
  inset: -50%;
  pointer-events: none;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
}
.bingkai:hover .foto {
  transform: scale(1.05);
}
.bingkai:hover .cahaya {
  opacity: 1;
}

/* --- Studi kasus --- */
.cerita {
  position: relative;
  z-index: 1;
  padding: 2.5rem 1rem;
}
.wadah {
  max-width: 1000px;
  margin: 0 auto;
}
.wadah.lebar {
  max-width: 1200px;
}
.cerita-kepala {
  margin-bottom: 2rem;
  text-align: center;
}
.tag-kategori {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.45rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-purple);
  background: rgba(167, 139, 250, 0.15);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 20px;
}
.cerita-judul {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-white);
}
.cerita-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-gray);
}
.meta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.pemisah {
  color: var(--text-dark);
}

/* Kartu latar belakang */
.kartu {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}
.kartu:hover {
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}
.kartu-intro {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}
.ikon-kotak {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  color: #fff;
  border-radius: var(--radius-md);
}
.ikon-kotak.cyan {
  color: var(--bg-primary);
  background: var(--gradient-cyan);
  box-shadow: var(--shadow-glow);
}
.ikon-kotak.merah {
  position: relative;
  z-index: 1;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ff4d4d, #ff0000);
  box-shadow: 0 4px 20px rgba(255, 77, 77, 0.4);
}
.kartu-isi {
  flex: 1;
  min-width: 0;
}
.kartu-judul {
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-white);
}
.kartu-teks {
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--text-light);
}

/* Kartu tantangan */
.sorot {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
  padding: 1.25rem;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 77, 77, 0.1) 0%, rgba(255, 0, 0, 0.05) 100%);
  border: 2px solid rgba(255, 77, 77, 0.3);
  border-radius: var(--radius-lg);
}
.sorot::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  pointer-events: none;
  background: radial-gradient(circle, rgba(255, 77, 77, 0.2) 0%, transparent 70%);
}
.sorot-isi {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}
.sorot-judul {
  margin-bottom: 0.75rem;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-white);
}
.sorot-teks {
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--text-light);
}
.metrik-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
.metrik {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  text-align: left;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
}
.metrik-nilai {
  font-size: 1.4rem;
  font-weight: 800;
}
.metrik-nilai.danger {
  color: #ff4d4d;
}
.metrik-nilai.warning {
  color: #ffa500;
}
.metrik-nilai.info {
  color: var(--accent-cyan);
}
.metrik-label {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: right;
  color: var(--text-gray);
}

/* --- Linimasa tahapan dan hasil --- */
.bagian-sub {
  margin: 2.5rem 0;
}
.sub-judul {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  color: var(--text-white);
}
.linimasa {
  position: relative;
  padding: 1rem 0;
}
.fase {
  position: relative;
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
}
.fase:last-child {
  padding-bottom: 0;
}
.penanda {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.titik {
  z-index: 2;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background: var(--gradient-cyan);
  border: 3px solid var(--bg-primary);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
}
.garis {
  flex: 1;
  width: 2px;
  margin-top: 0.4rem;
  background: linear-gradient(180deg, var(--accent-blue), transparent);
}
.fase-isi {
  position: relative;
  min-width: 0;
  padding: 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}
.fase-isi:hover {
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}
.fase-isi::before {
  content: '';
  position: absolute;
  top: 24px;
  left: -10px;
  display: none;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-right: 10px solid var(--card-border);
  border-bottom: 10px solid transparent;
}
.lencana-fase {
  display: inline-block;
  margin-bottom: 0.875rem;
  padding: 0.35rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 20px;
}
.fase-1 {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.fase-2 {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}
.fase-3 {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}
.fase-4 {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}
.fase-judul {
  margin-bottom: 0.75rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-white);
}
.fase-teks {
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--text-light);
}
.tag-daftar,
.lencana-daftar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag {
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--accent-cyan);
  background: rgba(0, 212, 255, 0.15);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
}

/* Hasil */
.hasil-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.hasil {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 204, 112, 0.02) 100%);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}
.hasil:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}
.hasil-ikon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: #fff;
  background: var(--gradient-green);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
}
.hasil-data {
  flex: 1;
  min-width: 0;
}
.hasil-banding {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}
.nilai-lama {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff4d4d;
  text-decoration: line-through;
  opacity: 0.7;
}
.panah {
  color: var(--accent-green);
}
.nilai-baru {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--accent-green);
}
.hasil-label {
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
  color: var(--text-gray);
}
.hasil-perubahan {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-green);
  background: rgba(0, 255, 136, 0.1);
  border-radius: 10px;
}

/* Pembelajaran */
.belajar {
  margin-top: 2.5rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%);
  border: 2px solid rgba(167, 139, 250, 0.3);
  border-radius: var(--radius-lg);
}
.belajar-kepala {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.belajar-ikon {
  flex-shrink: 0;
  color: var(--accent-purple);
}
.belajar-judul {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-white);
}
.belajar-daftar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.belajar-butir {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}
.belajar-butir:hover {
  background: rgba(167, 139, 250, 0.1);
  transform: translateX(4px);
}
.centang {
  flex-shrink: 0;
  margin-top: 0.1rem;
  color: var(--accent-green);
}
.belajar-butir p {
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--text-light);
}

/* --- Keahlian --- */
.keahlian {
  position: relative;
  z-index: 1;
  padding: 2.5rem 1rem;
  background: linear-gradient(180deg, transparent 0%, rgba(26, 26, 46, 0.5) 100%);
}
.keahlian-kepala {
  margin-bottom: 2rem;
  text-align: center;
}
.keahlian-judul {
  margin-bottom: 0.75rem;
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--text-white) 0%, var(--accent-cyan) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.keahlian-deskripsi {
  max-width: 700px;
  margin: 0 auto;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-gray);
}
.keahlian-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
}
.keahlian-kartu {
  position: relative;
  padding: 1.25rem;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.keahlian-kartu::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: var(--gradient-cyan);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}
.keahlian-kartu:hover {
  border-color: rgba(0, 212, 255, 0.5);
  box-shadow: var(--shadow-lg);
  transform: translateY(-8px);
}
.keahlian-kartu:hover::before {
  transform: scaleX(1);
}
.keahlian-ikon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 1rem;
  color: #fff;
  background: var(--gradient-cyan);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
  transition: transform 0.3s ease;
}
.keahlian-kartu:hover .keahlian-ikon {
  transform: scale(1.1) rotate(5deg);
}
.keahlian-nama {
  margin-bottom: 0.75rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-white);
}
.keahlian-teks {
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-gray);
}
.lencana-skill {
  padding: 0.35rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--accent-cyan);
  white-space: nowrap;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
}
.spasi-bawah {
  height: 2rem;
}

@media (prefers-reduced-motion: reduce) {
  .judul-situs,
  .terjemah,
  .ikon-terjemah,
  .foto,
  .cahaya,
  .kartu,
  .fase-isi,
  .hasil,
  .belajar-butir,
  .keahlian-kartu,
  .keahlian-kartu::before,
  .keahlian-ikon {
    transition: none;
  }
}

/* >= 641px: TABLET. Judul header ke tengah, metrik 3 kolom, hasil dan keahlian 2 kolom. */
@media (min-width: 641px) {
  .bilah {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    min-height: 60px;
    padding: 0 0.75rem;
  }
  .judul-situs {
    grid-column: 2;
    font-size: 1.15rem;
  }
  .terjemah {
    grid-column: 3;
    justify-self: end;
    height: 2.4rem;
    padding-right: 0.95rem;
  }
  .ikon-terjemah {
    width: 1.75rem;
    height: 1.75rem;
  }
  .teks-terjemah {
    font-size: 0.85rem;
  }

  .hero-banner {
    padding: 3.5rem 2rem;
  }
  .hero-grid {
    gap: 2.5rem;
  }
  .lencana {
    margin-bottom: 1.5rem;
    font-size: 0.85rem;
  }
  .judul-utama {
    margin-bottom: 1.25rem;
    font-size: 2.4rem;
  }
  .deskripsi-utama {
    max-width: 600px;
    margin: 0 auto 2rem;
    font-size: 1.05rem;
  }
  .stat-baris {
    gap: 1rem;
    max-width: 480px;
    margin: 2rem auto 0;
  }
  .stat-angka {
    font-size: 2rem;
  }
  .stat-label {
    font-size: 0.85rem;
  }
  .hero-foto {
    max-width: 520px;
    margin: 0 auto;
  }

  .cerita {
    padding: 3rem 2rem;
  }
  .cerita-kepala {
    margin-bottom: 2.5rem;
  }
  .tag-kategori {
    font-size: 0.85rem;
  }
  .cerita-judul {
    font-size: 2rem;
  }
  .cerita-meta {
    font-size: 0.9rem;
  }
  .kartu {
    margin-bottom: 2rem;
    padding: 1.75rem;
  }
  .kartu-intro {
    flex-direction: row;
    gap: 1.25rem;
  }
  .ikon-kotak {
    width: 56px;
    height: 56px;
  }
  .kartu-judul {
    font-size: 1.35rem;
  }
  .kartu-teks {
    font-size: 1rem;
  }
  .sorot {
    margin-bottom: 2.5rem;
    padding: 1.75rem;
  }
  .sorot-judul {
    font-size: 1.6rem;
  }
  .sorot-teks {
    margin-bottom: 1.75rem;
    font-size: 1rem;
  }
  .metrik-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  .metrik {
    display: block;
    padding: 1rem;
    text-align: center;
  }
  .metrik-nilai {
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }
  .metrik-label {
    font-size: 0.85rem;
    text-align: center;
  }

  .bagian-sub {
    margin: 3rem 0;
  }
  .sub-judul {
    margin-bottom: 2rem;
    font-size: 1.75rem;
  }
  .linimasa {
    padding: 1.5rem 0;
  }
  .fase {
    grid-template-columns: 48px 1fr;
    gap: 1.25rem;
    padding-bottom: 2rem;
  }
  .titik {
    width: 22px;
    height: 22px;
    border-width: 4px;
    box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.2);
  }
  .fase-isi {
    padding: 1.5rem;
  }
  .fase-isi:hover {
    transform: translateX(6px);
  }
  .fase-isi::before {
    display: block;
  }
  .lencana-fase {
    font-size: 0.8rem;
  }
  .fase-judul {
    font-size: 1.25rem;
  }
  .fase-teks {
    font-size: 1rem;
  }
  .tag {
    font-size: 0.8rem;
  }

  .hasil-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  .hasil-ikon {
    width: 52px;
    height: 52px;
  }
  .nilai-lama {
    font-size: 1.15rem;
  }
  .nilai-baru {
    font-size: 1.35rem;
  }

  .belajar {
    margin-top: 3rem;
    padding: 1.75rem;
  }
  .belajar-kepala {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .belajar-judul {
    font-size: 1.6rem;
  }
  .belajar-daftar {
    gap: 1rem;
  }
  .belajar-butir {
    gap: 1rem;
    padding: 1rem;
  }
  .belajar-butir:hover {
    transform: translateX(6px);
  }
  .belajar-butir p {
    font-size: 1rem;
  }

  .keahlian {
    padding: 3rem 2rem;
  }
  .keahlian-kepala {
    margin-bottom: 2.5rem;
  }
  .keahlian-judul {
    font-size: 2.1rem;
  }
  .keahlian-deskripsi {
    font-size: 1.05rem;
  }
  .keahlian-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  .keahlian-kartu {
    padding: 1.5rem;
  }
  .keahlian-ikon {
    width: 64px;
    height: 64px;
  }
  .keahlian-nama {
    font-size: 1.2rem;
  }
  .keahlian-teks {
    font-size: 0.925rem;
  }
  .lencana-skill {
    font-size: 0.75rem;
  }
  .spasi-bawah {
    height: 2.5rem;
  }
}

/* >= 768px: DESKTOP. Hero dua kolom, kartu tantangan dengan ikon di samping. */
@media (min-width: 768px) {
  .bilah {
    min-height: 64px;
    padding: 0 1rem;
  }
  .judul-situs {
    font-size: 1.25rem;
  }
  .terjemah {
    height: 2.5rem;
    padding-right: 1rem;
    margin-right: 0.5rem;
  }
  .ikon-terjemah {
    width: 1.85rem;
    height: 1.85rem;
  }
  .teks-terjemah {
    font-size: 0.9rem;
  }

  .hero-banner {
    padding: 4rem 2.5rem;
  }
  .hero-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }
  .hero-grid.tanpa-foto {
    grid-template-columns: 1fr;
  }
  .hero-teks {
    text-align: left;
  }
  .judul-utama {
    font-size: 2.3rem;
    letter-spacing: -1px;
  }
  .deskripsi-utama {
    max-width: none;
    margin: 0 0 1.75rem;
  }
  .stat-baris {
    grid-auto-columns: auto;
    justify-content: start;
    gap: 2rem;
    max-width: none;
    margin: 2rem 0 0;
  }
  .stat {
    text-align: left;
  }
  .hero-foto {
    max-width: none;
    margin: 0;
  }

  .cerita {
    padding: 4rem 2.5rem;
  }
  .cerita-kepala {
    margin-bottom: 3rem;
  }
  .cerita-judul {
    font-size: 2.25rem;
  }
  .kartu {
    padding: 2rem;
  }
  .kartu-intro {
    gap: 1.5rem;
  }
  .ikon-kotak {
    width: 60px;
    height: 60px;
  }
  .kartu-judul {
    font-size: 1.5rem;
  }
  .sorot {
    flex-direction: row;
    gap: 1.5rem;
    margin-bottom: 3rem;
    padding: 2rem;
  }
  .ikon-kotak.merah {
    margin-bottom: 0;
  }
  .sorot-judul {
    font-size: 1.8rem;
  }
  .sorot-teks {
    margin-bottom: 2rem;
    font-size: 1.05rem;
  }
  .metrik-nilai {
    font-size: 1.7rem;
  }

  .sub-judul {
    font-size: 2rem;
  }
  .fase {
    grid-template-columns: 60px 1fr;
    gap: 1.75rem;
    padding-bottom: 2.5rem;
  }
  .titik {
    width: 24px;
    height: 24px;
  }
  .fase-isi {
    padding: 2rem;
  }
  .fase-isi:hover {
    transform: translateX(8px);
  }
  .fase-judul {
    font-size: 1.4rem;
  }

  .hasil-grid {
    gap: 1.5rem;
  }
  .hasil {
    gap: 1.25rem;
    padding: 1.75rem;
  }
  .hasil-ikon {
    width: 60px;
    height: 60px;
  }
  .nilai-lama {
    font-size: 1.25rem;
  }
  .nilai-baru {
    font-size: 1.5rem;
  }
  .hasil-label {
    font-size: 0.9rem;
  }

  .belajar {
    padding: 2rem;
  }
  .belajar-judul {
    font-size: 1.8rem;
  }
  .belajar-butir:hover {
    transform: translateX(8px);
  }

  .keahlian {
    padding: 4rem 2.5rem;
  }
  .keahlian-kepala {
    margin-bottom: 3rem;
  }
  .keahlian-judul {
    font-size: 2.4rem;
  }
  .keahlian-deskripsi {
    font-size: 1.1rem;
  }
  .keahlian-grid {
    gap: 1.75rem;
  }
  .keahlian-kartu {
    padding: 1.75rem;
  }
  .keahlian-ikon {
    width: 70px;
    height: 70px;
  }
  .keahlian-nama {
    font-size: 1.3rem;
  }
  .keahlian-teks {
    font-size: 0.95rem;
  }
  .spasi-bawah {
    height: 3rem;
  }
}

/* >= 1024px: DESKTOP LEBAR. Ruang lebih longgar, keahlian tiga kolom. */
@media (min-width: 1024px) {
  .bilah {
    min-height: 68px;
    padding: 0 1.5rem;
  }
  .judul-situs {
    font-size: 1.35rem;
  }
  .terjemah {
    height: 2.6rem;
    padding-right: 1.1rem;
  }
  .ikon-terjemah {
    width: 1.95rem;
    height: 1.95rem;
  }

  .hero-banner {
    padding: 5rem 3rem;
  }
  .hero-grid {
    gap: 4rem;
  }
  .lencana {
    font-size: 0.9rem;
  }
  .judul-utama {
    margin-bottom: 1.5rem;
    font-size: 3rem;
  }
  .deskripsi-utama {
    margin-bottom: 2rem;
    font-size: 1.1rem;
    line-height: 1.8;
  }
  .stat-baris {
    gap: 3rem;
  }
  .stat-angka {
    font-size: 2.5rem;
  }

  .cerita {
    padding: 4.5rem 3rem;
  }
  .cerita-judul {
    font-size: 2.5rem;
  }
  .fase {
    gap: 2rem;
    padding-bottom: 3rem;
  }
  .hasil {
    gap: 1.5rem;
    padding: 2rem;
  }
  .belajar {
    margin-top: 3rem;
  }

  .keahlian {
    padding: 5rem 3rem;
  }
  .keahlian-judul {
    font-size: 2.5rem;
  }
  .keahlian-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
  .keahlian-kartu {
    padding: 2rem;
  }
  .spasi-bawah {
    height: 4rem;
  }
}
</style>
