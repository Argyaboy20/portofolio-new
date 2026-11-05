<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import UnggahBerkas from '../../components/admin/UnggahBerkas.vue'
import DaftarEditor from '../../components/admin/DaftarEditor.vue'

const PATH = '/api/admin/halaman/administrasi'

const konten = ref(null)
const sertifikat = ref(null)
const cv = ref(null)
const siap = ref(false)
const galatMuat = ref('')
const galat = ref('')
const pesan = ref('')
const menyimpan = ref(false)

async function muat() {
  galatMuat.value = ''
  try {
    const d = await api(PATH)
    if (!d.konten) {
      galatMuat.value = 'Isi halaman belum ada di database.'
      return
    }
    konten.value = d.konten
    sertifikat.value = d.gambar?.mengetik ?? null
    cv.value = d.gambar?.cv ?? null
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}
onMounted(muat)

async function simpan() {
  galat.value = ''
  pesan.value = ''
  menyimpan.value = true
  try {
    const d = await api(PATH, { method: 'PUT', body: konten.value })
    konten.value = d.konten
    pesan.value = 'Tersimpan.'
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

// Kunci ikon harus ada di KUNCI_ADMINISTRASI (utils/ikon.js)
const IKON_PILIHAN = [
  ['google-docs', 'Google Docs'],
  ['google-sheets', 'Google Sheets'],
  ['google-calendar', 'Google Calendar'],
  ['google-forms', 'Google Form'],
  ['clickup', 'ClickUp'],
  ['trello', 'Trello'],
  ['ms-office', 'MS Office (ikon umum)'],
  ['zoom', 'Zoom'],
  ['wbspro', 'WBSPro (ikon umum)'],
]
const WARNA_PILIHAN = [
  ['primary', 'Biru'],
  ['success', 'Hijau'],
  ['tertiary', 'Ungu'],
  ['warning', 'Kuning'],
  ['secondary', 'Biru muda'],
  ['dark', 'Gelap'],
  ['danger', 'Merah'],
  ['medium', 'Abu-abu'],
  ['light', 'Terang'],
]

const keterampilanBaru = () => ({ nama: '', ikon: 'google-docs', warna: 'primary' })
const perjalananBaru = () => ({
  periode: { id: '', en: '' },
  perusahaan: '',
  ringkasan: { id: '', en: '' },
})
</script>

<template>
  <section>
    <h1>Halaman Administrasi</h1>
    <p class="ket">
      Isi halaman <code>/administrasi</code> selain Pengalaman Kerja dan Rekomendasi (keduanya punya
      menu sendiri). Semua teks wajib ada dalam bahasa Indonesia dan Inggris.
    </p>

    <p v-if="galatMuat && !siap" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="kartu">
        <h2>Berkas</h2>
        <div class="dua-kolom">
          <UnggahBerkas
            label="Sertifikat kecepatan mengetik"
            accept="image/jpeg,image/png,image/webp"
            :maks-mb="8"
            :url="sertifikat"
            :endpoint="`${PATH}/gambar/mengetik`"
            bantuan="JPEG, PNG, atau WebP, maksimal 8 MB. Tampil di kartu Kecepatan Mengetik."
            @berubah="(url) => (sertifikat = url)"
          />
          <UnggahBerkas
            label="CV Administrasi (PDF)"
            accept="application/pdf"
            jenis="pdf"
            :maks-mb="8"
            :url="cv"
            :endpoint="`${PATH}/gambar/cv`"
            bantuan="PDF, maksimal 8 MB. Dibuka oleh tombol Lihat CV. Tombol tidak tampil bila belum ada."
            @berubah="(url) => (cv = url)"
          />
        </div>
      </div>

      <form @submit.prevent="simpan">
        <div class="kartu">
          <h2>Kepala halaman</h2>
          <KolomDuaBahasa
            label="Judul"
            v-model:id="konten.kepala.judul.id"
            v-model:en="konten.kepala.judul.en"
            :maks="100"
          />
          <KolomDuaBahasa
            label="Subjudul"
            v-model:id="konten.kepala.subjudul.id"
            v-model:en="konten.kepala.subjudul.en"
            :maks="150"
          />
        </div>

        <div class="kartu">
          <h2>Keterampilan administrasi</h2>
          <DaftarEditor
            v-model="konten.keterampilan"
            label="Keterampilan"
            nama-item="Keterampilan"
            :buat="keterampilanBaru"
            :min="1"
            :maks="12"
          >
            <template #default="{ item }">
              <div class="ruas">
                <label>Nama</label>
                <input v-model="item.nama" type="text" maxlength="60" required />
              </div>
              <div class="dua-kolom">
                <div class="ruas">
                  <label>Ikon</label>
                  <select v-model="item.ikon">
                    <option v-for="i in IKON_PILIHAN" :key="i[0]" :value="i[0]">{{ i[1] }}</option>
                  </select>
                </div>
                <div class="ruas">
                  <label>Warna tombol</label>
                  <select v-model="item.warna">
                    <option v-for="w in WARNA_PILIHAN" :key="w[0]" :value="w[0]">{{ w[1] }}</option>
                  </select>
                </div>
              </div>
            </template>
          </DaftarEditor>
        </div>

        <div class="kartu">
          <h2>Kecepatan mengetik</h2>
          <KolomDuaBahasa
            label="Paragraf"
            v-model:id="konten.mengetik.teks.id"
            v-model:en="konten.mengetik.teks.en"
            :maks="600"
            :baris="4"
          />
        </div>

        <div class="kartu">
          <h2>Perjalanan karir</h2>
          <p class="ket">Urutan dari terbaru (atas) ke terlama (bawah).</p>
          <DaftarEditor
            v-model="konten.perjalanan"
            label="Butir perjalanan"
            nama-item="Butir"
            :buat="perjalananBaru"
            :min="1"
            :maks="10"
          >
            <template #default="{ item }">
              <KolomDuaBahasa
                label="Periode"
                v-model:id="item.periode.id"
                v-model:en="item.periode.en"
                :maks="60"
              />
              <div class="ruas">
                <label>Perusahaan</label>
                <input v-model="item.perusahaan" type="text" maxlength="150" required />
              </div>
              <KolomDuaBahasa
                label="Ringkasan"
                v-model:id="item.ringkasan.id"
                v-model:en="item.ringkasan.en"
                :maks="500"
                :baris="3"
              />
            </template>
          </DaftarEditor>
        </div>

        <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
        <p v-if="pesan" class="sukses" role="status">{{ pesan }}</p>
        <button type="submit" class="simpan" :disabled="menyimpan">Simpan perubahan</button>
      </form>
    </template>
  </section>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px. */
h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  color: #1f2d3d;
}
h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #1f2d3d;
}
.ket {
  margin: 0 0 1.25rem;
  color: #6b7686;
}
.kartu {
  max-width: 62rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
}
.ruas {
  min-width: 0;
  margin-bottom: 1rem;
}
.ruas label {
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2d3d;
}
.ruas input,
.ruas select {
  width: 100%;
  padding: 0.6rem 0.7rem;
  font: inherit;
  font-size: 0.95rem;
  color: #222;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
}
.ruas input:focus,
.ruas select:focus {
  border-color: #4a90e2;
  outline: none;
}
.dua-kolom {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 1.5rem;
}
.simpan {
  padding: 0.7rem 1.4rem;
  font: inherit;
  font-weight: 600;
  color: #fff;
  background: #2e87f6;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.simpan:disabled {
  opacity: 0.55;
  cursor: default;
}
.galat {
  color: #d63b3b;
}
.galat button {
  margin-left: 0.5rem;
  cursor: pointer;
}
.sukses {
  color: #1f9d55;
}

@media (min-width: 641px) {
  .kartu {
    padding: 1.5rem;
  }
  .dua-kolom {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
