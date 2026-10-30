<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Briefcase, Heart, Users } from '@lucide/vue'
import { useBahasaStore } from '../stores/bahasa'

const props = defineProps({
  jenis: { type: String, required: true }, // 'karir' atau 'relawan'
  kartu: { type: Object, required: true },
})

const bahasa = useBahasaStore()
const eksternal = computed(() => props.kartu.tujuan.startsWith('https://'))
const atribut = computed(() =>
  eksternal.value
    ? { href: props.kartu.tujuan, target: '_blank', rel: 'noopener noreferrer' }
    : { to: props.kartu.tujuan },
)
const Ikon = computed(() => (props.jenis === 'relawan' ? Users : Briefcase))
</script>

<template>
  <component :is="eksternal ? 'a' : RouterLink" v-bind="atribut" class="kartu" :class="jenis">
    <div class="ikon"><component :is="Ikon" :size="24" aria-hidden="true" /></div>
    <div class="rincian">
      <h3>{{ bahasa.pilih(kartu.judulId, kartu.judulEn) }}</h3>
      <p>{{ bahasa.pilih(kartu.deskripsiId, kartu.deskripsiEn) }}</p>
    </div>
    <div v-if="jenis === 'relawan'" class="lencana"><Heart :size="16" aria-hidden="true" /></div>
  </component>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px, 768px, 1024px. */
.kartu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1rem;
  color: #fff;
  text-align: center;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}
.kartu:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
.karir {
  background: #1b508b;
}
.karir:hover {
  background: #3a80d2;
}
.relawan {
  background: #5b62b3;
}
.relawan:hover {
  background: #6a71c2;
}
.ikon {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  margin-bottom: 0.6rem;
  color: #003cff;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  transition: transform 0.3s ease;
}
.relawan .ikon {
  color: #fffcdc;
  background: #6da0e1;
}
.kartu:hover .ikon {
  transform: scale(1.1) rotate(10deg);
}
.rincian {
  flex: 1;
  width: 100%;
}
.rincian h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}
.rincian p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
}
.karir .rincian p::after {
  content: '\2192';
  display: inline-block;
  margin-left: 8px;
  transition: transform 0.3s ease;
}
.karir:hover .rincian p::after {
  transform: translateX(5px);
}
.lencana {
  display: grid;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  color: #fff;
  background: rgba(20, 40, 29, 0.1);
  border-radius: 50%;
}

@media (prefers-reduced-motion: reduce) {
  .kartu,
  .ikon {
    transition: none;
  }
}

@media (min-width: 641px) {
  .kartu {
    padding: 1.3rem;
  }
  .ikon {
    width: 60px;
    height: 60px;
  }
  .rincian h3 {
    font-size: 1.25rem;
  }
  .rincian p {
    font-size: 0.95rem;
  }
}

@media (min-width: 768px) {
  .kartu {
    flex-direction: row;
    gap: 1.5rem;
    padding: 1.4rem;
    text-align: left;
  }
  .ikon {
    margin: 0;
  }
  .lencana {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>