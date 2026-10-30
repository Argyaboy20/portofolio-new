<script setup>
import { RouterLink } from 'vue-router'
import { useBahasaStore } from '../stores/bahasa'

const bahasa = useBahasaStore()
</script>

<template>
  <header class="navbar">
    <div class="isi">
      <RouterLink to="/" class="judul">
        <span class="p">Maulana Farras</span><span class="s"> Blog's</span>
      </RouterLink>
      <div class="aksi">
        <slot name="aksi" />
        <button type="button" class="tautan" @click="bahasa.tukar()">{{ bahasa.label }}</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px, 768px. */
.navbar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: #000;
}
.isi {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 3.5rem;
  padding: 0 0.75rem;
}
.judul {
  min-width: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-decoration: none;
  white-space: nowrap;
}
.p {
  color: #4a90e2;
}
.s {
  color: #50e3c2;
}
.aksi {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}
.tautan,
:slotted(.tautan) {
  padding: 0.4rem 0.4rem;
  font: inherit;
  font-size: 0.68rem;
  font-weight: 500;
  color: #4a90e2;
  text-decoration: none;
  text-transform: uppercase;
  background: none;
  border: 0;
  cursor: pointer;
}
.tautan:hover,
:slotted(.tautan:hover) {
  color: #50e3c2;
}

@media (min-width: 641px) {
  .isi {
    padding: 0 1.5rem;
  }
  .judul {
    position: absolute;
    left: 50%;
    font-size: 0.9rem;
    transform: translateX(-50%);
  }
  .tautan,
  :slotted(.tautan) {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }
}

@media (min-width: 768px) {
  .judul {
    font-size: 1rem;
  }
  .tautan,
  :slotted(.tautan) {
    font-size: 0.8rem;
  }
}
</style>