<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { buatTurnstile } from '../../utils/turnstile'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const kodeAkses = ref('')
const galat = ref('')
const memproses = ref(false)
const kotakTurnstile = ref(null)
let turnstile = null

onMounted(() => {
  turnstile = buatTurnstile(kotakTurnstile.value)
})
onBeforeUnmount(() => turnstile?.hancurkan())

async function masuk() {
  galat.value = ''
  memproses.value = true
  try {
    const turnstileToken = await turnstile.ambilToken()
    await auth.login(email.value.trim(), password.value, kodeAkses.value.trim(), turnstileToken)
    router.push('/admin/dashboard')
  } catch (e) {
    galat.value = e.message
  } finally {
    memproses.value = false
  }
}
</script>

<template>
  <main class="login">
    <form class="kartu" @submit.prevent="masuk">
      <h1>Login Admin</h1>

      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" autocomplete="username" required />

      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" required />

      <label for="kode">Kode Akses</label>
      <input
        id="kode"
        v-model="kodeAkses"
        type="password"
        inputmode="numeric"
        maxlength="6"
        pattern="\d{6}"
        autocomplete="one-time-code"
        required
      />

      <div ref="kotakTurnstile"></div>
      <p v-if="galat" class="galat">{{ galat }}</p>

      <button type="submit" :disabled="memproses">
        {{ memproses ? 'Masuk...' : 'Masuk' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px. */
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
}
.kartu {
  width: 100%;
  max-width: 22rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 0.75rem;
}
h1 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}
label {
  font-size: 0.85rem;
  color: #b5b5b5;
}
input {
  padding: 0.6rem 0.7rem;
  font-size: 1rem;
  color: #f1f1f1;
  background: #0b0b0b;
  border: 1px solid #333;
  border-radius: 0.5rem;
}
button {
  margin-top: 0.75rem;
  padding: 0.7rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: #2e87f6;
  border: 0;
  border-radius: 0.5rem;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}
.galat {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #ff6b6b;
}

@media (min-width: 641px) {
  .kartu {
    padding: 1.75rem;
  }
}
</style>