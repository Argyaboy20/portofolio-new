<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronUp, Languages } from '@lucide/vue'
import { useBahasaStore } from '../../stores/bahasa'

const bahasa = useBahasaStore()
const p = (id, en) => bahasa.pilih(id, en)

const EMAIL = 'maulana.farras05@gmail.com'

// Isi statis. Ubah teks di sini, tidak ada admin untuk halaman ini.
const DAFTAR_ISI = [
  { id: 'pengunjung', judul: ['Pengunjung', 'Visitors'] },
  { id: 'data', judul: ['Data yang diproses', 'Data we process'] },
  { id: 'cookie', judul: ['Cookie', 'Cookies'] },
  { id: 'kontak', judul: ['Kontak', 'Contact'] },
]

const BUTIR_PENGUNJUNG = [
  ['Tidak ada data pribadi yang dikumpulkan.', 'No personal information is collected.'],
  [
    'Tidak ada data yang dijual atau dibagikan ke pengiklan.',
    'No information is sold to or shared with advertisers.',
  ],
  [
    'Tidak ada data yang ditambang untuk profil perilaku.',
    'No information is mined for behavioral profiles.',
  ],
  ['Tidak ada data yang dimonetisasi.', 'No information is monetized.'],
]

const BARIS_DATA = [
  {
    data: ['Alamat IP', 'IP address'],
    tujuan: [
      'Diproses Cloudflare untuk menyajikan halaman dan menangkal serangan.',
      'Processed by Cloudflare to serve pages and block attacks.',
    ],
    simpan: [
      'Dikelola Cloudflare. Situs ini tidak menyimpannya.',
      'Handled by Cloudflare. This site does not store it.',
    ],
  },
  {
    data: ['Kode akses Source Code', 'Source Code access code'],
    tujuan: [
      'Dicek di server. Percobaan gagal dihitung per alamat IP agar kode tidak ditebak.',
      'Checked on the server. Failed attempts are counted per IP address to stop guessing.',
    ],
    simpan: [
      'Hitungan di memori server, hilang saat server dimulai ulang.',
      'A counter in server memory, cleared when the server restarts.',
    ],
  },
  {
    data: [
      'Statistik kunjungan (setelah Cloudflare Web Analytics diaktifkan)',
      'Visit statistics (once Cloudflare Web Analytics is enabled)',
    ],
    tujuan: [
      'Alamat halaman, perujuk, jenis browser, sistem operasi, jenis perangkat, dan negara. Untuk tahu halaman mana yang dibaca.',
      'Page URL, referrer, browser type, operating system, device type, and country. To learn which pages are read.',
    ],
    simpan: [
      'Hanya angka gabungan. Tanpa cookie dan tanpa profil per orang.',
      'Aggregate counts only. No cookies and no per-person profile.',
    ],
  },
  {
    data: ['Pilihan bahasa (ID atau EN)', 'Language choice (ID or EN)'],
    tujuan: [
      'Agar situs ingat bahasa yang Anda pilih.',
      'So the site remembers the language you chose.',
    ],
    simpan: [
      'Di browser Anda sendiri (localStorage). Tidak dikirim ke server.',
      'In your own browser (localStorage). Never sent to the server.',
    ],
  },
  {
    data: ['Login admin', 'Admin login'],
    tujuan: [
      'Hanya untuk pemilik situs, dengan verifikasi Cloudflare Turnstile.',
      'For the site owner only, with Cloudflare Turnstile verification.',
    ],
    simpan: ['Tidak berlaku untuk pengunjung.', 'Does not apply to visitors.'],
  },
]

