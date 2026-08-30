<!-- components/OstracodTable.vue -->
<!-- Ostracod occurrence table — shown only when qualifying days fall in the date range -->
<script setup lang="ts">
import type { OstracodDay } from '~/composables/useOstracodCalculator'

defineProps<{
  days: OstracodDay[]
}>()

function formatWeekday(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <section class="ostracod-section" aria-labelledby="ostracod-title">
    <div class="ostracod-section__header">
      <p class="section-kicker">Bioluminescence watch</p>
      <h2 id="ostracod-title">Ostracods</h2>
      <p class="ostracod-section__note">
        Peak activity about 45 minutes after sundown, 2–6 days after full moon.
      </p>
    </div>

    <div class="ostracod-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Days after full moon</th>
            <th>Peak time</th>
            <th>Probability</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day in days" :key="day.date" class="ostracod-row">
            <td class="ostracod-row__date">
              <span class="date-weekday">{{ formatWeekday(day.date) }}</span>
              <span class="date-day">{{ formatDate(day.date) }}</span>
            </td>
            <td>Day {{ day.daysSinceFullMoon }}</td>
            <td>{{ day.peakTime }}</td>
            <td>
              <RiskBadge :level="day.probability" tone="positive" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.ostracod-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 3px dashed rgba(5, 7, 6, 0.2);
}

.ostracod-section__header h2 {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 400;
  color: var(--color-ink);
}

.section-kicker {
  margin: 0 0 0.55rem;
  color: var(--color-lagoon);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.ostracod-section__note {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 800;
  color: rgba(5, 7, 6, 0.68);
  line-height: 1.4;
}

.ostracod-table {
  width: 100%;
  overflow-x: auto;
  border-radius: 1rem;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
}

thead th {
  text-align: left;
  padding: 0.75rem;
  background: #3d5a80;
  color: var(--color-cream);
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 3px solid var(--color-ink);
}

thead th:first-child {
  border-top-left-radius: 0.85rem;
}

thead th:last-child {
  border-top-right-radius: 0.85rem;
}

.ostracod-row {
  background: #eef4ff;
}

.ostracod-row td {
  padding: 0.85rem 0.75rem;
  border-bottom: 2px solid rgba(5, 7, 6, 0.12);
  vertical-align: middle;
}

.ostracod-row__date {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.date-weekday {
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #3d5a80;
}

.date-day {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--color-ink);
}

@media (max-width: 760px) {
  table {
    min-width: 560px;
  }
}
</style>
