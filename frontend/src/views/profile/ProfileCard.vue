<template>
  <section class="profile-card">
    <slot />
  </section>
</template>

<style scoped>
.profile-card {
  padding: 1.5rem;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-md);
}
</style>
