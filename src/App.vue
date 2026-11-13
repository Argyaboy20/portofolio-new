<script setup>
import LoadingModal from './components/LoadingModal.vue'
import SambutanToast from './components/SambutanToast.vue'
import PembaruanBanner from './components/PembaruanBanner.vue'
import { usePembaruanOtomatis } from './utils/pembaruanOtomatis'

const { versiBaru, tutupBanner } = usePembaruanOtomatis()
</script>

<template>
  <RouterView />
  <LoadingModal />
  <SambutanToast />
  <PembaruanBanner v-if="versiBaru" @tutup="tutupBanner" />
</template>
