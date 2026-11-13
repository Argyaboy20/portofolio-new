<script setup>
import { RefreshCw, X } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'

const emit = defineEmits(['tutup'])
const bahasa = useBahasaStore()

function muatUlang() {
  window.location.reload()
}
</script>

<template>
  <div class="banner" role="status">
    <RefreshCw :size="18" aria-hidden="true" />
    <span class="teks">{{ bahasa.pilih('Versi baru tersedia', 'New version available') }}</span>
    <button type="button" class="muat" @click="muatUlang">
      {{ bahasa.pilih('Muat ulang', 'Reload') }}
    </button>
    <button
      type="button"
      class="tutup"
      :aria-label="bahasa.pilih('Tutup', 'Close')"
      @click="emit('tutup')"
    >
      <X :size="16" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px): pil melebar hampir penuh. Override: 641px ke atas ukuran mengikuti isi. */
.banner {
  position: fixed;
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  z-index: 2500;
  display: flex;
  gap: 0.6rem;
  align-items: center;
  width: calc(100% - 24px);
  max-width: 420px;
  padding: 0.55rem 0.6rem 0.55rem 1rem;
  font-size: 0.88rem;
  color: #fff;
  background: rgba(20, 30, 55, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  transform: translateX(-50%);
  animation: naik 0.35s ease-out;
}
.teks {
  flex: 1;
  min-width: 0;
  font-weight: 600;
}
.muat {
  padding: 0.4rem 0.9rem;
  font: inherit;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: #4a90e2;
  border: 0;
  border-radius: 999px;
}
.muat:hover {
  filter: brightness(1.1);
}
.tutup {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.14);
  border: 0;
  border-radius: 50%;
}
@keyframes naik {
  from {
    opacity: 0;
    transform: translate(-50%, 12px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .banner {
    animation: none;
  }
}
@media (min-width: 641px) {
  .banner {
    width: auto;
    min-width: 340px;
  }
}
</style>
