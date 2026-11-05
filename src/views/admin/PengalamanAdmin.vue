<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from '@lucide/vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import DaftarTeks from '../../components/admin/DaftarTeks.vue'

const PATH = '/api/admin/administrasi/pengalaman'
const BATAS_ITEM = 10
const BATAS_FOTO = 8

const bentukKosong = () => ({
  judulId: '',
  judulEn: '',
  perusahaan: '',
  periodeId: '',
  periodeEn: '',
  butirId: '',
  butirEn: '',
  proyekId: '',
  proyekEn: '',
  pembukaId: '',
  pembukaEn: '',
  daftarJudulId: '',
  daftarJudulEn: '',
  daftarId: '',
  daftarEn: '',
  teknologi: [],
})

const daftar = ref([])
const siap = ref(false)
const galatMuat = ref('')
const tampilForm = ref(false)
const editId = ref(null) // null = pengalaman baru
const form = ref(bentukKosong())
const galat = ref('')
const pesan = ref('')
const menyimpan = ref(false)
const galatFoto = ref('')
const sibukFoto = ref(false)

const aktif = computed(() => daftar.value.find((p) => p.id === editId.value) ?? null)

async function muat() {
  galatMuat.value = ''
  try {
    daftar.value = await api(PATH)
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}
onMounted(muat)

function keForm() {
  nextTick(() =>
    document
      .getElementById('form-pengalaman')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  )
}

function tambah() {
  editId.value = null
  form.value = bentukKosong()
  galat.value = ''
  pesan.value = ''
  galatFoto.value = ''
  tampilForm.value = true
  keForm()
}

function ubah(p) {
  editId.value = p.id
  const baru = bentukKosong()
  for (const k of Object.keys(baru)) baru[k] = Array.isArray(p[k]) ? [...p[k]] : p[k]
  form.value = baru
  galat.value = ''
  pesan.value = ''
  galatFoto.value = ''
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
    const body = JSON.parse(JSON.stringify(form.value))
    if (editId.value === null) {
      const baru = await api(PATH, { method: 'POST', body })
      daftar.value.push(baru)
      editId.value = baru.id // lanjut ke mode ubah supaya foto bisa diunggah
      pesan.value = 'Pengalaman dibuat. Foto bisa diunggah di bawah.'
    } else {
      const baru = await api(`${PATH}/${editId.value}`, { method: 'PUT', body })
      const i = daftar.value.findIndex((p) => p.id === baru.id)
      if (i >= 0) daftar.value[i] = baru
      pesan.value = 'Tersimpan.'
    }
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

async function hapus(p) {
  if (!window.confirm(`Hapus pengalaman "${p.judulId}" beserta semua fotonya?`)) return
  try {
    await api(`${PATH}/${p.id}`, { method: 'DELETE', pesan: 'Menghapus...' })
    daftar.value = daftar.value.filter((x) => x.id !== p.id)
    if (editId.value === p.id) tutupForm()
  } catch (e) {
    galatMuat.value = e.message
  }
}

async function geser(indeks, arah) {
  const tujuan = indeks + arah
  if (tujuan < 0 || tujuan >= daftar.value.length) return
  const salinan = [...daftar.value]
  ;[salinan[indeks], salinan[tujuan]] = [salinan[tujuan], salinan[indeks]]
  daftar.value = salinan
  try {
    await api(`${PATH}/urut`, {
      method: 'POST',
      body: { ids: salinan.map((p) => p.id) },
      loading: false,
    })
  } catch (e) {
    galatMuat.value = e.message
    await muat()
  }
}

// ===== Foto =====
async function fotoDipilih(event) {
  const berkas = [...(event.target.files ?? [])]
  event.target.value = ''
  if (!berkas.length || !aktif.value) return
  galatFoto.value = ''
  const sisa = BATAS_FOTO - aktif.value.gambar.length
  if (berkas.length > sisa) {
    galatFoto.value = `Maksimal ${BATAS_FOTO} foto per pengalaman (sisa ${sisa}).`
    return
  }
  sibukFoto.value = true
  try {
    for (const b of berkas) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(b.type)) {
        galatFoto.value = `"${b.name}" harus JPEG, PNG, atau WebP.`
        break
      }
      if (b.size > 8 * 1024 * 1024) {
        galatFoto.value = `"${b.name}" lebih dari 8 MB.`
        break
      }
      const data = new FormData()
      data.append('berkas', b)
      const baru = await api(`${PATH}/${aktif.value.id}/gambar`, {
        method: 'POST',
        body: data,
        pesan: 'Mengunggah foto...',
      })
      aktif.value.gambar.push({ id: baru.id, gambarUrl: baru.gambarUrl })
    }
  } catch (e) {
    galatFoto.value = e.message
  } finally {
    sibukFoto.value = false
  }
}

