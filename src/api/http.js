const BASE = import.meta.env.VITE_API_URL ?? ''
import { useLoadingStore } from '../stores/loading'
const TIMEOUT_MS = 75000 // supaya server Render yang baru bangun tidak diputus
const KUNCI_SESI = 'authSession'
const PESAN_METODE = {
  GET: 'Memuat data...',
  POST: 'Menyimpan data...',
  PATCH: 'Menyimpan perubahan...',
  PUT: 'Menyimpan perubahan...',
  DELETE: 'Menghapus data...',
}
const PESAN_PATH = {
  '/api/auth/admin/login': 'Masuk ke akun...',
}

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

function ambilToken() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI_SESI) ?? '{}').token ?? ''
  } catch {
    return ''
  }
}

export async function api(path, { method = 'GET', body, auth = true, loading = true, pesan } = {}) {
  const modal = loading ? useLoadingStore() : null
  modal?.mulai(pesan ?? PESAN_PATH[path] ?? PESAN_METODE[method] ?? 'Memuat data...')
  const headers = {}
  const isForm = body instanceof FormData
  if (body && !isForm) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = ambilToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const kontrol = new AbortController()
  const timer = setTimeout(() => kontrol.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      signal: kontrol.signal,
    })
  } catch (e) {
    throw new ApiError(
      0,
      e.name === 'AbortError'
        ? 'Server terlalu lama merespons. Coba lagi.'
        : 'Tidak bisa terhubung ke server.',
    )
  } finally {
    clearTimeout(timer)
    modal?.selesai()
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    // Token ditolak server: bersihkan sesi lalu kembali ke beranda
    if (res.status === 401 && auth) {
      localStorage.removeItem(KUNCI_SESI)
      window.location.assign('/')
    }
    throw new ApiError(res.status, data?.message ?? 'Terjadi kesalahan', data)
  }
  return data
}