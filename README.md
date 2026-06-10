# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Netlify API Cache Verification

The `/api/weather` and `/api/moon` routes are cached for 24 hours on Netlify's CDN and vary by the `start` and `end` query parameters.

After deploying to Netlify, verify the cache with:

```bash
curl -I 'https://<site-domain>/api/weather?start=2026-06-10&end=2026-06-16'
curl -I 'https://<site-domain>/api/weather?start=2026-06-10&end=2026-06-16'
curl -I 'https://<site-domain>/api/weather?start=2026-06-11&end=2026-06-16'
```

Check that repeated identical requests report a cache hit or stale response in `Cache-Status`, and that changing `start` or `end` creates a separate cached response instead of reusing the first range. `netlify dev` does not exercise the CDN cache, so this must be checked against a deployed site.