const tampilAtas = ref(false)
const saatGulir = () => (tampilAtas.value = window.scrollY > 200)
const keAtas = () => window.scrollTo({ top: 0, behavior: 'smooth' })
function keBagian(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  window.addEventListener('scroll', saatGulir, { passive: true })
  saatGulir()
})
onBeforeUnmount(() => window.removeEventListener('scroll', saatGulir))
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

    <main class="isi">
      <section class="pembuka">
        <h1>{{ p('Kebijakan Privasi', 'Privacy Policy') }}</h1>
        <p class="ringkas">
          {{
            p(
              'Situs ini tidak memakai cookie pelacak dan tidak mengumpulkan data pribadi Anda.',
              'This site uses no tracking cookies and collects no personal data about you.',
            )
          }}
        </p>
      </section>

      <div class="badan">
        <nav class="daftar-isi" :aria-label="p('Daftar isi', 'Contents')">
          <a v-for="s in DAFTAR_ISI" :key="s.id" :href="'#' + s.id" @click.prevent="keBagian(s.id)">
            {{ p(s.judul[0], s.judul[1]) }}
          </a>
        </nav>

        <article class="teks">
          <section id="pengunjung">
            <h2>{{ p('Pengunjung', 'Visitors') }}</h2>
            <ul class="butir">
              <li v-for="(b, i) in BUTIR_PENGUNJUNG" :key="i">{{ p(b[0], b[1]) }}</li>
            </ul>
          </section>

          <section id="data">
            <h2>{{ p('Data yang diproses', 'Data we process') }}</h2>
            <p>
              {{
                p(
                  'Tabel ini memuat semua data yang disentuh situs, untuk apa, dan berapa lama.',
                  'This table lists every piece of data the site touches, why, and for how long.',
                )
              }}
            </p>
            <table class="tabel">
              <thead>
                <tr>
                  <th scope="col">{{ p('Data', 'Data') }}</th>
                  <th scope="col">{{ p('Untuk apa', 'Why') }}</th>
                  <th scope="col">{{ p('Disimpan?', 'Kept?') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in BARIS_DATA" :key="i">
                  <th scope="row" :data-label="p('Data', 'Data')">{{ p(r.data[0], r.data[1]) }}</th>
                  <td :data-label="p('Untuk apa', 'Why')">{{ p(r.tujuan[0], r.tujuan[1]) }}</td>
                  <td :data-label="p('Disimpan?', 'Kept?')">{{ p(r.simpan[0], r.simpan[1]) }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="cookie">
            <h2>{{ p('Cookie', 'Cookies') }}</h2>
            <p>
              {{
                p(
                  'Situs ini tidak memasang cookie pelacak. Tidak ada iklan dan tidak ada pelacak pihak ketiga.',
                  'This site sets no tracking cookies. There are no ads and no third-party trackers.',
                )
              }}
            </p>
          </section>

          <section id="kontak">
            <h2>{{ p('Kontak', 'Contact') }}</h2>
            <p>
              {{
                p(
                  'Ada pertanyaan tentang kebijakan ini? Tulis ke ',
                  'Questions about this policy? Write to ',
                )
              }}<a :href="'mailto:' + EMAIL" class="surel">{{ EMAIL }}</a
              >.
            </p>
            <p class="diperbarui">
              {{ p('Diperbarui: November 2026', 'Last updated: November 2026') }}
            </p>
          </section>

          <div class="tombol-baris">
            <RouterLink to="/aboutme" class="tombol">{{
              p('Tentang Saya', 'About Me')
            }}</RouterLink>
            <RouterLink to="/" class="tombol utama">{{ p('Beranda', 'Home') }}</RouterLink>
          </div>
        </article>
      </div>
    </main>

    <footer class="kaki">Powered by Cloudflare and GitHub</footer>

    <button
      v-if="tampilAtas"
      type="button"
      class="atas"
      :aria-label="p('Ke atas', 'Back to top')"
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
  --kertas: #eef2f6;
  --tinta: #162330;
  --indigo: #3b4cca;
  --tint: #e3e9f5;
  --garis: #c9d3df;

  min-height: 100vh;
  color: var(--tinta);
  background: var(--kertas);
  font-family: Georgia, 'Times New Roman', serif;
}
.halaman *,
.halaman *::before,
.halaman *::after {
  box-sizing: border-box;
}
h1,
h2,
p,
ul {
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
  background: var(--kertas);
  border-bottom: 1px solid var(--garis);
}
.judul-situs {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--tinta);
  text-decoration: none;
}
.terjemah {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.35rem 0.8rem;
  font: inherit;
  font-family: system-ui, sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--indigo);
  cursor: pointer;
  background: transparent;
  border: 1.5px solid var(--indigo);
  border-radius: 999px;
}
.terjemah:hover {
  color: #fff;
  background: var(--indigo);
}

/* --- Pembuka --- */
.pembuka {
  max-width: 62rem;
  padding: 2.5rem 1.25rem 1.5rem;
  margin: 0 auto;
}
.pembuka h1 {
  margin-bottom: 0.9rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--indigo);
}
.ringkas {
  max-width: 24ch;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

/* --- Badan --- */
.badan {
  display: block;
  max-width: 62rem;
  padding: 0 1.25rem 2.5rem;
  margin: 0 auto;
}
.daftar-isi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem 0;
  margin-bottom: 1rem;
  border-top: 1px solid var(--garis);
  border-bottom: 1px solid var(--garis);
}
.daftar-isi a {
  padding: 0.3rem 0.8rem;
  font-family: system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--indigo);
  text-decoration: none;
  background: var(--tint);
  border-radius: 999px;
}
.daftar-isi a:hover {
  color: #fff;
  background: var(--indigo);
}

