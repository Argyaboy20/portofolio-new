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

const PATH = '/api/admin/halaman/relawan'
const BATAS_ITEM = 20
const BATAS_FOTO = 8

const bentukKosong = () => ({
  posisiId: '',
  posisiEn: '',
  organisasi: '',
  periodeId: '',
  periodeEn: '',
  bentuk: 'daftar',
  deskripsiId: '',
  deskripsiEn: '',
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

// Foto: keterangan baru sebelum memilih berkas
const ketBaruId = ref('')
const ketBaruEn = ref('')
const galatFoto = ref('')
const sibukFoto = ref(false)
const fotoDiubah = ref(null) // id foto yang keterangannya sedang diubah
const ketUbahId = ref('')
const ketUbahEn = ref('')

const aktif = computed(() => daftar.value.find((r) => r.id === editId.value) ?? null)

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
    document.getElementById('form-relawan')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  )
}

function resetFoto() {
  ketBaruId.value = ''
  ketBaruEn.value = ''
  galatFoto.value = ''
  fotoDiubah.value = null
}

function tambah() {
  editId.value = null
  form.value = bentukKosong()
  galat.value = ''
  pesan.value = ''
  resetFoto()
  tampilForm.value = true
  keForm()
}

function ubah(r) {
  editId.value = r.id
  form.value = {
    posisiId: r.posisiId,
    posisiEn: r.posisiEn,
    organisasi: r.organisasi,
    periodeId: r.periodeId,
    periodeEn: r.periodeEn,
    bentuk: r.bentuk,
    deskripsiId: r.deskripsiId,
    deskripsiEn: r.deskripsiEn,
  }
  galat.value = ''
  pesan.value = ''
  resetFoto()
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
    const body = { ...form.value }
    if (editId.value === null) {
      const baru = await api(PATH, { method: 'POST', body })
      daftar.value.push(baru)
      editId.value = baru.id // lanjut ke mode ubah supaya foto bisa diunggah
      pesan.value = 'Pengalaman dibuat. Foto bisa diunggah di bawah.'
    } else {
      const baru = await api(`${PATH}/${editId.value}`, { method: 'PUT', body })
      const i = daftar.value.findIndex((r) => r.id === baru.id)
      if (i >= 0) daftar.value[i] = baru
      pesan.value = 'Tersimpan.'
    }
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

async function hapus(r) {
  if (!window.confirm(`Hapus pengalaman "${r.organisasi}" beserta semua fotonya?`)) return
  try {
    await api(`${PATH}/${r.id}`, { method: 'DELETE', pesan: 'Menghapus...' })
    daftar.value = daftar.value.filter((x) => x.id !== r.id)
    if (editId.value === r.id) tutupForm()
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
      body: { ids: salinan.map((r) => r.id) },
      loading: false,
    })
  } catch (e) {
    galatMuat.value = e.message
    await muat()
  }
}

// ===== Foto =====
async function fotoDipilih(event) {
  const berkas = event.target.files?.[0]
  event.target.value = ''
  if (!berkas || !aktif.value) return
  galatFoto.value = ''
  if (!ketBaruId.value.trim() || !ketBaruEn.value.trim()) {
    galatFoto.value =
      'Isi keterangan foto dalam bahasa Indonesia dan Inggris dulu, lalu pilih berkas.'
    return
  }
  if (aktif.value.foto.length >= BATAS_FOTO) {
    galatFoto.value = `Maksimal ${BATAS_FOTO} foto per pengalaman.`
    return
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(berkas.type)) {
    galatFoto.value = 'Berkas harus gambar JPEG, PNG, atau WebP.'
    return
  }
  if (berkas.size > 8 * 1024 * 1024) {
    galatFoto.value = 'Ukuran berkas maksimal 8 MB.'
    return
  }
  const data = new FormData()
  data.append('berkas', berkas)
  data.append('keteranganId', ketBaruId.value.trim())
  data.append('keteranganEn', ketBaruEn.value.trim())
  sibukFoto.value = true
  try {
    const baru = await api(`${PATH}/${aktif.value.id}/foto`, {
      method: 'POST',
      body: data,
      pesan: 'Mengunggah foto...',
    })
    aktif.value.foto.push(baru)
    ketBaruId.value = ''
    ketBaruEn.value = ''
  } catch (e) {
    galatFoto.value = e.message
  } finally {
    sibukFoto.value = false
  }
}

