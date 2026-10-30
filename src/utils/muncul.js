// Pakai: <div class="muncul" v-muncul> atau v-muncul="2" (jeda berurutan, kelipatan 0,15 detik)
export const vMuncul = {
  mounted(el, binding) {
    if (binding.value) el.style.transitionDelay = `${binding.value * 0.15}s`
    if (!('IntersectionObserver' in window)) {
      el.classList.add('masuk')
      return
    }
    const pengamat = new IntersectionObserver(
      ([entri]) => {
        if (entri.isIntersecting) {
          el.classList.add('masuk')
          pengamat.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10px 0px' },
    )
    el._pengamat = pengamat
    pengamat.observe(el)
  },
  unmounted(el) {
    el._pengamat?.disconnect()
  },
}