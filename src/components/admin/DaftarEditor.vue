<script setup>
import { ChevronDown, ChevronUp, Plus, Trash2 } from '@lucide/vue'

const props = defineProps({
  label: { type: String, required: true },
  namaItem: { type: String, default: 'Item' },
  buat: { type: Function, required: true }, // mengembalikan item kosong baru
  min: { type: Number, default: 1 },
  maks: { type: Number, default: 10 },
})
const daftar = defineModel({ type: Array, default: () => [] })

function tambah() {
  if (daftar.value.length >= props.maks) return
  daftar.value = [...daftar.value, props.buat()]
}
function hapus(i) {
  if (daftar.value.length <= props.min) return
  daftar.value = daftar.value.filter((_, k) => k !== i)
}
function geser(i, arah) {
  const j = i + arah
  if (j < 0 || j >= daftar.value.length) return
  const salinan = [...daftar.value]
  ;[salinan[i], salinan[j]] = [salinan[j], salinan[i]]
  daftar.value = salinan
}
</script>

<template>
  <div class="editor">
    <div class="kepala">
      <span class="judul">{{ label }}</span>
      <span class="hitung">{{ daftar.length }} dari maksimal {{ maks }}</span>
    </div>

    <ol class="daftar">
      <li v-for="(item, i) in daftar" :key="i" class="butir">
        <div class="atas">
          <strong>{{ namaItem }} {{ i + 1 }}</strong>
          <div class="aksi">
            <button type="button" :disabled="i === 0" aria-label="Naikkan" @click="geser(i, -1)">
              <ChevronUp :size="16" aria-hidden="true" />
            </button>
            <button type="button" :disabled="i === daftar.length - 1" aria-label="Turunkan" @click="geser(i, 1)">
              <ChevronDown :size="16" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="bahaya"
              :disabled="daftar.length <= min"
              aria-label="Hapus"
              @click="hapus(i)"
            >
              <Trash2 :size="16" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div class="isi">
          <slot :item="item" :index="i" />
        </div>
      </li>
    </ol>

    <button type="button" class="tambah" :disabled="daftar.length >= maks" @click="tambah">
      <Plus :size="16" aria-hidden="true" /> Tambah {{ namaItem.toLowerCase() }}
    </button>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST) */
.editor {
  min-width: 0;
  margin-bottom: 1.25rem;
}
.kepala {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.judul {
  font-weight: 600;
  color: #1f2d3d;
}
.hitung {
  font-size: 0.8rem;
  color: #6b7686;
}
.daftar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  margin: 0 0 0.75rem;
  list-style: none;
}
.butir {
  padding: 0.75rem;
  background: #f7f9fc;
  border: 1px solid #e3e7ee;
  border-radius: 10px;
}
.atas {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #1f2d3d;
}
.aksi {
  display: flex;
  gap: 0.2rem;
}
.aksi button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: #4a5568;
  background: #e8edf5;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
.aksi button:hover:not(:disabled) {
  background: #dde5f0;
}
.aksi button:disabled {
  opacity: 0.35;
  cursor: default;
}
.aksi .bahaya {
  color: #d63b3b;
}
.isi {
  min-width: 0;
}
.tambah {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2e87f6;
  background: #fff;
  border: 1px solid #2e87f6;
  border-radius: 8px;
  cursor: pointer;
}
.tambah:disabled {
  opacity: 0.45;
  cursor: default;
}

@media (min-width: 641px) {
  .butir {
    padding: 1rem;
  }
}
</style>