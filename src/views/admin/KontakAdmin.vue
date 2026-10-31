<script setup>
import PengelolaDaftar from '../../components/admin/PengelolaDaftar.vue'

const NAMA = { email: 'Email', instagram: 'Instagram', linkedin: 'LinkedIn', github: 'GitHub', discord: 'Discord' }

const kolom = [
  {
    kunci: 'jenis',
    label: 'Jenis',
    tipe: 'pilihan',
    opsi: Object.entries(NAMA).map(([nilai, label]) => ({ nilai, label })),
  },
  {
    kunci: 'url',
    label: 'Alamat',
    tipe: 'teks',
    maks: 300,
    bantuan: 'Email: tulis alamat emailnya. Lainnya: alamat lengkap diawali https://',
  },
]
const judul = (i) => NAMA[i.jenis] ?? i.jenis
const subjudul = (i) => i.url
const ikon = (i) => i.jenis
</script>

<template>
  <section>
    <h1>Kontak Pribadi</h1>
    <p class="ket">Ikon bulat di bawah "Kontak Pribadi" pada panel kiri Beranda. Urutan di sini = urutan tampil.</p>
    <PengelolaDaftar
      endpoint="/api/admin/kontak"
      :kolom="kolom"
      :bentuk-kosong="{ jenis: 'instagram', url: '' }"
      :judul-item="judul"
      :subjudul-item="subjudul"
      :ikon-item="ikon"
      :batas="10"
      nama-item="kontak"
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