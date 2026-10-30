const BULAN = {
  id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}
const POLA_BULAN = /^\d{4}-(0[1-9]|1[0-2])$/

function namaBulan(ym, bahasa) {
  const [tahun, bulan] = ym.split('-')
  return `${BULAN[bahasa][Number(bulan) - 1]} ${tahun}`
}

// mulai/selesai berbentuk "YYYY-MM"; selesai null = masih berjalan
export function formatDurasi(mulai, selesai, bahasa = 'id') {
  if (!POLA_BULAN.test(mulai ?? '')) return ''
  const b = bahasa === 'en' ? 'en' : 'id'
  const awal = namaBulan(mulai, b)
  if (!selesai) return `${awal} - ${b === 'en' ? 'present' : 'sekarang'}`
  if (!POLA_BULAN.test(selesai) || selesai === mulai) return awal
  return `${awal} - ${namaBulan(selesai, b)}`
}