async function hapusFoto(f) {
  if (!aktif.value || !window.confirm('Hapus foto ini?')) return
  galatFoto.value = ''
  try {
    await api(`${PATH}/${aktif.value.id}/foto/${f.id}`, {
      method: 'DELETE',
      pesan: 'Menghapus foto...',
    })
    aktif.value.foto = aktif.value.foto.filter((x) => x.id !== f.id)
    if (fotoDiubah.value === f.id) fotoDiubah.value = null
  } catch (e) {
    galatFoto.value = e.message
  }
}

async function geserFoto(indeks, arah) {
  const r = aktif.value
  const tujuan = indeks + arah
  if (!r || tujuan < 0 || tujuan >= r.foto.length) return
  const salinan = [...r.foto]
  ;[salinan[indeks], salinan[tujuan]] = [salinan[tujuan], salinan[indeks]]
  r.foto = salinan
  try {
    await api(`${PATH}/${r.id}/foto/urut`, {
      method: 'POST',
      body: { ids: salinan.map((f) => f.id) },
      loading: false,
    })
  } catch (e) {
    galatFoto.value = e.message
    await muat()
  }
}

function mulaiUbahKet(f) {
  fotoDiubah.value = f.id
  ketUbahId.value = f.keteranganId
  ketUbahEn.value = f.keteranganEn
  galatFoto.value = ''
}

async function simpanKet(f) {
  if (!aktif.value) return
  galatFoto.value = ''
  try {
    const baru = await api(`${PATH}/${aktif.value.id}/foto/${f.id}`, {
      method: 'PUT',
      body: { keteranganId: ketUbahId.value, keteranganEn: ketUbahEn.value },
    })
    const i = aktif.value.foto.findIndex((x) => x.id === f.id)
    if (i >= 0) aktif.value.foto[i] = baru
    fotoDiubah.value = null
  } catch (e) {
    galatFoto.value = e.message
  }
}
</script>

