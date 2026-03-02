import { defineStore } from 'pinia';
import api from '@/api';
import { run, type AsyncState } from '@/stores/helpers/storeAsync';

export type UserRole = 'player' | 'admin' | 'moderator';

export type UserProfile = {
  id: number;
  pocketbase_user_id: string | null;
  role: UserRole;
  status: string;
  is_banned: boolean;
  region: string | null;
  bio: string | null;
  language: string | null;
  matchmaking_pref: unknown;
};

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

const normalizeRole = (value: unknown): UserRole => {
  if (typeof value !== 'string') return 'player';

  const normalized = value.trim().toLowerCase();

  if (normalized === 'admin' || normalized === 'administrator' || normalized === 'administrateur') {
    return 'admin';
  }

  if (normalized === 'moderator' || normalized === 'moderateur') {
    return 'moderator';
  }

  return 'player';
};

export const useUserStore = defineStore('userStore', {
  state: () => ({
    loading: false,
    error: null as AsyncState['error'],
    profile: null as UserProfile | null,
  }),

  getters: {
    currentRole: (state): UserRole => normalizeRole(state.profile?.role),
  },

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

        const response = await api.post<{ status: string; user: UserProfile }>('/users', payload);
        this.profile = response.data.user;
      });
    },

    async fetchByPocketBaseId(pocketbaseUserId: string) {
      return run(this, async () => {
        const response = await api.get<{ user: UserProfile }>(`/users/by-pocketbase/${encodeURIComponent(pocketbaseUserId)}`);
        this.profile = response.data.user;
      });
    },

    clearProfile() {
      this.profile = null;
      this.error = null;
      this.loading = false;
    },

    async hydrateFromSession(pocketbaseUserId: string | null | undefined) {
      if (!pocketbaseUserId) {
        this.clearProfile();
        return;
      }

      await this.fetchByPocketBaseId(pocketbaseUserId);
    },
  },

});
