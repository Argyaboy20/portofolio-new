// Pakai: <div class="muncul" v-muncul> atau v-muncul="2" (jeda berurutan, kelipatan 0,15 detik)

// Sekali saja: muncul saat terlihat, tetap tampil. Dipakai halaman project.
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

// Dua arah: masuk saat digulir ke bawah, tetap tampil bila lewat ke atas,
// hilang halus hanya bila lewat ke bawah (gulir ke atas). Dipakai Beranda dan Biodata.
export const vMunculDua = {
  mounted(el, binding) {
    const jeda = binding.value ? `${binding.value * 0.15}s` : '0s'
    if (!('IntersectionObserver' in window)) {
      el.classList.add('masuk')
      return
    }
    const pengamat = new IntersectionObserver(
      ([entri]) => {
        if (entri.isIntersecting) {
          el.style.transitionDelay = jeda
          el.classList.add('masuk')
        } else if (entri.boundingClientRect.top < 0) {
          // Di atas layar: sudah dilewati, tetap tampil
          el.style.transitionDelay = '0s'
          el.classList.add('masuk')
        } else {
          // Di bawah layar: keluar halus tanpa jeda
          el.style.transitionDelay = '0s'
          el.classList.remove('masuk')
        }
      },
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    )
    el._pengamat = pengamat
    pengamat.observe(el)
  },
  unmounted(el) {
    el._pengamat?.disconnect()
  },
}