<template>
  <section>
    <h1>Pengalaman Relawan</h1>
    <p class="ket">
      Daftar pengalaman di halaman <code>/relawan</code>. Tiap pengalaman punya galeri foto dengan
      keterangan. Semua teks wajib ada dalam bahasa Indonesia dan Inggris.
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
          v-for="(r, i) in daftar"
          :key="r.id"
          class="item"
          :class="{ terpilih: r.id === editId && tampilForm }"
        >
          <div class="isi-item">
            <p class="judul-item">{{ r.organisasi }}</p>
            <p class="sub-item">{{ r.posisiId }} · {{ r.periodeId }} · {{ r.foto.length }} foto</p>
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

      <div v-if="tampilForm" id="form-relawan" class="kartu">
        <div class="kepala-form">
          <h2>{{ editId === null ? 'Pengalaman baru' : 'Ubah pengalaman' }}</h2>
          <button type="button" class="ikon" aria-label="Tutup formulir" @click="tutupForm">
            <X :size="18" aria-hidden="true" />
          </button>
        </div>

        <form @submit.prevent="simpan">
          <KolomDuaBahasa
            label="Posisi"
            v-model:id="form.posisiId"
            v-model:en="form.posisiEn"
            :maks="150"
          />
          <div class="ruas">
            <label>Organisasi</label>
            <input v-model="form.organisasi" type="text" maxlength="200" required />
          </div>
          <KolomDuaBahasa
            label="Periode"
            v-model:id="form.periodeId"
            v-model:en="form.periodeEn"
            :maks="60"
          />
          <div class="ruas">
            <label>Bentuk deskripsi</label>
            <select v-model="form.bentuk">
              <option value="daftar">Daftar (satu butir per baris)</option>
              <option value="paragraf">Paragraf</option>
            </select>
          </div>
          <KolomDuaBahasa
            :label="
              form.bentuk === 'daftar'
                ? 'Deskripsi (satu butir per baris)'
                : 'Deskripsi (satu paragraf)'
            "
            v-model:id="form.deskripsiId"
            v-model:en="form.deskripsiEn"
            :maks="3000"
            :baris="6"
          />

          <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
          <p v-if="pesan" class="sukses" role="status">{{ pesan }}</p>
          <button type="submit" class="simpan" :disabled="menyimpan">
            {{ editId === null ? 'Buat pengalaman' : 'Simpan perubahan' }}
          </button>
        </form>

        <div v-if="aktif" class="foto">
          <h3>Foto galeri ({{ aktif.foto.length }} dari {{ BATAS_FOTO }})</h3>
          <p class="bantuan">
            JPEG, PNG, atau WebP, maksimal 8 MB per foto. Urutan di sini = urutan di galeri.
          </p>
          <p v-if="!aktif.foto.length" class="kosong">Belum ada foto.</p>

          <ul class="grid-foto">
            <li v-for="(f, i) in aktif.foto" :key="f.id" class="sel">
              <img :src="f.gambarUrl" :alt="f.keteranganId" loading="lazy" />
              <template v-if="fotoDiubah === f.id">
                <KolomDuaBahasa
                  label="Keterangan"
                  v-model:id="ketUbahId"
                  v-model:en="ketUbahEn"
                  :maks="200"
                />
                <div class="aksi-foto">
                  <button type="button" class="kecil" @click="simpanKet(f)">Simpan</button>
                  <button type="button" class="kecil abu" @click="fotoDiubah = null">Batal</button>
                </div>
              </template>
              <template v-else>
                <p class="ket-foto">{{ f.keteranganId }}</p>
                <p class="ket-foto en">{{ f.keteranganEn }}</p>
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
                    :disabled="i === aktif.foto.length - 1"
                    @click="geserFoto(i, 1)"
                  >
                    <ArrowRight :size="14" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="ikon"
                    aria-label="Ubah keterangan"
                    @click="mulaiUbahKet(f)"
                  >
                    <Pencil :size="14" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="ikon bahaya"
                    aria-label="Hapus foto"
                    @click="hapusFoto(f)"
                  >
                    <Trash2 :size="14" aria-hidden="true" />
                  </button>
                </div>
              </template>
            </li>
          </ul>

          <div v-if="aktif.foto.length < BATAS_FOTO" class="foto-baru">
            <h4>Tambah foto</h4>
            <KolomDuaBahasa
              label="Keterangan foto"
              v-model:id="ketBaruId"
              v-model:en="ketBaruEn"
              :maks="200"
            />
            <label class="unggah" :class="{ mati: sibukFoto }">
              <Upload :size="16" aria-hidden="true" /> Pilih berkas
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                :disabled="sibukFoto"
                @change="fotoDipilih"
              />
            </label>
          </div>
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
  margin: 1.5rem 0 0.5rem;
  font-size: 1rem;
  color: #1f2d3d;
}
h4 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
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
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 0;
  margin: 0 0 1rem;
  list-style: none;
}
.sel {
  min-width: 0;
  padding: 0.6rem;
  background: #f7f9fc;
  border: 1px solid #e3e7ee;
  border-radius: 10px;
}
.sel img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  background: #e8ecf2;
  border-radius: 8px;
}
.ket-foto {
  margin: 0.5rem 0 0;
  font-size: 0.82rem;
  color: #1f2d3d;
}
.ket-foto.en {
  margin-top: 0.15rem;
  color: #6b7686;
}
.aksi-foto {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.5rem;
}
.kecil {
  padding: 0.35rem 0.8rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background: #2e87f6;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.kecil.abu {
  color: #1f2d3d;
  background: #e3e7ee;
}
.foto-baru {
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: #f7f9fc;
  border: 1px dashed #cfd6e0;
  border-radius: 10px;
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
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .grid-foto {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
