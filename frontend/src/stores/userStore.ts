import { defineStore } from 'pinia';
import api from '@/api';
import { run, type AsyncState } from '@/stores/helpers/storeAsync';

export type UserSyncPayload = {
  email: string;
  username: string;
  role?: string;
  status?: string;
  is_banned?: boolean;
  avatar_url?: string;
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
    async syncFromPocketBase(record: Record<string, unknown> | null, fallback: { email: string; username: string }) {
      return run(this, async () => {
        const email = toString(record?.email) ?? fallback.email;
        const username = toString(record?.username) ?? fallback.username;

        const payload: UserSyncPayload = {
          email,
          username,
          role: toString(record?.role),
          status: toString(record?.status),
          is_banned: typeof record?.is_banned === 'boolean' ? record?.is_banned : undefined,
          avatar_url: toString(record?.avatar_url),
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
