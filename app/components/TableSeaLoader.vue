<!-- components/TableSeaLoader.vue -->
<!-- Reserved sea-themed loading state for forecast tables -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  minHeight?: string
}>(), {
  minHeight: 'min(360px, 42vh)',
})

const letters = 'Loading'.split('')
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
    <SeaBubblesLayer variant="loader" />

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

@media (prefers-reduced-motion: reduce) {
  .sea-loader__letter {
    animation: none;
  }
}
</style>
