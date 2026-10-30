// Penanda tautan di dalam teks dari admin: [[teks|tujuan]]
const POLA = /\[\[([^\]|]*)\|([^\]]*)\]\]/g

// Hanya https:// atau alamat internal "/..." (bukan "//host")
export function tujuanAman(tujuan) {
  return /^(https:\/\/|\/(?!\/))/.test(tujuan)
}

export function tautanEksternal(tujuan) {
  return tujuan.startsWith('https://')
}

// Memecah teks menjadi potongan { teks } atau { teks, tujuan }.
// Dirender dengan v-for, BUKAN v-html, jadi isi dari admin tidak pernah dianggap HTML.
export function pecahTeks(teks) {
  const hasil = []
  let akhir = 0
  for (const m of String(teks ?? '').matchAll(POLA)) {
    if (m.index > akhir) hasil.push({ teks: teks.slice(akhir, m.index) })
    const label = m[1].trim()
    const tujuan = m[2].trim()
    hasil.push(label && tujuanAman(tujuan) ? { teks: label, tujuan } : { teks: m[1] })
    akhir = m.index + m[0].length
  }
  if (akhir < String(teks ?? '').length) hasil.push({ teks: teks.slice(akhir) })
  return hasil
}