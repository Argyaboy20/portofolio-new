<script setup>
import { ArrowDown, ArrowUp } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'

const model = defineModel({ type: String, default: 'newest' })
const bahasa = useBahasaStore()
</script>

<template>
  <div class="urut" role="group" :aria-label="bahasa.pilih('Urutkan project', 'Sort projects')">
    <button type="button" class="tombol" :class="{ aktif: model === 'newest' }" :aria-pressed="model === 'newest'" @click="model = 'newest'">
      <ArrowDown :size="14" aria-hidden="true" />
      {{ bahasa.pilih('Terbaru', 'Newest') }}
    </button>
    <button type="button" class="tombol" :class="{ aktif: model === 'oldest' }" :aria-pressed="model === 'oldest'" @click="model = 'oldest'">
      <ArrowUp :size="14" aria-hidden="true" />
      {{ bahasa.pilih('Terlama', 'Oldest') }}
    </button>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px, 768px. */
.urut {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.3rem;
}
.tombol {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0.3rem 0.4rem;
  font: inherit;
  font-size: 0.65rem;
  color: #4a90e2;
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
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
  .tombol {
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }
}

@media (min-width: 768px) {
  .tombol {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
}
</style>