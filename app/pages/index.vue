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
    <header class="app-header">
      <h1>Bonaire Jelly Forecast</h1>
      <p class="app-subtitle">Sting risk for the west coast based on lunar cycle and wind conditions</p>
    </header>

    <!-- Date range controls -->
    <section class="controls">
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
    <footer class="footer">This webapp was built by <NuxtLink href="https://bistaweb.com" title="BistaWeb: for your next web development project. Based on Bonaire." prefetch>BistaWeb.com</NuxtLink></footer>
  </main>
</template>

<style>
/* Global reset */
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f9fafb;
  color: #111827;
}
</style>

<style scoped>
.app {
  max-width: 860px;
  background: #f8f8f8;
  border-radius: 0.4rem;
  height: 90vh;
  margin: 5vh auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  flex: 0 0 auto;
  margin-bottom: 2rem;
}

.app-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.app-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

/* Controls */
.controls {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 0 0 auto;
  margin-bottom: 2rem;
}

.controls__dates {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.controls label span {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
}

.controls input[type="date"] {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #111827;
}

.btn-primary {
  padding: 0.55rem 1.25rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  align-self: flex-end;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Error */
.error-banner {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  flex: 0 0 auto;
  margin-bottom: 1.5rem;
}

.results {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Results */
.results__legend {
  font-size: 0.75rem;
  color: #9ca3af;
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
  color: #9ca3af;
  font-size: 0.95rem;
}

.footer {
  font-size: 0.72rem;
  color: #333;
  text-align: center;

  a {
    color: #111;
    text-decoration: underline;
  }

  a:hover, a:focus {
    color: #000;
  }
}
</style>
