<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Upload, X } from '@lucide/vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import DaftarEditor from '../../components/admin/DaftarEditor.vue'
import UnggahBerkas from '../../components/admin/UnggahBerkas.vue'
import { DAFTAR_IKON_TOOL } from '../../utils/ikon'

const PATH_DOK = '/api/admin/halaman/portofolio'
const PATH_KEC = '/api/admin/halaman/portofolio/gambar/kecepatan'
const PATH = '/api/admin/proyek/portofolio/fitur'
const BATAS = 12

// ===== Isi halaman (dokumen) =====
const konten = ref(null)
const gambarKec = ref(null) // alamat gambar laporan kecepatan
const siapDok = ref(false)
const galatMuatDok = ref('')
const galatDok = ref('')
const pesanDok = ref('')
const menyimpanDok = ref(false)

const alatBaru = () => ({ nama: '', ikon: 'code-outline', level: 50 })

// Di formulir, tautan kosong berupa teks kosong; ke server dikirim sebagai null
function bentukForm(k) {
  return { ...k, kecepatan: { ...k.kecepatan, tautan: k.kecepatan?.tautan ?? '' } }
}

async function muatDok() {
  galatMuatDok.value = ''
  try {
    const d = await api(PATH_DOK)
    if (!d.konten) {
      galatMuatDok.value = 'Isi halaman belum ada di database.'
      return
    }
    konten.value = bentukForm(d.konten)
    gambarKec.value = d.gambar?.kecepatan ?? null
    siapDok.value = true
  } catch (e) {
    galatMuatDok.value = e.message
  }
}

async function simpanDok() {
  galatDok.value = ''
  pesanDok.value = ''
  menyimpanDok.value = true
  try {
    const k = konten.value
    const body = {
      kepala: k.kepala,
      kecepatan: {
        deskripsi: k.kecepatan.deskripsi,
        tombol: k.kecepatan.tombol,
        tautan: k.kecepatan.tautan.trim() || null,
      },
      alat: k.alat.map((a) => ({ nama: a.nama, ikon: a.ikon, level: Number(a.level) })),
    }
    const d = await api(PATH_DOK, { method: 'PUT', body })
    konten.value = bentukForm(d.konten)
    pesanDok.value = 'Tersimpan.'
  } catch (e) {
    galatDok.value = e.message
  } finally {
    menyimpanDok.value = false
  }
}

// ===== Foto galeri (tabel + foto) =====
const bentukKosong = () => ({ judulId: '', judulEn: '', deskripsiId: '', deskripsiEn: '' })

const fitur = ref([])
const siap = ref(false)
const galatMuat = ref('')
const tampilForm = ref(false)
const editId = ref(null) // null = data baru
const form = ref(bentukKosong())
const galat = ref('')
const pesan = ref('')
const menyimpan = ref(false)
const galatGambar = ref('')
const sibukGambar = ref(false)

const aktif = computed(() => fitur.value.find((x) => x.id === editId.value) ?? null)

