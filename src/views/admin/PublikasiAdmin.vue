<script setup>
import PengelolaDaftar from '../../components/admin/PengelolaDaftar.vue'

const kolom = [
  { kunci: 'jurnalNama', label: 'Nama jurnal', tipe: 'teks', maks: 200 },
  { kunci: 'judulArtikel', label: 'Judul artikel', tipe: 'teks', maks: 400 },
  { kunci: 'link', label: 'Tautan', tipe: 'teks', maks: 500, bantuan: 'Harus diawali https://' },
]
const judul = (i) => i.jurnalNama
const subjudul = (i) => i.judulArtikel
</script>

<template>
  <section>
    <h1>Publikasi</h1>
    <p class="ket">Empat publikasi pertama tampil di Beranda. Sisanya muncul lewat tombol "Lihat Selengkapnya".</p>
    <PengelolaDaftar
      endpoint="/api/admin/publikasi"
      :kolom="kolom"
      :bentuk-kosong="{ jurnalNama: '', judulArtikel: '', link: '' }"
      :judul-item="judul"
      :subjudul-item="subjudul"
      :batas="50"
      nama-item="publikasi"
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