<!-- pages/index.vue -->
 <script setup lang="ts">
const { loading, error, days, hasData, fetch, defaultDateRange } = useJellyForecast()

const range = defaultDateRange()
const startDate = ref(range.start)
const endDate = ref(range.end)
const todayStr = range.start

async function loadForecast() {
  await fetch(startDate.value, endDate.value)
}

// Load default 7-day forecast on mount
onMounted(() => loadForecast())
</script>

<template>
  <main class="app">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero__copy">
        <p class="hero__eyebrow">West Coast Watch</p>
        <h1 id="page-title">Bon Jelly Guard</h1>
        <p class="app-subtitle">
          Your sting forecast for Bonaire's leeward shore.
        </p>
      </div>
      <div class="hero__mascot">
        <NuxtImg
          src="/images/mascott.webp"
          alt="Cartoon jellyfish forecast mascot"
          width="360"
          height="360"
          densities="x1 x2"
          sizes="180px sm:220px md:280px"
          loading="eager"
        />
      </div>
    </section>

    <!-- Date range controls -->
    <section class="controls">
      <div>
        <p class="section-kicker">Pick your tide-card dates</p>
        <div class="controls__dates">
          <label>
            <span>From</span>
            <input type="date" v-model="startDate" :min="todayStr" />
          </label>
          <label>
            <span>To</span>
            <input type="date" v-model="endDate" :min="startDate" />
          </label>
        </div>
      </div>
      <button class="btn-primary" :disabled="loading" @click="loadForecast">
        {{ loading ? 'Loading…' : 'Show forecast' }}
      </button>
    </section>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <!-- Results -->
    <section v-if="hasData && !loading" class="results">
      <ForecastTable :days="days" />
      <p class="results__legend">
        Click any row to see time-of-day breakdown and forecast notes.
      </p>
    </section>

    <!-- Empty / initial state -->
    <div v-else-if="!loading && !error" class="empty-state">
      <p>Select a date range and load the forecast to see jelly risk.</p>
    </div>

    <section class="safety-callout" aria-label="Jellyfish sting safety">
      <div>
        <p class="section-kicker">Swim Prepared</p>
        <p class="safety-callout__text">
          Learn how to lower your sting risk and what to do if someone gets stung.
        </p>
      </div>
      <NuxtLink to="/safety" class="btn-primary safety-callout__link">
        Sting safety guide
      </NuxtLink>
    </section>

    <footer class="footer">
      This webapp was built by
      <NuxtLink href="https://bistaweb.com" title="BistaWeb: for your next web development project. Based on Bonaire." prefetch>BistaWeb.com</NuxtLink>
    </footer>
  </main>
</template>