async function hapusFoto(g) {
  if (!aktif.value || !window.confirm('Hapus foto ini?')) return
  galatFoto.value = ''
  try {
    await api(`${PATH}/${aktif.value.id}/gambar/${g.id}`, {
      method: 'DELETE',
      pesan: 'Menghapus foto...',
    })
    aktif.value.gambar = aktif.value.gambar.filter((x) => x.id !== g.id)
  } catch (e) {
    galatFoto.value = e.message
  }
}

async function geserFoto(indeks, arah) {
  const p = aktif.value
  const tujuan = indeks + arah
  if (!p || tujuan < 0 || tujuan >= p.gambar.length) return
  const salinan = [...p.gambar]
  ;[salinan[indeks], salinan[tujuan]] = [salinan[tujuan], salinan[indeks]]
  p.gambar = salinan
  try {
    await api(`${PATH}/${p.id}/gambar/urut`, {
      method: 'POST',
      body: { ids: salinan.map((g) => g.id) },
      loading: false,
    })
  } catch (e) {
    galatFoto.value = e.message
    await muat()
  }
}
</script>

<template>
  <section>
    <h1>Pengalaman Kerja</h1>
    <p class="ket">
      Daftar pengalaman di halaman <code>/administrasi</code>. Tiap pengalaman punya kartu ringkas
      dan jendela detail dengan foto. Semua teks wajib ada dalam bahasa Indonesia dan Inggris.
    </p>

    <p v-if="galatMuat" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="atas">
        <span class="hitung">{{ daftar.length }} dari {{ BATAS_ITEM }} pengalaman</span>
        <button type="button" class="utama" :disabled="daftar.length >= BATAS_ITEM" @click="tambah">
          <Plus :size="16" aria-hidden="true" /> Tambah pengalaman
        </button>
      </div>

      <p v-if="!daftar.length" class="kosong">Belum ada pengalaman.</p>

      <ul class="daftar">
        <li
          v-for="(p, i) in daftar"
          :key="p.id"
          class="item"
          :class="{ terpilih: p.id === editId && tampilForm }"
        >
          <div class="isi-item">
            <p class="judul-item">{{ p.judulId }}</p>
            <p class="sub-item">
              {{ p.perusahaan }} · {{ p.periodeId }} · {{ p.gambar.length }} foto
            </p>
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
            <button type="button" class="ikon" aria-label="Ubah" @click="ubah(p)">
              <Pencil :size="16" aria-hidden="true" />
            </button>
            <button type="button" class="ikon bahaya" aria-label="Hapus" @click="hapus(p)">
              <Trash2 :size="16" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>

      <div v-if="tampilForm" id="form-pengalaman" class="kartu">
        <div class="kepala-form">
          <h2>{{ editId === null ? 'Pengalaman baru' : 'Ubah pengalaman' }}</h2>
          <button type="button" class="ikon" aria-label="Tutup formulir" @click="tutupForm">
            <X :size="18" aria-hidden="true" />
          </button>
        </div>

        <form @submit.prevent="simpan">
          <h3>Kartu ringkas</h3>
          <KolomDuaBahasa
            label="Jabatan"
            v-model:id="form.judulId"
            v-model:en="form.judulEn"
            :maks="200"
          />
          <div class="ruas">
            <label>Perusahaan</label>
            <input v-model="form.perusahaan" type="text" maxlength="150" required />
          </div>
          <KolomDuaBahasa
            label="Periode"
            v-model:id="form.periodeId"
            v-model:en="form.periodeEn"
            :maks="60"
          />
          <KolomDuaBahasa
            label="Poin pekerjaan (satu butir per baris)"
            v-model:id="form.butirId"
            v-model:en="form.butirEn"
            :maks="2000"
            :baris="6"
          />

          <h3>Jendela detail</h3>
          <KolomDuaBahasa
            label="Nama proyek"
            v-model:id="form.proyekId"
            v-model:en="form.proyekEn"
            :maks="150"
          />
          <KolomDuaBahasa
            label="Paragraf pembuka"
            v-model:id="form.pembukaId"
            v-model:en="form.pembukaEn"
            :maks="1500"
            :baris="4"
          />
          <KolomDuaBahasa
            label="Judul daftar (contoh: Hasil yang dicapai)"
            v-model:id="form.daftarJudulId"
            v-model:en="form.daftarJudulEn"
            :maks="100"
          />
          <KolomDuaBahasa
            label="Isi daftar (satu butir per baris)"
            v-model:id="form.daftarId"
            v-model:en="form.daftarEn"
            :maks="3000"
            :baris="6"
          />
          <DaftarTeks
            v-model="form.teknologi"
            label="Teknologi yang digunakan"
            :maks="12"
            :panjang="40"
          />

          <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
          <p v-if="pesan" class="sukses" role="status">{{ pesan }}</p>
          <button type="submit" class="simpan" :disabled="menyimpan">
            {{ editId === null ? 'Buat pengalaman' : 'Simpan perubahan' }}
          </button>
        </form>

        <div v-if="aktif" class="foto">
          <h3>Foto ({{ aktif.gambar.length }} dari {{ BATAS_FOTO }})</h3>
          <p class="bantuan">
            JPEG, PNG, atau WebP, maksimal 8 MB per foto. Urutan di sini = urutan di slider.
          </p>
          <p v-if="!aktif.gambar.length" class="kosong">Belum ada foto.</p>
          <ul class="grid-foto">
            <li v-for="(g, i) in aktif.gambar" :key="g.id" class="sel">
              <img :src="g.gambarUrl" alt="Foto pengalaman" loading="lazy" />
              <div class="aksi-foto">
                <button
                  type="button"
                  class="ikon"
                  aria-label="Geser ke kiri"
                  :disabled="i === 0"
                  @click="geserFoto(i, -1)"
                >
                  <ArrowLeft :size="14" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  class="ikon"
                  aria-label="Geser ke kanan"
                  :disabled="i === aktif.gambar.length - 1"
                  @click="geserFoto(i, 1)"
                >
                  <ArrowRight :size="14" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  class="ikon bahaya"
                  aria-label="Hapus foto"
                  @click="hapusFoto(g)"
                >
                  <Trash2 :size="14" aria-hidden="true" />
                </button>
              </div>
            </li>
          </ul>
          <label class="unggah" :class="{ mati: sibukFoto || aktif.gambar.length >= BATAS_FOTO }">
            <Upload :size="16" aria-hidden="true" /> Tambah foto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              :disabled="sibukFoto || aktif.gambar.length >= BATAS_FOTO"
              @change="fotoDipilih"
            />
          </label>
          <p v-if="galatFoto" class="galat" role="alert">{{ galatFoto }}</p>
        </div>
        <p v-else class="bantuan">Foto bisa diunggah setelah pengalaman dibuat.</p>
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
  margin: 0;
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
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
}
.kepala-form {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.foto {
  padding-top: 0.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid #e3e7ee;
}
.grid-foto {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0;
  margin: 0 0 1rem;
  list-style: none;
}
.sel {
  min-width: 0;
}
.sel img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: #e8ecf2;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
}
.aksi-foto {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.4rem;
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
  .grid-foto {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .grid-foto {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
