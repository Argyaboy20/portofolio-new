<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useLoadingStore } from '../stores/loading'

const loading = useLoadingStore()
const lama = ref(false)
let timer = null

watch(
  () => loading.tampil,
  (aktif) => {
    clearTimeout(timer)
    lama.value = false
    if (aktif) timer = setTimeout(() => (lama.value = true), 5000)
  },
)

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div v-if="loading.tampil" class="lapisan" role="status" aria-live="polite">
    <div class="kotak">
      <div class="putar"></div>
      <p class="pesan">{{ loading.pesan }}</p>
      <p v-if="lama" class="catatan">Server sedang bangun dari mode tidur, mohon tunggu sebentar...</p>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px. */
.lapisan {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.6);
}
.kotak {
  width: 100%;
  max-width: 18rem;
  padding: 1.25rem;
  text-align: center;
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 0.75rem;
}
.putar {
  width: 2rem;
  height: 2rem;
  margin: 0 auto 0.75rem;
  border: 3px solid #333;
  border-top-color: #2e87f6;
  border-radius: 50%;
  animation: putar 0.8s linear infinite;
}
.pesan {
  margin: 0;
  font-size: 0.95rem;
}
.catatan {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #b5b5b5;
}
@keyframes putar {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .putar {
    animation-duration: 2.4s;
  }
}

@media (min-width: 641px) {
  .kotak {
    padding: 1.75rem;
  }
}
</style>