<template>
  <div class="profile-grid">
    <slot />
  </div>
</template>

<style scoped>
.profile-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
