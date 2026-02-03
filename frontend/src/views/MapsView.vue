<template>
  <div class="maps-page">
    <section class="form-section">
      <h2>Créer une nouvelle Map</h2>
      <form @submit.prevent="handleSubmit" class="map-form">
        <div class="field">
          <label>Titre :</label>
          <input v-model="form.title" type="text" placeholder="Nom de la map..." required />
        </div>

        <div class="field">
          <label>Description :</label>
          <textarea v-model="form.description" placeholder="Détails de la map..."></textarea>
        </div>

        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Envoi...' : 'Ajouter la Map' }}
        </button>
      </form>
    </section>

    <hr />

    <section class="list-section">
      <h2>Maps existantes</h2>
      <div v-if="mapStore.loading">Chargement des données...</div>
      <div v-else class="grid">
        <div v-for="map in mapStore.maps" :key="map.id" class="map-card">
          <h3>{{ map.title }}</h3>
          <p>{{ map.description }}</p>
          <span class="id-badge">ID: {{ map.id }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMapStore } from '@/stores/mapStore';

const mapStore = useMapStore();

// État local pour le formulaire
const defaultCreatorId = 1; // Ton ID par défaut
const form = ref({
  title: '',
  description: '',
  creator_id: defaultCreatorId
});

const isSubmitting = ref(false);

onMounted(() => {
  mapStore.fetchMaps();
});

const handleSubmit = async () => {
  if (!form.value.title) return alert("Le titre est requis");

  isSubmitting.value = true;
  try {
    await mapStore.saveMap(form.value);
    // Reset du formulaire après succès
    form.value = { title: '', description: '', creator_id: defaultCreatorId };
    alert("Map enregistrée avec succès !");
  } catch {
    alert("Erreur lors de l'envoi");
  } finally {
    isSubmitting.value = false;
  }
};
</script>



<style scoped>
.maps-page { max-width: 800px; margin: 0 auto; }
.form-section { background: #fdfdfd; padding: 20px; border: 1px dashed #42b883; border-radius: 10px; margin-bottom: 30px; }
.map-form { display: flex; flex-direction: column; gap: 15px; }
.field { display: flex; flex-direction: column; gap: 5px; }
input, textarea { padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
button { background: #42b883; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 4px; font-weight: bold; }
button:disabled { background: #ccc; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.map-card { border: 1px solid #eee; padding: 15px; border-radius: 8px; position: relative; }
.id-badge { font-size: 0.7rem; color: #999; position: absolute; top: 10px; right: 10px; }
</style>
