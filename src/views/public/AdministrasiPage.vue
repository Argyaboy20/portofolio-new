<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Briefcase,
  Gauge,
  Languages,
  MapPinned,
  MessageSquareQuote,
  User,
  Wrench,
} from '@lucide/vue'
import IkonDinamis from '../../components/IkonDinamis.vue'
import ModalPengalaman from '../../components/ModalPengalaman.vue'
import SliderRekomendasi from '../../components/SliderRekomendasi.vue'
import { useBahasaStore } from '../../stores/bahasa'
import { useBerandaStore } from '../../stores/beranda'
import { useAdministrasiStore } from '../../stores/administrasi'

const bahasa = useBahasaStore()
const beranda = useBerandaStore()
const administrasi = useAdministrasiStore()

onMounted(() => {
  administrasi.muat()
  beranda.muat() // hanya untuk foto profil; bila gagal, kartu memakai ikon pengganti
})

const k = computed(() => administrasi.data?.konten ?? null)
const sertifikat = computed(() => administrasi.data?.gambar?.mengetik ?? null)
const cv = computed(() => administrasi.data?.gambar?.cv ?? null)
const fotoProfil = computed(() => beranda.data?.profil?.fotoUrl ?? null)
const galat = computed(() => administrasi.galat)
const daftarPengalaman = computed(() => administrasi.data?.pengalaman ?? [])
const daftarRekomendasi = computed(() => administrasi.data?.rekomendasi ?? [])
const terpilih = ref(null) // pengalaman yang sedang dibuka di modal
const butir = (s) =>
  (s ?? '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
// Animasi linimasa: tiap butir bergeser masuk satu kali saat pertama terlihat
const linimasa = ref(null)
let pengamat = null

function amatiLinimasa() {
  pengamat?.disconnect()
  pengamat = null
  const el = linimasa.value
  if (!el) return
  const butirEl = el.querySelectorAll('.perjalanan-butir')
  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    butirEl.forEach((b) => b.classList.add('masuk'))
    return
  }
  pengamat = new IntersectionObserver(
    (daftar) => {
      daftar.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('masuk')
          pengamat?.unobserve(e.target)
        }
      })
    },
    { threshold: 0.1 },
  )
  butirEl.forEach((b) => pengamat.observe(b))
}

