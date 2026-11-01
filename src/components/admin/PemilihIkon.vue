<script setup>
import { computed, useId } from 'vue'
import { DAFTAR_IKON, IKON_HALAMAN } from '../../utils/ikonHalaman'

defineProps({ label: { type: String, default: 'Ikon' } })
const model = defineModel({ type: String, default: 'cpu' })
const uid = useId()
const Ikon = computed(() => IKON_HALAMAN[model.value] ?? null)
</script>

<template>
  <div class="ruas">
    <label :for="uid">{{ label }}</label>
    <div class="baris">
      <span class="pratinjau"><component :is="Ikon" v-if="Ikon" :size="20" aria-hidden="true" /></span>
      <select :id="uid" v-model="model">
        <option v-for="i in DAFTAR_IKON" :key="i" :value="i">{{ i }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST) */
.ruas {
  min-width: 0;
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2d3d;
}
.baris {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.pratinjau {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 40px;
  height: 40px;
  color: #2e87f6;
  background: #eaf3ff;
  border-radius: 8px;
}
select {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.7rem;
  font: inherit;
  font-size: 0.95rem;
  color: #222;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
}
select:focus {
  border-color: #4a90e2;
  outline: none;
}
</style>