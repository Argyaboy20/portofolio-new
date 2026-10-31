<script setup>
import { RouterLink } from 'vue-router'
import { User } from '@lucide/vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <section>
    <h1>Dashboard</h1>
    <p class="sapa">Masuk sebagai {{ auth.email }}</p>

    <div class="baris">
      <RouterLink to="/admin/beranda/profil" class="kartu">
        <User :size="22" aria-hidden="true" />
        <strong>Profil</strong>
        <span>Nama, jabatan, ringkasan, foto, dan CV</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST) */
h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  color: #1f2d3d;
}
.sapa {
  margin: 0 0 1.5rem;
  color: #6b7686;
}
.baris {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.kartu {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem;
  color: #2e87f6;
  text-decoration: none;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.kartu:hover {
  box-shadow: 0 8px 20px rgba(46, 135, 246, 0.12);
  transform: translateY(-2px);
}
.kartu strong {
  color: #1f2d3d;
}
.kartu span {
  font-size: 0.85rem;
  color: #6b7686;
}

@media (min-width: 641px) {
  .baris {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}
</style>