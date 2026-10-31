<script setup>
import PengelolaDaftar from '../../components/admin/PengelolaDaftar.vue'
import { DAFTAR_IKON_TOOL } from '../../utils/ikon'

const kolom = [
  { kunci: 'nama', label: 'Nama', tipe: 'teks', maks: 60 },
  {
    kunci: 'ikon',
    label: 'Ikon',
    tipe: 'ikon',
    opsi: DAFTAR_IKON_TOOL.map((nilai) => ({ nilai, label: nilai })),
  },
  {
    kunci: 'kategori',
    label: 'Kategori',
    tipe: 'pilihan',
    opsi: [
      { nilai: 'programmer', label: 'Programmer' },
      { nilai: 'data-analyst', label: 'Data Analyst' },
    ],
  },
  {
    kunci: 'level',
    label: 'Level',
    tipe: 'pilihan',
    opsi: [
      { nilai: 'Advanced', label: 'Advanced' },
      { nilai: 'Intermediate', label: 'Intermediate' },
      { nilai: 'Basic', label: 'Basic' },
    ],
  },
  { kunci: 'isTechStack', label: 'Hitung sebagai Tech Stack (angka di halaman Biodata)', tipe: 'cek' },
]
const judul = (i) => i.nama
const subjudul = (i) => `${i.kategori} - ${i.level}${i.isTechStack ? ' - Tech Stack' : ''}`
const ikon = (i) => i.ikon
</script>

<template>
  <section>
    <h1>Alat dan Teknologi</h1>
    <p class="ket">Kartu di bagian "Alat dan Teknologi" pada Beranda, dan angka "Tech Stack" di halaman Biodata.</p>
    <PengelolaDaftar
      endpoint="/api/admin/tool"
      :kolom="kolom"
      :bentuk-kosong="{ nama: '', ikon: 'code-outline', kategori: 'programmer', level: 'Basic', isTechStack: false }"
      :judul-item="judul"
      :subjudul-item="subjudul"
      :ikon-item="ikon"
      :batas="60"
      nama-item="alat"
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