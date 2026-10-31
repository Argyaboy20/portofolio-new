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
      redirect: '/admin/dashboard',
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