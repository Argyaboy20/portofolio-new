<script setup>
import { Plus, X } from '@lucide/vue'

const props = defineProps({
  label: { type: String, required: true },
  maks: { type: Number, default: 6 },
  panjang: { type: Number, default: 40 }, // batas karakter per teks
})
const daftar = defineModel({ type: Array, default: () => [] })

function ubah(i, nilai) {
  const salinan = [...daftar.value]
  salinan[i] = nilai
  daftar.value = salinan
}
function hapus(i) {
  daftar.value = daftar.value.filter((_, k) => k !== i)
}
function tambah() {
  if (daftar.value.length < props.maks) daftar.value = [...daftar.value, '']
}
</script>

<template>
  <div class="teks">
    <div class="kepala">
      <span class="judul">{{ label }}</span>
      <span class="hitung">{{ daftar.length }}/{{ maks }}</span>
    </div>
    <div v-for="(t, i) in daftar" :key="i" class="baris">
      <input
        :value="t"
        type="text"
        :maxlength="panjang"
        required
        :aria-label="`${label} ${i + 1}`"
        @input="ubah(i, $event.target.value)"
      />
      <button type="button" :aria-label="`Hapus ${label.toLowerCase()} ${i + 1}`" @click="hapus(i)">
        <X :size="16" aria-hidden="true" />
      </button>
    </div>
    <button type="button" class="tambah" :disabled="daftar.length >= maks" @click="tambah">
      <Plus :size="14" aria-hidden="true" /> Tambah {{ label.toLowerCase() }}
    </button>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST) */
.teks {
  min-width: 0;
  margin-bottom: 1rem;
}
.kepala {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}
.judul {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2d3d;
}
.hitung {
  font-size: 0.75rem;
  color: #98a2b3;
}
.baris {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
}
input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0.7rem;
  font: inherit;
  font-size: 0.9rem;
  color: #222;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
}
input:focus {
  border-color: #4a90e2;
  outline: none;
}
.baris button {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  color: #d63b3b;
  background: #e8edf5;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
.tambah {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  font: inherit;
  font-size: 0.8rem;
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
</style>