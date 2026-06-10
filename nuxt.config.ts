// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/image', '@nuxt/fonts'],
  routeRules: {
    '/api/weather': {
      cache: { maxAge: 60 * 60 * 24, swr: true },
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Netlify-CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400, durable',
        'Netlify-Vary': 'query=start|end'
      }
    },
    '/api/moon': {
      cache: { maxAge: 60 * 60 * 24, swr: true },
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Netlify-CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400, durable',
        'Netlify-Vary': 'query=start|end'
      }
    }
  },
  image: {
    provider: import.meta.env.NETLIFY ? 'netlify' : 'ipx'
  }
})