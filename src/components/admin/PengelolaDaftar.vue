<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from '@lucide/vue'
import { api } from '../../api/http'
import IkonDinamis from '../IkonDinamis.vue'
import { useBerandaStore } from '../../stores/beranda'

const props = defineProps({
  endpoint: { type: String, required: true },
  // tipe: 'teks' | 'angka' | 'pilihan' | 'ikon' | 'cek'
  kolom: { type: Array, required: true },
  bentukKosong: { type: Object, required: true },
  judulItem: { type: Function, required: true },
  subjudulItem: { type: Function, default: () => '' },
  ikonItem: { type: Function, default: null },
  batas: { type: Number, required: true },
  namaItem: { type: String, default: 'item' },
})

const beranda = useBerandaStore()
const daftar = ref([])
const siap = ref(false)
const galatMuat = ref('')
const galat = ref('')
const pesan = ref('')
const mode = ref(null) // null | 'baru' | id item yang sedang diubah
const form = reactive({})
const menyimpan = ref(false)
const bekerja = ref(false)
const kotakForm = ref(null)

const penuh = computed(() => daftar.value.length >= props.batas)

async function muat() {
  galatMuat.value = ''
  try {
    daftar.value = await api(props.endpoint)
    siap.value = true
  } catch (e) {
    galatMuat.value = e.message
  }
}
onMounted(muat)

// Beranda publik dimuat ulang dari server saat dibuka berikutnya
const berubah = () => (beranda.data = null)

