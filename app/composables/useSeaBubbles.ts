export interface SeaBubble {
  id: number
  size: number
  left: number
  opacity: number
  duration: number
  delay: number
  drift: number
  wobble: number
}

export interface SeaBubbleConfig {
  maxBubbles: number
  minGroupSize: number
  maxGroupSize: number
  minSpawnDelay: number
  maxSpawnDelay: number
  minSize: number
  maxSize: number
  minOpacity: number
  maxOpacity: number
  minDuration: number
  maxDuration: number
  maxDrift: number
  maxWobble: number
}

export const LOADER_BUBBLE_CONFIG: SeaBubbleConfig = {
  maxBubbles: 64,
  minGroupSize: 3,
  maxGroupSize: 6,
  minSpawnDelay: 900,
  maxSpawnDelay: 2000,
  minSize: 4,
  maxSize: 20,
  minOpacity: 0.12,
  maxOpacity: 0.62,
  minDuration: 4.5,
  maxDuration: 10,
  maxDrift: 48,
  maxWobble: 26,
}

export const AMBIENT_BUBBLE_CONFIG: SeaBubbleConfig = {
  maxBubbles: 40,
  minGroupSize: 2,
  maxGroupSize: 5,
  minSpawnDelay: 1000,
  maxSpawnDelay: 2200,
  minSize: 5,
  maxSize: 14,
  minOpacity: 0.2,
  maxOpacity: 0.5,
  minDuration: 7,
  maxDuration: 13,
  maxDrift: 36,
  maxWobble: 20,
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomIntBetween(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function useSeaBubbles(config: SeaBubbleConfig) {
  const bubbles = ref<SeaBubble[]>([])

  let bubbleId = 0
  let groupTimer: ReturnType<typeof setTimeout> | undefined

  function spawnGroup() {
    const count = randomIntBetween(config.minGroupSize, config.maxGroupSize)
    const baseLeft = 8 + Math.random() * 84
    const batch: SeaBubble[] = []

    for (let i = 0; i < count; i++) {
      batch.push({
        id: bubbleId++,
        size: randomBetween(config.minSize, config.maxSize),
        left: baseLeft + (Math.random() - 0.5) * 12,
        opacity: randomBetween(config.minOpacity, config.maxOpacity),
        duration: randomBetween(config.minDuration, config.maxDuration),
        delay: Math.random() * 1.2,
        drift: (Math.random() - 0.5) * config.maxDrift,
        wobble: randomBetween(4, config.maxWobble),
      })
    }

    bubbles.value = [...bubbles.value, ...batch].slice(-config.maxBubbles)

    for (const bubble of batch) {
      const lifetime = (bubble.duration + bubble.delay) * 1000 + 200
      setTimeout(() => {
        bubbles.value = bubbles.value.filter((item) => item.id !== bubble.id)
      }, lifetime)
    }
  }

  function scheduleGroups() {
    spawnGroup()
    const nextDelay = randomBetween(config.minSpawnDelay, config.maxSpawnDelay)
    groupTimer = setTimeout(scheduleGroups, nextDelay)
  }

  onMounted(() => {
    spawnGroup()
    spawnGroup()
    scheduleGroups()
  })

  onUnmounted(() => {
    if (groupTimer) clearTimeout(groupTimer)
  })

  return { bubbles }
}
