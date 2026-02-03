<template>
  <div class="maps-list">
    <MapsListHeader />

    <MapsGrid
      :maps="mapStore.maps"
      :loading="mapStore.loading"
      @edit="goToEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMapStore } from '@/stores/mapStore';
import MapsGrid from './maps/list/MapsGrid.vue';
import MapsListHeader from './maps/list/MapsListHeader.vue';

const mapStore = useMapStore();
const router = useRouter();

onMounted(() => {
  mapStore.fetchMaps();
});

const goToEdit = (id: number) => {
  router.push(`/maps/edit/${id}`);
};
</script>

<style scoped>
.maps-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