function isiForm(sumber) {
  for (const k of props.kolom) form[k.kunci] = sumber[k.kunci]
}
async function bukaForm(nilaiMode, sumber) {
  galat.value = ''
  pesan.value = ''
  isiForm(sumber)
  mode.value = nilaiMode
  await nextTick()
  kotakForm.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
const tambah = () => bukaForm('baru', props.bentukKosong)
const ubah = (item) => bukaForm(item.id, item)
function batal() {
  mode.value = null
  galat.value = ''
}

function badan() {
  const hasil = {}
  for (const k of props.kolom) hasil[k.kunci] = form[k.kunci]
  return hasil
}

async function simpan() {
  galat.value = ''
  pesan.value = ''
  menyimpan.value = true
  try {
    if (mode.value === 'baru') {
      const baru = await api(props.endpoint, { method: 'POST', body: badan() })
      daftar.value.push(baru)
    } else {
      const baru = await api(`${props.endpoint}/${mode.value}`, { method: 'PUT', body: badan() })
      daftar.value = daftar.value.map((d) => (d.id === baru.id ? baru : d))
    }
    berubah()
    mode.value = null
    pesan.value = 'Tersimpan.'
  } catch (e) {
    galat.value = e.message
  } finally {
    menyimpan.value = false
  }
}

async function hapus(item) {
  if (!window.confirm(`Hapus "${props.judulItem(item)}"?`)) return
  galat.value = ''
  pesan.value = ''
  bekerja.value = true
  try {
    await api(`${props.endpoint}/${item.id}`, { method: 'DELETE' })
    daftar.value = daftar.value.filter((d) => d.id !== item.id)
    if (mode.value === item.id) mode.value = null
    berubah()
  } catch (e) {
    galat.value = e.message
  } finally {
    bekerja.value = false
  }
}

async function geser(indeks, arah) {
  const tujuan = indeks + arah
  if (tujuan < 0 || tujuan >= daftar.value.length) return
  const asal = [...daftar.value]
  const salinan = [...asal]
  ;[salinan[indeks], salinan[tujuan]] = [salinan[tujuan], salinan[indeks]]
  daftar.value = salinan
  galat.value = ''
  pesan.value = ''
  bekerja.value = true
  try {
    await api(`${props.endpoint}/urut`, {
      method: 'POST',
      body: { ids: salinan.map((d) => d.id) },
      loading: false,
    })
    berubah()
  } catch (e) {
    daftar.value = asal // kembalikan urutan semula bila server menolak
    galat.value = e.message
  } finally {
    bekerja.value = false
  }
}
</script>

<template>
  <div>
    <p v-if="galatMuat && !siap" class="galat">
      {{ galatMuat }} <button type="button" @click="muat">Coba lagi</button>
    </p>

    <template v-if="siap">
      <div class="atas">
        <span class="hitung">{{ daftar.length }} dari maksimal {{ batas }} {{ namaItem }}</span>
        <button type="button" class="tambah" :disabled="penuh || mode !== null" @click="tambah">
          <Plus :size="16" aria-hidden="true" /> Tambah
        </button>
      </div>

      <p v-if="pesan" class="sukses" role="status">{{ pesan }}</p>
      <p v-if="galat && mode === null" class="galat" role="alert">{{ galat }}</p>

      <form v-if="mode !== null" ref="kotakForm" class="form" @submit.prevent="simpan">
        <h2>{{ mode === 'baru' ? `Tambah ${namaItem}` : `Ubah ${namaItem}` }}</h2>

        <div v-for="k in kolom" :key="k.kunci" class="ruas">
          <label v-if="k.tipe === 'cek'" class="cek">
            <input v-model="form[k.kunci]" type="checkbox" /> {{ k.label }}
          </label>
          <template v-else>
            <label :for="`f-${k.kunci}`">{{ k.label }}</label>
            <div class="kontrol">
              <select v-if="k.tipe === 'pilihan' || k.tipe === 'ikon'" :id="`f-${k.kunci}`" v-model="form[k.kunci]" required>
                <option v-for="o in k.opsi" :key="o.nilai" :value="o.nilai">{{ o.label }}</option>
              </select>
              <input
                v-else-if="k.tipe === 'angka'"
                :id="`f-${k.kunci}`"
                v-model.number="form[k.kunci]"
                type="number"
                :min="k.min"
                :max="k.maksNilai"
                step="1"
                required
              />
              <input v-else :id="`f-${k.kunci}`" v-model="form[k.kunci]" type="text" :maxlength="k.maks" required />
              <span v-if="k.tipe === 'ikon' && form[k.kunci]" class="pratinjau">
                <IkonDinamis :nama="form[k.kunci]" ukuran="1.6rem" />
              </span>
            </div>
            <p v-if="k.bantuan" class="bantuan">{{ k.bantuan }}</p>
          </template>
        </div>

        <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
        <div class="aksi-form">
          <button type="submit" class="simpan" :disabled="menyimpan">Simpan</button>
          <button type="button" class="batal" :disabled="menyimpan" @click="batal">Batal</button>
        </div>
      </form>

      <p v-if="!daftar.length" class="kosong">Belum ada data.</p>
      <ul class="daftar">
        <li v-for="(item, i) in daftar" :key="item.id" class="butir" :class="{ sedang: mode === item.id }">
          <span v-if="ikonItem" class="ikon"><IkonDinamis :nama="ikonItem(item)" ukuran="1.4rem" /></span>
          <div class="teks">
            <strong>{{ judulItem(item) }}</strong>
            <span>{{ subjudulItem(item) }}</span>
          </div>
          <div class="aksi">
            <button type="button" :disabled="i === 0 || bekerja" aria-label="Naikkan" @click="geser(i, -1)">
              <ArrowUp :size="16" aria-hidden="true" />
            </button>
            <button type="button" :disabled="i === daftar.length - 1 || bekerja" aria-label="Turunkan" @click="geser(i, 1)">
              <ArrowDown :size="16" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Ubah" @click="ubah(item)">
              <Pencil :size="16" aria-hidden="true" />
            </button>
            <button type="button" class="bahaya" :disabled="bekerja" aria-label="Hapus" @click="hapus(item)">
              <Trash2 :size="16" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px. */
.atas {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.hitung {
  font-size: 0.85rem;
  color: #6b7686;
}
.tambah,
.simpan,
.batal {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  background: #2e87f6;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.batal {
  color: #555;
  background: #e8ecf2;
}
.tambah:disabled,
.simpan:disabled,
.batal:disabled {
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
.kosong {
  color: #98a2b3;
}

.form {
  max-width: 40rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  scroll-margin-top: 4.5rem;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 12px;
}
.form h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #1f2d3d;
}
.ruas {
  margin-bottom: 1rem;
}
.ruas label {
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2d3d;
}
.kontrol {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.ruas input[type='text'],
.ruas input[type='number'],
.ruas select {
  width: 100%;
  min-width: 0;
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
.cek {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500 !important;
}
.pratinjau {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  color: #2e87f6;
  background: #eef4fd;
  border-radius: 8px;
}
.bantuan {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  color: #6b7686;
}
.aksi-form {
  display: flex;
  gap: 0.5rem;
}

.daftar {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 40rem;
  padding: 0;
  margin: 0;
  list-style: none;
}
.butir {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.8rem;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 10px;
}
.butir.sedang {
  border-color: #2e87f6;
  box-shadow: 0 0 0 2px rgba(46, 135, 246, 0.15);
}
.ikon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  color: #2e87f6;
  background: #eef4fd;
  border-radius: 8px;
}
.teks {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.teks strong {
  overflow: hidden;
  font-size: 0.92rem;
  color: #1f2d3d;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.teks span {
  overflow: hidden;
  font-size: 0.78rem;
  color: #6b7686;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.aksi {
  display: flex;
  flex-shrink: 0;
  gap: 0.2rem;
}
.aksi button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: #4a5568;
  background: #f1f4f9;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
.aksi button:hover:not(:disabled) {
  background: #e1e8f2;
}
.aksi button:disabled {
  opacity: 0.35;
  cursor: default;
}
.aksi .bahaya {
  color: #d63b3b;
}

@media (min-width: 641px) {
  .form {
    padding: 1.5rem;
  }
  .butir {
    padding: 0.8rem 1rem;
  }
  .aksi button {
    width: 34px;
    height: 34px;
  }
}
</style>