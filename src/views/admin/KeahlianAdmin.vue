<script setup>
import PengelolaDaftar from '../../components/admin/PengelolaDaftar.vue'

const kolom = [
  { kunci: 'nama', label: 'Nama keahlian', tipe: 'teks', maks: 60 },
  { kunci: 'persen', label: 'Persen (0 sampai 100)', tipe: 'angka', min: 0, maksNilai: 100 },
]
const judul = (i) => i.nama
const subjudul = (i) => `${i.persen}%`
</script>

<template>
  <section>
    <h1>Keahlian</h1>
    <p class="ket">Bar persen di bagian "Keahlian" pada Beranda.</p>
    <PengelolaDaftar
      endpoint="/api/admin/keahlian"
      :kolom="kolom"
      :bentuk-kosong="{ nama: '', persen: 80 }"
      :judul-item="judul"
      :subjudul-item="subjudul"
      :batas="30"
      nama-item="keahlian"
    />
  </section>
</template>

<style scoped>
h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  color: #1f2d3d;
}
.ket {
  margin: 0 0 1.25rem;
  color: #6b7686;
}
</style>