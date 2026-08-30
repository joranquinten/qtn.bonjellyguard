<!-- components/TableSeaLoader.vue -->
<!-- Reserved sea-themed loading state for forecast tables -->
<script setup lang="ts">
interface Bubble {
  id: number
  size: number
  left: number
  opacity: number
  duration: number
  delay: number
  drift: number
  wobble: number
}

const props = withDefaults(defineProps<{
  minHeight?: string
}>(), {
  minHeight: 'min(360px, 42vh)',
})

const letters = 'Loading'.split('')
const bubbles = ref<Bubble[]>([])

let bubbleId = 0
let groupTimer: ReturnType<typeof setTimeout> | undefined

function spawnGroup() {
  const count = 3 + Math.floor(Math.random() * 4)
  const baseLeft = 12 + Math.random() * 76
  const batch: Bubble[] = []

  for (let i = 0; i < count; i++) {
    batch.push({
      id: bubbleId++,
      size: 4 + Math.random() * 16,
      left: baseLeft + (Math.random() - 0.5) * 14,
      opacity: 0.12 + Math.random() * 0.5,
      duration: 4.5 + Math.random() * 5.5,
      delay: Math.random() * 0.9,
      drift: (Math.random() - 0.5) * 48,
      wobble: 6 + Math.random() * 20,
    })
  }

  bubbles.value = [...bubbles.value, ...batch].slice(-64)

  for (const bubble of batch) {
    const lifetime = (bubble.duration + bubble.delay) * 1000 + 200
    setTimeout(() => {
      bubbles.value = bubbles.value.filter((item) => item.id !== bubble.id)
    }, lifetime)
  }
}

function scheduleGroups() {
  spawnGroup()
  const nextDelay = 900 + Math.random() * 1100
  groupTimer = setTimeout(scheduleGroups, nextDelay)
}

onMounted(() => {
  scheduleGroups()
})

onUnmounted(() => {
  if (groupTimer) clearTimeout(groupTimer)
})
</script>

<template>
  <div
    class="sea-loader"
    :style="{ minHeight: props.minHeight }"
    role="status"
    aria-live="polite"
    aria-label="Loading forecast"
  >
    <div class="sea-loader__depth" aria-hidden="true" />

    <div class="sea-loader__bubbles" aria-hidden="true">
      <span
        v-for="bubble in bubbles"
        :key="bubble.id"
        class="sea-loader__bubble-track"
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
        <span class="sea-loader__bubble-body" />
      </span>
    </div>

    <p class="sea-loader__text">
      <span
        v-for="(letter, index) in letters"
        :key="`${letter}-${index}`"
        class="sea-loader__letter"
        :style="{ '--letter-delay': `${index * 0.14}s` }"
      >{{ letter }}</span>
    </p>
  </div>
</template>

<style scoped>
.sea-loader {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  border: 3px solid rgba(5, 7, 6, 0.85);
  box-shadow: inset 0 0 3rem rgba(0, 0, 0, 0.35);
  background:
    radial-gradient(ellipse at 50% 120%, rgba(104, 173, 156, 0.18), transparent 55%),
    linear-gradient(180deg, #0c3d5c 0%, #072a42 45%, #041e31 100%);
}

.sea-loader__depth {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.04), transparent 28%),
    radial-gradient(circle at 78% 65%, rgba(255, 255, 255, 0.03), transparent 24%);
  pointer-events: none;
}

.sea-loader__bubbles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.sea-loader__bubble-track {
  position: absolute;
  bottom: -10%;
  left: var(--bubble-left);
  animation: bubble-rise-y var(--bubble-duration) var(--bubble-delay) linear forwards;
  will-change: transform;
}

.sea-loader__bubble-body {
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
    bubble-wobble var(--bubble-duration) var(--bubble-delay) ease-in-out forwards,
    bubble-fade var(--bubble-duration) var(--bubble-delay) linear forwards;
  will-change: transform, opacity;
}

.sea-loader__text {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(0.85rem, 3vw, 1.35rem);
  margin: 0;
  display: flex;
  justify-content: center;
  gap: 0.06em;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2.1rem);
  font-weight: 400;
  letter-spacing: 0.08em;
  color: rgba(241, 235, 223, 0.92);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
  z-index: 1;
}

.sea-loader__letter {
  display: inline-block;
  animation: letter-float 2.6s var(--letter-delay) ease-in-out infinite;
}

@keyframes letter-float {
  0%, 100% {
    transform: translateY(0) rotate(-3deg);
  }
  35% {
    transform: translateY(-7px) rotate(2deg);
  }
  70% {
    transform: translateY(-3px) rotate(-1deg);
  }
}

@keyframes bubble-rise-y {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-115vh);
  }
}

@keyframes bubble-wobble {
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

@keyframes bubble-fade {
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
  .sea-loader__letter {
    animation: none;
  }

  .sea-loader__bubble-body {
    animation: bubble-fade var(--bubble-duration) var(--bubble-delay) linear forwards;
  }
}
</style>
