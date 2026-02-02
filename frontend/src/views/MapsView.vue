<script setup lang="ts">
import { onMounted } from 'vue';
import { useMapStore } from '@/stores/mapStore';

const mapStore = useMapStore();

onMounted(() => {
  mapStore.fetchMaps();
});
</script>

<template>
  <div class="maps-container">
    <h1>Liste des Maps (Test)</h1>

    <div v-if="mapStore.loading">Chargement...</div>

    <div v-else class="grid">
      <div v-for="map in mapStore.maps" :key="map.id" class="map-card">
        <h3>{{ map.title }}</h3>
        <p>{{ map.description || 'Pas de description' }}</p>
        <div class="badge">{{ map.status }}</div>
        <small>Créé par ID: {{ map.creator_id }}</small>
      </div>
    </div>

    <div v-if="!mapStore.loading && mapStore.maps.length === 0">
      Aucune map trouvée. Crée-en une via Postman !
    </div>
  </div>
</template>

<style scoped>
.maps-container { padding: 20px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
.map-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  background: #f9f9f9;
}
.badge {
  display: inline-block;
  background: #42b883;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