.teks section {
  padding-top: 0.5rem;
  margin-bottom: 2rem;
  scroll-margin-top: 70px;
}
.teks h2 {
  margin-bottom: 0.8rem;
  font-size: 1.35rem;
  font-weight: 700;
}
.teks p {
  max-width: 68ch;
  margin-bottom: 0.9rem;
  font-size: 1.02rem;
  line-height: 1.75;
}
.butir {
  max-width: 68ch;
  padding: 0;
  list-style: none;
}
.butir li {
  padding: 0.65rem 0 0.65rem 1.1rem;
  font-size: 1.02rem;
  line-height: 1.6;
  border-bottom: 1px solid var(--garis);
  border-left: 3px solid var(--indigo);
  margin-bottom: 0.5rem;
  background: var(--tint);
  border-radius: 0 6px 6px 0;
}
.surel {
  color: var(--indigo);
  text-underline-offset: 3px;
}
.diperbarui {
  font-size: 0.9rem;
  font-style: italic;
  opacity: 0.75;
}

/* --- Tabel (HP: tiap baris jadi blok bertanda) --- */
.tabel {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.tabel thead {
  display: none;
}
.tabel tr {
  display: block;
  padding: 0.9rem 0;
  border-top: 1px solid var(--garis);
}
.tabel tr:last-child {
  border-bottom: 1px solid var(--garis);
}
.tabel th,
.tabel td {
  display: block;
  padding: 0.15rem 0;
  text-align: left;
  line-height: 1.55;
}
.tabel th {
  font-size: 1.02rem;
  font-weight: 700;
}
.tabel td::before {
  display: block;
  margin-top: 0.5rem;
  font-family: system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--indigo);
  content: attr(data-label);
}

/* --- Tombol --- */
.tombol-baris {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  max-width: 68ch;
}
.tombol {
  padding: 0.8rem 1rem;
  font-family: system-ui, sans-serif;
  font-weight: 700;
  color: var(--indigo);
  text-align: center;
  text-decoration: none;
  border: 1.5px solid var(--indigo);
  border-radius: 10px;
}
.tombol:hover {
  background: var(--tint);
}
.tombol.utama {
  color: #fff;
  background: var(--indigo);
}
.tombol.utama:hover {
  filter: brightness(1.1);
}

.kaki {
  padding: 1rem;
  font-family: system-ui, sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  background: var(--tinta);
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
  background: var(--indigo);
  border: 0;
  border-radius: 50%;
  box-shadow: 0 6px 16px rgba(22, 35, 48, 0.3);
}

/* >= 641px: TABLET. Tabel jadi tiga kolom. */
@media (min-width: 641px) {
  .bilah {
    padding: 0 1.5rem;
  }
  .judul-situs {
    font-size: 1rem;
  }
  .pembuka {
    padding: 3.5rem 2rem 2rem;
  }
  .ringkas {
    font-size: 2.6rem;
  }
  .badan {
    padding: 0 2rem 3rem;
  }
  .tabel thead {
    display: table-header-group;
  }
  .tabel tr {
    display: table-row;
    padding: 0;
  }
  .tabel th,
  .tabel td {
    display: table-cell;
    padding: 0.9rem 0.8rem 0.9rem 0;
    vertical-align: top;
    border-top: 1px solid var(--garis);
  }
  .tabel thead th {
    padding-bottom: 0.5rem;
    font-family: system-ui, sans-serif;
    font-size: 0.8rem;
    color: var(--indigo);
    border-top: 0;
    border-bottom: 2px solid var(--tinta);
  }
  .tabel tr:last-child {
    border-bottom: 0;
  }
  .tabel tbody tr:last-child th,
  .tabel tbody tr:last-child td {
    border-bottom: 1px solid var(--garis);
  }
  .tabel td::before {
    display: none;
  }
  .tabel th:first-child {
    width: 24%;
  }
  .tombol-baris {
    flex-direction: row;
  }
  .tombol {
    flex: 1;
  }
}

/* >= 768px: DESKTOP. Daftar isi menempel di kiri, teks di kanan. */
@media (min-width: 768px) {
  .pembuka {
    padding: 4.5rem 2rem 2.5rem;
  }
  .ringkas {
    max-width: 22ch;
    font-size: 3.2rem;
  }
  .badan {
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 3rem;
  }
  .daftar-isi {
    position: sticky;
    top: 76px;
    flex-direction: column;
    align-self: start;
    gap: 0.2rem;
    padding: 0;
    margin: 0;
    border: 0;
    border-left: 2px solid var(--garis);
  }
  .daftar-isi a {
    padding: 0.4rem 0.9rem;
    background: none;
    border-radius: 0;
  }
  .daftar-isi a:hover {
    color: var(--indigo);
    background: var(--tint);
  }
}

/* >= 1024px: DESKTOP LEBAR. */
@media (min-width: 1024px) {
  .pembuka,
  .badan {
    max-width: 70rem;
  }
  .ringkas {
    font-size: 3.6rem;
  }
  .badan {
    grid-template-columns: 220px 1fr;
    gap: 4rem;
  }
}
</style>
