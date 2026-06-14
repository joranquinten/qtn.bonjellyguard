<!-- components/RiskBadge.vue -->
<!-- Displays a traffic-light risk level with optional likelihood percentage -->
<script setup lang="ts">
import type { RiskLevel } from '~/composables/useRiskCalculator'

const props = defineProps<{
  level: RiskLevel | 'unknown'
  score?: number
  showScore?: boolean
}>()

const label = computed(() => {
  switch (props.level) {
    case 'high': return 'High'
    case 'medium': return 'Medium'
    case 'low': return 'Low'
    case 'unknown': return 'Unknown'
    default: return '—'
  }
})
</script>

<template>
  <span :class="['risk-badge', `risk-badge--${level}`]">
    <span class="risk-badge__dot" aria-hidden="true" />
    <span class="risk-badge__label">{{ label }}</span>
    <span v-if="showScore" class="risk-badge__score">{{ score }}%</span>
  </span>
</template>

<style scoped>
.risk-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.23rem 0.6rem;
  border: 2px solid var(--color-ink);
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.01em;
  white-space: nowrap;
  box-shadow: 2px 2px 0 rgba(5, 7, 6, 0.24);
}

.risk-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.risk-badge__score {
  opacity: 0.72;
  font-weight: 800;
  font-size: 0.75rem;
}

/* Low */
.risk-badge--low {
  background: #d8f1df;
  color: #123f26;
}
.risk-badge--low .risk-badge__dot {
  background: var(--color-seafoam);
}

/* Medium */
.risk-badge--medium {
  background: #f7ddb0;
  color: #5b3510;
}
.risk-badge--medium .risk-badge__dot {
  background: #d99225;
}

/* High */
.risk-badge--high {
  background: #f0bdc9;
  color: #5d1022;
}
.risk-badge--high .risk-badge__dot {
  background: var(--color-rose);
}

/* Unknown */
.risk-badge--unknown {
  background: var(--color-cream);
  color: rgba(5, 7, 6, 0.68);
}
.risk-badge--unknown .risk-badge__dot {
  background: rgba(5, 7, 6, 0.42);
}
</style>
