import { defineStore } from 'pinia';
import api from '@/api';
import { run, type AsyncState } from '@/stores/helpers/storeAsync';

export type UserSyncPayload = {
  pocketbase_user_id: string;
  role?: string;
  status?: string;
  is_banned?: boolean;
  region?: string;
  bio?: string;
  language?: string;
  matchmaking_pref?: unknown;
};

const toString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

export const useUserStore = defineStore('userStore', {
  state: () => ({
    loading: false,
    error: null as AsyncState['error'],
  }),

  actions: {
    async syncFromPocketBase(record: Record<string, unknown> | null) {
      return run(this, async () => {
        const pocketbase_user_id = toString(record?.id);

        if (!pocketbase_user_id) {
          throw new Error('PocketBase user id is required to sync user profile');
        }

        const payload: UserSyncPayload = {
          pocketbase_user_id,
          role: toString(record?.role),
          status: toString(record?.status),
          is_banned: typeof record?.is_banned === 'boolean' ? record?.is_banned : undefined,
          region: toString(record?.region),
          bio: toString(record?.bio),
          language: toString(record?.language),
          matchmaking_pref: record?.matchmaking_pref,
        };

        await api.post('/users', payload);
      });
    },
  },
});
