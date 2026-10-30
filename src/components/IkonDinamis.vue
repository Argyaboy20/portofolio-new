<script setup>
import { computed } from 'vue'
import { cariIkon } from '../utils/ikon'

const props = defineProps({
  nama: { type: String, required: true },
  ukuran: { type: [String, Number], default: '1em' },
})

const ikon = computed(() => cariIkon(props.nama))
</script>

<template>
  <svg
    v-if="ikon.jenis === 'merek'"
    viewBox="0 0 24 24"
    :width="ukuran"
    :height="ukuran"
    fill="currentColor"
    aria-hidden="true"
  >
    <path :d="ikon.data.path" />
  </svg>

  <!-- LinkedIn: gambar sederhana buatan sendiri (kotak dengan huruf "in") -->
  <svg
    v-else-if="ikon.jenis === 'linkedin'"
    viewBox="0 0 24 24"
    :width="ukuran"
    :height="ukuran"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM7.2 9.5H4.8V19h2.4V9.5ZM6 5.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM10 9.5V19h2.4v-4.9c0-1.3.6-2.1 1.6-2.1s1.4.7 1.4 2V19h2.4v-5.4c0-2.4-1.3-3.8-3.2-3.8-1.1 0-1.9.5-2.2 1.1V9.5H10Z"
    />
  </svg>

  <component :is="ikon.komponen" v-else :size="ukuran" aria-hidden="true" />
</template>