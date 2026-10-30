<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { GraduationCap, Trophy, X } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'
import { formatDurasi } from '../utils/durasi'

defineProps({ daftar: { type: Array, required: true } })

const bahasa = useBahasaStore()
const terbuka = ref(null) // prestasi yang sedang dibuka di modal
const tombolTutup = ref(null)
let pemicu = null

function rentangTahun(p) {
  const akhir = p.selesaiTahun ?? bahasa.pilih('sekarang', 'present')
  return `${p.mulaiTahun} - ${akhir}`
}

function buka(prestasi, event) {
  pemicu = event.currentTarget
  terbuka.value = prestasi
}
function tutup() {
  terbuka.value = null
}

function saatTombol(e) {
  if (e.key === 'Escape') tutup()
}

// Kunci gulir halaman: html DAN body (html menjadi penggulung di sebagian peramban)
watch(terbuka, async (nilai) => {
  // Kunci html saja. Mengunci body juga menjadikannya wadah gulir sendiri,
  // sehingga elemen sticky (navbar, panel kiri) lepas dari layar.
  document.documentElement.style.overflow = nilai ? 'hidden' : ''
  if (nilai) {
    window.addEventListener('keydown', saatTombol)
    await nextTick()
    tombolTutup.value?.focus()
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
  <div class="daftar">
    <article v-for="p in daftar" :key="p.id" class="kartu">
      <div class="ikon"><GraduationCap :size="20" aria-hidden="true" /></div>
      <div class="rincian">
        <h3 class="sekolah">{{ p.institusi }}</h3>
        <p class="jurusan">{{ bahasa.pilih(p.jurusanId, p.jurusanEn) }}</p>
        <p class="tahun">{{ rentangTahun(p) }}</p>

        <div v-if="p.ipk || p.semesterId" class="statistik">
          <div v-if="p.ipk" class="stat">
            <span class="label">{{ bahasa.pilih('IPK', 'GPA') }}</span>
            <span class="nilai">{{ p.ipk }}</span>
          </div>
          <div v-if="p.semesterId" class="stat">
            <span class="label">Semester</span>
            <span class="nilai">{{ bahasa.pilih(p.semesterId, p.semesterEn || p.semesterId) }}</span>
          </div>
        </div>

        <div v-if="p.prestasi.length" class="lencana-baris">
          <button
            v-for="r in p.prestasi"
            :key="r.id"
            type="button"
            class="lencana"
            @click="buka(r, $event)"
          >
            <Trophy :size="18" aria-hidden="true" />
            <span>{{ bahasa.pilih(r.judulId, r.judulEn) }}</span>
          </button>
        </div>
      </div>
    </article>

    <Teleport to="body">
      <div v-if="terbuka" class="lapisan" @click.self="tutup">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="judul-prestasi">
          <header class="modal-kepala">
            <h3 id="judul-prestasi">{{ bahasa.pilih(terbuka.judulId, terbuka.judulEn) }}</h3>
            <button ref="tombolTutup" type="button" class="tutup" :aria-label="bahasa.pilih('Tutup', 'Close')" @click="tutup">
              <X :size="20" aria-hidden="true" />
            </button>
          </header>

          <div class="modal-isi">
            <div class="kartu kartu-modal">
              <div class="ikon"><GraduationCap :size="20" aria-hidden="true" /></div>
              <div class="rincian">
                <h4 class="sekolah">{{ terbuka.institusi }}</h4>
                <p class="jurusan">{{ bahasa.pilih(terbuka.jurusanId, terbuka.jurusanEn) }}</p>
                <p class="tahun">{{ formatDurasi(terbuka.mulai, terbuka.selesai, bahasa.kode) }}</p>
                <div class="statistik">
                  <div class="stat">
                    <span class="label">Semester</span>
                    <span class="nilai">{{ terbuka.semester }}</span>
                  </div>
                  <div class="stat">
                    <span class="label">{{ bahasa.pilih('IP', 'GPA') }}</span>
                    <span class="nilai">{{ terbuka.nilai }}</span>
                  </div>
                </div>
                <p class="deskripsi">{{ bahasa.pilih(terbuka.deskripsiId, terbuka.deskripsiEn) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px, 768px. */
.kartu {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.8rem;
  background: linear-gradient(145deg, #fff, #f5f7fa);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.kartu:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(74, 144, 226, 0.1);
}
.ikon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 35px;
  height: 35px;
  color: #fff;
  background: linear-gradient(135deg, #4a90e2, #50e3c2);
  border-radius: 12px;
}
.rincian {
  flex: 1;
  min-width: 0;
}
.sekolah {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #2c3e50;
}
.jurusan {
  margin: 0 0 0.3rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a90e2;
}
.tahun {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: #666;
}
.statistik {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 1rem 0;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.9rem;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 8px;
}
.label {
  margin-bottom: 0.3rem;
  font-size: 0.8rem;
  color: #2c3e50;
}
.nilai {
  font-size: 1.05rem;
  font-weight: 600;
  color: #4a90e2;
}
.lencana-baris {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}
.lencana {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  color: #2c3e50;
  text-align: left;
  background: rgba(80, 227, 194, 0.1);
  border: 0;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
}
.lencana:hover {
  background: rgba(80, 227, 194, 0.2);
  transform: translateY(-2px);
}
.lencana svg {
  flex-shrink: 0;
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
  width: 92vw;
  max-width: 92vw;
  max-height: 85vh;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
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
  font-weight: 600;
}
.tutup {
  display: grid;
  flex-shrink: 0;
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
  max-height: calc(85vh - 3.5rem);
  padding: 1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.kartu-modal:hover {
  transform: none;
}
.deskripsi {
  margin: 1rem 0 0;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #666;
  text-align: justify;
}

@media (prefers-reduced-motion: reduce) {
  .kartu,
  .lencana {
    transition: none;
  }
}

@media (min-width: 641px) {
  .kartu {
    gap: 1.25rem;
    padding: 1rem;
  }
  .ikon {
    width: 40px;
    height: 40px;
  }
  .sekolah {
    font-size: 1.2rem;
  }
  .jurusan {
    font-size: 1rem;
  }
  .modal {
    width: 80vw;
    max-width: 620px;
  }
}

@media (min-width: 768px) {
  .kartu {
    gap: 1.5rem;
    padding: 1.25rem;
  }
  .ikon {
    width: 52px;
    height: 52px;
  }
  .sekolah {
    font-size: 1.3rem;
  }
  .lencana {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  .modal {
    width: 640px;
    max-width: 90vw;
  }
}
</style>