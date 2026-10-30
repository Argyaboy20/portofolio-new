<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useBahasaStore } from '../stores/bahasa'
import { pecahTeks, tautanEksternal } from '../utils/teks'

const props = defineProps({ profil: { type: Object, required: true } })
const bahasa = useBahasaStore()

const paragraf1 = computed(() => pecahTeks(bahasa.pilih(props.profil.ringkasan1Id, props.profil.ringkasan1En)))
const paragraf2 = computed(() => pecahTeks(bahasa.pilih(props.profil.ringkasan2Id, props.profil.ringkasan2En)))
</script>

<template>
  <div class="ringkas">
    <p v-for="(daftar, n) in [paragraf1, paragraf2]" :key="n">
      <template v-for="(s, i) in daftar" :key="i">
        <a
          v-if="s.tujuan && tautanEksternal(s.tujuan)"
          :href="s.tujuan"
          class="tautan"
          target="_blank"
          rel="noopener noreferrer"
          ><strong>{{ s.teks }}</strong></a
        >
        <RouterLink v-else-if="s.tujuan" :to="s.tujuan" class="tautan"
          ><strong>{{ s.teks }}</strong></RouterLink
        >
        <template v-else>{{ s.teks }}</template>
      </template>
    </p>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST) */
.ringkas p {
  margin: 0 0 1rem;
  text-align: justify;
}
.tautan {
  color: #4a90e2;
  text-decoration: none;
  cursor: pointer;
}
.tautan:hover {
  color: #3a7bc8;
}
</style>