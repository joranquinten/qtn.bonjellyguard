<template>
  <div>
    <NuxtPage />
    <div class="background-container">
      <NuxtImg
        src="/images/background.webp"
        class="background"
        sizes="100vw sm:100vw md:100vw lg:100vw xl:100vw"
        densities="x1"
        quality="35"
        loading="eager"
        fetchpriority="low"
        alt=""
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<style scoped>
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.background {
  filter: blur(5px);
  position: absolute;
  inset: -10px;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  object-fit: cover;
  z-index: -1;
}
</style>
