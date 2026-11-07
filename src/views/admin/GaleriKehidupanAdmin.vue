<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Upload, X } from '@lucide/vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'

const PATH = '/api/admin/galeri-kehidupan/foto'
const PATH_LAGU = '/api/admin/halaman/galeri-kehidupan'
const BATAS_TAB = 40
const TAB = [
  { kode: 'cerita-hidup', nama: 'Cerita Hidup' },
  { kode: 'pmm-life', nama: 'Kisah PMM' },
]

const bentukKosong = () => ({
  tanggal: '',
  judulId: '',
  judulEn: '',
  deskripsiId: '',
  deskripsiEn: '',
})

const semua = ref([]) // semua foto, dua tab
const siap = ref(false)
const galatMuat = ref('')
const tab = ref(TAB[0].kode)
const tampilForm = ref(false)
const editId = ref(null) // null = data baru
const kategoriForm = ref(TAB[0].kode)
const form = ref(bentukKosong())
const galat = ref('')
const pesan = ref('')
const menyimpan = ref(false)
const galatGambar = ref('')
const sibukGambar = ref(false)

// Lagu latar (chip di header halaman publik)
const lagu = ref({ aktif: false, judul: '', artis: '', tautan: '' })
const galatLagu = ref('')
const pesanLagu = ref('')
const menyimpanLagu = ref(false)

const daftar = computed(() => semua.value.filter((x) => x.kategori === tab.value))
const aktif = computed(() => semua.value.find((x) => x.id === editId.value) ?? null)
const jumlah = (kode) => semua.value.filter((x) => x.kategori === kode).length

