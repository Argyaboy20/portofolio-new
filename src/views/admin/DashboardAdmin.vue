<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/http'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const emailServer = ref('')

onMounted(async () => {
  const data = await api('/api/admin/me')
  emailServer.value = data.email
})

function keluar() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <main class="dash">
    <h1>Dashboard Admin</h1>
    <p>Login sebagai: {{ emailServer || '...' }}</p>
    <button @click="keluar">Keluar</button>
  </main>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST) */
.dash {
  padding: 1rem;
}
button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}
</style>