<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from '@lucide/vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import UnggahBerkas from '../../components/admin/UnggahBerkas.vue'

const KUNCI = ['penghargaan', 'cuplikan', 'putar']
const SEKSI = {
  penghargaan: {
    judul: 'Penghargaan',
    path: '/api/admin/biodata/penghargaan',
    batas: 12,
    nama: 'penghargaan',
    label: 'judulId',
  },
  cuplikan: {
    judul: 'Potret Kehidupan',
    path: '/api/admin/biodata/cuplikan',
    batas: 12,
    nama: 'potret',
    label: 'keteranganId',
  },
  putar: {
    judul: 'Galeri Sekilas (foto berputar)',
    path: '/api/admin/biodata/foto-putar',
    batas: 20,
    nama: 'foto',
    label: 'keteranganId',
  },
}
const KOSONG = {
  penghargaan: { judulId: '', judulEn: '', deskripsiId: '', deskripsiEn: '' },
  cuplikan: { keteranganId: '', keteranganEn: '' },
  putar: { keteranganId: '', keteranganEn: '' },
}
const form = {
  penghargaan: reactive({ ...KOSONG.penghargaan }),
  cuplikan: reactive({ ...KOSONG.cuplikan }),
  putar: reactive({ ...KOSONG.putar }),
}
const daftar = reactive({ penghargaan: [], cuplikan: [], putar: [] })
const sampulUrl = ref(null)

// null | { jenis, id: 'baru' | number }
const panel = ref(null)
const gambarPanel = ref(null)
const galat = ref('')
const pesan = ref('')
const menyimpan = ref(false)
const bekerja = ref(false)
const siap = ref(false)
const galatMuat = ref('')

