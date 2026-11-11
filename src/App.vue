<script setup>
import LoadingModal from './components/LoadingModal.vue'
import SambutanToast from './components/SambutanToast.vue'
</script>

<template>
  <RouterView />
  <LoadingModal />
  <SambutanToast />
</template>
