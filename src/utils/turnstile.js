const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ''
const URL_SKRIP = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const BATAS_TUNGGU_MS = 30000

export class TurnstileError extends Error {}

let muatSkrip = null
function muat() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!muatSkrip) {
    muatSkrip = new Promise((ok, gagal) => {
      const s = document.createElement('script')
      s.src = URL_SKRIP
      s.async = true
      s.defer = true
      s.onload = () => ok(window.turnstile)
      s.onerror = () => {
        muatSkrip = null
        gagal(new TurnstileError('Verifikasi keamanan gagal dimuat. Muat ulang halaman lalu coba lagi.'))
      }
      document.head.appendChild(s)
    })
  }
  return muatSkrip
}

// Tanpa VITE_TURNSTILE_SITE_KEY semuanya mati dan token = '' (server melewati verifikasi bila secret kosong)
export function buatTurnstile(elemen) {
  if (!SITE_KEY) {
    return { ambilToken: async () => '', hancurkan() {} }
  }

  let widgetId = null
  let token = ''
  let menunggu = null

  const siap = muat().then((ts) => {
    widgetId = ts.render(elemen, {
      sitekey: SITE_KEY,
      appearance: 'interaction-only', // tampil hanya bila pengunjung perlu dicek
      callback: (t) => {
        token = t
        menunggu?.ok(t)
        menunggu = null
      },
      'error-callback': () => {
        menunggu?.gagal(new TurnstileError('Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.'))
        menunggu = null
        return true
      },
      'expired-callback': () => {
        token = ''
      },
    })
  })

  async function ambilToken() {
    await siap
    if (!token) {
      token = await new Promise((ok, gagal) => {
        menunggu = { ok, gagal }
        setTimeout(() => {
          if (menunggu) {
            menunggu = null
            gagal(new TurnstileError('Verifikasi keamanan terlalu lama. Coba lagi.'))
          }
        }, BATAS_TUNGGU_MS)
      })
    }
    const dipakai = token
    token = ''
    window.turnstile.reset(widgetId) // token hanya sekali pakai; minta yang baru
    return dipakai
  }

  function hancurkan() {
    if (widgetId !== null && window.turnstile) window.turnstile.remove(widgetId)
  }

  return { ambilToken, hancurkan }
}