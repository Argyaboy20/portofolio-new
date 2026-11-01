<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from '@lucide/vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'

const IKON = ['code', 'gamepad', 'headphones', 'dumbbell']
const KUNCI = ['linimasa', 'hobi']
const SEKSI = {
  linimasa: {
    judul: 'Perjalananku (linimasa)',
    path: '/api/admin/biodata/linimasa',
    batas: 20,
    nama: 'item linimasa',
  },
  hobi: {
    judul: 'Hobi dan ketertarikan',
    path: '/api/admin/biodata/hobi',
    batas: 12,
    nama: 'hobi',
  },
}

// ===== Biodata utama =====
const KOLOM_B = [
  'heroAwalId',
  'heroAwalEn',
  'heroSubjudulId',
  'heroSubjudulEn',
  'kutipanTeks',
  'kutipanSumber',
  'waNomor',
  'waPesan',
  'quoraUrl',
  'lokasi',
]
const formB = reactive(Object.fromEntries(KOLOM_B.map((k) => [k, ''])))
const galatB = ref('')
const pesanB = ref('')
const menyimpanB = ref(false)

// ===== Linimasa dan Hobi =====
const KOSONG = {
  linimasa: { periodeId: '', periodeEn: '', judulId: '', judulEn: '', deskripsiId: '', deskripsiEn: '' },
  hobi: { ikon: 'code', judulId: '', judulEn: '', deskripsiId: '', deskripsiEn: '' },
}
const form = {
  linimasa: reactive({ ...KOSONG.linimasa }),
  hobi: reactive({ ...KOSONG.hobi }),
}
const daftar = reactive({ linimasa: [], hobi: [] })
// null | { jenis: 'linimasa' | 'hobi', id: 'baru' | number }
const panel = ref(null)
const galat = ref('')
const pesan = ref('')
const menyimpan = ref(false)
const bekerja = ref(false)

const siap = ref(false)
const galatMuat = ref('')

