<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logo from '@/assets/img/logo_gameDash.svg'

export type NavIcon = 'home' | 'progress' | 'tasks' | 'shop' | 'maps'

export type NavItem = {
  label: string
  to: string
  exact?: boolean
  icon?: NavIcon
}

const props = withDefaults(
  defineProps<{
    items: NavItem[]
    brandLabel?: string
    brandLogo?: string
    showBrand?: boolean
    showActions?: boolean
  }>(),
  {
    brandLabel: 'GAMEDASH',
    brandLogo: logo,
    showBrand: true,
    showActions: true,
  },
)

const emit = defineEmits<{
  (event: 'logout'): void
  (event: 'profile'): void
}>()

const iconPaths: Record<NavIcon, string> = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.5v-6H10.5v6H5a1 1 0 0 1-1-1z',
  progress: 'M12 4a8 8 0 1 1-8 8 8 8 0 0 1 8-8Zm0 3v5l4 2',
  tasks: 'M6 7h12M6 12h12M6 17h8',
  shop: 'M6 9h12l-1.2 9H7.2L6 9Zm2-3h8l1 3H7l1-3Z',
  maps: 'M4 6l6-2 4 2 6-2v14l-6 2-4-2-6 2V6Z',
}

const getIconPath = (icon?: NavIcon) => (icon ? iconPaths[icon] : '')
</script>

<template>
  <nav class="base-nav">
    <RouterLink v-if="props.showBrand" to="/test" class="base-nav__brand">
      <img :src="props.brandLogo" :alt="props.brandLabel" class="base-nav__logo" />
    </RouterLink>

    <div class="base-nav__links">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="base-nav__link"
        :exact-active-class="item.exact ? 'is-active' : undefined"
        active-class="is-active"
      >
        <span v-if="item.icon" class="base-nav__link-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img" focusable="false">
            <path :d="getIconPath(item.icon)" />
          </svg>
        </span>
        <span class="base-nav__link-label">{{ item.label }}</span>
      </RouterLink>
    </div>

    <div v-if="props.showActions" class="base-nav__actions">
      <button type="button" class="base-nav__action" aria-label="Profile" @click="emit('profile')">
        <svg viewBox="0 0 24 24" role="img" focusable="false">
          <path
            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2-8 4.5V20h16v-1.5C20 16 16.4 14 12 14Z"
          />
        </svg>
      </button>
      <button type="button" class="base-nav__action" aria-label="Sign out" @click="emit('logout')">
        <svg viewBox="0 0 24 24" role="img" focusable="false">
          <path d="M12 2v10M6.2 4.9A8 8 0 1 0 17.8 4.9" />
        </svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.base-nav {
  padding: 0.85rem 1.5rem;
  background: transparent;
  border-bottom: none;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.5rem;
  align-items: center;
}

.base-nav__brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 700;
}

.base-nav__logo {
  width: 42px;
  height: 42px;
}

.base-nav__brand-text {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
}

.base-nav__links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.base-nav__link {
  text-decoration: none;
  color: #516079;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  position: relative;
  padding: 0.25rem 0;
  transition: color 0.2s ease;
}

.base-nav__link-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.base-nav__link svg,
.base-nav__action svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.base-nav__link.is-active {
  color: #f28b5b;
}

.base-nav__link.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.7rem;
  height: 2px;
  border-radius: 999px;
  background: #f28b5b;
}

.base-nav__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.base-nav__action {
  background: transparent;
  border: none;
  color: #516079;
  padding: 0.25rem;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.base-nav__action:hover,
.base-nav__link:hover {
  color: rgba(252, 239, 225, 0.95);
}

@media (max-width: 900px) {
  .base-nav {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .base-nav__links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
