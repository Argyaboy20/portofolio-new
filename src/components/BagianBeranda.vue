<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  id: { type: String, default: undefined },
  judul: { type: String, required: true },
})

const el = ref(null)
const tampil = ref(false)
let pengamat = null

onMounted(() => {
  if (!('IntersectionObserver' in window)) {
    tampil.value = true
    return
  }
  pengamat = new IntersectionObserver(
    ([entri]) => {
      if (entri.isIntersecting) {
        tampil.value = true
        pengamat.disconnect()
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -10px 0px' },
  )
  pengamat.observe(el.value)
})
onBeforeUnmount(() => pengamat?.disconnect())
</script>

<template>
  <section :id="id" ref="el" class="bagian" :class="{ masuk: tampil }">
    <div class="kepala">
      <h2 class="judul">{{ judul }}</h2>
      <slot name="aksi" />
    </div>
    <div class="isi">
      <slot :tampil="tampil" />
    </div>
  </section>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST)
   Dasar = mobile (<=640px). Override dengan min-width: 641px, 768px. */
.bagian {
  margin-bottom: 2.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.bagian.masuk {
  opacity: 1;
  transform: translateY(0);
}
.kepala {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 0.5rem;
  margin-bottom: 1.2rem;
}
.judul {
  position: relative;
  margin: 0;
  font-size: 1.3rem;
  color: #2c3e50;
}
.judul::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 40px;
  height: 3px;
  background: #4a90e2;
}
.isi {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #333;
}

@media (prefers-reduced-motion: reduce) {
  .bagian {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

@media (min-width: 641px) {
  .bagian {
    margin-bottom: 3rem;
  }
  .judul {
    font-size: 1.5rem;
  }
  .isi {
    font-size: 0.95rem;
  }
}

@media (min-width: 768px) {
  .bagian {
    margin-bottom: 3.5rem;
  }
  .judul {
    font-size: 1.75rem;
  }
  .judul::after {
    bottom: -10px;
    width: 50px;
    height: 4px;
  }
  .isi {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .bagian {
    margin-bottom: 4rem;
  }
  .judul {
    font-size: 2rem;
  }
}
</style>