// Butir baru muncul setelah data termuat, jadi diamati setelah tampilan diperbarui
watch(
  () => k.value?.perjalanan,
  async (nilai) => {
    if (!nilai) return
    await nextTick()
    amatiLinimasa()
  },
  { immediate: true },
)
onBeforeUnmount(() => pengamat?.disconnect())
const t = (o) => bahasa.pilih(o.id, o.en)
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

    <main v-if="k" class="isi">
      <div class="wadah">
        <!-- Kartu profil -->
        <section class="kartu profil">
          <div class="avatar">
            <img
              v-if="fotoProfil"
              :src="fotoProfil"
              :alt="bahasa.pilih('Foto profil', 'Profile photo')"
            />
            <User v-else :size="44" aria-hidden="true" />
          </div>
          <h1 class="profil-judul">{{ t(k.kepala.judul) }}</h1>
          <p class="profil-sub">{{ t(k.kepala.subjudul) }}</p>
          <a v-if="cv" :href="cv" target="_blank" rel="noopener noreferrer" class="tombol-cv">
            {{ bahasa.pilih('Lihat CV', 'View CV') }}
          </a>
        </section>

        <!-- Pengalaman kerja -->
        <section v-if="daftarPengalaman.length" class="kartu">
          <h2 class="kartu-judul">
            <Briefcase :size="24" aria-hidden="true" />
            {{ bahasa.pilih('Pengalaman Kerja', 'Work Experience') }}
          </h2>
          <ul class="pekerjaan">
            <li v-for="p in daftarPengalaman" :key="p.id">
              <button type="button" class="pekerjaan-item" @click="terpilih = p">
                <h3 class="pk-judul">{{ bahasa.pilih(p.judulId, p.judulEn) }}</h3>
                <p class="pk-perusahaan">{{ p.perusahaan }}</p>
                <p class="pk-periode">{{ bahasa.pilih(p.periodeId, p.periodeEn) }}</p>
                <ul class="pk-poin">
                  <li v-for="(b, i) in butir(bahasa.pilih(p.butirId, p.butirEn))" :key="i">
                    {{ b }}
                  </li>
                </ul>
              </button>
            </li>
          </ul>
        </section>

        <!-- Keterampilan -->
        <section class="kartu">
          <h2 class="kartu-judul">
            <Wrench :size="24" aria-hidden="true" />
            {{ bahasa.pilih('Keterampilan Administrasi', 'Administration Skills') }}
          </h2>
          <div class="skill-grid">
            <div v-for="(s, i) in k.keterampilan" :key="i" class="skill" :class="`w-${s.warna}`">
              <IkonDinamis :nama="s.ikon" :ukuran="28" />
              <span class="skill-nama">{{ s.nama }}</span>
            </div>
          </div>
        </section>

        <!-- Kecepatan mengetik -->
        <section class="kartu tengah">
          <h2 class="kartu-judul">
            <Gauge :size="24" aria-hidden="true" />
            {{ bahasa.pilih('Kecepatan Mengetik', 'Typing Speed') }}
          </h2>
          <img
            v-if="sertifikat"
            :src="sertifikat"
            :alt="bahasa.pilih('Sertifikat kecepatan mengetik', 'Typing speed certificate')"
            class="sertifikat"
          />
          <p class="mengetik-teks">{{ t(k.mengetik.teks) }}</p>
        </section>

        <!-- Rekomendasi -->
        <section v-if="daftarRekomendasi.length" class="kartu">
          <h2 class="kartu-judul">
            <MessageSquareQuote :size="24" aria-hidden="true" />
            {{ bahasa.pilih('Rekomendasi', 'Recommendations') }}
          </h2>
          <SliderRekomendasi :daftar="daftarRekomendasi" />
        </section>

        <!-- Perjalanan karir -->
        <section class="kartu perjalanan">
          <h2 class="kartu-judul">
            <MapPinned :size="24" aria-hidden="true" />
            {{ bahasa.pilih('Perjalanan Karir', 'Career Journey') }}
          </h2>
          <div ref="linimasa" class="timeline">
            <div v-for="(j, i) in k.perjalanan" :key="i" class="perjalanan-butir">
              <div class="perjalanan-titik"></div>
              <div class="perjalanan-isi">
                <h3 class="pj-periode">{{ t(j.periode) }}</h3>
                <h4 class="pj-perusahaan">{{ j.perusahaan }}</h4>
                <p class="pj-ringkasan">{{ t(j.ringkasan) }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <main v-else-if="galat" class="isi">
      <p class="pesan">
        {{ galat }}
        <button type="button" class="coba-lagi" @click="administrasi.muat(true)">
          {{ bahasa.pilih('Coba lagi', 'Try again') }}
        </button>
      </p>
    </main>

    <ModalPengalaman :item="terpilih" @tutup="terpilih = null" />
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override: 641px tablet, 768px desktop, 1024px desktop lebar. */
.halaman {
  --aksen: #00c6ff;
  --aksen2: #8c7ae6;
  --kartu-lebar: 1300px;

  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  color: #fff;
  background:
    radial-gradient(circle at 10% 20%, rgba(46, 134, 222, 0.2) 0%, transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(140, 122, 230, 0.2) 0%, transparent 30%),
    linear-gradient(to bottom right, #141e30, #243b55);
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
  min-height: 48px;
  padding: 0 0.5rem 0 1rem;
  background: rgba(20, 30, 48, 0.95);
  border-bottom: 1px solid rgba(0, 198, 255, 0.2);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px) saturate(180%);
}
.judul-situs {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: #fff;
  text-decoration: none;
}
.judul-situs:hover {
  color: var(--aksen);
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
  border: 1px solid rgba(0, 198, 255, 0.4);
  border-radius: 999px;
  transition: transform 0.25s ease;
}
.terjemah:hover {
  transform: translateY(-1px);
}
.terjemah:active {
  transform: scale(0.96);
}
.ikon-terjemah {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  color: #141e30;
  background: var(--aksen);
  border-radius: 50%;
}
.teks-terjemah {
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.06em;
}

.isi {
  position: relative;
  z-index: 1;
}
.wadah {
  max-width: var(--kartu-lebar);
  padding: 0.75rem 0.75rem 2rem;
  margin: 0 auto;
}
.pesan {
  padding: 3rem 1rem;
  text-align: center;
  color: #e0e0e0;
}
.coba-lagi {
  margin-left: 0.5rem;
  padding: 0.3rem 0.9rem;
  font: inherit;
  color: var(--aksen);
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(0, 198, 255, 0.5);
  border-radius: 999px;
}

/* --- Kartu umum --- */
.kartu {
  margin-bottom: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(28, 58, 148, 0.7), rgba(20, 46, 123, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}
.kartu-judul {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--aksen);
}
.tengah {
  text-align: center;
}
.tengah .kartu-judul {
  justify-content: flex-start;
  text-align: left;
}

/* --- Kartu profil --- */
.profil {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  background: linear-gradient(135deg, rgba(20, 30, 48, 0.9), rgba(36, 59, 85, 0.9));
  border-color: rgba(255, 255, 255, 0.18);
  border-radius: 20px;
}
.avatar {
  display: grid;
  place-items: center;
  width: 100px;
  height: 100px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.7);
  background: #243b55;
  border: 4px solid rgba(74, 144, 226, 0.6);
  border-radius: 50%;
  animation: cahaya 3s infinite;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.profil-judul {
  margin-bottom: 0.4rem;
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
}
.profil-sub {
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}
.tombol-cv {
  display: inline-block;
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a90e2;
  text-decoration: none;
  background: rgba(74, 144, 226, 0.1);
  border: 1.5px solid rgba(74, 144, 226, 0.5);
  border-radius: 20px;
  transition: all 0.3s ease;
}
.tombol-cv:hover {
  color: #5da3f5;
  background: rgba(74, 144, 226, 0.2);
  border-color: rgba(74, 144, 226, 0.8);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  transform: translateY(-2px);
}
@keyframes cahaya {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(0, 198, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 198, 255, 0.8);
  }
}