async function muat() {
  galatMuat.value = ''
  try {
    const b = await api('/api/admin/biodata')
    for (const k of KOLOM_B) formB[k] = b[k] ?? ''
    daftar.linimasa = await api(SEKSI.linimasa.path)
    daftar.hobi = await api(SEKSI.hobi.path)
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}
onMounted(muat)

async function muatDaftar(jenis) {
  daftar[jenis] = await api(SEKSI[jenis].path, { loading: false })
}

async function simpanUtama() {
  galatB.value = ''
  pesanB.value = ''
  menyimpanB.value = true
  try {
    await api('/api/admin/biodata', {
      method: 'PUT',
      body: Object.fromEntries(KOLOM_B.map((k) => [k, formB[k]])),
    })
    pesanB.value = 'Tersimpan.'
  } catch (e) {
    galatB.value = e.message
  } finally {
    menyimpanB.value = false
  }
}

// ===== Formulir daftar =====
async function fokusKeForm() {
  await nextTick()
  document.getElementById('panel-daftar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function buka(jenis, id, sumber) {
  galat.value = ''
  pesan.value = ''
  const isi = { ...KOSONG[jenis] }
  for (const k of Object.keys(isi)) isi[k] = sumber[k] ?? isi[k]
  Object.assign(form[jenis], isi)
  panel.value = { jenis, id }
  fokusKeForm()
}
const tambah = (jenis) => buka(jenis, 'baru', {})
const ubah = (jenis, item) => buka(jenis, item.id, item)

function tutup() {
  panel.value = null
  galat.value = ''
}

async function simpanDaftar() {
  galat.value = ''
  pesan.value = ''
  const { jenis, id } = panel.value
  const path = SEKSI[jenis].path
  menyimpan.value = true
  try {
    if (id === 'baru') {
      await api(path, { method: 'POST', body: { ...form[jenis] } })
    } else {
      await api(`${path}/${id}`, { method: 'PUT', body: { ...form[jenis] } })
    }
    await muatDaftar(jenis)
    panel.value = null
    pesan.value = 'Tersimpan.'
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

async function jalankan(kerja, jenis) {
  galat.value = ''
  pesan.value = ''
  bekerja.value = true
  try {
    await kerja()
  } catch (e) {
    galat.value = e.message
    await muatDaftar(jenis) // sinkronkan ulang dengan server
  } finally {
    bekerja.value = false
  }
}

function hapus(jenis, item) {
  if (!window.confirm(`Hapus "${item.judulId}"?`)) return
  return jalankan(async () => {
    await api(`${SEKSI[jenis].path}/${item.id}`, { method: 'DELETE' })
    daftar[jenis] = daftar[jenis].filter((d) => d.id !== item.id)
    if (panel.value?.jenis === jenis && panel.value.id === item.id) panel.value = null
  }, jenis)
}

function geser(jenis, i, arah) {
  const j = i + arah
  if (j < 0 || j >= daftar[jenis].length) return
  const ids = daftar[jenis].map((d) => d.id)
  ;[ids[i], ids[j]] = [ids[j], ids[i]]
  return jalankan(async () => {
    await api(`${SEKSI[jenis].path}/urut`, { method: 'POST', body: { ids }, loading: false })
    await muatDaftar(jenis)
  }, jenis)
}

const barisKedua = (jenis, item) => (jenis === 'linimasa' ? item.periodeId : `Ikon: ${item.ikon}`)
</script>

<template>
  <section>
    <h1>Biodata</h1>
    <p class="ket">Isi halaman Biodata: hero, kutipan, kontak, Perjalananku, dan Hobi.</p>

    <p v-if="galatMuat && !siap" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <!-- ===== Utama ===== -->
      <form class="form" @submit.prevent="simpanUtama">
        <h2>Hero, kutipan, dan kontak</h2>

        <KolomDuaBahasa label="Hero: kalimat awal" v-model:id="formB.heroAwalId" v-model:en="formB.heroAwalEn" :maks="100" />
        <KolomDuaBahasa
          label="Hero: subjudul"
          v-model:id="formB.heroSubjudulId"
          v-model:en="formB.heroSubjudulEn"
          :maks="300"
          :baris="3"
        />

        <div class="ruas">
          <label for="kutipanTeks">Kutipan</label>
          <textarea id="kutipanTeks" v-model="formB.kutipanTeks" rows="3" maxlength="1000" required></textarea>
        </div>
        <div class="ruas">
          <label for="kutipanSumber">Sumber kutipan</label>
          <input id="kutipanSumber" v-model="formB.kutipanSumber" type="text" maxlength="150" required />
        </div>

        <div class="ruas">
          <label for="waNomor">Nomor WhatsApp</label>
          <input
            id="waNomor"
            v-model="formB.waNomor"
            type="text"
            inputmode="numeric"
            maxlength="15"
            pattern="[1-9][0-9]{7,14}"
            required
          />
          <p class="bantuan">Hanya digit, tanpa +, spasi, atau 0 di depan. Contoh: 6285761787971.</p>
        </div>
        <div class="ruas">
          <label for="waPesan">Pesan WhatsApp awal</label>
          <textarea id="waPesan" v-model="formB.waPesan" rows="3" maxlength="1000" required></textarea>
        </div>
        <div class="ruas">
          <label for="quoraUrl">Tautan Quora</label>
          <input id="quoraUrl" v-model="formB.quoraUrl" type="url" maxlength="300" pattern="https://.*" required />
        </div>
        <div class="ruas">
          <label for="lokasi">Lokasi</label>
          <input id="lokasi" v-model="formB.lokasi" type="text" maxlength="150" required />
        </div>

        <p v-if="galatB" class="galat" role="alert">{{ galatB }}</p>
        <p v-if="pesanB" class="sukses" role="status">{{ pesanB }}</p>
        <button type="submit" class="simpan" :disabled="menyimpanB">Simpan perubahan</button>
      </form>

      <!-- ===== Linimasa dan Hobi ===== -->
      <p v-if="pesan && panel === null" class="sukses" role="status">{{ pesan }}</p>
      <p v-if="galat && panel === null" class="galat" role="alert">{{ galat }}</p>

      <div v-for="kunci in KUNCI" :key="kunci" class="seksi">
        <div class="atas">
          <h2>{{ SEKSI[kunci].judul }}</h2>
          <button
            type="button"
            class="tambah"
            :disabled="daftar[kunci].length >= SEKSI[kunci].batas || panel !== null"
            @click="tambah(kunci)"
          >
            <Plus :size="16" aria-hidden="true" /> Tambah
          </button>
        </div>
        <p class="hitung">{{ daftar[kunci].length }} dari maksimal {{ SEKSI[kunci].batas }}</p>

        <div v-if="panel && panel.jenis === kunci" id="panel-daftar" class="panel">
          <form class="form" @submit.prevent="simpanDaftar">
            <h3>{{ panel.id === 'baru' ? 'Tambah' : 'Ubah' }} {{ SEKSI[kunci].nama }}</h3>

            <template v-if="kunci === 'linimasa'">
              <KolomDuaBahasa
                label="Periode"
                v-model:id="form.linimasa.periodeId"
                v-model:en="form.linimasa.periodeEn"
                :maks="60"
              />
              <KolomDuaBahasa
                label="Judul"
                v-model:id="form.linimasa.judulId"
                v-model:en="form.linimasa.judulEn"
                :maks="150"
              />
              <KolomDuaBahasa
                label="Deskripsi"
                v-model:id="form.linimasa.deskripsiId"
                v-model:en="form.linimasa.deskripsiEn"
                :maks="1500"
                :baris="4"
              />
            </template>

            <template v-else>
              <div class="ruas">
                <label for="h-ikon">Ikon</label>
                <select id="h-ikon" v-model="form.hobi.ikon">
                  <option v-for="i in IKON" :key="i" :value="i">{{ i }}</option>
                </select>
              </div>
              <KolomDuaBahasa
                label="Judul"
                v-model:id="form.hobi.judulId"
                v-model:en="form.hobi.judulEn"
                :maks="100"
              />
              <KolomDuaBahasa
                label="Deskripsi"
                v-model:id="form.hobi.deskripsiId"
                v-model:en="form.hobi.deskripsiEn"
                :maks="1000"
                :baris="3"
              />
            </template>

            <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
            <div class="aksi-form">
              <button type="submit" class="simpan" :disabled="menyimpan">Simpan</button>
              <button type="button" class="batal" :disabled="menyimpan" @click="tutup">Tutup</button>
            </div>
          </form>
        </div>

        <p v-if="!daftar[kunci].length" class="kosong">Belum ada data.</p>
        <ul class="daftar">
          <li v-for="(item, i) in daftar[kunci]" :key="item.id" class="butir">
            <div class="teks">
              <strong>{{ item.judulId }}</strong>
              <span>{{ barisKedua(kunci, item) }}</span>
            </div>
            <div class="aksi">
              <button type="button" :disabled="bekerja || i === 0" aria-label="Naikkan" @click="geser(kunci, i, -1)">
                <ChevronUp :size="16" aria-hidden="true" />
              </button>
              <button
                type="button"
                :disabled="bekerja || i === daftar[kunci].length - 1"
                aria-label="Turunkan"
                @click="geser(kunci, i, 1)"
              >
                <ChevronDown :size="16" aria-hidden="true" />
              </button>
              <button type="button" :disabled="panel !== null" aria-label="Ubah" @click="ubah(kunci, item)">
                <Pencil :size="16" aria-hidden="true" />
              </button>
              <button type="button" class="bahaya" :disabled="bekerja" aria-label="Hapus" @click="hapus(kunci, item)">
                <Trash2 :size="16" aria-hidden="true" />
              </button>
            </div>
          </li>
        </ul>
      </div>
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
  margin: 0;
  font-size: 1.1rem;
  color: #1f2d3d;
}
h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #1f2d3d;
}
.ket {
  margin: 0 0 1.25rem;
  color: #6b7686;
}
.form {
  max-width: 62rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
}
.form > h2 {
  margin-bottom: 1rem;
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
.ruas textarea,
.ruas select {
  width: 100%;
  min-width: 0;
  padding: 0.6rem 0.7rem;
  font: inherit;
  font-size: 0.95rem;
  color: #222;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
}
.ruas textarea {
  resize: vertical;
}
.ruas input:focus,
.ruas textarea:focus,
.ruas select:focus {
  border-color: #4a90e2;
  outline: none;
}
.bantuan {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  color: #6b7686;
}
.simpan,
.tambah,
.batal {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 1.2rem;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  background: #2e87f6;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.batal {
  color: #555;
  background: #e8ecf2;
}
.simpan:disabled,
.tambah:disabled,
.batal:disabled {
  opacity: 0.55;
  cursor: default;
}
.aksi-form {
  display: flex;
  gap: 0.5rem;
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
.kosong {
  margin: 0.3rem 0;
  font-size: 0.85rem;
  color: #98a2b3;
}

.seksi {
  max-width: 62rem;
  margin-bottom: 1.75rem;
}
.atas {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.hitung {
  margin: 0.2rem 0 0.8rem;
  font-size: 0.85rem;
  color: #6b7686;
}
.panel {
  margin-bottom: 1rem;
  scroll-margin-top: 4.5rem;
}
.panel .form {
  border-color: #cfd6e0;
}
.daftar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
  list-style: none;
}
.butir {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.8rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 10px;
}
.teks {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.teks strong {
  overflow: hidden;
  font-size: 0.92rem;
  color: #1f2d3d;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.teks span {
  overflow: hidden;
  font-size: 0.78rem;
  color: #6b7686;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.aksi {
  display: flex;
  flex-shrink: 0;
  gap: 0.2rem;
}
.aksi button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: #4a5568;
  background: #f1f4f9;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
.aksi button:hover:not(:disabled) {
  background: #dde5f0;
}
.aksi button:disabled {
  opacity: 0.35;
  cursor: default;
}
.aksi .bahaya {
  color: #d63b3b;
}

@media (min-width: 641px) {
  .form {
    padding: 1.5rem;
  }
  .aksi button {
    width: 34px;
    height: 34px;
  }
}
</style>