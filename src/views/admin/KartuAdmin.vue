<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import { useBerandaStore } from '../../stores/beranda'

const beranda = useBerandaStore()

const KARTU = [
  { kunci: 'karir', nama: 'Karir Kedua', ket: 'Kartu biru di Beranda.' },
  { kunci: 'relawan', nama: 'Relawan', ket: 'Kartu ungu di Beranda.' },
]
const KOLOM = ['judulId', 'judulEn', 'deskripsiId', 'deskripsiEn', 'tujuan']
const kosong = () => Object.fromEntries(KOLOM.map((k) => [k, '']))

const form = reactive({ karir: kosong(), relawan: kosong() })
const status = reactive({
  karir: { galat: '', pesan: '', menyimpan: false },
  relawan: { galat: '', pesan: '', menyimpan: false },
})
const siap = ref(false)
const galatMuat = ref('')

async function muat() {
  galatMuat.value = ''
  try {
    const data = await api('/api/admin/kartu')
    for (const item of data) {
      if (!form[item.jenis]) continue
      for (const k of KOLOM) form[item.jenis][k] = item[k] ?? ''
    }
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}
onMounted(muat)

async function simpan(jenis) {
  const s = status[jenis]
  s.galat = ''
  s.pesan = ''
  s.menyimpan = true
  try {
    await api(`/api/admin/kartu/${jenis}`, {
      method: 'PUT',
      body: Object.fromEntries(KOLOM.map((k) => [k, form[jenis][k]])),
    })
    // Beranda publik dimuat ulang dari server saat dibuka berikutnya
    beranda.data = null
    s.pesan = 'Tersimpan.'
  } catch (e) {
    s.galat = e.message
  } finally {
    s.menyimpan = false
  }
}
</script>

<template>
  <section>
    <h1>Karir dan Relawan</h1>
    <p class="ket">
      Dua kartu tetap di Beranda: "Karir Kedua" dan "Relawan". Kartu tidak bisa ditambah atau dihapus, hanya diubah
      isinya.
    </p>

    <p v-if="galatMuat && !siap" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <form v-for="k in KARTU" :key="k.kunci" class="kartu" @submit.prevent="simpan(k.kunci)">
        <h2>
          {{ k.nama }}
          <small>{{ k.ket }}</small>
        </h2>

        <KolomDuaBahasa
          label="Judul"
          v-model:id="form[k.kunci].judulId"
          v-model:en="form[k.kunci].judulEn"
          :maks="100"
        />
        <KolomDuaBahasa
          label="Deskripsi"
          v-model:id="form[k.kunci].deskripsiId"
          v-model:en="form[k.kunci].deskripsiEn"
          :maks="1000"
          :baris="4"
        />

        <div class="ruas">
          <label :for="`tujuan-${k.kunci}`">Alamat tujuan</label>
          <input :id="`tujuan-${k.kunci}`" v-model="form[k.kunci].tujuan" type="text" maxlength="100" required />
          <p class="bantuan">
            Halaman di situs ini yang dibuka saat kartu ditekan, contoh <code>/itsupport</code> atau
            <code>/relawan</code>. Alamat luar (<code>https://</code>) tidak diterima. Halaman yang belum dibuat sementara
            membawa pengunjung kembali ke Beranda.
          </p>
        </div>

        <p v-if="status[k.kunci].galat" class="galat" role="alert">{{ status[k.kunci].galat }}</p>
        <p v-if="status[k.kunci].pesan" class="sukses" role="status">{{ status[k.kunci].pesan }}</p>
        <button type="submit" class="simpan" :disabled="status[k.kunci].menyimpan">Simpan perubahan</button>
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
h2 small {
  display: block;
  font-size: 0.8rem;
  font-weight: 400;
  color: #6b7686;
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
.bantuan {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  color: #6b7686;
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
}
</style>