/* --- Keterampilan (warna meniru warna Ionic di situs lama) --- */
.skill-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}
.skill {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  padding: 0.6rem;
  color: #fff;
  background: #3880ff;
  border-radius: 14px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.skill:hover {
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
  transform: translateY(-5px);
}
.skill-nama {
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
}
.w-primary {
  background: #3880ff;
}
.w-success {
  color: #000;
  background: #2dd36f;
}
.w-tertiary {
  background: #5260ff;
}
.w-warning {
  color: #000;
  background: #ffc409;
}
.w-secondary {
  color: #000;
  background: #3dc2ff;
}
.w-dark {
  background: #222428;
}
.w-danger {
  background: #eb445a;
}
.w-medium {
  color: #000;
  background: #92949c;
}
.w-light {
  color: #000;
  background: #f4f5f8;
}

/* --- Kecepatan mengetik --- */
.sertifikat {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.mengetik-teks {
  max-width: 85%;
  margin: 0 auto;
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: center;
}

/* --- Pengalaman kerja --- */
.pekerjaan {
  padding: 0;
  margin: 0;
  list-style: none;
}
.pekerjaan > li {
  margin-bottom: 0.6rem;
}
.pekerjaan-item {
  display: block;
  width: 100%;
  padding: 0.9rem 1rem;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: rgba(37, 67, 117, 0.7);
  border: 0;
  border-left: 3px solid var(--aksen);
  border-radius: 6px;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease,
    background 0.3s ease;
}
.pekerjaan-item:hover,
.pekerjaan-item:focus-visible {
  background: rgba(0, 198, 255, 0.12);
  border-left-color: var(--aksen2);
  transform: translateX(5px);
}
.pk-judul {
  margin: 0 0 0.3rem;
  font-size: 0.95rem;
  font-weight: 600;
}
.pk-perusahaan {
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
  font-weight: 500;
}
.pk-periode {
  margin-bottom: 0.6rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}
.pk-poin {
  padding-left: 1.1rem;
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
}

/* --- Perjalanan karir --- */
.timeline {
  position: relative;
  padding: 0.6rem 0 0;
}
.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 15px;
  z-index: 0;
  width: 3px;
  background: linear-gradient(to bottom, #ffd700, #ff9f43);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  transform: translateX(-50%);
}
.perjalanan-butir {
  position: relative;
  padding: 6px 0 6px 40px;
  margin-bottom: 14px;
  opacity: 0;
  transition:
    opacity 0.8s ease-out,
    transform 0.8s ease-out;
}
.perjalanan-butir:nth-child(odd) {
  transform: translateX(-50px);
}
.perjalanan-butir:nth-child(even) {
  transform: translateX(50px);
}
.perjalanan-butir:last-child {
  margin-bottom: 0;
}
.perjalanan-butir.masuk {
  opacity: 1;
  transform: translateX(0);
}
.perjalanan-titik {
  position: absolute;
  top: 18px;
  left: 7px;
  z-index: 1;
  width: 16px;
  height: 16px;
  background: var(--aksen);
  border: 4px solid #17306f;
  border-radius: 50%;
  transition: transform 0.3s ease;
  animation: cahaya 3s infinite;
}
.perjalanan-butir:hover .perjalanan-titik {
  transform: scale(1.2);
}
.perjalanan-isi {
  padding: 0.75rem 0.9rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 3px solid var(--aksen);
  border-radius: 12px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}
.perjalanan-isi:hover {
  border-left-color: var(--aksen2);
  box-shadow: 0 8px 20px rgba(0, 198, 255, 0.2);
  transform: translateY(-5px);
}
.pj-periode {
  margin: 0 0 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--aksen);
}
.pj-perusahaan {
  margin: 0 0 0.4rem;
  font-size: 0.9rem;
  font-weight: 600;
}
.pj-ringkasan {
  font-size: 0.78rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
}

@media (prefers-reduced-motion: reduce) {
  .avatar {
    animation: none;
  }
  .terjemah,
  .tombol-cv,
  .skill {
    transition: none;
  }
  .pekerjaan-item {
    transition: none;
  }
  .perjalanan-butir,
  .perjalanan-titik,
  .perjalanan-isi {
    transition: none;
    animation: none;
  }
  .perjalanan-butir {
    opacity: 1;
    transform: none;
  }
}

/* >= 641px: TABLET. Header ke tengah, tombol keterampilan 3 kolom. */
@media (min-width: 641px) {
  .bilah {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    min-height: 52px;
    padding: 0 0.75rem;
  }
  .judul-situs {
    grid-column: 2;
    font-size: 1rem;
  }
  .terjemah {
    grid-column: 3;
    justify-self: end;
  }
  .wadah {
    padding: 1rem 1rem 2.5rem;
  }
  .kartu {
    margin-bottom: 1.25rem;
    padding: 1.5rem;
  }
  .profil {
    padding: 1.9rem 1.5rem;
  }
  .avatar {
    width: 120px;
    height: 120px;
    margin-bottom: 1rem;
  }
  .profil-judul {
    font-size: 1.5rem;
  }
  .profil-sub {
    font-size: 1rem;
  }
  .tombol-cv {
    padding: 0.5rem 1.25rem;
    font-size: 0.95rem;
  }
  .skill-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.9rem;
  }
  .skill {
    min-height: 90px;
  }
  .skill-nama {
    font-size: 0.8rem;
  }
  .mengetik-teks {
    font-size: 1rem;
  }
  .pk-judul,
  .pk-perusahaan {
    font-size: 1.05rem;
  }
  .pk-periode,
  .pk-poin {
    font-size: 0.85rem;
  }
  .timeline::before {
    left: 20px;
  }
  .perjalanan-butir {
    padding-left: 52px;
    margin-bottom: 18px;
  }
  .perjalanan-titik {
    left: 10px;
    width: 20px;
    height: 20px;
  }
  .perjalanan-isi {
    padding: 1rem 1.1rem;
  }
  .pj-periode {
    font-size: 0.85rem;
  }
  .pj-perusahaan {
    font-size: 1rem;
  }
  .pj-ringkasan {
    font-size: 0.82rem;
  }
}

