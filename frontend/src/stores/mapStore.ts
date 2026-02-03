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
    },

    async saveMap(mapData: Partial<GameMap>) {
      try {
        const response = await api.post<GameMap>('/maps', mapData);

        const index = this.maps.findIndex(m => m.id === response.data.id);
        if (index !== -1) {
          this.maps[index] = response.data;
        } else {
          this.maps.push(response.data);
        }
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la sauvegarde", error);
        throw error;
      }
    }
  }
});