async function muat() {
  galatMuat.value = ''
  try {
    sampulUrl.value = (await api('/api/admin/biodata/sampul')).sampulUrl ?? null
    for (const k of KUNCI) daftar[k] = await api(SEKSI[k].path)
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}
onMounted(muat)

async function muatDaftar(jenis) {
  daftar[jenis] = await api(SEKSI[jenis].path, { loading: false })
}

async function fokusKeForm() {
  await nextTick()
  document.getElementById('panel-galeri')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function buka(jenis, id, sumber) {
  galat.value = ''
  pesan.value = ''
  const isi = { ...KOSONG[jenis] }
  for (const k of Object.keys(isi)) isi[k] = sumber[k] ?? isi[k]
  Object.assign(form[jenis], isi)
  gambarPanel.value = sumber.gambarUrl ?? null
  panel.value = { jenis, id }
  fokusKeForm()
}
const tambah = (jenis) => buka(jenis, 'baru', {})
const ubah = (jenis, item) => buka(jenis, item.id, item)

function tutup() {
  panel.value = null
  galat.value = ''
  pesan.value = ''
}

async function simpan() {
  galat.value = ''
  pesan.value = ''
  const { jenis, id } = panel.value
  const path = SEKSI[jenis].path
  menyimpan.value = true
  try {
    if (id === 'baru') {
      const baru = await api(path, { method: 'POST', body: { ...form[jenis] } })
      await muatDaftar(jenis)
      // Pindah ke mode ubah supaya gambarnya bisa langsung diunggah
      panel.value = { jenis, id: baru.id }
      gambarPanel.value = baru.gambarUrl ?? null
      pesan.value = 'Tersimpan. Sekarang kamu bisa mengunggah gambarnya di bawah.'
    } else {
      await api(`${path}/${id}`, { method: 'PUT', body: { ...form[jenis] } })
      await muatDaftar(jenis)
      panel.value = null
      pesan.value = 'Tersimpan.'
    }
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

async function gambarBerubah(url) {
  gambarPanel.value = url
  await muatDaftar(panel.value.jenis)
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
  const nama = item[SEKSI[jenis].label]
  if (!window.confirm(`Hapus "${nama}"? Gambarnya ikut terhapus.`)) return
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
</script>

<template>
  <section>
    <h1>Galeri Biodata</h1>
    <p class="ket">Gambar untuk halaman Biodata: sampul, Penghargaan, Potret Kehidupan, dan Galeri Sekilas.</p>

    <p v-if="galatMuat && !siap" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <!-- ===== Sampul ===== -->
      <div class="seksi">
        <h2>Sampul Penghargaan</h2>
        <div class="kotak">
          <UnggahBerkas
            label="Gambar sampul"
            accept="image/jpeg,image/png,image/webp"
            :maks-mb="8"
            :url="sampulUrl"
            endpoint="/api/admin/biodata/sampul"
            bantuan="JPEG, PNG, atau WebP, maksimal 8 MB. Sampul bagian Penghargaan di halaman Biodata."
            @berubah="(url) => (sampulUrl = url)"
          />
        </div>
      </div>

      <p v-if="pesan && panel === null" class="sukses" role="status">{{ pesan }}</p>
      <p v-if="galat && panel === null" class="galat" role="alert">{{ galat }}</p>

      <!-- ===== Tiga daftar bergambar ===== -->
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

        <div v-if="panel && panel.jenis === kunci" id="panel-galeri" class="panel">
          <form class="form" @submit.prevent="simpan">
            <h3>{{ panel.id === 'baru' ? 'Tambah' : 'Ubah' }} {{ SEKSI[kunci].nama }}</h3>

            <template v-if="kunci === 'penghargaan'">
              <KolomDuaBahasa
                label="Judul"
                v-model:id="form.penghargaan.judulId"
                v-model:en="form.penghargaan.judulEn"
                :maks="150"
              />
              <KolomDuaBahasa
                label="Deskripsi"
                v-model:id="form.penghargaan.deskripsiId"
                v-model:en="form.penghargaan.deskripsiEn"
                :maks="1000"
                :baris="3"
              />
            </template>
            <KolomDuaBahasa
              v-else
              label="Keterangan"
              v-model:id="form[kunci].keteranganId"
              v-model:en="form[kunci].keteranganEn"
              :maks="200"
            />

            <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
            <p v-if="pesan" class="sukses" role="status">{{ pesan }}</p>
            <div class="aksi-form">
              <button type="submit" class="simpan" :disabled="menyimpan">Simpan</button>
              <button type="button" class="batal" :disabled="menyimpan" @click="tutup">Tutup</button>
            </div>
          </form>

          <div class="kotak">
            <UnggahBerkas
              v-if="typeof panel.id === 'number'"
              label="Gambar"
              accept="image/jpeg,image/png,image/webp"
              :maks-mb="8"
              :url="gambarPanel"
              :endpoint="`${SEKSI[kunci].path}/${panel.id}/gambar`"
              bantuan="JPEG, PNG, atau WebP, maksimal 8 MB."
              @berubah="gambarBerubah"
            />
            <p v-else class="catatan">Simpan dulu, lalu bagian unggah gambar akan muncul di sini.</p>
          </div>
        </div>

        <p v-if="!daftar[kunci].length" class="kosong">Belum ada data.</p>
        <ul class="daftar">
          <li v-for="(item, i) in daftar[kunci]" :key="item.id" class="butir">
            <div class="thumb">
              <img v-if="item.gambarUrl" :src="item.gambarUrl" alt="" loading="lazy" />
              <span v-else>Kosong</span>
            </div>
            <div class="teks">
              <strong>{{ item[SEKSI[kunci].label] }}</strong>
              <span>{{ item.gambarUrl ? 'Gambar terpasang' : 'Belum ada gambar' }}</span>
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
.seksi {
  max-width: 62rem;
  margin-bottom: 1.75rem;
}
.seksi > h2 {
  margin-bottom: 0.6rem;
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
.form,
.kotak {
  padding: 1rem;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 12px;
}
.panel .kotak {
  margin-top: 0.75rem;
}
.catatan {
  margin: 0;
  font-size: 0.85rem;
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
  padding: 0.6rem 0.8rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 10px;
}
.thumb {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  font-size: 0.65rem;
  color: #98a2b3;
  background: #f1f4f9;
  border-radius: 6px;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  .form,
  .kotak {
    padding: 1.5rem;
  }
  .aksi button {
    width: 34px;
    height: 34px;
  }
}
</style>