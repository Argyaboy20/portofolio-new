<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Eye, EyeOff, Shield } from '@lucide/vue'
import { useAuthStore } from '../../stores/auth'
import { buatTurnstile } from '../../utils/turnstile'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const kodeAkses = ref('')
const lihatPassword = ref(false)
const lihatKode = ref(false)
const capsAktif = ref(false)
const galat = ref('')
const memproses = ref(false)

const kotakTurnstile = ref(null)
let turnstile = null

const bisaKirim = computed(
  () => email.value.trim() !== '' && password.value !== '' && kodeAkses.value.length === 6,
)

// Kode akses: hanya angka, maksimal 6 digit
watch(kodeAkses, (nilai) => {
  const bersih = nilai.replace(/\D/g, '').slice(0, 6)
  if (bersih !== nilai) kodeAkses.value = bersih
})

function cekCaps(e) {
  capsAktif.value = !!e.getModifierState?.('CapsLock')
}

onMounted(() => {
  turnstile = buatTurnstile(kotakTurnstile.value)
})
onBeforeUnmount(() => turnstile?.hancurkan())

async function masuk() {
  if (!bisaKirim.value || memproses.value) return
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
    <div class="lingkaran l1" aria-hidden="true"></div>
    <div class="lingkaran l2" aria-hidden="true"></div>
    <div class="lingkaran l3" aria-hidden="true"></div>

    <div class="kartu">
      <section class="merek">
        <div class="lencana"><Shield :size="28" aria-hidden="true" /></div>
        <p class="situs"><span class="p">Maulana Farras</span><span class="s"> Blog's</span></p>
        <h1>Portal Admin</h1>
        <p class="isi">Kelola konten situs portofolio: profil, proyek, galeri, dan lainnya.</p>
      </section>

      <form class="form" @submit.prevent="masuk">
        <h2>Masuk</h2>

        <div class="ruas">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" autocomplete="username" required />
        </div>

        <div class="ruas">
          <label for="password">Password</label>
          <div class="kotak-input">
            <input
              id="password"
              v-model="password"
              :type="lihatPassword ? 'text' : 'password'"
              autocomplete="current-password"
              maxlength="72"
              required
              @keydown="cekCaps"
              @keyup="cekCaps"
            />
            <button
              type="button"
              class="mata"
              :aria-label="lihatPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              :aria-pressed="lihatPassword"
              @mousedown.prevent
              @click="lihatPassword = !lihatPassword"
            >
              <EyeOff v-if="lihatPassword" :size="20" aria-hidden="true" />
              <Eye v-else :size="20" aria-hidden="true" />
            </button>
          </div>
          <p v-if="capsAktif" class="peringatan">Caps Lock sedang aktif.</p>
        </div>

        <div class="ruas">
          <label for="kode">Kode Akses (6 digit)</label>
          <div class="kotak-input">
            <input
              id="kode"
              v-model="kodeAkses"
              :type="lihatKode ? 'text' : 'password'"
              inputmode="numeric"
              maxlength="6"
              autocomplete="one-time-code"
              required
            />
            <button
              type="button"
              class="mata"
              :aria-label="lihatKode ? 'Sembunyikan kode akses' : 'Tampilkan kode akses'"
              :aria-pressed="lihatKode"
              @mousedown.prevent
              @click="lihatKode = !lihatKode"
            >
              <EyeOff v-if="lihatKode" :size="20" aria-hidden="true" />
              <Eye v-else :size="20" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div ref="kotakTurnstile" class="turnstile"></div>

        <p v-if="galat" class="galat" role="alert">{{ galat }}</p>

        <button type="submit" class="masuk" :disabled="!bisaKirim || memproses">
          {{ memproses ? 'Memeriksa...' : 'Masuk' }}
        </button>

        <RouterLink to="/" class="kembali">Kembali ke situs</RouterLink>
      </form>
    </div>
  </main>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px): kepala bermerek di atas, formulir di bawah.
   Override: min-width 641px (ruang lebih lega), 768px (dua kolom), 1024px (merek lebih besar). */
