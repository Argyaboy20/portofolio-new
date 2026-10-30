import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'beranda',
      component: () => import('../views/public/BerandaPage.vue'),
    },
    // Sengaja tidak ditautkan dari halaman publik mana pun
    {
      path: '/loginadmin',
      name: 'loginadmin',
      component: () => import('../views/admin/LoginAdmin.vue'),
    },
    { path: '/admin', redirect: '/admin/dashboard' },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/admin/DashboardAdmin.vue'),
      meta: { requiresAuth: true },
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

export default router