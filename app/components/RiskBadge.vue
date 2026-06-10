<!-- components/RiskBadge.vue -->
<!-- Displays a traffic-light risk level with optional percentage score -->
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
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.risk-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.risk-badge__score {
  opacity: 0.75;
  font-weight: 400;
  font-size: 0.75rem;
}

/* Low */
.risk-badge--low {
  background: #dcfce7;
  color: #166534;
}
.risk-badge--low .risk-badge__dot {
  background: #22c55e;
}

/* Medium */
.risk-badge--medium {
  background: #fef9c3;
  color: #854d0e;
}
.risk-badge--medium .risk-badge__dot {
  background: #eab308;
}

/* High */
.risk-badge--high {
  background: #fee2e2;
  color: #991b1b;
}
.risk-badge--high .risk-badge__dot {
  background: #ef4444;
}

/* Unknown */
.risk-badge--unknown {
  background: #f3f4f6;
  color: #6b7280;
}
.risk-badge--unknown .risk-badge__dot {
  background: #9ca3af;
}
</style>
