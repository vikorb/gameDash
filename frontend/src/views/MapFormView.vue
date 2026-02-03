<template>
  <div class="form-container">
    <h1 style="color: red">FORMULAIRE DE MAP</h1>
    <h1>{{ isEdit ? 'Modifier la Map' : 'Nouvelle Map' }}</h1>

    <form @submit.prevent="save">
      <div class="field">
        <label>Titre</label>
        <input v-model="form.title" required />
      </div>
      <div class="field">
        <label>Description</label>
        <textarea v-model="form.description"></textarea>
      </div>
      <div class="actions">
        <button type="button" @click="router.back()">Annuler</button>
        <button type="submit" class="save">{{ isEdit ? 'Mettre à jour' : 'Créer' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMapStore } from '@/stores/mapStore';
import type { GameMap } from '@/types/map';

const router = useRouter();
const mapStore = useMapStore();

// On définit une interface pour le formulaire (champs éditables uniquement)
interface MapFormData {
  id?: number;
  title: string;
  description: string;
  creator_id: number;
}

const props = defineProps<{
  id?: string
}>();

const isEdit = computed(() => !!props.id);
const loading = ref(false);

const form = ref<MapFormData>({
  title: '',
  description: '',
  creator_id: 1
});

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    const targetId = Number(props.id);

    // 1. On cherche dans le store
    let existingMap: GameMap | undefined | null = mapStore.maps.find(m => m.id === targetId);

    // 2. Si pas là (refresh), on fetch
    if (!existingMap) {
      existingMap = await mapStore.fetchMapById(targetId);
    }

    if (existingMap) {
      // 3. On "mappe" les données pour ne garder que ce qui intéresse le formulaire
      form.value = {
        id: existingMap.id,
        title: existingMap.title,
        description: existingMap.description || '',
        creator_id: existingMap.creator_id
      };
    } else {
      // Si vraiment introuvable après le fetch
      console.warn("Map introuvable, redirection...");
      router.push('/maps');
    }
    loading.value = false;
  }
});

const save = async () => {
  try {
    await mapStore.saveMap(form.value);
    router.push('/maps');
  } catch {
    alert("Erreur lors de la sauvegarde");
  }
};
</script>

<style scoped>
.form-container { max-width: 500px; margin: 0 auto; }
.field { margin-bottom: 1rem; display: flex; flex-direction: column; }
.actions { display: flex; gap: 10px; margin-top: 2rem; }
.save { background: #42b883; color: white; border: none; padding: 10px; cursor: pointer; flex: 1; }
</style>
