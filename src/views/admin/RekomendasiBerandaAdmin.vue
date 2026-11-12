<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from '@lucide/vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import UnggahBerkas from '../../components/admin/UnggahBerkas.vue'

const PATH = '/api/admin/beranda/rekomendasi'
const BATAS_ITEM = 12

const bentukKosong = () => ({ nama: '', jabatan: '', teksId: '', teksEn: '', link: '' })

const daftar = ref([])
const siap = ref(false)
const galatMuat = ref('')
const tampilForm = ref(false)
const editId = ref(null) // null = rekomendasi baru
const form = ref(bentukKosong())
const galat = ref('')
const pesan = ref('')
const menyimpan = ref(false)

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
    document
      .getElementById('form-rekomendasi-beranda')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  )
}

function tambah() {
  editId.value = null
  form.value = bentukKosong()
  galat.value = ''
  pesan.value = ''
  tampilForm.value = true
  keForm()
}

function ubah(r) {
  editId.value = r.id
  form.value = {
    nama: r.nama,
    jabatan: r.jabatan,
    teksId: r.teksId,
    teksEn: r.teksEn,
    link: r.link ?? '',
  }
  galat.value = ''
  pesan.value = ''
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
      pesan.value = 'Rekomendasi dibuat. Foto bisa diunggah di bawah.'
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
  if (!window.confirm(`Hapus rekomendasi dari "${r.nama}" beserta fotonya?`)) return
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

function fotoBerubah(url) {
  if (aktif.value) aktif.value.fotoUrl = url
}
</script>

<template>
  <section>
    <h1>Rekomendasi Beranda</h1>
    <p class="ket">
      Kutipan rekomendasi di section Rekomendasi pada halaman Beranda, di bawah Publikasi. Satu
      kutipan boleh terdiri dari beberapa paragraf. Ini terpisah dari rekomendasi di halaman
      <code>/administrasi</code>. Teks wajib ada dalam bahasa Indonesia dan Inggris.
    </p>

    <p v-if="galatMuat" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="atas">
        <span class="hitung">{{ daftar.length }} dari {{ BATAS_ITEM }} rekomendasi</span>
        <button type="button" class="utama" :disabled="daftar.length >= BATAS_ITEM" @click="tambah">
          <Plus :size="16" aria-hidden="true" /> Tambah rekomendasi
        </button>
      </div>

      <p v-if="!daftar.length" class="kosong">Belum ada rekomendasi.</p>

      <ul class="daftar">
        <li
          v-for="(r, i) in daftar"
          :key="r.id"
          class="item"
          :class="{ terpilih: r.id === editId && tampilForm }"
        >
          <div class="isi-item">
            <p class="judul-item">{{ r.nama }}</p>
            <p class="sub-item">
              {{ r.jabatan }} · {{ r.fotoUrl ? 'ada foto' : 'belum ada foto' }}
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
            <button type="button" class="ikon" aria-label="Ubah" @click="ubah(r)">
              <Pencil :size="16" aria-hidden="true" />
            </button>
            <button type="button" class="ikon bahaya" aria-label="Hapus" @click="hapus(r)">
              <Trash2 :size="16" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>

      <div v-if="tampilForm" id="form-rekomendasi-beranda" class="kartu">
        <div class="kepala-form">
          <h2>{{ editId === null ? 'Rekomendasi baru' : 'Ubah rekomendasi' }}</h2>
          <button type="button" class="ikon" aria-label="Tutup formulir" @click="tutupForm">
            <X :size="18" aria-hidden="true" />
          </button>
        </div>

        <form @submit.prevent="simpan">
          <div class="ruas">
            <label>Nama</label>
            <input v-model="form.nama" type="text" maxlength="100" required />
          </div>
          <div class="ruas">
            <label>Jabatan dan perusahaan</label>
            <input v-model="form.jabatan" type="text" maxlength="150" required />
          </div>
          <KolomDuaBahasa
            label="Kutipan"
            v-model:id="form.teksId"
            v-model:en="form.teksEn"
            :maks="3000"
            :baris="10"
            bantuan="Pisahkan paragraf dengan satu baris kosong (tekan Enter dua kali)."
          />
          <div class="ruas">
            <label>Tautan (opsional, harus diawali https://)</label>
            <input v-model="form.link" type="url" maxlength="500" />
          </div>

          <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
          <p v-if="pesan" class="sukses" role="status">{{ pesan }}</p>
          <button type="submit" class="simpan" :disabled="menyimpan">
            {{ editId === null ? 'Buat rekomendasi' : 'Simpan perubahan' }}
          </button>
        </form>

        <div v-if="aktif" class="foto">
          <UnggahBerkas
            label="Foto"
            accept="image/jpeg,image/png,image/webp"
            :maks-mb="8"
            :url="aktif.fotoUrl"
            :endpoint="`${PATH}/${aktif.id}/foto`"
            bulat
            bantuan="JPEG, PNG, atau WebP, maksimal 8 MB. Tampil bulat di samping nama."
            @berubah="fotoBerubah"
          />
        </div>
        <p v-else class="bantuan">Foto bisa diunggah setelah rekomendasi dibuat.</p>
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
.ket {
  margin: 0 0 1.25rem;
  color: #6b7686;
}
.bantuan {
  margin: 1rem 0 0;
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
  padding-top: 1.25rem;
  margin-top: 1.5rem;
  border-top: 1px solid #e3e7ee;
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
