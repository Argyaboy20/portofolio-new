import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const NAMA_SITUS = "Maulana Farras Blog's"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Halaman baru mulai dari atas. Tautan ber-hash (#kontak) digulirkan oleh halamannya sendiri
  // setelah data termuat, karena tujuannya baru ada saat itu.
  scrollBehavior(to, _from, tersimpan) {
    if (tersimpan) return tersimpan
    if (to.hash) return false
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'beranda',
      component: () => import('../views/public/BerandaPage.vue'),
    },
    {
      path: '/biodata',
      name: 'biodata',
      component: () => import('../views/public/BiodataPage.vue'),
      meta: { title: 'Biodata' },
    },
    {
      path: '/itsupport',
      name: 'itsupport',
      component: () => import('../views/public/ItsupportPage.vue'),
      meta: { title: 'IT Support' },
    },
    {
      path: '/administrasi',
      name: 'administrasi',
      component: () => import('../views/public/AdministrasiPage.vue'),
      meta: { title: 'Administrasi' },
    },
    {
      path: '/relawan',
      name: 'relawan',
      component: () => import('../views/public/RelawanPage.vue'),
      meta: { title: 'Relawan' },
    },
    {
      path: '/galeri-kehidupan',
      name: 'galeri-kehidupan',
      component: () => import('../views/public/GaleriKehidupanPage.vue'),
      meta: { title: 'Galeri Kehidupan' },
    },
    {
      path: '/locana',
      name: 'locana',
      component: () => import('../views/public/LocanaPage.vue'),
      meta: { title: 'Locana' },
    },
    {
      path: '/socialvit',
      name: 'socialvit',
      component: () => import('../views/public/SocialvitPage.vue'),
      meta: { title: 'SocialVit' },
    },
    {
      path: '/connectpmm',
      name: 'connectpmm',
      component: () => import('../views/public/ConnectpmmPage.vue'),
      meta: { title: 'PMM Connect' },
    },
    {
      path: '/pertanianmobile',
      name: 'pertanianmobile',
      component: () => import('../views/public/PertanianmobilePage.vue'),
      meta: { title: 'Pertanian Mobile' },
    },
    {
      path: '/portofolio',
      name: 'portofolio',
      component: () => import('../views/public/PortofolioPage.vue'),
      meta: { title: 'Portofolio' },
    },
    {
      path: '/aplikasir',
      name: 'aplikasir',
      component: () => import('../views/public/AplikasirPage.vue'),
      meta: { title: 'ApliKasir' },
    },
    {
      path: '/aboutme',
      name: 'aboutme',
      component: () => import('../views/public/AboutmePage.vue'),
      meta: { title: 'Tentang Saya' },
    },
    {
      path: '/privacypolicy',
      name: 'privacypolicy',
      component: () => import('../views/public/PrivacypolicyPage.vue'),
      meta: { title: 'Kebijakan Privasi' },
    },
    // Sengaja tidak ditautkan dari halaman publik mana pun
    {
      path: '/loginadmin',
      name: 'loginadmin',
      component: () => import('../views/admin/LoginAdmin.vue'),
      meta: { title: 'Login Admin' },
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true },
      // Tamu yang membuka /admin persis dikirim ke halaman publik Administrasi; admin masuk ke dashboard
      redirect: () => {
        const auth = useAuthStore()
        if (!auth.token) auth.restoreSession()
        return auth.isLoggedIn ? '/admin/dashboard' : '/administrasi'
      },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardAdmin.vue'),
          meta: { title: 'Dashboard Admin' },
        },
        {
          path: 'beranda/profil',
          name: 'admin-profil',
          component: () => import('../views/admin/ProfilAdmin.vue'),
          meta: { title: 'Profil Admin' },
        },
        {
          path: 'beranda/kontak',
          name: 'admin-kontak',
          component: () => import('../views/admin/KontakAdmin.vue'),
          meta: { title: 'Kontak Admin' },
        },
        {
          path: 'beranda/keahlian',
          name: 'admin-keahlian',
          component: () => import('../views/admin/KeahlianAdmin.vue'),
          meta: { title: 'Keahlian Admin' },
        },
        {
          path: 'beranda/tools',
          name: 'admin-tools',
          component: () => import('../views/admin/ToolAdmin.vue'),
          meta: { title: 'Alat dan Teknologi Admin' },
        },
        {
          path: 'beranda/project',
          name: 'admin-project',
          component: () => import('../views/admin/ProjectAdmin.vue'),
          meta: { title: 'Project Admin' },
        },
        {
          path: 'beranda/publikasi',
          name: 'admin-publikasi',
          component: () => import('../views/admin/PublikasiAdmin.vue'),
          meta: { title: 'Publikasi Admin' },
        },
        {
          path: 'beranda/pendidikan',
          name: 'admin-pendidikan',
          component: () => import('../views/admin/PendidikanAdmin.vue'),
          meta: { title: 'Pendidikan Admin' },
        },
        {
          path: 'beranda/kartu',
          name: 'admin-kartu',
          component: () => import('../views/admin/KartuAdmin.vue'),
          meta: { title: 'Karir dan Relawan Admin' },
        },
        {
          path: 'biodata',
          name: 'admin-biodata',
          component: () => import('../views/admin/BiodataAdmin.vue'),
          meta: { title: 'Biodata Admin' },
        },
        {
          path: 'galeri-biodata',
          name: 'admin-galeri-biodata',
          component: () => import('../views/admin/GaleriBiodataAdmin.vue'),
          meta: { title: 'Galeri Biodata Admin' },
        },
        {
          path: 'halaman/itsupport',
          name: 'admin-halaman-itsupport',
          component: () => import('../views/admin/ItsupportAdmin.vue'),
          meta: { title: 'IT Support Admin' },
        },
        {
          path: 'halaman/administrasi',
          name: 'admin-halaman-administrasi',
          component: () => import('../views/admin/AdministrasiAdmin.vue'),
          meta: { title: 'Administrasi Admin' },
        },
        {
          path: 'halaman/pengalaman',
          name: 'admin-halaman-pengalaman',
          component: () => import('../views/admin/PengalamanAdmin.vue'),
          meta: { title: 'Pengalaman Admin' },
        },
        {
          path: 'halaman/rekomendasi',
          name: 'admin-halaman-rekomendasi',
          component: () => import('../views/admin/RekomendasiAdmin.vue'),
          meta: { title: 'Rekomendasi Admin' },
        },
        {
          path: 'halaman/relawan',
          name: 'admin-halaman-relawan',
          component: () => import('../views/admin/RelawanAdmin.vue'),
          meta: { title: 'Relawan Admin' },
        },
        {
          path: 'halaman/galeri-kehidupan',
          name: 'admin-halaman-galeri-kehidupan',
          component: () => import('../views/admin/GaleriKehidupanAdmin.vue'),
          meta: { title: 'Galeri Kehidupan Admin' },
        },
        {
          path: 'halaman/locana',
          name: 'admin-halaman-locana',
          component: () => import('../views/admin/LocanaAdmin.vue'),
          meta: { title: 'Locana Admin' },
        },
        {
          path: 'halaman/socialvit',
          name: 'admin-halaman-socialvit',
          component: () => import('../views/admin/SocialvitAdmin.vue'),
          meta: { title: 'SocialVit Admin' },
        },
        {
          path: 'halaman/connectpmm',
          name: 'admin-halaman-connectpmm',
          component: () => import('../views/admin/ConnectpmmAdmin.vue'),
          meta: { title: 'PMM Connect Admin' },
        },
        {
          path: 'halaman/pertanianmobile',
          name: 'admin-halaman-pertanianmobile',
          component: () => import('../views/admin/PertanianmobileAdmin.vue'),
          meta: { title: 'Pertanian Mobile' },
        },
        {
          path: 'halaman/portofolio',
          name: 'admin-halaman-portofolio',
          component: () => import('../views/admin/PortofolioAdmin.vue'),
          meta: { title: 'Portofolio Admin' },
        },
        {
          path: 'halaman/aplikasir',
          name: 'admin-halaman-aplikasir',
          component: () => import('../views/admin/AplikasirAdmin.vue'),
          meta: { title: 'ApliKasir Admin' },
        },
        {
          path: 'halaman/aboutme',
          name: 'admin-halaman-aboutme',
          component: () => import('../views/admin/AboutmeAdmin.vue'),
          meta: { title: 'Tentang Saya Admin' },
        },
        {
          path: 'pengaturan',
          name: 'admin-pengaturan',
          component: () => import('../views/admin/PengaturanAdmin.vue'),
          meta: { title: 'Pengaturan Admin' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.token) auth.restoreSession()
  // Tanpa login diarahkan ke beranda publik supaya keberadaan portal admin tidak bocor
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { path: '/' }
  if (to.name === 'loginadmin' && auth.isLoggedIn) return { path: '/admin/dashboard' }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - ${NAMA_SITUS}` : NAMA_SITUS
})

export default router
