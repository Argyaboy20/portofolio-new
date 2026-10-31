<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import UnggahBerkas from '../../components/admin/UnggahBerkas.vue'
import { useBerandaStore } from '../../stores/beranda'

const beranda = useBerandaStore()

const kolomTeks = [
  'nama', 'gelar', 'jabatanId', 'jabatanEn', 'labelSupportId', 'labelSupportEn',
  'ringkasan1Id', 'ringkasan1En', 'ringkasan2Id', 'ringkasan2En',
]
const form = reactive(Object.fromEntries(kolomTeks.map((k) => [k, ''])))
const fotoUrl = ref(null)
const cvUrl = ref(null)
const siap = ref(false)
const galat = ref('')
const pesan = ref('')
const menyimpan = ref(false)

const BANTUAN_TAUTAN =
  'Tautan di dalam teks: tulis [[teks yang tampil|https://alamat]] atau [[teks|/halaman-internal]]. Hanya alamat https:// atau alamat internal yang diterima.'

async function muat() {
  galat.value = ''
  try {
    const data = await api('/api/admin/profil')
    for (const k of kolomTeks) form[k] = data[k] ?? ''
    fotoUrl.value = data.fotoUrl ?? null
    cvUrl.value = data.cvUrl ?? null
    siap.value = true
  } catch (e) {
    galat.value = e.message
  }
}
onMounted(muat)

// Beranda publik dimuat ulang dari server saat dibuka berikutnya
const dataBerubah = () => (beranda.data = null)

async function simpan() {
  galat.value = ''
  pesan.value = ''
  menyimpan.value = true
  try {
    await api('/api/admin/profil', {
      method: 'PUT',
      body: Object.fromEntries(kolomTeks.map((k) => [k, form[k]])),
    })
    dataBerubah()
    pesan.value = 'Tersimpan.'
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

function fotoBerubah(url) {
  fotoUrl.value = url
  dataBerubah()
}
function cvBerubah(url) {
  cvUrl.value = url
  dataBerubah()
}
</script>

<template>
  <section>
    <h1>Profil</h1>
    <p class="ket">Isi panel kiri dan bagian "Profil Singkat" di Beranda.</p>

    <p v-if="galat && !siap" class="galat">
      {{ galat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="kartu berkas">
        <UnggahBerkas
          label="Foto profil"
          accept="image/jpeg,image/png,image/webp"
          :maks-mb="8"
          :url="fotoUrl"
          endpoint="/api/admin/profil/foto"
          bulat
          bantuan="JPEG, PNG, atau WebP, maksimal 8 MB. Otomatis diperkecil dan metadatanya dibuang."
          @berubah="fotoBerubah"
        />
        <UnggahBerkas
          label="CV"
          accept="application/pdf"
          :maks-mb="8"
          :url="cvUrl"
          jenis="pdf"
          endpoint="/api/admin/profil/cv"
          bantuan="PDF, maksimal 8 MB. Berkas ini bisa dibuka siapa saja yang menekan tombol Lihat CV."
          @berubah="cvBerubah"
        />
      </div>

      <form class="kartu" @submit.prevent="simpan">
        <div class="satu">
          <div class="sisi">
            <label for="nama">Nama</label>
            <input id="nama" v-model="form.nama" type="text" maxlength="100" required />
          </div>
          <div class="sisi">
            <label for="gelar">Gelar (boleh kosong)</label>
            <input id="gelar" v-model="form.gelar" type="text" maxlength="50" />
          </div>
        </div>

        <KolomDuaBahasa label="Jabatan" v-model:id="form.jabatanId" v-model:en="form.jabatanEn" :maks="150" />
        <KolomDuaBahasa
          label="Label IT Support (tautan ke halaman IT Support)"
          v-model:id="form.labelSupportId"
          v-model:en="form.labelSupportEn"
          :maks="100"
        />
        <KolomDuaBahasa
          label="Profil singkat, paragraf 1"
          v-model:id="form.ringkasan1Id"
          v-model:en="form.ringkasan1En"
          :maks="3000"
          :baris="7"
          :bantuan="BANTUAN_TAUTAN"
        />
        <KolomDuaBahasa
          label="Profil singkat, paragraf 2"
          v-model:id="form.ringkasan2Id"
          v-model:en="form.ringkasan2En"
          :maks="3000"
          :baris="7"
          :bantuan="BANTUAN_TAUTAN"
        />

        <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
        <p v-if="pesan" class="sukses" role="status">{{ pesan }}</p>
        <button type="submit" class="simpan" :disabled="menyimpan">Simpan perubahan</button>
      </form>
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
.kartu {
  max-width: 62rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
}
.berkas {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
.satu {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.sisi {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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

@media (min-width: 641px) {
  .kartu {
    padding: 1.5rem;
  }
  .berkas {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 768px) {
  .satu {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}
</style>