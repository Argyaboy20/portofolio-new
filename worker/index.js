const URL_PING = 'https://portofolio-new-api.onrender.com/api/ping'

// Hanya kunci buatan backend: kategori/uuid.webp atau .pdf
const POLA_MEDIA =
  /^\/media\/((?:profil|cv|project|penghargaan|cuplikan|putar|sampul)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:webp|pdf))$/

const tidakAda = () =>
  new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })

function kepalaMedia(objek) {
  const h = new Headers()
  objek.writeHttpMetadata(h)
  h.set('etag', objek.httpEtag)
  // Nama objek acak dan tidak pernah ditimpa, jadi aman di-cache selamanya
  h.set('Cache-Control', 'public, max-age=31536000, immutable')
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('Cross-Origin-Resource-Policy', 'cross-origin')
  return h
}

async function layaniMedia(request, env) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  }
  const cocok = POLA_MEDIA.exec(new URL(request.url).pathname)
  if (!cocok) return tidakAda()
  const kunci = cocok[1]

  if (request.method === 'HEAD') {
    const meta = await env.MEDIA.head(kunci)
    return meta ? new Response(null, { status: 200, headers: kepalaMedia(meta) }) : tidakAda()
  }

  // onlyIf: If-None-Match dari browser dijawab 304 tanpa mengirim ulang isinya
  const objek = await env.MEDIA.get(kunci, { onlyIf: request.headers })
  if (objek === null) return tidakAda()
  return new Response(objek.body ?? null, {
    status: objek.body ? 200 : 304,
    headers: kepalaMedia(objek),
  })
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname.startsWith('/media/')) {
      return layaniMedia(request, env)
    }
    return env.ASSETS.fetch(request)
  },
  async scheduled(_event, _env, ctx) {
    ctx.waitUntil(fetch(URL_PING, { signal: AbortSignal.timeout(60000) }).catch(() => {}))
  },
}