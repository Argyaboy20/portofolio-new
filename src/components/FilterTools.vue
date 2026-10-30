<script setup>
import { useBahasaStore } from '../stores/bahasa'

const model = defineModel({ type: String, default: 'all' })
const bahasa = useBahasaStore()

const opsi = [
  { kunci: 'all', id: 'Semua', en: 'All' },
  { kunci: 'programmer', id: 'Programmer', en: 'Programmer' },
  { kunci: 'data-analyst', id: 'Data Analyst', en: 'Data Analyst' },
]
</script>

<template>
  <div class="filter" role="group" :aria-label="bahasa.pilih('Filter alat', 'Filter tools')">
    <button
      v-for="o in opsi"
      :key="o.kunci"
      type="button"
      class="tombol"
      :class="{ aktif: model === o.kunci }"
      :aria-pressed="model === o.kunci"
      @click="model = o.kunci"
    >
      {{ bahasa.pilih(o.id, o.en) }}
    </button>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px, 768px. */
.filter {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.1rem;
}
.tombol {
  padding: 0.3rem 0.3rem;
  font: inherit;
  font-size: 0.62rem;
  font-weight: 500;
  color: #4a90e2;
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
}
.tombol:hover {
  color: #50e3c2;
}
.tombol.aktif {
  font-weight: 700;
  color: #50e3c2;
  border-bottom-color: #50e3c2;
}

@media (min-width: 641px) {
  .filter {
    gap: 0.25rem;
  }
  .tombol {
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }
}

@media (min-width: 768px) {
  .tombol {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
}
</style>