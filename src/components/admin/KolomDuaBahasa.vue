<script setup>
import { useId } from 'vue'

defineProps({
  label: { type: String, required: true },
  maks: { type: Number, default: 150 },
  baris: { type: Number, default: 0 }, // 0 = satu baris; >0 = kotak teks panjang
  bantuan: { type: String, default: '' },
})

const id = defineModel('id', { type: String, default: '' })
const en = defineModel('en', { type: String, default: '' })
const uid = useId()
</script>

<template>
  <fieldset class="kolom">
    <legend>{{ label }}</legend>
    <p v-if="bantuan" class="bantuan">{{ bantuan }}</p>
    <div class="dua">
      <div class="sisi">
        <label :for="`${uid}-id`">Indonesia (ID)</label>
        <textarea v-if="baris" :id="`${uid}-id`" v-model="id" :rows="baris" :maxlength="maks" required></textarea>
        <input v-else :id="`${uid}-id`" v-model="id" type="text" :maxlength="maks" required />
        <span class="hitung">{{ id.length }}/{{ maks }}</span>
      </div>
      <div class="sisi">
        <label :for="`${uid}-en`">English (EN)</label>
        <textarea v-if="baris" :id="`${uid}-en`" v-model="en" :rows="baris" :maxlength="maks" required></textarea>
        <input v-else :id="`${uid}-en`" v-model="en" type="text" :maxlength="maks" required />
        <span class="hitung">{{ en.length }}/{{ maks }}</span>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px): ID dan EN bertumpuk. Berdampingan mulai 768px. */
.kolom {
  min-width: 0;
  margin: 0 0 1.25rem;
  padding: 0;
  border: 0;
}
legend {
  padding: 0;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #1f2d3d;
}
.bantuan {
  margin: 0 0 0.6rem;
  font-size: 0.8rem;
  color: #6b7686;
}
.dua {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
.sisi {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}
label {
  font-size: 0.8rem;
  color: #6b7686;
}
input,
textarea {
  width: 100%;
  padding: 0.6rem 0.7rem;
  font: inherit;
  font-size: 0.95rem;
  color: #222;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
}
textarea {
  resize: vertical;
  line-height: 1.5;
}
input:focus,
textarea:focus {
  border-color: #4a90e2;
  outline: none;
}
.hitung {
  align-self: flex-end;
  font-size: 0.7rem;
  color: #98a2b3;
}

@media (min-width: 768px) {
  .dua {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}
</style>