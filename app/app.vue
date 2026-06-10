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
  background: #1E6083;
  z-index: -1;
}

.background-container::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(30, 96, 131, 0.88), rgba(5, 7, 6, 0.45));
}

.background {
  filter: blur(7px) saturate(0.8);
  opacity: 0.42;
  position: absolute;
  inset: -10px;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  object-fit: cover;
  z-index: -1;
}
</style>