.login {
  position: relative;
  display: grid;
  min-height: 100vh;
  padding: 1rem;
  overflow: hidden;
  place-items: center;
  background: linear-gradient(135deg, #2c3e50, #4a90e2);
}
.lingkaran {
  position: absolute;
  border-radius: 50%;
  opacity: 0.18;
}
.l1 {
  bottom: -120px;
  left: -60px;
  width: 240px;
  height: 240px;
  background: #50e3c2;
  animation: melayang 8s ease-in-out infinite;
}
.l2 {
  top: -90px;
  right: 8%;
  width: 180px;
  height: 180px;
  background: #ff6b6b;
  animation: melayang 6s ease-in-out infinite reverse;
}
.l3 {
  top: 45%;
  right: -60px;
  width: 120px;
  height: 120px;
  background: #4a90e2;
  animation: melayang 7s ease-in-out infinite 1s;
}
@keyframes melayang {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(15px, 15px);
  }
}

.kartu {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 26rem;
  overflow: hidden;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

/* --- Panel merek --- */
.merek {
  padding: 1.5rem 1.5rem 1.25rem;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #1f2d3d, #2c3e50);
}
.lencana {
  display: grid;
  width: 56px;
  height: 56px;
  margin: 0 auto 0.75rem;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #4a90e2, #50e3c2);
  border-radius: 50%;
}
.situs {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 1px;
}
.p {
  color: #4a90e2;
}
.s {
  color: #50e3c2;
}
.merek h1 {
  margin: 0.25rem 0 0;
  font-size: 1.4rem;
}
.isi {
  display: none;
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
}

/* --- Formulir --- */
.form {
  padding: 1.5rem;
}
.form h2 {
  margin: 0 0 1.1rem;
  font-size: 1.15rem;
  color: #1f2d3d;
}
.ruas {
  margin-bottom: 1rem;
}
.ruas label {
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2d3d;
}
.ruas input {
  width: 100%;
  padding: 0.7rem 0.8rem;
  font: inherit;
  font-size: 1rem;
  color: #222;
  background: #fff;
  border: 1px solid #cfd6e0;
  border-radius: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.ruas input:focus {
  border-color: #4a90e2;
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
}
.kotak-input {
  position: relative;
}
.kotak-input input {
  padding-right: 3rem;
}
.mata {
  position: absolute;
  top: 50%;
  right: 0.35rem;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #6b7686;
  background: none;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transform: translateY(-50%);
}
.mata:hover {
  color: #2e87f6;
  background: #eef4fd;
}
.peringatan {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: #b7791f;
}
.turnstile {
  display: flex;
  justify-content: center;
}
.galat {
  margin: 0 0 1rem;
  padding: 0.6rem 0.8rem;
  font-size: 0.85rem;
  color: #b42318;
  background: #fdecec;
  border-radius: 8px;
}
.masuk {
  width: 100%;
  padding: 0.8rem;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #2e87f6, #4a90e2);
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.masuk:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(46, 135, 246, 0.35);
  transform: translateY(-1px);
}
.masuk:disabled {
  opacity: 0.5;
  cursor: default;
}
.kembali {
  display: block;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #6b7686;
  text-align: center;
  text-decoration: none;
}
.kembali:hover {
  color: #2e87f6;
}

@media (prefers-reduced-motion: reduce) {
  .lingkaran {
    animation: none;
  }
  .masuk,
  .ruas input {
    transition: none;
  }
}

@media (min-width: 641px) {
  .login {
    padding: 2rem;
  }
  .merek {
    padding: 1.75rem 2rem 1.5rem;
  }
  .isi {
    display: block;
  }
  .form {
    padding: 2rem;
  }
}

@media (min-width: 768px) {
  .kartu {
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-width: 56rem;
  }
  .merek {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2.5rem;
    text-align: left;
  }
  .lencana {
    margin: 0 0 1.25rem;
  }
  .merek h1 {
    font-size: 2rem;
  }
  .isi {
    font-size: 0.95rem;
  }
  .form {
    align-self: center;
    padding: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .merek h1 {
    font-size: 2.2rem;
  }
  .l1 {
    width: 340px;
    height: 340px;
  }
  .l2 {
    width: 240px;
    height: 240px;
  }
}
</style>