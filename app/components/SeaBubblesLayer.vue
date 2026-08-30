<!-- Shared rising bubble layer for loaders and ambient backgrounds -->
<script setup lang="ts">
import {
  useSeaBubbles,
  AMBIENT_BUBBLE_CONFIG,
  LOADER_BUBBLE_CONFIG,
  type SeaBubbleConfig,
} from '~/composables/useSeaBubbles'

const props = withDefaults(defineProps<{
  variant?: 'loader' | 'ambient'
  config?: SeaBubbleConfig
}>(), {
  variant: 'loader',
})

const bubbleConfig = computed(() => props.config ?? (
  props.variant === 'ambient' ? AMBIENT_BUBBLE_CONFIG : LOADER_BUBBLE_CONFIG
))

const { bubbles } = useSeaBubbles(bubbleConfig.value)
</script>

<template>
  <div
    class="sea-bubbles"
    :class="`sea-bubbles--${variant}`"
    aria-hidden="true"
  >
    <span
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="sea-bubble-track"
      :style="{
        '--bubble-left': `${bubble.left}%`,
        '--bubble-duration': `${bubble.duration}s`,
        '--bubble-delay': `${bubble.delay}s`,
        '--bubble-drift': `${bubble.drift}px`,
        '--bubble-wobble': `${bubble.wobble}px`,
        '--bubble-opacity': bubble.opacity,
        '--bubble-size': `${bubble.size}px`,
      }"
    >
      <span class="sea-bubble-body" />
    </span>
  </div>
</template>

<style>
.sea-bubbles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.sea-bubbles--ambient {
  z-index: 2;
}

.sea-bubbles--ambient .sea-bubble-body {
  border-color: rgba(255, 255, 255, 0.4);
  background: radial-gradient(
    circle at 30% 28%,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.35) 45%,
    rgba(255, 255, 255, 0.08) 100%
  );
}

.sea-bubble-track {
  position: absolute;
  bottom: -10%;
  left: var(--bubble-left);
  animation: sea-bubble-rise-y var(--bubble-duration) var(--bubble-delay) linear forwards;
  will-change: transform;
}

.sea-bubble-body {
  display: block;
  width: var(--bubble-size);
  height: var(--bubble-size);
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 28%,
    rgba(255, 255, 255, 0.85),
    rgba(255, 255, 255, 0.2) 45%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.35);
  opacity: 0;
  animation:
    sea-bubble-wobble var(--bubble-duration) var(--bubble-delay) ease-in-out forwards,
    sea-bubble-fade var(--bubble-duration) var(--bubble-delay) linear forwards;
  will-change: transform, opacity;
}

@keyframes sea-bubble-rise-y {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-115vh);
  }
}

@keyframes sea-bubble-wobble {
  0% {
    transform: translateX(0) scale(0.65);
  }
  25% {
    transform: translateX(calc(var(--bubble-wobble) * 0.5)) scale(0.95);
  }
  50% {
    transform: translateX(calc(var(--bubble-drift) * -0.2)) scale(1.05);
  }
  75% {
    transform: translateX(calc(var(--bubble-wobble) * -0.6)) scale(0.92);
  }
  100% {
    transform: translateX(calc(var(--bubble-drift) * 0.85)) scale(0.75);
  }
}

@keyframes sea-bubble-fade {
  0% {
    opacity: 0;
  }
  8% {
    opacity: var(--bubble-opacity);
  }
  88% {
    opacity: calc(var(--bubble-opacity) * 0.45);
  }
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sea-bubble-body {
    animation: sea-bubble-fade var(--bubble-duration) var(--bubble-delay) linear forwards;
  }
}
</style>
