<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { Pencil, Plus, Trash2 } from '@lucide/vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import UnggahBerkas from '../../components/admin/UnggahBerkas.vue'
import { useBerandaStore } from '../../stores/beranda'
import { formatDurasi } from '../../utils/durasi'

const BATAS = 60
const beranda = useBerandaStore()

const daftar = ref([])
const siap = ref(false)
const galatMuat = ref('')
const galat = ref('')
const pesan = ref('')
const mode = ref(null) // null | 'baru' | id project yang sedang diubah
const gambarUrl = ref(null)
const menyimpan = ref(false)
const bekerja = ref(false)
const kotakForm = ref(null)

const KOSONG = {
  judul: '',
  deskripsiId: '',
  deskripsiEn: '',
  mulai: '',
  selesai: '',
  berjalan: false,
  demoPath: '/',
  sourceUrl: '',
}
const form = reactive({ ...KOSONG })

async function muat(senyap = false) {
  galatMuat.value = ''
  try {
    daftar.value = await api('/api/admin/project', { loading: !senyap })
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}
onMounted(() => muat())

// Beranda publik dimuat ulang dari server saat dibuka berikutnya
const berubah = () => (beranda.data = null)

async function bukaForm(nilaiMode, sumber) {
  galat.value = ''
  pesan.value = ''
  Object.assign(form, KOSONG, {
    judul: sumber.judul ?? '',
    deskripsiId: sumber.deskripsiId ?? '',
    deskripsiEn: sumber.deskripsiEn ?? '',
    mulai: sumber.mulai ?? '',
    selesai: sumber.selesai ?? '',
    berjalan: nilaiMode !== 'baru' && sumber.selesai === null,
    demoPath: sumber.demoPath ?? '/',
    sourceUrl: sumber.sourceUrl ?? '',
  })
  gambarUrl.value = sumber.gambarUrl ?? null
  mode.value = nilaiMode
  await nextTick()
  kotakForm.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
const tambah = () => bukaForm('baru', {})
const ubah = (p) => bukaForm(p.id, p)
function tutup() {
  mode.value = null
  galat.value = ''
}

async function simpan() {
  galat.value = ''
  pesan.value = ''
  if (!form.berjalan && !form.selesai) {
    galat.value = 'Isi bulan selesai, atau centang "Masih berjalan".'
    return
  }
  const badan = {
    judul: form.judul,
    deskripsiId: form.deskripsiId,
    deskripsiEn: form.deskripsiEn,
    mulai: form.mulai,
    selesai: form.berjalan ? null : form.selesai,
    demoPath: form.demoPath,
    sourceUrl: form.sourceUrl,
  }
  menyimpan.value = true
  try {
    if (mode.value === 'baru') {
      const baru = await api('/api/admin/project', { method: 'POST', body: badan })
      mode.value = baru.id // pindah ke mode ubah supaya gambar bisa diunggah
      gambarUrl.value = baru.gambarUrl
      pesan.value = 'Project dibuat. Sekarang kamu bisa mengunggah gambarnya di bawah.'
    } else {
      await api(`/api/admin/project/${mode.value}`, { method: 'PUT', body: badan })
      pesan.value = 'Tersimpan.'
    }
    berubah()
    await muat(true)
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

async function hapus(p) {
  if (!window.confirm(`Hapus project "${p.judul}"? Gambarnya ikut terhapus.`)) return
  galat.value = ''
  pesan.value = ''
  bekerja.value = true
  try {
    await api(`/api/admin/project/${p.id}`, { method: 'DELETE' })
    daftar.value = daftar.value.filter((d) => d.id !== p.id)
    if (mode.value === p.id) mode.value = null
    berubah()
  } catch (e) {
    galat.value = e.message
  } finally {
    bekerja.value = false
  }
}

async function gambarBerubah(url) {
  gambarUrl.value = url
  berubah()
  await muat(true)
}

const inisial = (judul) => judul.trim().slice(0, 1).toUpperCase()
</script>

<template>
  <section>
    <h1>Project</h1>
    <p class="ket">Kartu di bagian "Project Terbaru" pada Beranda. Urutan tampil ditentukan oleh bulan mulai.</p>

    <p v-if="galatMuat && !siap" class="galat">
      {{ galatMuat }} <button type="button" @click="muat()">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="atas">
        <span class="hitung">{{ daftar.length }} dari maksimal {{ BATAS }} project</span>
        <button type="button" class="tambah" :disabled="daftar.length >= BATAS || mode !== null" @click="tambah">
          <Plus :size="16" aria-hidden="true" /> Tambah
        </button>
      </div>

      <p v-if="pesan && mode === null" class="sukses" role="status">{{ pesan }}</p>
      <p v-if="galat && mode === null" class="galat" role="alert">{{ galat }}</p>

      <div v-if="mode !== null" ref="kotakForm" class="panel">
        <form class="form" @submit.prevent="simpan">
          <h2>{{ mode === 'baru' ? 'Tambah project' : 'Ubah project' }}</h2>

          <div class="ruas">
            <label for="judul">Judul</label>
            <input id="judul" v-model="form.judul" type="text" maxlength="100" required />
          </div>

          <KolomDuaBahasa
            label="Deskripsi"
            v-model:id="form.deskripsiId"
            v-model:en="form.deskripsiEn"
            :maks="1500"
            :baris="5"
          />

          <div class="dua">
            <div class="ruas">
              <label for="mulai">Bulan mulai</label>
              <input
                id="mulai"
                v-model="form.mulai"
                type="month"
                placeholder="2025-10"
                pattern="\d{4}-(0[1-9]|1[0-2])"
                required
              />
            </div>
            <div class="ruas">
              <label for="selesai">Bulan selesai</label>
              <input
                id="selesai"
                v-model="form.selesai"
                type="month"
                placeholder="2025-12"
                pattern="\d{4}-(0[1-9]|1[0-2])"
                :disabled="form.berjalan"
                :required="!form.berjalan"
              />
              <label class="cek"><input v-model="form.berjalan" type="checkbox" /> Masih berjalan (tampil "sekarang")</label>
            </div>
          </div>

          <div class="ruas">
            <label for="demo">Alamat halaman demo</label>
            <input id="demo" v-model="form.demoPath" type="text" maxlength="100" required />
            <p class="bantuan">Halaman di situs ini yang dibuka tombol "Lihat Demo", contoh <code>/locana</code>.</p>
          </div>

          <div class="ruas">
            <label for="source">Tautan source code (boleh kosong)</label>
            <input id="source" v-model="form.sourceUrl" type="text" maxlength="500" placeholder="https://github.com/..." />
            <p class="bantuan">
              Rahasia: tidak pernah dikirim ke pengunjung. Hanya keluar setelah pengunjung memasukkan kode akses. Kosong =
              tombol Source Code tidak tampil.
            </p>
          </div>

          <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
          <p v-if="pesan" class="sukses" role="status">{{ pesan }}</p>
          <div class="aksi-form">
            <button type="submit" class="simpan" :disabled="menyimpan">Simpan</button>
            <button type="button" class="batal" :disabled="menyimpan" @click="tutup">Tutup</button>
          </div>
        </form>

        <div class="gambar">
          <UnggahBerkas
            v-if="typeof mode === 'number'"
            label="Gambar project"
            accept="image/jpeg,image/png,image/webp"
            :maks-mb="8"
            :url="gambarUrl"
            :endpoint="`/api/admin/project/${mode}/gambar`"
            bantuan="JPEG, PNG, atau WebP, maksimal 8 MB. Tampil di bagian atas kartu project."
            @berubah="gambarBerubah"
          />
          <p v-else class="catatan">Simpan project dulu, lalu bagian unggah gambar akan muncul di sini.</p>
        </div>
      </div>

      <p v-if="!daftar.length" class="kosong">Belum ada project.</p>
      <ul class="daftar">
        <li v-for="p in daftar" :key="p.id" class="butir" :class="{ sedang: mode === p.id }">
          <div class="mini">
            <img v-if="p.gambarUrl" :src="p.gambarUrl" alt="" loading="lazy" />
            <span v-else aria-hidden="true">{{ inisial(p.judul) }}</span>
          </div>
          <div class="teks">
            <strong>{{ p.judul }}</strong>
            <span>{{ formatDurasi(p.mulai, p.selesai, 'id') }}</span>
            <span class="demo">{{ p.demoPath }}{{ p.sourceUrl ? '' : ' - tanpa source code' }}</span>
          </div>
          <div class="aksi">
            <button type="button" aria-label="Ubah" @click="ubah(p)"><Pencil :size="16" aria-hidden="true" /></button>
            <button type="button" class="bahaya" :disabled="bekerja" aria-label="Hapus" @click="hapus(p)">
              <Trash2 :size="16" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px dan 1024px. */
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
  color: #98a2b3;
}

.panel {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 62rem;
  margin-bottom: 1.25rem;
  scroll-margin-top: 4.5rem;
}
.form,
.gambar {
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
.bantuan {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  color: #6b7686;
}
.catatan {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7686;
}
.aksi-form {
  display: flex;
  gap: 0.5rem;
}

.daftar {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 62rem;
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
.butir.sedang {
  border-color: #2e87f6;
  box-shadow: 0 0 0 2px rgba(46, 135, 246, 0.15);
}
.mini {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 3.2rem;
  height: 3.2rem;
  overflow: hidden;
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #4a90e2, #50e3c2);
  border-radius: 8px;
}
.mini img {
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
  background: #e1e8f2;
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
  .gambar {
    padding: 1.5rem;
  }
  .dua {
    grid-template-columns: 1fr 1fr;
  }
  .butir {
    padding: 0.8rem 1rem;
  }
  .aksi button {
    width: 34px;
    height: 34px;
  }
}

@media (min-width: 1024px) {
  .panel {
    grid-template-columns: 1fr 17rem;
    align-items: start;
  }
}
</style>