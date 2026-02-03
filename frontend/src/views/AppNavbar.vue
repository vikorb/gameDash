<script setup lang="ts">
import BaseNav, { type NavItem } from '@/components/BaseNav.vue';

const items: NavItem[] = [
  { label: 'Accueil', to: '/', exact: true },
  { label: 'Maps', to: '/maps' },
];
</script>

<template>
  <BaseNav :items="items" />
</template>
