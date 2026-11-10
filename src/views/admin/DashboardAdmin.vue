<script setup>
import { RouterLink } from 'vue-router'
import {
  Activity,
  BookOpen,
  Briefcase,
  Camera,
  CodeXml,
  FileText,
  GraduationCap,
  HandHeart,
  Heart,
  Images,
  Leaf,
  Mail,
  MessageSquareQuote,
  Monitor,
  Network,
  Quote,
  ReceiptText,
  Server,
  Settings,
  Smartphone,
  Trophy,
  User,
  UserRound,
  Users,
} from '@lucide/vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

// shortcut: daftar ini menyalin menu AdminLayout, ubah dua tempat saat menambah halaman
const KELOMPOK = [
  {
    judul: 'Beranda',
    butir: [
      ['/admin/beranda/profil', 'Profil', 'Nama, jabatan, ringkasan, foto, CV', User],
      ['/admin/beranda/kontak', 'Kontak', 'Email dan media sosial', Mail],
      ['/admin/beranda/pendidikan', 'Pendidikan', 'Kampus dan prestasi', GraduationCap],
      ['/admin/beranda/keahlian', 'Keahlian', 'Bilah keahlian', Activity],
      ['/admin/beranda/tools', 'Alat dan Teknologi', 'Daftar alat dan level', CodeXml],
      ['/admin/beranda/project', 'Project', 'Kartu project dan kode akses', Briefcase],
      ['/admin/beranda/kartu', 'Karir dan Relawan', 'Dua kartu tujuan', Heart],
      ['/admin/beranda/publikasi', 'Publikasi', 'Artikel dan jurnal', Quote],
    ],
  },
  {
    judul: 'Biodata',
    butir: [
      ['/admin/biodata', 'Biodata', 'Teks dan data diri', BookOpen],
      ['/admin/galeri-biodata', 'Galeri Biodata', 'Foto penghargaan dan potret', Images],
    ],
  },
  {
    judul: 'Halaman',
    butir: [
      ['/admin/halaman/itsupport', 'IT Support', 'Studi kasus', Server],
      ['/admin/halaman/administrasi', 'Administrasi', 'Profil, CV, keterampilan', FileText],
      ['/admin/halaman/pengalaman', 'Pengalaman Kerja', 'Kartu dan foto', Trophy],
      ['/admin/halaman/rekomendasi', 'Rekomendasi', 'Kutipan dan foto', MessageSquareQuote],
      ['/admin/halaman/relawan', 'Relawan', 'Pengalaman dan galeri', HandHeart],
      ['/admin/halaman/galeri-kehidupan', 'Galeri Kehidupan', 'Foto dua tab', Camera],
      ['/admin/halaman/locana', 'Locana', 'Fitur dan alat', Smartphone],
      ['/admin/halaman/socialvit', 'SocialVit', 'Galeri dan tim', Users],
      ['/admin/halaman/connectpmm', 'PMM Connect', 'Galeri dan alat', Network],
      ['/admin/halaman/pertanianmobile', 'Pertanian Mobile', 'Galeri dan alat', Leaf],
      ['/admin/halaman/portofolio', 'Portofolio', 'Galeri UI/UX dan kecepatan', Monitor],
      ['/admin/halaman/aplikasir', 'ApliKasir', 'Galeri dan alat', ReceiptText],
      ['/admin/halaman/aboutme', 'Tentang Saya', 'Foto dan paragraf', UserRound],
    ],
  },
  {
    judul: 'Situs',
    butir: [['/admin/pengaturan', 'Pengaturan', 'Hak cipta, footer, kode akses', Settings]],
  },
]
</script>

<template>
  <section>
    <h1>Dashboard</h1>
    <p class="sapa">Masuk sebagai {{ auth.email }}</p>

    <div v-for="k in KELOMPOK" :key="k.judul" class="grup">
      <h2>{{ k.judul }}</h2>
      <div class="baris">
        <RouterLink v-for="b in k.butir" :key="b[0]" :to="b[0]" class="kartu">
          <component :is="b[3]" :size="22" aria-hidden="true" />
          <strong>{{ b[1] }}</strong>
          <span>{{ b[2] }}</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST) */
h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  color: #1f2d3d;
}
h2 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: #6b7686;
}
.sapa {
  margin: 0 0 1.5rem;
  color: #6b7686;
}
.grup {
  margin-bottom: 1.75rem;
}
.baris {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
.kartu {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem;
  color: #2e87f6;
  text-decoration: none;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.kartu:hover {
  box-shadow: 0 8px 20px rgba(46, 135, 246, 0.12);
  transform: translateY(-2px);
}
.kartu strong {
  color: #1f2d3d;
}
.kartu span {
  font-size: 0.85rem;
  color: #6b7686;
}

@media (min-width: 641px) {
  .baris {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}
</style>
