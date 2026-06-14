<!-- components/ForecastTable.vue -->
<!-- Day-by-day forecast table with expandable time-of-day detail -->
<script setup lang="ts">
import { ref } from 'vue'
import type { DayRisk } from '~/composables/useRiskCalculator'

defineProps<{
  days: DayRisk[]
}>()

const expandedDate = ref<string | null>(null)

function toggleExpand(date: string) {
  expandedDate.value = expandedDate.value === date ? null : date
}

function formatWeekday(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>

<template>
  <div class="forecast-table">
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Overall</th>
          <th>Box Jelly</th>
          <th>Siphonophores</th>
          <th>Confidence</th>
          <th aria-label="Expand" />
        </tr>
      </thead>
      <tbody>
        <template v-for="day in days" :key="day.date">
          <!-- Main row -->
          <tr
            :class="['forecast-row', { 'forecast-row--expanded': expandedDate === day.date }]"
            @click="toggleExpand(day.date)"
          >
            <td class="forecast-row__date">
              <span class="date-weekday">{{ formatWeekday(day.date) }}</span>
              <span class="date-day">{{ formatDate(day.date) }}</span>
            </td>
            <td>
              <RiskBadge :level="day.overallLevel" :score="day.overallLikelihood" show-score />
            </td>
            <td>
              <RiskBadge :level="day.boxJellyLevel" :score="day.boxJellyLikelihood" show-score />
            </td>
            <td>
              <RiskBadge
                :level="day.siphonophoreScore === 0 && day.siphonophoreReason.includes('unknown') ? 'unknown' : day.siphonophoreLevel"
                :score="day.siphonophoreLikelihood"
                :show-score="!day.siphonophoreReason.includes('unknown')"
              />
            </td>
            <td>
              <span :class="['confidence-tag', `confidence-tag--${day.confidence}`]">
                {{ day.confidence }}
              </span>
            </td>
            <td class="forecast-row__chevron">
              <span :class="{ rotated: expandedDate === day.date }">▾</span>
            </td>
          </tr>

          <!-- Expanded detail row -->
          <tr v-if="expandedDate === day.date" class="forecast-detail">
            <td colspan="6">
              <div class="forecast-detail__inner">
                <!-- Time of day breakdown -->
                <div class="detail-section">
                  <h4>Time of day</h4>
                  <div class="tod-grid">
                    <div
                      v-for="tod in day.timeOfDayRisks"
                      :key="tod.timeOfDay"
                      class="tod-card"
                    >
                      <span class="tod-card__label">{{ capitalize(tod.timeOfDay) }}</span>
                      <RiskBadge
                        :level="tod.boxJellyLevel"
                        :score="tod.boxJellyLikelihood"
                        show-score
                      />
                      <span class="tod-card__reason">{{ tod.reason }}</span>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div class="detail-section detail-notes">
                  <p><strong>Box jelly:</strong> {{ day.boxJellyReason }}</p>
                  <p><strong>Siphonophores:</strong> {{ day.siphonophoreReason }}</p>
                  <p class="confidence-note">ⓘ {{ day.confidenceNote }}</p>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.forecast-table {
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
  background: var(--color-lagoon);
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

.forecast-row {
  cursor: pointer;
  background: #fffaf0;
  transition: background 0.15s, transform 0.15s;
}

.forecast-row:hover,
.forecast-row--expanded {
  background: #f4dfce;
}

.forecast-row td {
  padding: 0.85rem 0.75rem;
  border-bottom: 2px solid rgba(5, 7, 6, 0.12);
  vertical-align: middle;
}

.forecast-row__date {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.date-weekday {
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-lagoon);
}

.date-day {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--color-ink);
}

.forecast-row__chevron {
  text-align: right;
  color: var(--color-ink);
  font-size: 1.3rem;
  font-weight: 900;
}

.forecast-row__chevron span {
  display: inline-block;
  transition: transform 0.2s;
}

.forecast-row__chevron span.rotated {
  transform: rotate(180deg);
}

/* Confidence tag */
.confidence-tag {
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.18rem 0.45rem;
  border: 2px solid var(--color-ink);
  border-radius: 999px;
  box-shadow: 2px 2px 0 rgba(5, 7, 6, 0.22);
}

.confidence-tag--high {
  background: var(--color-seafoam);
  color: var(--color-ink);
}
.confidence-tag--medium {
  background: var(--color-rose);
  color: var(--color-ink);
}
.confidence-tag--low {
  background: var(--color-cream);
  color: var(--color-ink);
}

/* Expanded detail */
.forecast-detail td {
  padding: 0;
  background: #f6ead9;
  border-bottom: 2px solid rgba(5, 7, 6, 0.16);
}

.forecast-detail__inner {
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-section h4 {
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-lagoon);
  margin: 0 0 0.5rem;
}

.tod-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}

.tod-card {
  background: #fffaf0;
  border: 2px solid rgba(5, 7, 6, 0.8);
  border-radius: 0.85rem;
  padding: 0.7rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  box-shadow: 3px 3px 0 rgba(5, 7, 6, 0.16);
}

.tod-card__label {
  font-size: 0.75rem;
  font-weight: 900;
  color: var(--color-ink);
}

.tod-card__reason {
  font-size: 0.7rem;
  color: rgba(5, 7, 6, 0.68);
  line-height: 1.3;
}

.detail-notes p {
  font-size: 0.8rem;
  color: rgba(5, 7, 6, 0.82);
  margin: 0 0 0.3rem;
  line-height: 1.45;
}

.confidence-note {
  color: rgba(5, 7, 6, 0.62) !important;
  font-style: italic;
}

@media (max-width: 760px) {
  table {
    min-width: 720px;
  }
}
</style>
