<template>
  <section class="profile-card">
    <slot />
  </section>
</template>

<style scoped>
.profile-card {
  padding: 1.5rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}

@media (max-width: 720px) {
  .profile-card {
    padding: 1.1rem;
    border-radius: 22px;
  }
}
</style>
