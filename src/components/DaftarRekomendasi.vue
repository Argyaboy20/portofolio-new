<script setup>
import { computed } from 'vue'
import { ExternalLink, Quote, User } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'

const props = defineProps({ daftar: { type: Array, required: true } })

const bahasa = useBahasaStore()

// Kutipan dipecah per paragraf: satu baris kosong = paragraf baru
function paragraf(teks) {
  return String(teks ?? '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
}

const tampil = computed(() =>
  props.daftar.map((r) => ({ ...r, paragraf: paragraf(bahasa.pilih(r.teksId, r.teksEn)) })),
)
</script>

<template>
  <div class="grid">
    <figure v-for="r in tampil" :key="r.id" class="kartu">
      <Quote class="hias" :size="28" aria-hidden="true" />
      <blockquote class="kutipan">
        <p v-for="(p, i) in r.paragraf" :key="i">{{ p }}</p>
      </blockquote>
      <figcaption class="penulis">
        <span class="foto" aria-hidden="true">
          <img v-if="r.fotoUrl" :src="r.fotoUrl" alt="" loading="lazy" />
          <User v-else :size="22" />
        </span>
        <span class="identitas">
          <a v-if="r.link" :href="r.link" class="nama" target="_blank" rel="noopener noreferrer">
            {{ r.nama }}
            <ExternalLink :size="13" aria-hidden="true" />
          </a>
          <strong v-else class="nama">{{ r.nama }}</strong>
          <span class="jabatan">{{ r.jabatan }}</span>
        </span>
      </figcaption>
    </figure>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px, 1024px. */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 1rem;
}
.kartu {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin: 0;
  padding: 1.2rem 1.1rem 1.1rem 1.4rem;
  overflow: hidden;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.kartu::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #4a90e2, #50e3c2);
}
.kartu:hover {
  box-shadow: 0 8px 28px rgba(74, 144, 226, 0.15);
  transform: translateY(-3px);
}
.hias {
  flex-shrink: 0;
  color: rgba(74, 144, 226, 0.45);
}
.kutipan {
  margin: 0;
}
.kutipan p {
  margin: 0 0 0.8rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #34495e;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.kutipan p:last-child {
  margin-bottom: 0;
}
.penulis {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-top: 0.9rem;
  margin-top: auto;
  border-top: 1px solid #eef1f6;
}
.foto {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 46px;
  height: 46px;
  overflow: hidden;
  color: #4a90e2;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 50%;
}
.foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.identitas {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.nama {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  text-decoration: none;
}
a.nama:hover,
a.nama:focus-visible {
  color: #4a90e2;
}
.jabatan {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #6b7686;
}

@media (prefers-reduced-motion: reduce) {
  .kartu {
    transition: none;
  }
  .kartu:hover {
    transform: none;
  }
}

@media (min-width: 641px) {
  .grid {
    gap: 1.2rem;
  }
  .kartu {
    padding: 1.4rem 1.4rem 1.2rem 1.7rem;
  }
  .kutipan p {
    font-size: 0.95rem;
  }
}

@media (min-width: 1024px) {
  .grid {
    gap: 1.5rem;
  }
  .kutipan p {
    font-size: 1rem;
  }
}
</style>
