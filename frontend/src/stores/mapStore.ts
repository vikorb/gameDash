import { defineStore } from 'pinia';
import api from '@/api';
import type { GameMap } from '@/types/map';

export const useMapStore = defineStore('mapStore', {
  state: () => ({
    maps: [] as GameMap[],
    loading: false,
  }),
  actions: {
    async fetchMaps() {
      this.loading = true;
      try {
        const response = await api.get('/maps');
        this.maps = response.data;
      } catch (error) {
        console.error("Erreur fetch maps", error);
      } finally {
        this.loading = false;
      }
    }
  }
});
