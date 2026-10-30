<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { X } from '@lucide/vue'
import { api } from '../api/http'
import { useBahasaStore } from '../stores/bahasa'
import { formatDurasi } from '../utils/durasi'

defineProps({ daftar: { type: Array, required: true } })

const bahasa = useBahasaStore()

const dibuka = ref(null) // project yang sedang diminta source-nya
const kode = ref('')
const galat = ref('')
const memeriksa = ref(false)
const tautanSource = ref('')
const kolomKode = ref(null)
let pemicu = null

function inisial(judul) {
  return judul.trim().slice(0, 1).toUpperCase()
}

function bukaModal(project, event) {
  pemicu = event.currentTarget
  kode.value = ''
  galat.value = ''
  tautanSource.value = ''
  dibuka.value = project
}
function tutup() {
  dibuka.value = null
}

async function kirim() {
  if (!kode.value.trim() || memeriksa.value) return
  galat.value = ''
  memeriksa.value = true
  try {
    const data = await api(`/api/beranda/project/${dibuka.value.id}/source`, {
      method: 'POST',
      body: { kode: kode.value },
      auth: false,
      pesan: bahasa.pilih('Memeriksa kode...', 'Checking code...'),
    })
    tautanSource.value = data.sourceUrl
    kode.value = ''
  } catch (e) {
    galat.value = e.message
  } finally {
    memeriksa.value = false
  }
}

function saatTombol(e) {
  if (e.key === 'Escape') tutup()
}

// Kunci html saja (bukan body): mengunci body membuat elemen sticky lepas dari layar
watch(dibuka, async (nilai) => {
  document.documentElement.style.overflow = nilai ? 'hidden' : ''
  if (nilai) {
    window.addEventListener('keydown', saatTombol)
    await nextTick()
    kolomKode.value?.focus()
  } else {
    window.removeEventListener('keydown', saatTombol)
    pemicu?.focus()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', saatTombol)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div class="grid">
    <article v-for="p in daftar" :key="p.id" class="kartu">
      <div class="gambar">
        <img v-if="p.gambarUrl" :src="p.gambarUrl" :alt="p.judul" loading="lazy" />
        <span v-else aria-hidden="true">{{ inisial(p.judul) }}</span>
      </div>
      <div class="info">
        <h3>{{ p.judul }}</h3>
        <span class="durasi">{{ formatDurasi(p.mulai, p.selesai, bahasa.kode) }}</span>
        <p>{{ bahasa.pilih(p.deskripsiId, p.deskripsiEn) }}</p>
        <div class="tautan">
          <RouterLink :to="p.demoPath" class="demo">{{ bahasa.pilih('Lihat Demo', 'View Demo') }}</RouterLink>
          <button v-if="p.adaSource" type="button" class="source" @click="bukaModal(p, $event)">
            {{ bahasa.pilih('Source Code', 'Source Code') }}
          </button>
        </div>
      </div>
    </article>

    <Teleport to="body">
      <div v-if="dibuka" class="lapisan" @click.self="tutup">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="judul-source">
          <header class="modal-kepala">
            <h3 id="judul-source">{{ bahasa.pilih('Akses Source Code', 'Source Code Access') }}</h3>
            <button type="button" class="tutup" :aria-label="bahasa.pilih('Tutup', 'Close')" @click="tutup">
              <X :size="20" aria-hidden="true" />
            </button>
          </header>

          <div class="modal-isi">
            <p class="proyek">{{ dibuka.judul }}</p>

            <template v-if="!tautanSource">
              <form @submit.prevent="kirim">
                <label for="kode-source">
                  {{ bahasa.pilih('Masukkan kode akses untuk melihat source code:', 'Enter the access code to view the source code:') }}
                </label>
                <input
                  id="kode-source"
                  ref="kolomKode"
                  v-model="kode"
                  type="password"
                  maxlength="100"
                  autocomplete="off"
                />
                <p v-if="galat" class="galat" role="alert">{{ galat }}</p>
                <div class="aksi">
                  <button type="button" class="batal" @click="tutup">{{ bahasa.pilih('Batal', 'Cancel') }}</button>
                  <button type="submit" class="kirim" :disabled="memeriksa || !kode.trim()">
                    {{ bahasa.pilih('Konfirmasi', 'Confirm') }}
                  </button>
                </div>
              </form>
            </template>

            <template v-else>
              <p class="berhasil">{{ bahasa.pilih('Kode benar.', 'Code accepted.') }}</p>
              <a :href="tautanSource" class="buka" target="_blank" rel="noopener noreferrer" @click="tutup">
                {{ bahasa.pilih('Buka Source Code', 'Open Source Code') }}
              </a>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px, 768px, 1024px. */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
}
.kartu {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}
.kartu:hover {
  transform: translateY(-5px);
}
.gambar {
  display: grid;
  place-items: center;
  height: 150px;
  overflow: hidden;
  font-size: 3rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #4a90e2, #50e3c2);
}
.gambar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}
.info {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1rem;
}
.info h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #2c3e50;
}
.durasi {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  font-style: italic;
  color: #4a90e2;
}
.info p {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: #666;
}
.tautan {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: auto;
}
.demo,
.source {
  padding: 0;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  color: #4a90e2;
  text-decoration: none;
  background: none;
  border: 0;
  cursor: pointer;
}
.demo:hover,
.source:hover {
  color: #50e3c2;
}

/* --- Modal --- */
.lapisan {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  overscroll-behavior: contain;
}
.modal {
  width: 100%;
  max-width: 22rem;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.modal-kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  color: #fff;
  background: linear-gradient(to right, #4a90e2, #50e3c2);
}
.modal-kepala h3 {
  margin: 0;
  font-size: 1rem;
}
.tutup {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  color: #fff;
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}
.tutup:hover {
  background: rgba(255, 255, 255, 0.2);
}
.modal-isi {
  padding: 1rem;
}
.proyek {
  margin: 0 0 0.75rem;
  font-weight: 600;
  color: #2c3e50;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: #444;
}
input {
  width: 100%;
  padding: 0.6rem 0.7rem;
  font-size: 1rem;
  color: #222;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}
input:focus {
  border-color: #4a90e2;
  outline: none;
}
.galat {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #d63b3b;
}
.aksi {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.batal,
.kirim,
.buka {
  flex: 1;
  padding: 0.6rem;
  font: inherit;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  cursor: pointer;
}
.batal {
  color: #555;
  background: #f0f0f0;
  border: 0;
}
.kirim,
.buka {
  display: block;
  color: #fff;
  background: #4a90e2;
  border: 0;
}
.kirim:disabled {
  opacity: 0.5;
  cursor: default;
}
.berhasil {
  margin: 0 0 1rem;
  color: #1f9d55;
}

@media (prefers-reduced-motion: reduce) {
  .kartu {
    transition: none;
  }
}

@media (min-width: 641px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
  }
  .gambar {
    height: 165px;
  }
  .info {
    padding: 1.25rem;
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
    gap: 1.75rem;
  }
  .gambar {
    height: 175px;
  }
  .info {
    padding: 1.4rem;
  }
  .info h3 {
    font-size: 1.05rem;
  }
  .info p {
    font-size: 0.9rem;
  }
  .durasi {
    font-size: 0.85rem;
  }
  .demo,
  .source {
    font-size: 0.9rem;
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
  }
  .gambar {
    height: 180px;
  }
  .info {
    padding: 1.5rem;
  }
}
</style>