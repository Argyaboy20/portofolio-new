<script setup>
defineProps({
  daftar: { type: Array, required: true },
  tampil: { type: Boolean, default: false },
})
</script>

<template>
  <div>
    <div v-for="k in daftar" :key="k.id" class="keahlian">
      <div class="baris">
        <span class="nama">{{ k.nama }}</span>
        <span class="persen">{{ k.persen }}%</span>
      </div>
      <div
        class="rel"
        role="progressbar"
        :aria-valuenow="k.persen"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="k.nama"
      >
        <div class="isi" :style="{ width: tampil ? k.persen + '%' : '0%' }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES (MOBILE FIRST) */
.keahlian {
  margin-bottom: 1.25rem;
}
.baris {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}
.nama {
  font-weight: 600;
}
.persen {
  padding: 2px 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(to right, #4a90e2, #50e3c2);
  border-radius: 10px;
}
.rel {
  height: 10px;
  margin-top: 8px;
  overflow: hidden;
  background: #e6ebf2;
  border-radius: 5px;
}
.isi {
  height: 100%;
  background: linear-gradient(to right, #4a90e2, #50e3c2);
  border-radius: 5px;
  transition: width 0.9s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .isi {
    transition: none;
  }
}
</style>