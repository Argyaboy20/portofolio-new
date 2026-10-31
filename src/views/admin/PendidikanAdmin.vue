<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from '@lucide/vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import { useBerandaStore } from '../../stores/beranda'
import { formatDurasi } from '../../utils/durasi'

const BATAS_PENDIDIKAN = 10
const BATAS_PRESTASI = 20
const beranda = useBerandaStore()

const daftar = ref([])
const siap = ref(false)
const galatMuat = ref('')
const galat = ref('')
const pesan = ref('')
const menyimpan = ref(false)
const bekerja = ref(false)
const kotakForm = ref(null)
// null | { jenis: 'pendidikan', id: 'baru' | number } | { jenis: 'prestasi', pendidikanId, id: 'baru' | number }
const panel = ref(null)

const KOSONG_P = {
  institusi: '',
  jurusanId: '',
  jurusanEn: '',
  mulaiTahun: '',
  selesaiTahun: '',
  berjalan: false,
  ipk: '',
  semesterId: '',
  semesterEn: '',
}
const KOSONG_R = {
  judulId: '',
  judulEn: '',
  institusi: '',
  jurusanId: '',
  jurusanEn: '',
  mulai: '',
  selesai: '',
  berjalan: false,
  semester: '',
  nilai: '',
  deskripsiId: '',
  deskripsiEn: '',
}
const formP = reactive({ ...KOSONG_P })
const formR = reactive({ ...KOSONG_R })