<style scoped>
.app {
  width: min(1120px, calc(100% - 2rem));
  min-height: calc(100svh - 2rem);
  margin: 1rem auto;
  padding: clamp(1rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(190px, 32%);
  align-items: center;
  gap: clamp(1rem, 4vw, 3rem);
  overflow: hidden;
  background:
    radial-gradient(circle at 82% 16%, rgba(210, 158, 173, 0.9), transparent 8rem),
    linear-gradient(135deg, var(--color-cream), #fff8ec);
  border: 4px solid var(--color-ink);
  border-radius: 2rem;
  box-shadow: 10px 10px 0 rgba(5, 7, 6, 0.9);
  padding: clamp(1.5rem, 5vw, 3.5rem);
}

.hero::before {
  content: "";
  position: absolute;
  inset: 1rem;
  border: 2px dashed rgba(5, 7, 6, 0.35);
  border-radius: 1.4rem;
  pointer-events: none;
}

.hero__copy,
.hero__mascot {
  position: relative;
}

.hero__eyebrow,
.section-kicker {
  margin: 0 0 0.55rem;
  color: var(--color-lagoon);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero h1 {
  max-width: 12ch;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 7vw, 5.8rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 0.02em;
  color: var(--color-ink);
  text-shadow: 4px 4px 0 var(--color-seafoam);
  margin: 0 0 1rem;
}

.app-subtitle {
  max-width: 34rem;
  font-size: clamp(1rem, 2vw, 1.3rem);
  font-weight: 800;
  line-height: 1.45;
  color: #234250;
  margin: 0;
}

.hero__mascot {
  display: grid;
  place-items: center;
}

.hero__mascot img {
  width: min(100%, 280px);
  height: auto;
  filter: drop-shadow(8px 10px 0 rgba(5, 7, 6, 0.25));
  transform: rotate(3deg);
}

.safety-callout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: rgba(241, 235, 223, 0.94);
  border: 3px solid var(--color-ink);
  border-radius: 1.4rem;
  box-shadow: 7px 7px 0 rgba(5, 7, 6, 0.75);
  padding: 1rem;
}

.safety-callout__text {
  margin: 0;
  color: #234250;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.4;
}

.safety-callout__link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

/* Controls */
.controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.25rem;
  flex-wrap: wrap;
  background: rgba(241, 235, 223, 0.94);
  border: 3px solid var(--color-ink);
  border-radius: 1.4rem;
  box-shadow: 7px 7px 0 rgba(5, 7, 6, 0.75);
  padding: 1rem;
}

.controls__dates {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.controls label span {
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-lagoon);
}

.controls input[type="date"] {
  min-height: 2.8rem;
  padding: 0.55rem 0.8rem;
  border: 2px solid var(--color-ink);
  border-radius: 0.8rem;
  background: #fffaf0;
  color: var(--color-ink);
  box-shadow: inset 0 -3px 0 rgba(104, 173, 156, 0.25);
}

.btn-primary {
  min-height: 2.8rem;
  padding: 0.65rem 1.35rem;
  background: var(--color-rose);
  color: var(--color-ink);
  border: 2px solid var(--color-ink);
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 4px 4px 0 var(--color-ink);
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  align-self: flex-end;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-seafoam);
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 var(--color-ink);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Error */
.error-banner {
  background: #fff0f2;
  color: #6d1628;
  padding: 0.85rem 1rem;
  border: 2px solid var(--color-ink);
  border-radius: 1rem;
  font-size: 0.9rem;
  font-weight: 800;
}

.results {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background: rgba(241, 235, 223, 0.96);
  border: 3px solid var(--color-ink);
  border-radius: 1.4rem;
  box-shadow: 7px 7px 0 rgba(5, 7, 6, 0.75);
  padding: clamp(0.75rem, 2vw, 1.25rem);
}

/* Results */
.results__legend {
  font-size: 0.8rem;
  font-weight: 800;
  color: rgba(5, 7, 6, 0.65);
  margin-top: 0.75rem;
  text-align: center;
}

/* Empty */
.empty-state {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(241, 235, 223, 0.9);
  border: 3px dashed rgba(5, 7, 6, 0.45);
  border-radius: 1.4rem;
  color: rgba(5, 7, 6, 0.72);
  font-size: 1rem;
  font-weight: 800;
  padding: 2rem;
}

.footer {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--color-cream);
  text-align: center;

  a {
    color: var(--color-cream);
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.2em;
  }

  a:hover, a:focus {
    color: var(--color-rose);
  }
}

@media (max-width: 720px) {
  .app {
    width: min(100% - 1rem, 1120px);
    min-height: calc(100svh - 1rem);
    margin: 0.5rem auto;
    padding: 0.75rem;
  }

  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    border-radius: 1.4rem;
    box-shadow: 6px 6px 0 rgba(5, 7, 6, 0.9);
  }

  .hero h1,
  .app-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero__mascot {
    order: -1;
  }

  .hero__mascot img {
    width: min(58vw, 190px);
  }

  .controls,
  .safety-callout,
  .controls__dates {
    display: grid;
    width: 100%;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>
