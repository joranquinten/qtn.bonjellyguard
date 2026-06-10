<!-- components/ForecastTable.vue -->
<!-- Day-by-day forecast table with expandable time-of-day detail -->
<script setup lang="ts">
import { ref } from 'vue'
import type { DayRisk, RiskLevel } from '~/composables/useRiskCalculator'

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

function adjustedScore(base: number, modifier: number): number {
  return Math.min(100, Math.round(base * modifier))
}

function adjustedLevel(base: number, modifier: number): RiskLevel {
  const score = adjustedScore(base, modifier)
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
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
              <RiskBadge :level="day.overallLevel" :score="day.overallScore" show-score />
            </td>
            <td>
              <RiskBadge :level="day.boxJellyLevel" :score="day.boxJellyScore" show-score />
            </td>
            <td>
              <RiskBadge
                :level="day.siphonophoreScore === 0 && day.siphonophoreReason.includes('unknown') ? 'unknown' : day.siphonophoreLevel"
                :score="day.siphonophoreScore"
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
                        :level="adjustedLevel(day.boxJellyScore, tod.boxJellyModifier)"
                        :score="adjustedScore(day.boxJellyScore, tod.boxJellyModifier)"
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
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

thead th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.forecast-row {
  cursor: pointer;
  transition: background 0.15s;
}

.forecast-row:hover,
.forecast-row--expanded {
  background: #f9fafb;
}

.forecast-row td {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.forecast-row__date {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.date-weekday {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
}

.date-day {
  font-weight: 500;
  color: #111827;
}

.forecast-row__chevron {
  text-align: right;
  color: #9ca3af;
  font-size: 1.1rem;
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
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.confidence-tag--high {
  background: #eff6ff;
  color: #1d4ed8;
}
.confidence-tag--medium {
  background: #fff7ed;
  color: #c2410c;
}
.confidence-tag--low {
  background: #f3f4f6;
  color: #6b7280;
}

/* Expanded detail */
.forecast-detail td {
  padding: 0;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.forecast-detail__inner {
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-section h4 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin: 0 0 0.5rem;
}

.tod-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}

.tod-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.tod-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.tod-card__reason {
  font-size: 0.7rem;
  color: #6b7280;
  line-height: 1.3;
}

.detail-notes p {
  font-size: 0.8rem;
  color: #374151;
  margin: 0 0 0.3rem;
}

.confidence-note {
  color: #6b7280 !important;
  font-style: italic;
}
</style>
