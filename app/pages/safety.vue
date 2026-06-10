<template>
  <main class="safety-page">
    <NuxtLink to="/" class="back-link">← Back to forecast</NuxtLink>

    <section class="safety-hero" aria-labelledby="safety-title">
      <p class="section-kicker">Beach Safety</p>
      <h1 id="safety-title">Jelly Sting Safety</h1>
      <p>
        A quick guide for lowering your sting risk and responding calmly if someone
        is stung on Bonaire's west coast.
      </p>
    </section>

    <section class="safety-grid" aria-label="Jellyfish sting safety guidance">
      <article class="safety-card">
        <h2>How to Prevent Stings</h2>
        <ul>
          <li>Check the forecast before swimming, snorkeling, diving, or shore entries.</li>
          <li>Avoid swimming through visible jellyfish, floating tentacles, or slick patches.</li>
          <li>Do not touch jellyfish on the beach. Detached or dead tentacles can still sting.</li>
          <li>Wear a rash guard, leggings, wetsuit, or dive skin when risk is elevated.</li>
          <li>Enter and exit carefully in low visibility, especially near dawn, dusk, and night.</li>
          <li>Keep vinegar or a local first-aid kit nearby when swimming in higher-risk periods.</li>
        </ul>
      </article>

      <article class="safety-card safety-card--urgent">
        <h2>What to Do When Stung</h2>
        <ol>
          <li>Leave the water right away and help the person stay calm and still.</li>
          <li>Do not rub the sting. Rubbing can trigger more stinging cells.</li>
          <li>Carefully remove visible tentacles with tweezers, gloves, or a protected hand.</li>
          <li>Rinse with seawater if needed. Avoid fresh water on the sting area.</li>
          <li>
            For suspected tropical box jellyfish stings, vinegar is commonly used to stop
            unfired stinging cells. Avoid vinegar if the animal is clearly a Portuguese
            man-of-war or if local guidance says otherwise.
          </li>
          <li>
            For pain relief, immerse the area in hot water that is hot but not scalding
            for about 20 minutes, or until pain eases.
          </li>
        </ol>
      </article>

      <article class="safety-card">
        <h2>What Not to Do</h2>
        <ul>
          <li>Do not rinse with fresh water.</li>
          <li>Do not rub with towels, sand, or your hands.</li>
          <li>Do not scrape the skin with a card or knife.</li>
          <li>Do not apply urine, alcohol, ammonia, or meat tenderizer.</li>
          <li>Do not apply a tight pressure bandage unless instructed by medical professionals.</li>
        </ul>
      </article>

      <article class="safety-card">
        <h2>Get Urgent Help If</h2>
        <ul>
          <li>The person has trouble breathing, chest pain, fainting, confusion, or weakness.</li>
          <li>The sting covers a large area, crosses the face or genitals, or pain is severe.</li>
          <li>The person is a child, pregnant, elderly, or has heart or allergy concerns.</li>
          <li>Symptoms spread beyond the sting site or keep getting worse.</li>
        </ul>
      </article>
    </section>

    <section class="safety-note">
      <h2>Important note</h2>
      <p>
        This page is general first-aid information, not medical advice. Jellyfish first aid
        varies by species, so follow local lifeguard, dive operator, or medical guidance
        whenever it is available.
      </p>
    </section>
  </main>
</template>

<style scoped>
.safety-page {
  width: min(960px, calc(100% - 2rem));
  min-height: calc(100svh - 2rem);
  margin: 1rem auto;
  padding: clamp(1rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.back-link {
  width: fit-content;
  color: var(--color-cream);
  font-size: 0.9rem;
  font-weight: 900;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.22em;
}

.back-link:hover,
.back-link:focus {
  color: var(--color-rose);
}

.safety-hero,
.safety-card,
.safety-note {
  background: rgba(241, 235, 223, 0.96);
  border: 3px solid var(--color-ink);
  border-radius: 1.4rem;
  box-shadow: 7px 7px 0 rgba(5, 7, 6, 0.75);
}

.safety-hero {
  padding: clamp(1.5rem, 5vw, 3rem);
  background:
    radial-gradient(circle at 86% 18%, rgba(210, 158, 173, 0.88), transparent 8rem),
    linear-gradient(135deg, var(--color-cream), #fff8ec);
}

.section-kicker {
  margin: 0 0 0.55rem;
  color: var(--color-lagoon);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.safety-hero h1 {
  max-width: 12ch;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 7vw, 5rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 0.02em;
  color: var(--color-ink);
  text-shadow: 4px 4px 0 var(--color-seafoam);
  margin: 0 0 1rem;
}

.safety-hero p {
  max-width: 42rem;
  margin: 0;
  color: #234250;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 800;
  line-height: 1.45;
}

.safety-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.safety-card,
.safety-note {
  padding: clamp(1rem, 3vw, 1.4rem);
}

.safety-card--urgent {
  background:
    linear-gradient(135deg, rgba(210, 158, 173, 0.28), transparent),
    rgba(241, 235, 223, 0.98);
}

.safety-card h2,
.safety-note h2 {
  margin: 0 0 0.8rem;
  color: var(--color-ink);
  font-size: clamp(1.25rem, 2.5vw, 1.55rem);
  line-height: 1.1;
}

.safety-card ul,
.safety-card ol {
  margin: 0;
  padding-left: 1.25rem;
}

.safety-card li {
  margin: 0.55rem 0;
  color: #234250;
  font-weight: 800;
  line-height: 1.45;
}

.safety-note p {
  margin: 0;
  color: rgba(5, 7, 6, 0.72);
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.5;
}

@media (max-width: 720px) {
  .safety-page {
    width: min(100% - 1rem, 960px);
    min-height: calc(100svh - 1rem);
    margin: 0.5rem auto;
    padding: 0.75rem;
  }

  .safety-grid {
    grid-template-columns: 1fr;
  }
}
</style>
