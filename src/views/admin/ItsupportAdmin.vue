<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import UnggahBerkas from '../../components/admin/UnggahBerkas.vue'
import DaftarEditor from '../../components/admin/DaftarEditor.vue'
import DaftarTeks from '../../components/admin/DaftarTeks.vue'
import PemilihIkon from '../../components/admin/PemilihIkon.vue'

const PATH = '/api/admin/halaman/itsupport'

const konten = ref(null)
const gambarHero = ref(null)
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
    gambarHero.value = d.gambar?.hero ?? null
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
    // Seluruh isi halaman dikirim; bagian yang belum tampil di formulir ikut tersimpan utuh
    const d = await api(PATH, { method: 'PUT', body: konten.value })
    konten.value = d.konten
    pesan.value = 'Tersimpan.'
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

const statBaru = () => ({ angka: '', label: { id: '', en: '' } })
const metrikBaru = () => ({ nilai: '', nada: 'info', label: { id: '', en: '' } })
const faseBaru = () => ({ judul: { id: '', en: '' }, deskripsi: { id: '', en: '' }, tag: [] })
const hasilBaru = () => ({
  ikon: 'gauge',
  lama: '',
  baru: '',
  label: { id: '', en: '' },
  perubahan: { id: '', en: '' },
})
const pembelajaranBaru = () => ({ id: '', en: '' })
const keahlianBaru = () => ({
  ikon: 'cpu',
  judul: { id: '', en: '' },
  deskripsi: { id: '', en: '' },
  lencana: [],
})
const NADA = [
  ['danger', 'Bahaya (merah)'],
  ['warning', 'Peringatan (kuning)'],
  ['info', 'Info (biru)'],
]
</script>

