<template>
  <div>
    <div class="header">
      <h1 style="color: blue">LISTE DES MAPS</h1>
      <RouterLink to="/maps/new" class="btn-primary">＋ Créer une Map</RouterLink>
    </div>

    <div v-if="mapStore.loading">Chargement...</div>

    <div v-else class="grid">
      <div v-for="map in mapStore.maps" :key="map.id" class="map-card">
        <h3>{{ map.title }}</h3>
        <p>{{ map.description }}</p>
        <button @click="goToEdit(map.id)" class="btn-edit">Modifier</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useMapStore } from '@/stores/mapStore';
import { useRouter } from 'vue-router';

const mapStore = useMapStore();
const router = useRouter();

onMounted(() => {
  mapStore.fetchMaps();
});

const goToEdit = (id: number) => {
  console.log("Redirection vers /maps/edit/" + id);
  router.push(`/maps/edit/${id}`);
};
</script>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-primary { background: var(--color-primary); color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.map-card { border: 1px solid var(--color-border); padding: 1rem; border-radius: 8px; background: white; }
.btn-edit {
  margin-top: 10px;
  width: 100%;
  cursor: pointer;
  background: var(--color-primary-strong);
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
}
</style>
