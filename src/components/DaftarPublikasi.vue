<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronDown, ExternalLink, X } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'

const props = defineProps({ daftar: { type: Array, required: true } })

const bahasa = useBahasaStore()
const tampil = computed(() => props.daftar.slice(0, 4))
const modalBuka = ref(false)
const tombolTutup = ref(null)
let pemicu = null

function buka(event) {
  pemicu = event.currentTarget
  modalBuka.value = true
}
function tutup() {
  modalBuka.value = false
}
function saatTombol(e) {
  if (e.key === 'Escape') tutup()
}

// Kunci html saja (bukan body): mengunci body membuat elemen sticky lepas dari layar
watch(modalBuka, async (nilai) => {
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
  <div class="wadah">
    <a
      v-for="(p, i) in tampil"
      :key="p.id"
      :href="p.link"
      class="butir"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="nomor">{{ i + 1 }}</span>
      <span class="rincian">
        <strong>{{ p.jurnalNama }}</strong>
        <span>{{ p.judulArtikel }}</span>
      </span>
      <span class="lencana"><ExternalLink :size="14" aria-hidden="true" /></span>
    </a>

    <div v-if="daftar.length > 4" class="selengkapnya">
      <button type="button" @click="buka($event)">
        {{ bahasa.pilih('Lihat Selengkapnya', 'See More') }}
        <ChevronDown :size="16" aria-hidden="true" />
      </button>
    </div>

    <Teleport to="body">
      <div v-if="modalBuka" class="lapisan" @click.self="tutup">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="judul-publikasi">
          <header class="modal-kepala">
            <h3 id="judul-publikasi">{{ bahasa.pilih('Semua Publikasi', 'All Publications') }}</h3>
            <button
              ref="tombolTutup"
              type="button"
              class="tutup"
              :aria-label="bahasa.pilih('Tutup', 'Close')"
              @click="tutup"
            >
              <X :size="20" aria-hidden="true" />
            </button>
          </header>
          <div class="modal-isi">
            <a
              v-for="(p, i) in daftar"
              :key="p.id"
              :href="p.link"
              class="butir"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="nomor">{{ i + 1 }}</span>
              <span class="rincian">
                <strong>{{ p.jurnalNama }}</strong>
                <span>{{ p.judulArtikel }}</span>
              </span>
              <span class="lencana"><ExternalLink :size="14" aria-hidden="true" /></span>
            </a>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px, 768px. */
.wadah {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.butir {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1rem;
  overflow: hidden;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, #1b3a6b, #243b8a);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}
.butir::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #4a90e2, #50e3c2);
  transition: width 0.3s ease;
}
.butir:hover {
  background: linear-gradient(135deg, #243b8a, #2e4fa3);
  box-shadow: 0 8px 28px rgba(74, 144, 226, 0.2);
  transform: translateY(-3px);
}
.butir:hover::before {
  width: 6px;
}
.nomor {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  font-size: 1rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}
.rincian {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}
.rincian strong {
  font-size: 0.85rem;
  font-weight: 600;
}
.rincian span {
  font-size: 0.75rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
}
.lencana {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 1.7rem;
  height: 1.7rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: transform 0.3s ease;
}
.butir:hover .lencana {
  transform: scale(1.15);
}
.selengkapnya {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}
.selengkapnya button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1.1rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  color: #4a90e2;
  background: transparent;
  border: 1.5px solid #4a90e2;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}
.selengkapnya button:hover {
  color: #fff;
  background: #4a90e2;
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
  display: flex;
  flex-direction: column;
  width: 95vw;
  max-height: 80vh;
  overflow: hidden;
  background: #1a2d5a;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.modal-kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  color: #fff;
  background: #1b3a6b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
  background: rgba(255, 255, 255, 0.15);
}
.modal-isi {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 0.8rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

@media (prefers-reduced-motion: reduce) {
  .butir,
  .lencana,
  .butir::before {
    transition: none;
  }
}

@media (min-width: 641px) {
  .wadah {
    gap: 1rem;
  }
  .butir {
    gap: 1rem;
    padding: 1.1rem 1.4rem;
  }
  .nomor {
    width: 42px;
    height: 42px;
  }
  .rincian strong {
    font-size: 0.95rem;
  }
  .rincian span {
    font-size: 0.82rem;
  }
  .lencana {
    width: 1.9rem;
    height: 1.9rem;
  }
  .selengkapnya button {
    padding: 0.5rem 1.3rem;
    font-size: 0.88rem;
  }
  .modal {
    width: 90vw;
    max-width: 600px;
    max-height: 75vh;
  }
}

@media (min-width: 768px) {
  .butir {
    padding: 1.2rem 1.5rem;
  }
  .nomor {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }
  .rincian strong {
    font-size: 1rem;
  }
  .rincian span {
    font-size: 0.85rem;
  }
  .lencana {
    width: 2rem;
    height: 2rem;
  }
  .modal {
    width: 600px;
    max-width: 90vw;
    max-height: 70vh;
  }
}
</style>