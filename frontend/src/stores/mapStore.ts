import { defineStore } from 'pinia';
import api from '@/api';
import type { GameMap } from '@/types/map';
import { run, type AsyncState } from '@/stores/helpers/storeAsync';
import { upsertById, replaceAll } from '@/utils/upsert';

export const useMapStore = defineStore('mapStore', {
  state: () => ({
    maps: [] as GameMap[],
    loading: false,
    error: null as AsyncState['error'],
  }),

  actions: {
    async fetchMaps() {
      return run(this, async () => {
        const { data } = await api.get<GameMap[]>('/maps');
        replaceAll(this.maps, data);
        return data;
      });
    },

    async saveMap(mapData: Partial<GameMap>) {
      return run(this, async () => {
        const { data } = await api.post<GameMap>('/maps', mapData);
        upsertById(this.maps, data);
        return data;
      });
    },

    async fetchMapById(id: number) {
      return run(this, async () => {
        const { data } = await api.get<GameMap>(`/maps/${id}`);
        upsertById(this.maps, data);
        return data;
      });
    },
  },
});
