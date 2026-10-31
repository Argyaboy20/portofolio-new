<script setup>
import { computed, ref } from 'vue'
import { ExternalLink, Trash2, Upload } from '@lucide/vue'
import { api } from '../../api/http'

const props = defineProps({
  label: { type: String, required: true },
  accept: { type: String, required: true }, // contoh: "image/jpeg,image/png,image/webp"
  maksMb: { type: Number, default: 8 },
  url: { type: String, default: null }, // alamat berkas saat ini
  jenis: { type: String, default: 'gambar' }, // 'gambar' atau 'pdf'
  endpoint: { type: String, required: true }, // POST unggah dan DELETE hapus
  bulat: { type: Boolean, default: false },
  bantuan: { type: String, default: '' },
})
const emit = defineEmits(['berubah'])

const galat = ref('')
const sibuk = ref(false)
const tipeBoleh = computed(() => props.accept.split(',').map((s) => s.trim()))

async function dipilih(event) {
  const berkas = event.target.files?.[0]
  event.target.value = '' // supaya berkas yang sama bisa dipilih lagi
  if (!berkas) return
  galat.value = ''
  if (!tipeBoleh.value.includes(berkas.type)) {
    galat.value = props.jenis === 'pdf' ? 'Berkas harus PDF.' : 'Berkas harus gambar JPEG, PNG, atau WebP.'
    return
  }
  if (berkas.size > props.maksMb * 1024 * 1024) {
    galat.value = `Ukuran berkas maksimal ${props.maksMb} MB.`
    return
  }
  const form = new FormData()
  form.append('berkas', berkas)
  sibuk.value = true
  try {
    const data = await api(props.endpoint, { method: 'POST', body: form, pesan: 'Mengunggah berkas...' })
    emit('berubah', Object.values(data ?? {})[0] ?? null)
  } catch (e) {
    galat.value = e.message
  } finally {
    sibuk.value = false
  }
}

async function hapus() {
  if (!window.confirm('Hapus berkas ini?')) return
  galat.value = ''
  sibuk.value = true
  try {
    await api(props.endpoint, { method: 'DELETE', pesan: 'Menghapus berkas...' })
    emit('berubah', null)
  } catch (e) {
    galat.value = e.message
  } finally {
    sibuk.value = false
  }
}
</script>

<template>
  <div class="unggah">
    <p class="judul">{{ label }}</p>
    <p v-if="bantuan" class="bantuan">{{ bantuan }}</p>

    <div v-if="url" class="saat-ini">
      <img v-if="jenis === 'gambar'" :src="url" alt="Pratinjau" :class="{ bulat }" />
      <a v-else :href="url" target="_blank" rel="noopener noreferrer" class="buka">
        <ExternalLink :size="16" aria-hidden="true" /> Buka berkas
      </a>
    </div>
    <p v-else class="kosong">Belum ada berkas.</p>

    <div class="aksi">
      <label class="tombol" :class="{ mati: sibuk }">
        <Upload :size="16" aria-hidden="true" />
        {{ url ? 'Ganti' : 'Pilih berkas' }}
        <input type="file" :accept="accept" :disabled="sibuk" @change="dipilih" />
      </label>
      <button v-if="url" type="button" class="tombol bahaya" :disabled="sibuk" @click="hapus">
        <Trash2 :size="16" aria-hidden="true" /> Hapus
      </button>
    </div>
    <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST) */
.unggah {
  min-width: 0;
}
.judul {
  margin: 0 0 0.3rem;
  font-weight: 600;
  color: #1f2d3d;
}
.bantuan {
  margin: 0 0 0.6rem;
  font-size: 0.8rem;
  color: #6b7686;
}
.saat-ini {
  margin-bottom: 0.75rem;
}
.saat-ini img {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: cover;
  background: #e8ecf2;
  border: 1px solid #cfd6e0;
  border-radius: 10px;
}
.saat-ini img.bulat {
  border-radius: 50%;
}
.buka {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #2e87f6;
  text-decoration: none;
}
.kosong {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: #98a2b3;
}
.aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tombol {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: #2e87f6;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.tombol input {
  display: none;
}
.tombol.mati,
.tombol:disabled {
  opacity: 0.55;
  cursor: default;
}
.tombol.bahaya {
  background: #d63b3b;
}
.galat {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #d63b3b;
}
</style>