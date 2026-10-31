<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import { useBerandaStore } from '../../stores/beranda'

const beranda = useBerandaStore()

const form = reactive({ hakCiptaId: '', hakCiptaEn: '', footerTeks: '' })
const kodeSudahDiatur = ref(false)
const siap = ref(false)
const galatMuat = ref('')

// Kartu 1: teks situs
const galatTeks = ref('')
const pesanTeks = ref('')
const menyimpanTeks = ref(false)

// Kartu 2: kode akses Source Code
const kodeBaru = ref('')
const passwordAdmin = ref('')
const galatKode = ref('')
const pesanKode = ref('')
const prosesKode = ref(false)

async function muat() {
  galatMuat.value = ''
  try {
    const data = await api('/api/admin/pengaturan')
    form.hakCiptaId = data.hakCiptaId ?? ''
    form.hakCiptaEn = data.hakCiptaEn ?? ''
    form.footerTeks = data.footerTeks ?? ''
    kodeSudahDiatur.value = !!data.kodeSudahDiatur
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}
onMounted(muat)

// Beranda publik dimuat ulang dari server saat dibuka berikutnya
const dataBerubah = () => (beranda.data = null)

async function simpanTeks() {
  galatTeks.value = ''
  pesanTeks.value = ''
  menyimpanTeks.value = true
  try {
    await api('/api/admin/pengaturan', {
      method: 'PUT',
      body: { hakCiptaId: form.hakCiptaId, hakCiptaEn: form.hakCiptaEn, footerTeks: form.footerTeks },
    })
    dataBerubah()
    pesanTeks.value = 'Tersimpan.'
  } catch (e) {
    galatTeks.value = e.message
  } finally {
    menyimpanTeks.value = false
  }
}

async function simpanKode() {
  galatKode.value = ''
  pesanKode.value = ''
  prosesKode.value = true
  try {
    const hasil = await api('/api/admin/pengaturan/kode-source', {
      method: 'POST',
      body: { kodeBaru: kodeBaru.value, passwordAdmin: passwordAdmin.value },
    })
    kodeSudahDiatur.value = !!hasil.kodeSudahDiatur
    kodeBaru.value = ''
    passwordAdmin.value = ''
    pesanKode.value = 'Kode akses tersimpan.'
  } catch (e) {
    galatKode.value = e.message
  } finally {
    prosesKode.value = false
  }
}

async function nonaktifkanKode() {
  galatKode.value = ''
  pesanKode.value = ''
  if (!passwordAdmin.value) {
    galatKode.value = 'Isi password admin dulu untuk menonaktifkan kode.'
    return
  }
  if (!window.confirm('Nonaktifkan kode akses? Tombol Source Code di situs tidak bisa dibuka sampai kode baru diatur.')) return
  prosesKode.value = true
  try {
    const hasil = await api('/api/admin/pengaturan/kode-source/nonaktif', {
      method: 'POST',
      body: { passwordAdmin: passwordAdmin.value },
    })
    kodeSudahDiatur.value = !!hasil.kodeSudahDiatur
    passwordAdmin.value = ''
    pesanKode.value = 'Kode akses dinonaktifkan.'
  } catch (e) {
    galatKode.value = e.message
  } finally {
    prosesKode.value = false
  }
}
</script>

<template>
  <section>
    <h1>Pengaturan</h1>
    <p class="ket">Teks hak cipta dan footer, serta kode akses tombol Source Code di Beranda.</p>

    <p v-if="galatMuat && !siap" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <form class="kartu" @submit.prevent="simpanTeks">
        <h2>Teks situs</h2>
        <KolomDuaBahasa label="Hak cipta" v-model:id="form.hakCiptaId" v-model:en="form.hakCiptaEn" :maks="200" />
        <div class="sisi">
          <label for="footer">Teks footer</label>
          <input id="footer" v-model="form.footerTeks" type="text" maxlength="200" required />
        </div>

        <p v-if="galatTeks" class="galat" role="alert">{{ galatTeks }}</p>
        <p v-if="pesanTeks" class="sukses" role="status">{{ pesanTeks }}</p>
        <button type="submit" class="simpan" :disabled="menyimpanTeks">Simpan perubahan</button>
      </form>

      <form class="kartu" @submit.prevent="simpanKode">
        <h2>Kode akses Source Code</h2>
        <p class="status" :class="{ aktif: kodeSudahDiatur }">
          Status: {{ kodeSudahDiatur ? 'sudah diatur' : 'belum diatur / nonaktif' }}
        </p>
        <p class="bantuan">
          Pengunjung harus memasukkan kode ini untuk membuka tautan Source Code. Kode berupa huruf dan angka saja,
          8 sampai 64 karakter. Kode tidak bisa dilihat lagi setelah disimpan, hanya bisa diganti. Jangan memakai
          kode lama dari situs Angular.
        </p>

        <div class="sisi">
          <label for="kode-baru">Kode baru</label>
          <input
            id="kode-baru"
            v-model="kodeBaru"
            type="password"
            autocomplete="new-password"
            minlength="8"
            maxlength="64"
            pattern="[A-Za-z0-9]{8,64}"
          />
        </div>
        <div class="sisi">
          <label for="pw-admin">Password admin (konfirmasi)</label>
          <input id="pw-admin" v-model="passwordAdmin" type="password" autocomplete="current-password" maxlength="200" />
        </div>

        <p v-if="galatKode" class="galat" role="alert">{{ galatKode }}</p>
        <p v-if="pesanKode" class="sukses" role="status">{{ pesanKode }}</p>

        <div class="aksi">
          <button type="submit" class="simpan" :disabled="prosesKode || !kodeBaru || !passwordAdmin">
            Simpan kode
          </button>
          <button
            v-if="kodeSudahDiatur"
            type="button"
            class="bahaya"
            :disabled="prosesKode"
            @click="nonaktifkanKode"
          >
            Nonaktifkan kode
          </button>
        </div>
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
.ket {
  margin: 0 0 1.25rem;
  color: #6b7686;
}
.kartu {
  max-width: 44rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
}
.sisi {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}
.sisi label {
  font-weight: 600;
  color: #1f2d3d;
}
.sisi input {
  width: 100%;
  padding: 0.6rem 0.7rem;
  font: inherit;
  font-size: 0.95rem;
  color: #222;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
}
.sisi input:focus {
  border-color: #4a90e2;
  outline: none;
}
.status {
  margin: 0 0 0.5rem;
  font-weight: 600;
  color: #d63b3b;
}
.status.aktif {
  color: #1f9d55;
}
.bantuan {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: #6b7686;
}
.aksi {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.simpan,
.bahaya {
  padding: 0.7rem 1.4rem;
  font: inherit;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
}
.simpan {
  color: #fff;
  background: #2e87f6;
  border: 0;
}
.bahaya {
  color: #d63b3b;
  background: #fff;
  border: 1px solid #ff6b6b;
}
.simpan:disabled,
.bahaya:disabled {
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

@media (min-width: 641px) {
  .kartu {
    padding: 1.5rem;
  }
  .aksi {
    flex-direction: row;
  }
}
</style>