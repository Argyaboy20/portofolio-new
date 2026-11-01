<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import IkonDinamis from './IkonDinamis.vue'
import { useBahasaStore } from '../stores/bahasa'

const BATAS_AWAL = 20

const props = defineProps({
  tools: { type: Array, required: true },
  filter: { type: String, default: 'all' },
})

const bahasa = useBahasaStore()
const semua = ref(false)
const tombol = ref(null)

const tampil = computed(() =>
  props.filter === 'all' ? props.tools : props.tools.filter((t) => t.kategori === props.filter),
)
// Default hanya 20 tool; sisanya muncul setelah tombol ditekan
const terlihat = computed(() => (semua.value ? tampil.value : tampil.value.slice(0, BATAS_AWAL)))
const adaLebih = computed(() => tampil.value.length > BATAS_AWAL)

// Ganti filter: daftar kembali terlipat
watch(
  () => props.filter,
  () => {
    semua.value = false
  },
)

async function ubah() {
  semua.value = !semua.value
  if (!semua.value) {
    // Setelah dilipat, jaga tombol tetap di layar supaya tidak terlempar jauh ke bawah
    await nextTick()
    const kurangGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    tombol.value?.scrollIntoView({ block: 'center', behavior: kurangGerak ? 'auto' : 'smooth' })
  }
}
</script>

<template>
  <div>
    <div class="wadah">
      <div v-for="t in terlihat" :key="t.id" class="alat">
        <div class="ikon"><IkonDinamis :nama="t.ikon" ukuran="1.3rem" /></div>
        <span class="nama">{{ t.nama }}</span>
        <span class="level">{{ t.level }}</span>
      </div>
    </div>

    <div v-if="adaLebih" class="lebih">
      <button ref="tombol" type="button" class="tombol-lebih" :aria-expanded="semua" @click="ubah">
        {{ semua ? bahasa.pilih('Lihat lebih sedikit', 'See less') : bahasa.pilih('Lihat selengkapnya', 'See more') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px, 768px, 1024px. */
.wadah {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  margin-top: 1rem;
}
.alat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.8rem 0.5rem;
  text-align: center;
  background: linear-gradient(145deg, #fff, #f5f7fa);
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.alat:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(74, 144, 226, 0.1);
}
.ikon {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  margin-bottom: 0.6rem;
  color: #4a90e2;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 12px;
  transition: background 0.3s ease, color 0.3s ease;
}
.alat:hover .ikon {
  color: #fff;
  background: linear-gradient(135deg, #4a90e2, #50e3c2);
}
.nama {
  margin-bottom: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2c3e50;
  word-break: break-word;
}
.level {
  padding: 0.15rem 0.5rem;
  font-size: 0.7rem;
  color: #4a90e2;
  background: rgba(80, 227, 194, 0.1);
  border-radius: 12px;
}
.lebih {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}
.tombol-lebih {
  padding: 0.6rem 1.6rem;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a90e2;
  background: transparent;
  border: 2px solid #4a90e2;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}
.tombol-lebih:hover,
.tombol-lebih:focus-visible {
  color: #fff;
  background: #4a90e2;
}
@media (prefers-reduced-motion: reduce) {
  .alat,
  .ikon {
    transition: none;
  }
  .tombol-lebih {
    transition: none;
  }
}

@media (min-width: 641px) {
  .wadah {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 1rem;
  }
  .alat {
    padding: 1rem 0.6rem;
  }
  .ikon {
    width: 40px;
    height: 40px;
  }
  .nama {
    font-size: 0.8rem;
  }
}

@media (min-width: 768px) {
  .wadah {
    grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
    gap: 1.2rem;
  }
  .alat {
    padding: 1.1rem 0.7rem;
  }
  .ikon {
    width: 46px;
    height: 46px;
  }
  .nama {
    font-size: 0.85rem;
  }
  .level {
    padding: 0.2rem 0.6rem;
    font-size: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .wadah {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1.5rem;
  }
  .alat {
    padding: 1.2rem 0.8rem;
  }
  .ikon {
    width: 50px;
    height: 50px;
    margin-bottom: 0.8rem;
  }
  .nama {
    font-size: 0.9rem;
  }
}
</style>