async function muat(senyap = false) {
  galatMuat.value = ''
  try {
    daftar.value = await api('/api/admin/pendidikan', { loading: !senyap })
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}
onMounted(() => muat())

// Beranda publik dimuat ulang dari server saat dibuka berikutnya
const berubah = () => (beranda.data = null)

async function fokusKeForm() {
  await nextTick()
  kotakForm.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function tutup() {
  panel.value = null
  galat.value = ''
}

// ===== Pendidikan: formulir =====
function bukaPendidikan(id, sumber) {
  galat.value = ''
  pesan.value = ''
  Object.assign(formP, KOSONG_P, {
    institusi: sumber.institusi ?? '',
    jurusanId: sumber.jurusanId ?? '',
    jurusanEn: sumber.jurusanEn ?? '',
    mulaiTahun: sumber.mulaiTahun ?? '',
    selesaiTahun: sumber.selesaiTahun ?? '',
    berjalan: id !== 'baru' && sumber.selesaiTahun === null,
    ipk: sumber.ipk ?? '',
    semesterId: sumber.semesterId ?? '',
    semesterEn: sumber.semesterEn ?? '',
  })
  panel.value = { jenis: 'pendidikan', id }
  fokusKeForm()
}
const tambahPendidikan = () => bukaPendidikan('baru', {})
const ubahPendidikan = (p) => bukaPendidikan(p.id, p)

async function simpanPendidikan() {
  galat.value = ''
  pesan.value = ''
  if (!formP.berjalan && !formP.selesaiTahun) {
    galat.value = 'Isi tahun selesai, atau centang "Masih berjalan".'
    return
  }
  const badan = {
    institusi: formP.institusi,
    jurusanId: formP.jurusanId,
    jurusanEn: formP.jurusanEn,
    mulaiTahun: Number(formP.mulaiTahun),
    selesaiTahun: formP.berjalan ? null : Number(formP.selesaiTahun),
    ipk: formP.ipk,
    semesterId: formP.semesterId,
    semesterEn: formP.semesterEn,
  }
  menyimpan.value = true
  try {
    if (panel.value.id === 'baru') {
      await api('/api/admin/pendidikan', { method: 'POST', body: badan })
    } else {
      await api(`/api/admin/pendidikan/${panel.value.id}`, { method: 'PUT', body: badan })
    }
    berubah()
    await muat(true)
    panel.value = null
    pesan.value = 'Tersimpan.'
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

// ===== Prestasi: formulir =====
function bukaPrestasi(pendidikan, id, sumber) {
  galat.value = ''
  pesan.value = ''
  Object.assign(formR, KOSONG_R, {
    judulId: sumber.judulId ?? '',
    judulEn: sumber.judulEn ?? '',
    // Prestasi baru: isi awal diambil dari pendidikannya supaya tidak mengetik ulang
    institusi: sumber.institusi ?? pendidikan.institusi,
    jurusanId: sumber.jurusanId ?? pendidikan.jurusanId,
    jurusanEn: sumber.jurusanEn ?? pendidikan.jurusanEn,
    mulai: sumber.mulai ?? '',
    selesai: sumber.selesai ?? '',
    berjalan: id !== 'baru' && sumber.selesai === null,
    semester: sumber.semester ?? '',
    nilai: sumber.nilai ?? '',
    deskripsiId: sumber.deskripsiId ?? '',
    deskripsiEn: sumber.deskripsiEn ?? '',
  })
  panel.value = { jenis: 'prestasi', pendidikanId: pendidikan.id, id }
  fokusKeForm()
}
const tambahPrestasi = (p) => bukaPrestasi(p, 'baru', {})
const ubahPrestasi = (p, r) => bukaPrestasi(p, r.id, r)

async function simpanPrestasi() {
  galat.value = ''
  pesan.value = ''
  if (!formR.berjalan && !formR.selesai) {
    galat.value = 'Isi bulan selesai, atau centang "Masih berjalan".'
    return
  }
  const badan = {
    judulId: formR.judulId,
    judulEn: formR.judulEn,
    institusi: formR.institusi,
    jurusanId: formR.jurusanId,
    jurusanEn: formR.jurusanEn,
    mulai: formR.mulai,
    selesai: formR.berjalan ? null : formR.selesai,
    semester: formR.semester,
    nilai: formR.nilai,
    deskripsiId: formR.deskripsiId,
    deskripsiEn: formR.deskripsiEn,
  }
  menyimpan.value = true
  try {
    if (panel.value.id === 'baru') {
      await api(`/api/admin/pendidikan/${panel.value.pendidikanId}/prestasi`, { method: 'POST', body: badan })
    } else {
      await api(`/api/admin/prestasi/${panel.value.id}`, { method: 'PUT', body: badan })
    }
    berubah()
    await muat(true)
    panel.value = null
    pesan.value = 'Tersimpan.'
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

// ===== Hapus dan urutan =====
async function jalankan(kerja) {
  galat.value = ''
  pesan.value = ''
  bekerja.value = true
  try {
    await kerja()
    berubah()
  } catch (e) {
    galat.value = e.message
    await muat(true) // sinkronkan ulang dengan server
  } finally {
    bekerja.value = false
  }
}

function hapusPendidikan(p) {
  if (!window.confirm(`Hapus pendidikan "${p.institusi}"? Semua prestasi di dalamnya ikut terhapus.`)) return
  return jalankan(async () => {
    await api(`/api/admin/pendidikan/${p.id}`, { method: 'DELETE' })
    daftar.value = daftar.value.filter((d) => d.id !== p.id)
    if (panel.value && (panel.value.id === p.id || panel.value.pendidikanId === p.id)) panel.value = null
  })
}

function hapusPrestasi(r) {
  if (!window.confirm(`Hapus prestasi "${r.judulId}"?`)) return
  return jalankan(async () => {
    await api(`/api/admin/prestasi/${r.id}`, { method: 'DELETE' })
    if (panel.value?.jenis === 'prestasi' && panel.value.id === r.id) panel.value = null
    await muat(true)
  })
}

function geserPendidikan(i, arah) {
  const j = i + arah
  if (j < 0 || j >= daftar.value.length) return
  const ids = daftar.value.map((d) => d.id)
  ;[ids[i], ids[j]] = [ids[j], ids[i]]
  return jalankan(async () => {
    await api('/api/admin/pendidikan/urut', { method: 'POST', body: { ids }, loading: false })
    await muat(true)
  })
}

function geserPrestasi(p, i, arah) {
  const j = i + arah
  if (j < 0 || j >= p.prestasi.length) return
  const ids = p.prestasi.map((r) => r.id)
  ;[ids[i], ids[j]] = [ids[j], ids[i]]
  return jalankan(async () => {
    await api(`/api/admin/pendidikan/${p.id}/prestasi/urut`, { method: 'POST', body: { ids }, loading: false })
    await muat(true)
  })
}

const namaPendidikan = (id) => daftar.value.find((d) => d.id === id)?.institusi ?? ''
</script>

<template>
  <section>
    <h1>Pendidikan</h1>
    <p class="ket">
      Kartu di bagian "Pendidikan" pada Beranda, beserta badge Prestasi di dalamnya (membuka modal rincian).
    </p>

    <p v-if="galatMuat && !siap" class="galat">
      {{ galatMuat }} <button type="button" @click="muat()">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="atas">
        <span class="hitung">{{ daftar.length }} dari maksimal {{ BATAS_PENDIDIKAN }} pendidikan</span>
        <button
          type="button"
          class="tambah"
          :disabled="daftar.length >= BATAS_PENDIDIKAN || panel !== null"
          @click="tambahPendidikan"
        >
          <Plus :size="16" aria-hidden="true" /> Tambah
        </button>
      </div>

      <p v-if="pesan && panel === null" class="sukses" role="status">{{ pesan }}</p>
      <p v-if="galat && panel === null" class="galat" role="alert">{{ galat }}</p>

      <div v-if="panel" ref="kotakForm" class="panel">
        <form v-if="panel.jenis === 'pendidikan'" class="form" @submit.prevent="simpanPendidikan">
          <h2>{{ panel.id === 'baru' ? 'Tambah pendidikan' : 'Ubah pendidikan' }}</h2>

          <div class="ruas">
            <label for="institusi">Institusi</label>
            <input id="institusi" v-model="formP.institusi" type="text" maxlength="150" required />
          </div>

          <KolomDuaBahasa label="Jurusan" v-model:id="formP.jurusanId" v-model:en="formP.jurusanEn" :maks="150" />

          <div class="dua">
            <div class="ruas">
              <label for="mulaiTahun">Tahun mulai</label>
              <input id="mulaiTahun" v-model="formP.mulaiTahun" type="number" min="1990" max="2100" required />
            </div>
            <div class="ruas">
              <label for="selesaiTahun">Tahun selesai</label>
              <input
                id="selesaiTahun"
                v-model="formP.selesaiTahun"
                type="number"
                min="1990"
                max="2100"
                :disabled="formP.berjalan"
                :required="!formP.berjalan"
              />
              <label class="cek"><input v-model="formP.berjalan" type="checkbox" /> Masih berjalan</label>
            </div>
          </div>

          <div class="ruas">
            <label for="ipk">IPK (boleh kosong)</label>
            <input id="ipk" v-model="formP.ipk" type="text" maxlength="10" placeholder="3.80" />
          </div>

          <div class="dua">
            <div class="ruas">
              <label for="semId">Semester, Indonesia (boleh kosong)</label>
              <input id="semId" v-model="formP.semesterId" type="text" maxlength="100" />
            </div>
            <div class="ruas">
              <label for="semEn">Semester, English (boleh kosong)</label>
              <input id="semEn" v-model="formP.semesterEn" type="text" maxlength="100" />
            </div>
          </div>

          <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
          <div class="aksi-form">
            <button type="submit" class="simpan" :disabled="menyimpan">Simpan</button>
            <button type="button" class="batal" :disabled="menyimpan" @click="tutup">Tutup</button>
          </div>
        </form>

        <form v-else class="form" @submit.prevent="simpanPrestasi">
          <h2>
            {{ panel.id === 'baru' ? 'Tambah prestasi' : 'Ubah prestasi' }}
            <small>untuk {{ namaPendidikan(panel.pendidikanId) }}</small>
          </h2>

          <KolomDuaBahasa
            label="Judul (teks badge)"
            v-model:id="formR.judulId"
            v-model:en="formR.judulEn"
            :maks="150"
          />

          <div class="ruas">
            <label for="r-institusi">Institusi (isi kartu di modal)</label>
            <input id="r-institusi" v-model="formR.institusi" type="text" maxlength="150" required />
          </div>

          <KolomDuaBahasa label="Jurusan" v-model:id="formR.jurusanId" v-model:en="formR.jurusanEn" :maks="150" />

          <div class="dua">
            <div class="ruas">
              <label for="r-mulai">Bulan mulai</label>
              <input id="r-mulai" v-model="formR.mulai" type="month" placeholder="2024-01" required />
            </div>
            <div class="ruas">
              <label for="r-selesai">Bulan selesai</label>
              <input
                id="r-selesai"
                v-model="formR.selesai"
                type="month"
                placeholder="2024-06"
                :disabled="formR.berjalan"
                :required="!formR.berjalan"
              />
              <label class="cek"><input v-model="formR.berjalan" type="checkbox" /> Masih berjalan</label>
            </div>
          </div>

          <div class="dua">
            <div class="ruas">
              <label for="r-semester">Semester</label>
              <input id="r-semester" v-model="formR.semester" type="text" maxlength="50" required />
            </div>
            <div class="ruas">
              <label for="r-nilai">Nilai</label>
              <input id="r-nilai" v-model="formR.nilai" type="text" maxlength="20" placeholder="3.61" required />
            </div>
          </div>

          <KolomDuaBahasa
            label="Deskripsi"
            v-model:id="formR.deskripsiId"
            v-model:en="formR.deskripsiEn"
            :maks="1500"
            :baris="5"
          />

          <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
          <div class="aksi-form">
            <button type="submit" class="simpan" :disabled="menyimpan">Simpan</button>
            <button type="button" class="batal" :disabled="menyimpan" @click="tutup">Tutup</button>
          </div>
        </form>
      </div>

      <p v-if="!daftar.length" class="kosong">Belum ada pendidikan.</p>
      <ul class="daftar">
        <li v-for="(p, i) in daftar" :key="p.id" class="kartu">
          <div class="baris">
            <div class="teks">
              <strong>{{ p.institusi }}</strong>
              <span>{{ p.jurusanId }}</span>
              <span>
                {{ p.mulaiTahun }} - {{ p.selesaiTahun ?? 'sekarang' }}<template v-if="p.ipk"> - IPK {{ p.ipk }}</template>
              </span>
            </div>
            <div class="aksi">
              <button type="button" :disabled="bekerja || i === 0" aria-label="Naikkan" @click="geserPendidikan(i, -1)">
                <ChevronUp :size="16" aria-hidden="true" />
              </button>
              <button
                type="button"
                :disabled="bekerja || i === daftar.length - 1"
                aria-label="Turunkan"
                @click="geserPendidikan(i, 1)"
              >
                <ChevronDown :size="16" aria-hidden="true" />
              </button>
              <button type="button" :disabled="panel !== null" aria-label="Ubah" @click="ubahPendidikan(p)">
                <Pencil :size="16" aria-hidden="true" />
              </button>
              <button type="button" class="bahaya" :disabled="bekerja" aria-label="Hapus" @click="hapusPendidikan(p)">
                <Trash2 :size="16" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="sub">
            <div class="atas kecil">
              <span class="hitung">Prestasi ({{ p.prestasi.length }}/{{ BATAS_PRESTASI }})</span>
              <button
                type="button"
                class="tambah"
                :disabled="p.prestasi.length >= BATAS_PRESTASI || panel !== null"
                @click="tambahPrestasi(p)"
              >
                <Plus :size="16" aria-hidden="true" /> Prestasi
              </button>
            </div>
            <p v-if="!p.prestasi.length" class="kosong">Belum ada prestasi.</p>
            <ul class="daftar-sub">
              <li v-for="(r, k) in p.prestasi" :key="r.id" class="butir">
                <div class="teks">
                  <strong>{{ r.judulId }}</strong>
                  <span>{{ formatDurasi(r.mulai, r.selesai, 'id') }} - Nilai {{ r.nilai }}</span>
                </div>
                <div class="aksi">
                  <button type="button" :disabled="bekerja || k === 0" aria-label="Naikkan" @click="geserPrestasi(p, k, -1)">
                    <ChevronUp :size="16" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    :disabled="bekerja || k === p.prestasi.length - 1"
                    aria-label="Turunkan"
                    @click="geserPrestasi(p, k, 1)"
                  >
                    <ChevronDown :size="16" aria-hidden="true" />
                  </button>
                  <button type="button" :disabled="panel !== null" aria-label="Ubah" @click="ubahPrestasi(p, r)">
                    <Pencil :size="16" aria-hidden="true" />
                  </button>
                  <button type="button" class="bahaya" :disabled="bekerja" aria-label="Hapus" @click="hapusPrestasi(r)">
                    <Trash2 :size="16" aria-hidden="true" />
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px dan 768px. */
h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  color: #1f2d3d;
}
.ket {
  margin: 0 0 1.25rem;
  color: #6b7686;
}
.atas {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.atas.kecil {
  margin-bottom: 0.5rem;
}
.hitung {
  font-size: 0.85rem;
  color: #6b7686;
}
.tambah,
.simpan,
.batal {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
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
.tambah:disabled,
.simpan:disabled,
.batal:disabled {
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
.kosong {
  margin: 0.3rem 0;
  font-size: 0.85rem;
  color: #98a2b3;
}

.panel {
  max-width: 62rem;
  margin-bottom: 1.25rem;
  scroll-margin-top: 4.5rem;
}
.form {
  padding: 1rem;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 12px;
}
.form h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #1f2d3d;
}
.form h2 small {
  display: block;
  font-size: 0.8rem;
  font-weight: 400;
  color: #6b7686;
}
.ruas {
  min-width: 0;
  margin-bottom: 1rem;
}
.ruas > label {
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2d3d;
}
.ruas input[type='text'],
.ruas input[type='number'],
.ruas input[type='month'] {
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
.ruas input:focus {
  border-color: #4a90e2;
  outline: none;
}
.ruas input:disabled {
  background: #f1f4f9;
}
.cek {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #1f2d3d;
}
.dua {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 1rem;
}
.aksi-form {
  display: flex;
  gap: 0.5rem;
}

.daftar,
.daftar-sub {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  list-style: none;
}
.daftar {
  gap: 0.8rem;
  max-width: 62rem;
}
.daftar-sub {
  gap: 0.4rem;
}
.kartu {
  padding: 0.8rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 10px;
}
.baris,
.butir {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.sub {
  padding-top: 0.8rem;
  margin-top: 0.8rem;
  border-top: 1px solid #eef1f6;
}
.butir {
  padding: 0.5rem 0.6rem;
  background: #f7f9fc;
  border-radius: 8px;
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
.butir .aksi button {
  background: #e8edf5;
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
  .dua {
    grid-template-columns: 1fr 1fr;
  }
  .kartu {
    padding: 1rem 1.2rem;
  }
  .aksi button {
    width: 34px;
    height: 34px;
  }
}
</style>