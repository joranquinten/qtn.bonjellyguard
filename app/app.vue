<template>
  <div class="app-shell">
    <div class="background-container" aria-hidden="true">
      <div class="background-container__sea" />
      <SeaBubblesLayer variant="ambient" />
    </div>
    <div class="app-shell__content">
      <NuxtPage />
    </div>
  </div>
</template>

<style>
/* Global reset */
*, *::before, *::after { box-sizing: border-box; }

:root {
  --color-lagoon: #1E6083;
  --color-seafoam: #68AD9C;
  --color-rose: #D29EAD;
  --color-cream: #F1EBDF;
  --color-ink: #050706;
  --font-display: 'Rye', Georgia, serif;
  --font-body: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

html {
  min-height: 100%;
  background: #041e31;
}

body {
  margin: 0;
  min-height: 100%;
  font-family: var(--font-body);
  background: #041e31;
  color: var(--color-ink);
}

button,
input {
  font: inherit;
}
</style>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100%;
  isolation: isolate;
}

.app-shell__content {
  position: relative;
  z-index: 1;
}

.background-container {
  position: fixed;
  inset: 0;
  background: #072a42;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-container__sea {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 115%, rgba(104, 173, 156, 0.14), transparent 58%),
    radial-gradient(circle at 18% 82%, rgba(255, 255, 255, 0.03), transparent 28%),
    radial-gradient(circle at 82% 68%, rgba(255, 255, 255, 0.025), transparent 24%),
    linear-gradient(180deg, #0c3d5c 0%, #072a42 42%, #041e31 100%);
}
</style>