<template>
  <section>
    <h1>Halaman IT Support</h1>
    <p class="ket">Isi halaman <code>/itsupport</code>. Semua teks wajib ada dalam bahasa Indonesia dan Inggris.</p>

    <p v-if="galatMuat && !siap" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="kartu">
        <h2>Foto hero</h2>
        <UnggahBerkas
          label="Foto"
          accept="image/jpeg,image/png,image/webp"
          :maks-mb="8"
          :url="gambarHero"
          :endpoint="`${PATH}/gambar/hero`"
          bantuan="JPEG, PNG, atau WebP, maksimal 8 MB. Tampil di sisi kanan hero (di HP, di bawah teks)."
          @berubah="(url) => (gambarHero = url)"
        />
      </div>

      <form @submit.prevent="simpan">
        <div class="kartu">
          <h2>Hero</h2>
          <KolomDuaBahasa label="Lencana" v-model:id="konten.hero.lencana.id" v-model:en="konten.hero.lencana.en" :maks="60" />
          <KolomDuaBahasa label="Judul" v-model:id="konten.hero.judul.id" v-model:en="konten.hero.judul.en" :maks="120" />
          <KolomDuaBahasa
            label="Deskripsi"
            v-model:id="konten.hero.deskripsi.id"
            v-model:en="konten.hero.deskripsi.en"
            :maks="500"
            :baris="4"
          />

          <DaftarEditor v-model="konten.hero.stat" label="Statistik" nama-item="Statistik" :buat="statBaru" :min="1" :maks="4">
            <template #default="{ item }">
              <div class="ruas">
                <label>Angka</label>
                <input v-model="item.angka" type="text" maxlength="20" required />
              </div>
              <KolomDuaBahasa label="Label" v-model:id="item.label.id" v-model:en="item.label.en" :maks="60" />
            </template>
          </DaftarEditor>
        </div>

        <div class="kartu">
          <h2>Studi kasus</h2>
          <KolomDuaBahasa label="Tag" v-model:id="konten.cerita.tag.id" v-model:en="konten.cerita.tag.en" :maks="40" />
          <KolomDuaBahasa
            label="Judul"
            v-model:id="konten.cerita.judul.id"
            v-model:en="konten.cerita.judul.en"
            :maks="200"
          />
          <KolomDuaBahasa
            label="Tanggal"
            v-model:id="konten.cerita.tanggal.id"
            v-model:en="konten.cerita.tanggal.en"
            :maks="40"
          />
          <KolomDuaBahasa
            label="Waktu baca"
            v-model:id="konten.cerita.waktuBaca.id"
            v-model:en="konten.cerita.waktuBaca.en"
            :maks="40"
          />

          <h3>Latar belakang</h3>
          <KolomDuaBahasa
            label="Judul bagian"
            v-model:id="konten.cerita.latarBelakang.judul.id"
            v-model:en="konten.cerita.latarBelakang.judul.en"
            :maks="80"
          />
          <KolomDuaBahasa
            label="Teks"
            v-model:id="konten.cerita.latarBelakang.teks.id"
            v-model:en="konten.cerita.latarBelakang.teks.en"
            :maks="1000"
            :baris="5"
          />
        </div>

        <div class="kartu">
          <h2>Tantangan kritis</h2>
          <KolomDuaBahasa
            label="Judul bagian"
            v-model:id="konten.cerita.tantangan.judul.id"
            v-model:en="konten.cerita.tantangan.judul.en"
            :maks="80"
          />
          <KolomDuaBahasa
            label="Teks"
            v-model:id="konten.cerita.tantangan.teks.id"
            v-model:en="konten.cerita.tantangan.teks.en"
            :maks="1000"
            :baris="4"
          />
          <DaftarEditor
            v-model="konten.cerita.tantangan.metrik"
            label="Metrik"
            nama-item="Metrik"
            :buat="metrikBaru"
            :min="1"
            :maks="6"
          >
            <template #default="{ item }">
              <div class="ruas">
                <label>Nilai</label>
                <input v-model="item.nilai" type="text" maxlength="20" required />
              </div>
              <div class="ruas">
                <label>Warna</label>
                <select v-model="item.nada">
                  <option v-for="n in NADA" :key="n[0]" :value="n[0]">{{ n[1] }}</option>
                </select>
              </div>
              <KolomDuaBahasa label="Label" v-model:id="item.label.id" v-model:en="item.label.en" :maks="40" />
            </template>
          </DaftarEditor>
        </div>

        <div class="kartu">
          <h2>Tahapan eksekusi</h2>
          <KolomDuaBahasa
            label="Judul bagian"
            v-model:id="konten.cerita.fase.judul.id"
            v-model:en="konten.cerita.fase.judul.en"
            :maks="80"
          />
          <DaftarEditor
            v-model="konten.cerita.fase.item"
            label="Fase"
            nama-item="Fase"
            :buat="faseBaru"
            :min="1"
            :maks="8"
          >
            <template #default="{ item }">
              <KolomDuaBahasa label="Judul" v-model:id="item.judul.id" v-model:en="item.judul.en" :maks="100" />
              <KolomDuaBahasa
                label="Deskripsi"
                v-model:id="item.deskripsi.id"
                v-model:en="item.deskripsi.en"
                :maks="800"
                :baris="4"
              />
              <DaftarTeks v-model="item.tag" label="Tag" :maks="6" :panjang="40" />
            </template>
          </DaftarEditor>
        </div>

        <div class="kartu">
          <h2>Hasil yang dicapai</h2>
          <KolomDuaBahasa
            label="Judul bagian"
            v-model:id="konten.cerita.hasil.judul.id"
            v-model:en="konten.cerita.hasil.judul.en"
            :maks="80"
          />
          <DaftarEditor
            v-model="konten.cerita.hasil.item"
            label="Hasil"
            nama-item="Hasil"
            :buat="hasilBaru"
            :min="1"
            :maks="8"
          >
            <template #default="{ item }">
              <PemilihIkon v-model="item.ikon" />
              <div class="dua-kolom">
                <div class="ruas">
                  <label>Nilai lama</label>
                  <input v-model="item.lama" type="text" maxlength="20" required />
                </div>
                <div class="ruas">
                  <label>Nilai baru</label>
                  <input v-model="item.baru" type="text" maxlength="20" required />
                </div>
              </div>
              <KolomDuaBahasa label="Label" v-model:id="item.label.id" v-model:en="item.label.en" :maks="60" />
              <KolomDuaBahasa
                label="Perubahan"
                v-model:id="item.perubahan.id"
                v-model:en="item.perubahan.en"
                :maks="60"
              />
            </template>
          </DaftarEditor>
        </div>

        <div class="kartu">
          <h2>Pembelajaran penting</h2>
          <KolomDuaBahasa
            label="Judul bagian"
            v-model:id="konten.cerita.pembelajaran.judul.id"
            v-model:en="konten.cerita.pembelajaran.judul.en"
            :maks="80"
          />
          <DaftarEditor
            v-model="konten.cerita.pembelajaran.item"
            label="Butir"
            nama-item="Butir"
            :buat="pembelajaranBaru"
            :min="1"
            :maks="10"
          >
            <template #default="{ item }">
              <KolomDuaBahasa label="Isi" v-model:id="item.id" v-model:en="item.en" :maks="300" :baris="2" />
            </template>
          </DaftarEditor>
        </div>

        <div class="kartu">
          <h2>Keahlian dan expertise</h2>
          <KolomDuaBahasa
            label="Judul bagian"
            v-model:id="konten.keahlian.judul.id"
            v-model:en="konten.keahlian.judul.en"
            :maks="80"
          />
          <KolomDuaBahasa
            label="Deskripsi bagian"
            v-model:id="konten.keahlian.deskripsi.id"
            v-model:en="konten.keahlian.deskripsi.en"
            :maks="400"
            :baris="3"
          />
          <DaftarEditor
            v-model="konten.keahlian.item"
            label="Kartu keahlian"
            nama-item="Keahlian"
            :buat="keahlianBaru"
            :min="1"
            :maks="12"
          >
            <template #default="{ item }">
              <PemilihIkon v-model="item.ikon" />
              <KolomDuaBahasa label="Judul" v-model:id="item.judul.id" v-model:en="item.judul.en" :maks="80" />
              <KolomDuaBahasa
                label="Deskripsi"
                v-model:id="item.deskripsi.id"
                v-model:en="item.deskripsi.en"
                :maks="600"
                :baris="3"
              />
              <DaftarTeks v-model="item.lencana" label="Lencana" :maks="6" :panjang="40" />
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
h3 {
  margin: 1.5rem 0 0.75rem;
  font-size: 1rem;
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
.ruas input {
  width: 100%;
  padding: 0.6rem 0.7rem;
  font: inherit;
  font-size: 0.95rem;
  color: #222;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
}
.ruas input:focus {
  border-color: #4a90e2;
  outline: none;
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
.ruas select:focus {
  border-color: #4a90e2;
  outline: none;
}
.dua-kolom {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 1rem;
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