async function muat() {
  galatMuat.value = ''
  try {
    semua.value = await api(PATH)
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}

async function muatLagu() {
  try {
    const dok = await api(PATH_LAGU)
    const l = dok.konten?.lagu
    lagu.value = l
      ? { aktif: true, judul: l.judul, artis: l.artis, tautan: l.tautan }
      : { aktif: false, judul: '', artis: '', tautan: '' }
  } catch (e) {
    galatMuat.value = e.message
  }
}

onMounted(() => {
  muat()
  muatLagu()
})

async function simpanLagu() {
  galatLagu.value = ''
  pesanLagu.value = ''
  menyimpanLagu.value = true
  try {
    const l = lagu.value
    const body = {
      lagu: l.aktif
        ? { judul: l.judul.trim(), artis: l.artis.trim(), tautan: l.tautan.trim() }
        : null,
    }
    await api(PATH_LAGU, { method: 'PUT', body })
    pesanLagu.value = l.aktif ? 'Lagu tersimpan.' : 'Chip lagu disembunyikan.'
  } catch (e) {
    galatLagu.value = e.message
  } finally {
    menyimpanLagu.value = false
  }
}

function keForm() {
  nextTick(() =>
    document.getElementById('form-galeri')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  )
}

function pilihTab(kode) {
  tab.value = kode
  tutupForm()
}

function tambah() {
  editId.value = null
  kategoriForm.value = tab.value
  form.value = bentukKosong()
  galat.value = ''
  pesan.value = ''
  galatGambar.value = ''
  tampilForm.value = true
  keForm()
}

function ubah(r) {
  editId.value = r.id
  kategoriForm.value = r.kategori
  form.value = {
    tanggal: r.tanggal,
    judulId: r.judulId,
    judulEn: r.judulEn,
    deskripsiId: r.deskripsiId,
    deskripsiEn: r.deskripsiEn,
  }
  galat.value = ''
  pesan.value = ''
  galatGambar.value = ''
  tampilForm.value = true
  keForm()
}

function tutupForm() {
  tampilForm.value = false
  editId.value = null
}

async function simpan() {
  galat.value = ''
  pesan.value = ''
  menyimpan.value = true
  try {
    const isi = { ...form.value }
    if (editId.value === null) {
      const baru = await api(PATH, {
        method: 'POST',
        body: { kategori: kategoriForm.value, ...isi },
      })
      semua.value.push(baru)
      editId.value = baru.id // lanjut ke mode ubah supaya foto bisa diunggah
      pesan.value = 'Data dibuat. Foto bisa diunggah di bawah.'
    } else {
      const baru = await api(`${PATH}/${editId.value}`, { method: 'PUT', body: isi })
      const i = semua.value.findIndex((x) => x.id === baru.id)
      if (i >= 0) semua.value[i] = baru
      pesan.value = 'Tersimpan.'
    }
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

async function hapus(r) {
  if (!window.confirm(`Hapus "${r.judulId}" beserta fotonya?`)) return
  try {
    await api(`${PATH}/${r.id}`, { method: 'DELETE', pesan: 'Menghapus...' })
    semua.value = semua.value.filter((x) => x.id !== r.id)
    if (editId.value === r.id) tutupForm()
  } catch (e) {
    galatMuat.value = e.message
  }
}

// Urutan dikirim per tab dan harus memuat semua id tab itu
async function geser(indeks, arah) {
  const tujuan = indeks + arah
  const salinan = [...daftar.value]
  if (tujuan < 0 || tujuan >= salinan.length) return
  ;[salinan[indeks], salinan[tujuan]] = [salinan[tujuan], salinan[indeks]]
  semua.value = [...semua.value.filter((x) => x.kategori !== tab.value), ...salinan]
  try {
    await api(`${PATH}/urut`, {
      method: 'POST',
      body: { kategori: tab.value, ids: salinan.map((x) => x.id) },
      loading: false,
    })
  } catch (e) {
    galatMuat.value = e.message
    await muat()
  }
}

// ===== Foto =====
async function gambarDipilih(event) {
  const berkas = event.target.files?.[0]
  event.target.value = ''
  if (!berkas || !aktif.value) return
  galatGambar.value = ''
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(berkas.type)) {
    galatGambar.value = 'Berkas harus gambar JPEG, PNG, atau WebP.'
    return
  }
  if (berkas.size > 8 * 1024 * 1024) {
    galatGambar.value = 'Ukuran berkas maksimal 8 MB.'
    return
  }
  const data = new FormData()
  data.append('berkas', berkas)
  sibukGambar.value = true
  try {
    const baru = await api(`${PATH}/${aktif.value.id}/gambar`, {
      method: 'POST',
      body: data,
      pesan: 'Mengunggah foto...',
    })
    const i = semua.value.findIndex((x) => x.id === baru.id)
    if (i >= 0) semua.value[i] = baru
  } catch (e) {
    galatGambar.value = e.message
  } finally {
    sibukGambar.value = false
  }
}

async function hapusGambar() {
  if (!aktif.value || !window.confirm('Hapus foto ini? Data teksnya tetap ada.')) return
  galatGambar.value = ''
  try {
    await api(`${PATH}/${aktif.value.id}/gambar`, { method: 'DELETE', pesan: 'Menghapus foto...' })
    aktif.value.gambarUrl = null
    aktif.value.kecilUrl = null
  } catch (e) {
    galatGambar.value = e.message
  }
}
</script>

<template>
  <section>
    <h1>Galeri Kehidupan</h1>
    <p class="ket">
      Foto di halaman <code>/galeri-kehidupan</code>, dibagi dua tab. Judul dan deskripsi wajib ada
      dalam bahasa Indonesia dan Inggris. Foto yang belum diunggah tidak tampil di halaman publik.
    </p>

    <p v-if="galatMuat" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="kartu">
        <h2>Lagu latar</h2>
        <p class="bantuan">
          Chip lagu di header halaman publik. Tempel tautan YouTube atau Spotify (https). Kalau
          dimatikan, chip tidak tampil.
        </p>
        <label class="centang">
          <input v-model="lagu.aktif" type="checkbox" /> Tampilkan chip lagu
        </label>
        <template v-if="lagu.aktif">
          <div class="ruas">
            <label>Judul lagu</label>
            <input v-model="lagu.judul" type="text" maxlength="100" />
          </div>
          <div class="ruas">
            <label>Artis</label>
            <input v-model="lagu.artis" type="text" maxlength="100" />
          </div>
          <div class="ruas">
            <label>Tautan YouTube atau Spotify</label>
            <input v-model="lagu.tautan" type="text" maxlength="300" placeholder="https://..." />
          </div>
        </template>
        <p v-if="galatLagu" class="galat" role="alert">{{ galatLagu }}</p>
        <p v-if="pesanLagu" class="sukses" role="status">{{ pesanLagu }}</p>
        <button type="button" class="simpan" :disabled="menyimpanLagu" @click="simpanLagu">
          Simpan lagu
        </button>
      </div>

      <div class="tab-baris" role="tablist">
        <button
          v-for="t in TAB"
          :key="t.kode"
          type="button"
          role="tab"
          class="tab"
          :class="{ aktif: tab === t.kode }"
          :aria-selected="tab === t.kode"
          @click="pilihTab(t.kode)"
        >
          {{ t.nama }} ({{ jumlah(t.kode) }})
        </button>
      </div>

      <div class="atas">
        <span class="hitung">{{ daftar.length }} dari {{ BATAS_TAB }} foto di tab ini</span>
        <button type="button" class="utama" :disabled="daftar.length >= BATAS_TAB" @click="tambah">
          <Plus :size="16" aria-hidden="true" /> Tambah foto
        </button>
      </div>

      <p v-if="!daftar.length" class="kosong">Belum ada foto di tab ini.</p>

      <ul class="daftar">
        <li
          v-for="(r, i) in daftar"
          :key="r.id"
          class="item"
          :class="{ terpilih: r.id === editId && tampilForm }"
        >
          <div class="kiri-item">
            <img v-if="r.kecilUrl" :src="r.kecilUrl" :alt="r.judulId" class="mini" loading="lazy" />
            <span v-else class="mini tanpa">Belum ada foto</span>
            <div class="isi-item">
              <p class="judul-item">{{ r.judulId }}</p>
              <p class="sub-item">
                {{ r.tanggal }} · {{ r.kecilUrl ? 'ada foto' : 'belum ada foto' }}
              </p>
            </div>
          </div>
          <div class="aksi-item">
            <button
              type="button"
              class="ikon"
              aria-label="Naikkan"
              :disabled="i === 0"
              @click="geser(i, -1)"
            >
              <ArrowUp :size="16" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="ikon"
              aria-label="Turunkan"
              :disabled="i === daftar.length - 1"
              @click="geser(i, 1)"
            >
              <ArrowDown :size="16" aria-hidden="true" />
            </button>
            <button type="button" class="ikon" aria-label="Ubah" @click="ubah(r)">
              <Pencil :size="16" aria-hidden="true" />
            </button>
            <button type="button" class="ikon bahaya" aria-label="Hapus" @click="hapus(r)">
              <Trash2 :size="16" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>

      <div v-if="tampilForm" id="form-galeri" class="kartu">
        <div class="kepala-form">
          <h2>{{ editId === null ? 'Foto baru' : 'Ubah foto' }}</h2>
          <button type="button" class="ikon" aria-label="Tutup formulir" @click="tutupForm">
            <X :size="18" aria-hidden="true" />
          </button>
        </div>

        <form @submit.prevent="simpan">
          <div class="ruas">
            <label>Tab</label>
            <input :value="TAB.find((t) => t.kode === kategoriForm)?.nama" type="text" disabled />
          </div>
          <div class="ruas">
            <label>Tanggal</label>
            <input v-model="form.tanggal" type="date" required />
          </div>
          <KolomDuaBahasa
            label="Judul"
            v-model:id="form.judulId"
            v-model:en="form.judulEn"
            :maks="150"
          />
          <KolomDuaBahasa
            label="Deskripsi"
            v-model:id="form.deskripsiId"
            v-model:en="form.deskripsiEn"
            :maks="3000"
            :baris="4"
          />

          <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
          <p v-if="pesan" class="sukses" role="status">{{ pesan }}</p>
          <button type="submit" class="simpan" :disabled="menyimpan">
            {{ editId === null ? 'Buat data' : 'Simpan perubahan' }}
          </button>
        </form>

        <div v-if="aktif" class="foto">
          <h3>Foto</h3>
          <p class="bantuan">
            JPEG, PNG, atau WebP, maksimal 8 MB. Server membuat dua ukuran sekaligus (penuh dan
            kecil untuk grid).
          </p>
          <img
            v-if="aktif.gambarUrl"
            :src="aktif.gambarUrl"
            :alt="aktif.judulId"
            class="pratinjau"
          />
          <p v-else class="kosong">Belum ada foto.</p>
          <div class="aksi-foto">
            <label class="unggah" :class="{ mati: sibukGambar }">
              <Upload :size="16" aria-hidden="true" />
              {{ aktif.gambarUrl ? 'Ganti foto' : 'Pilih berkas' }}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                :disabled="sibukGambar"
                @change="gambarDipilih"
              />
            </label>
            <button v-if="aktif.gambarUrl" type="button" class="kecil abu" @click="hapusGambar">
              Hapus foto
            </button>
          </div>
          <p v-if="galatGambar" class="galat" role="alert">{{ galatGambar }}</p>
        </div>
        <p v-else class="bantuan">Foto bisa diunggah setelah data dibuat.</p>
      </div>
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
h2 {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
  color: #1f2d3d;
}
h3 {
  margin: 1.5rem 0 0.5rem;
  font-size: 1rem;
  color: #1f2d3d;
}
.ket {
  margin: 0 0 1.25rem;
  color: #6b7686;
}
.bantuan {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  color: #6b7686;
}
.kosong {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: #98a2b3;
}
.tab-baris {
  display: flex;
  gap: 0.4rem;
  max-width: 62rem;
  margin-bottom: 1rem;
}
.tab {
  flex: 1;
  padding: 0.6rem 0.8rem;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2d3d;
  cursor: pointer;
  background: #eef1f6;
  border: 1px solid #e3e7ee;
  border-radius: 8px;
}
.tab.aktif {
  color: #fff;
  background: #2e87f6;
  border-color: #2e87f6;
}
.atas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  max-width: 62rem;
  margin-bottom: 1rem;
}
.hitung {
  font-size: 0.85rem;
  color: #6b7686;
}
.utama {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.55rem 0.9rem;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  background: #2e87f6;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.utama:disabled {
  opacity: 0.55;
  cursor: default;
}
.daftar {
  max-width: 62rem;
  padding: 0;
  margin: 0 0 1.25rem;
  list-style: none;
}
.item {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.9rem 1rem;
  margin-bottom: 0.6rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
}
.item.terpilih {
  border-color: #2e87f6;
}
.kiri-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  min-width: 0;
}
.mini {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  object-fit: cover;
  background: #e8ecf2;
  border-radius: 8px;
}
.mini.tanpa {
  display: grid;
  place-items: center;
  padding: 0.25rem;
  font-size: 0.65rem;
  color: #98a2b3;
  text-align: center;
}
.isi-item {
  min-width: 0;
}
.judul-item {
  margin: 0;
  font-weight: 600;
  color: #1f2d3d;
}
.sub-item {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: #6b7686;
}
.aksi-item {
  display: flex;
  gap: 0.4rem;
}
.ikon {
  display: grid;
  place-items: center;
  padding: 0.4rem;
  color: #1f2d3d;
  background: #eef1f6;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.ikon:disabled {
  opacity: 0.4;
  cursor: default;
}
.ikon.bahaya {
  color: #d63b3b;
}
.kartu {
  max-width: 62rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
}
.kepala-form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.centang {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2d3d;
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
.ruas input:disabled {
  color: #6b7686;
  background: #f1f3f7;
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
.foto {
  padding-top: 0.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid #e3e7ee;
}
.pratinjau {
  display: block;
  width: 100%;
  max-width: 28rem;
  max-height: 22rem;
  margin-bottom: 0.75rem;
  object-fit: contain;
  background: #e8ecf2;
  border-radius: 10px;
}
.aksi-foto {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.kecil {
  padding: 0.5rem 0.9rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: #2e87f6;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.kecil.abu {
  color: #d63b3b;
  background: #eef1f6;
}
.unggah {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: #2e87f6;
  border-radius: 8px;
  cursor: pointer;
}
.unggah input {
  display: none;
}
.unggah.mati {
  opacity: 0.55;
  cursor: default;
}

@media (min-width: 641px) {
  .kartu {
    padding: 1.5rem;
  }
  .item {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