/* >= 768px: DESKTOP. */
@media (min-width: 768px) {
  .bilah {
    min-height: 56px;
  }
  .judul-situs {
    font-size: 1.1rem;
  }
  .wadah {
    padding: 1.25rem 1.25rem 3rem;
  }
  .skill {
    min-height: 100px;
  }
  .skill-nama {
    font-size: 0.9rem;
  }
  .pk-judul {
    font-size: 1.15rem;
  }
  .pk-poin {
    font-size: 0.9rem;
  }
  .timeline::before {
    left: 50%;
  }
  .perjalanan-butir {
    width: 50%;
    padding: 6px 36px;
    margin-bottom: 22px;
  }
  .perjalanan-butir:nth-child(odd) {
    text-align: right;
  }
  .perjalanan-butir:nth-child(odd) .perjalanan-isi {
    border-right: 3px solid var(--aksen);
    border-left: 1px solid rgba(255, 255, 255, 0.12);
  }
  .perjalanan-butir:nth-child(odd) .perjalanan-isi:hover {
    border-right-color: var(--aksen2);
    border-left-color: rgba(255, 255, 255, 0.12);
  }
  .perjalanan-butir:nth-child(odd) .perjalanan-titik {
    right: -10px;
    left: auto;
  }
  .perjalanan-butir:nth-child(even) {
    left: 50%;
    text-align: left;
  }
  .perjalanan-butir:nth-child(even) .perjalanan-titik {
    left: -10px;
  }
  .perjalanan-isi {
    padding: 1.1rem 1.25rem;
  }
  .pj-periode {
    font-size: 0.9rem;
  }
  .pj-perusahaan {
    font-size: 1.05rem;
  }
  .pj-ringkasan {
    font-size: 0.9rem;
  }
}

/* >= 1024px: DESKTOP LEBAR. */
@media (min-width: 1024px) {
  .wadah {
    padding: 1.5rem 1.5rem 3.5rem;
  }
  .judul-situs {
    font-size: 1.2rem;
  }
}
</style>