async function muat() {
  galatMuat.value = ''
  try {
    fitur.value = await api(PATH)
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}

onMounted(() => {
  muatDok()
  muat()
})

function keFormulir() {
  nextTick(() =>
    document.getElementById('form-foto')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  )
}

function tambah() {
  editId.value = null
  form.value = bentukKosong()
  galat.value = ''
  pesan.value = ''
  galatGambar.value = ''
  tampilForm.value = true
  keFormulir()
}

function ubah(r) {
  editId.value = r.id
  form.value = {
    judulId: r.judulId,
    judulEn: r.judulEn,
    deskripsiId: r.deskripsiId,
    deskripsiEn: r.deskripsiEn,
  }
  galat.value = ''
  pesan.value = ''
  galatGambar.value = ''
  tampilForm.value = true
  keFormulir()
}

function tutupForm() {
  tampilForm.value = false
  editId.value = null
}

// Backend mewajibkan ringkasan; di halaman ini ringkasan = judul, butir dikosongkan
function isiKirim() {
  const f = form.value
  return {
    judulId: f.judulId,
    judulEn: f.judulEn,
    ringkasId: f.judulId,
    ringkasEn: f.judulEn,
    deskripsiId: f.deskripsiId,
    deskripsiEn: f.deskripsiEn,
    butirId: '',
    butirEn: '',
  }
}

async function simpan() {
  galat.value = ''
  pesan.value = ''
  menyimpan.value = true
  try {
    if (editId.value === null) {
      const baru = await api(PATH, { method: 'POST', body: isiKirim() })
      fitur.value.push(baru)
      editId.value = baru.id // lanjut ke mode ubah supaya foto bisa diunggah
      pesan.value = 'Data dibuat. Foto bisa diunggah di bawah.'
    } else {
      const baru = await api(`${PATH}/${editId.value}`, { method: 'PUT', body: isiKirim() })
      const i = fitur.value.findIndex((x) => x.id === baru.id)
      if (i >= 0) fitur.value[i] = baru
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
    fitur.value = fitur.value.filter((x) => x.id !== r.id)
    if (editId.value === r.id) tutupForm()
  } catch (e) {
    galatMuat.value = e.message
  }
}

// Urutan dikirim sebagai daftar id dan harus memuat semua foto
async function geser(indeks, arah) {
  const tujuan = indeks + arah
  const salinan = [...fitur.value]
  if (tujuan < 0 || tujuan >= salinan.length) return
  ;[salinan[indeks], salinan[tujuan]] = [salinan[tujuan], salinan[indeks]]
  fitur.value = salinan
  try {
    await api(`${PATH}/urut`, {
      method: 'POST',
      body: { ids: salinan.map((x) => x.id) },
      loading: false,
    })
  } catch (e) {
    galatMuat.value = e.message
    await muat()
  }
}

// ===== Berkas foto =====
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
    const i = fitur.value.findIndex((x) => x.id === baru.id)
    if (i >= 0) fitur.value[i] = baru
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
    <h1>Portofolio</h1>
    <p class="ket">
      Isi halaman <code>/portofolio</code>: header, galeri tampilan UI/UX, laporan kecepatan web,
      dan alat pengembangan. Semua teks wajib ada dalam bahasa Indonesia dan Inggris.
    </p>

    <!-- ===== Isi halaman ===== -->
    <p v-if="galatMuatDok && !siapDok" class="galat">
      {{ galatMuatDok }} <button type="button" @click="muatDok">Coba lagi</button>
    </p>

    <form v-if="siapDok" @submit.prevent="simpanDok">
      <div class="kartu">
        <h2>Header halaman</h2>
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
          :maks="200"
          :baris="2"
        />
      </div>

      <div class="kartu">
        <h2>Alat pengembangan</h2>
        <DaftarEditor
          v-model="konten.alat"
          label="Alat"
          nama-item="Alat"
          :buat="alatBaru"
          :min="1"
          :maks="12"
        >
          <template #default="{ item }">
            <div class="dua-kolom">
              <div class="ruas">
                <label>Nama</label>
                <input v-model="item.nama" type="text" maxlength="60" required />
              </div>
              <div class="ruas">
                <label>Ikon</label>
                <select v-model="item.ikon">
                  <option v-for="nama in DAFTAR_IKON_TOOL" :key="nama" :value="nama">
                    {{ nama }}
                  </option>
                </select>
              </div>
            </div>
            <div class="ruas">
              <label>Tingkat kemahiran (0 sampai 100)</label>
              <input v-model.number="item.level" type="number" min="0" max="100" required />
            </div>
          </template>
        </DaftarEditor>
      </div>

      <div class="kartu">
        <h2>Kecepatan web</h2>
        <KolomDuaBahasa
          label="Deskripsi"
          v-model:id="konten.kecepatan.deskripsi.id"
          v-model:en="konten.kecepatan.deskripsi.en"
          :maks="300"
          :baris="2"
        />
        <KolomDuaBahasa
          label="Teks tombol laporan"
          v-model:id="konten.kecepatan.tombol.id"
          v-model:en="konten.kecepatan.tombol.en"
          :maks="100"
        />
        <div class="ruas">
          <label>Tautan laporan lengkap</label>
          <input
            v-model="konten.kecepatan.tautan"
            type="text"
            maxlength="500"
            placeholder="https://..."
          />
        </div>
        <p class="bantuan">
          Tautan harus diawali http:// atau https://. Kalau dikosongkan, tombolnya tidak tampil di
          halaman publik.
        </p>

        <p v-if="galatDok" class="galat" role="alert">{{ galatDok }}</p>
        <p v-if="pesanDok" class="sukses" role="status">{{ pesanDok }}</p>
        <button type="submit" class="simpan" :disabled="menyimpanDok">Simpan isi halaman</button>
      </div>
    </form>

    <div v-if="siapDok" class="kartu">
      <UnggahBerkas
        label="Gambar laporan kecepatan"
        accept="image/jpeg,image/png,image/webp"
        :maks-mb="8"
        :url="gambarKec"
        :endpoint="PATH_KEC"
        bantuan="Tangkapan layar hasil uji kecepatan. Disimpan langsung, tidak perlu menekan Simpan isi halaman."
        @berubah="(u) => (gambarKec = u)"
      />
    </div>

    <!-- ===== Foto galeri ===== -->
    <h2 class="judul-bagian">Galeri tampilan UI/UX</h2>
    <p class="ket">
      Foto yang tampil sebagai kartu. Data yang belum diunggah fotonya tidak tampil di halaman
      publik.
    </p>

    <p v-if="galatMuat" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="atas">
        <span class="hitung">{{ fitur.length }} dari {{ BATAS }} foto</span>
        <button type="button" class="utama" :disabled="fitur.length >= BATAS" @click="tambah">
          <Plus :size="16" aria-hidden="true" /> Tambah foto
        </button>
      </div>

      <p v-if="!fitur.length" class="kosong">Belum ada foto.</p>

      <ul class="daftar">
        <li
          v-for="(r, i) in fitur"
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
                {{ r.kecilUrl ? 'Ada foto' : 'Belum ada foto (tidak tampil di publik)' }}
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
              :disabled="i === fitur.length - 1"
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

      <div v-if="tampilForm" id="form-foto" class="kartu">
        <div class="kepala-form">
          <h2>{{ editId === null ? 'Foto baru' : 'Ubah foto' }}</h2>
          <button type="button" class="ikon" aria-label="Tutup formulir" @click="tutupForm">
            <X :size="18" aria-hidden="true" />
          </button>
        </div>

        <form @submit.prevent="simpan">
          <KolomDuaBahasa
            label="Judul"
            v-model:id="form.judulId"
            v-model:en="form.judulEn"
            :maks="100"
          />
          <KolomDuaBahasa
            label="Deskripsi (di jendela detail)"
            v-model:id="form.deskripsiId"
            v-model:en="form.deskripsiEn"
            :maks="500"
            :baris="3"
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
            kecil).
          </p>
          <img
            v-if="aktif.gambarUrl"
            :src="aktif.gambarUrl"
            :alt="aktif.judulId"
            class="pratinjau"
          />
          <p v-else class="kosong">Belum ada foto.</p>
          <div class="aksi-foto">
            <label class="pilih-foto" :class="{ mati: sibukGambar }">
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
h2.judul-bagian {
  margin: 2rem 0 0.25rem;
  font-size: 1.3rem;
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
.pilih-foto {
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
.pilih-foto input {
  display: none;
}
.pilih-foto.mati {
  opacity: 0.55;
  cursor: default;
}

@media (min-width: 641px) {
  .kartu {
    padding: 1.5rem;
  }
  .dua-kolom {
    grid-template-columns: 1fr 1fr;
  }
  .item {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
