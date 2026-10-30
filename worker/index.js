const URL_PING = 'https://portofolio-new-api.onrender.com/api/ping'

export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request)
  },
  async scheduled(_event, _env, ctx) {
    ctx.waitUntil(fetch(URL_PING, { signal: AbortSignal.timeout(60000) }).catch(() => {}))
  },
}