<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../../api/http'
import KolomDuaBahasa from '../../components/admin/KolomDuaBahasa.vue'
import UnggahBerkas from '../../components/admin/UnggahBerkas.vue'
import DaftarEditor from '../../components/admin/DaftarEditor.vue'

const PATH = '/api/admin/halaman/aboutme'

const konten = ref(null)
const foto = ref(null)
const siap = ref(false)
const galatMuat = ref('')
const galat = ref('')
const pesan = ref('')
const menyimpan = ref(false)

const paragrafBaru = () => ({ id: '', en: '' })

async function muat() {
  galatMuat.value = ''
  try {
    const d = await api(PATH)
    if (!d.konten) {
      galatMuat.value = 'Isi halaman belum ada di database.'
      return
    }
    konten.value = d.konten
    foto.value = d.gambar?.foto ?? null
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}
onMounted(muat)

async function simpan() {
  galat.value = ''
  pesan.value = ''
  menyimpan.value = true
  try {
    const d = await api(PATH, { method: 'PUT', body: konten.value })
    konten.value = d.konten
    pesan.value = 'Tersimpan.'
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}
</script>

<template>
  <section>
    <h1>Tentang Saya</h1>
    <p class="ket">
      Isi halaman <code>/aboutme</code>. Semua teks wajib ada dalam bahasa Indonesia dan Inggris.
    </p>

    <p v-if="galatMuat && !siap" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="kartu">
        <h2>Foto profil</h2>
        <UnggahBerkas
          label="Foto"
          accept="image/jpeg,image/png,image/webp"
          :maks-mb="8"
          :url="foto"
          :endpoint="`${PATH}/gambar/foto`"
          bantuan="JPEG, PNG, atau WebP, maksimal 8 MB. Tampil bulat di bagian atas halaman. Disimpan langsung, tidak perlu menekan Simpan."
          @berubah="(url) => (foto = url)"
        />
      </div>

      <form @submit.prevent="simpan">
        <div class="kartu">
          <h2>Judul dan sapaan</h2>
          <KolomDuaBahasa
            label="Judul"
            v-model:id="konten.judul.id"
            v-model:en="konten.judul.en"
            :maks="60"
          />
          <KolomDuaBahasa
            label="Sapaan"
            v-model:id="konten.sapaan.id"
            v-model:en="konten.sapaan.en"
            :maks="60"
          />
        </div>

        <div class="kartu">
          <h2>Paragraf</h2>
          <p class="bantuan">Paragraf pertama tampil lebih besar sebagai pembuka.</p>
          <DaftarEditor
            v-model="konten.paragraf"
            label="Paragraf"
            nama-item="Paragraf"
            :buat="paragrafBaru"
            :min="1"
            :maks="8"
          >
            <template #default="{ item }">
              <KolomDuaBahasa
                label="Isi"
                v-model:id="item.id"
                v-model:en="item.en"
                :maks="2500"
                :baris="6"
              />
            </template>
          </DaftarEditor>
        </div>

        <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
        <p v-if="pesan" class="sukses" role="status">{{ pesan }}</p>
        <button type="submit" class="simpan" :disabled="menyimpan">Simpan perubahan</button>
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
.bantuan {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  color: #6b7686;
}
.kartu {
  max-width: 62rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
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
