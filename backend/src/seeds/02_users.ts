import { Knex } from 'knex';

type SeedRole = 'admin' | 'moderator' | 'player';

type SeedUserIdentity = {
  email: string;
  username: string;
  password: string;
  role: SeedRole;
};

type SeedUserRow = {
  pocketbase_user_id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'player';
  status: number;
  region: string | null;
  bio: string | null;
  language: string | null;
  matchmaking_pref: unknown;
};

const DEFAULT_PASSWORD = 'SeedUser123!';

const buildIdentities = (): SeedUserIdentity[] => {
  const users: SeedUserIdentity[] = [
    {
      email: 'seed.admin@gamedash.local',
      username: 'seed_admin',
      password: DEFAULT_PASSWORD,
      role: 'admin',
    },
  ];

  for (let i = 1; i <= 3; i += 1) {
    const idx = String(i).padStart(3, '0');
    users.push({
      email: `seed.moderator.${idx}@gamedash.local`,
      username: `seed_moderator_${idx}`,
      password: DEFAULT_PASSWORD,
      role: 'moderator',
    });
  }

  for (let i = 1; i <= 60; i += 1) {
    const idx = String(i).padStart(3, '0');
    users.push({
      email: `seed.player.${idx}@gamedash.local`,
      username: `seed_player_${idx}`,
      password: DEFAULT_PASSWORD,
      role: 'player',
    });
  }

  return users;
};

const buildPostgresRows = (identities: Array<SeedUserIdentity & { pocketbase_user_id: string }>): SeedUserRow[] => {
  return identities.map((identity, index) => ({
    pocketbase_user_id: identity.pocketbase_user_id,
    username: identity.username,
    email: identity.email,
    role: identity.role,
    status: 1,
    region: identity.role === 'player' ? (index % 2 === 0 ? 'eu-west' : 'us-east') : 'eu-west',
    bio:
      identity.role === 'admin'
        ? 'Admin seed account'
        : identity.role === 'moderator'
          ? 'Moderator seed account'
          : 'Player seed account',
    language: index % 3 === 0 ? 'en' : 'fr',
    matchmaking_pref: { mode: identity.role === 'player' ? 'casual' : identity.role === 'moderator' ? 'ranked' : 'all' },
  }));
};

type PocketBaseListResponse = {
  items?: Array<{ id?: string }>;
};

type PocketBaseAuthResponse = {
  token?: string;
};

type PocketBaseCreateResponse = {
  id?: string;
};

const getPocketBaseBaseUrls = (): string[] => {
  const fromEnv = process.env.POCKETBASE_URL?.trim();
  const candidates = [fromEnv, 'http://pocketbase:8090', 'http://localhost:8090'];

  return candidates.filter((value): value is string => typeof value === 'string' && value.length > 0);
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    throw new Error(`PocketBase request failed (${response.status} ${response.statusText}) on ${url}`);
  }

  return data;
};

const authenticatePocketBaseAdmin = async (baseUrl: string): Promise<string> => {
  const identity = process.env.POCKETBASE_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.POCKETBASE_ADMIN_PASSWORD ?? 'admin123456';

  const body = JSON.stringify({ identity, password });

  const auth = await requestJson<PocketBaseAuthResponse>(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }).catch(() => null);

  if (auth?.token) return auth.token;

  const fallbackAuth = await requestJson<PocketBaseAuthResponse>(`${baseUrl}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!fallbackAuth.token) {
    throw new Error('Unable to authenticate as PocketBase admin');
  }

  return fallbackAuth.token;
};

const findPocketBaseUserIdByEmail = async (baseUrl: string, token: string, email: string): Promise<string | null> => {
  const filter = encodeURIComponent(`email="${email}"`);
  const result = await requestJson<PocketBaseListResponse>(
    `${baseUrl}/api/collections/users/records?filter=${filter}&perPage=1&page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return result.items?.[0]?.id ?? null;
};

const createPocketBaseUser = async (baseUrl: string, token: string, identity: SeedUserIdentity): Promise<string> => {
  const created = await requestJson<PocketBaseCreateResponse>(`${baseUrl}/api/collections/users/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: identity.email,
      username: identity.username,
      password: identity.password,
      passwordConfirm: identity.password,
    }),
  });

  if (!created.id) {
    throw new Error(`PocketBase user creation failed for ${identity.email}`);
  }

  return created.id;
};

const ensurePocketBaseUser = async (baseUrl: string, token: string, identity: SeedUserIdentity): Promise<string> => {
  const existingId = await findPocketBaseUserIdByEmail(baseUrl, token, identity.email);
  if (existingId) {
    return existingId;
  }

  return createPocketBaseUser(baseUrl, token, identity);
};

export async function seed(knex: Knex): Promise<void> {
  const identities = buildIdentities();
  const pocketBaseUrls = getPocketBaseBaseUrls();

  let pocketBaseUrl: string | null = null;
  let adminToken: string | null = null;

  for (const candidateUrl of pocketBaseUrls) {
    const token = await authenticatePocketBaseAdmin(candidateUrl).catch(() => null);
    if (!token) continue;

    pocketBaseUrl = candidateUrl;
    adminToken = token;
    break;
  }

  if (!pocketBaseUrl || !adminToken) {
    throw new Error(`Unable to reach PocketBase on: ${pocketBaseUrls.join(', ')}`);
  }

  const linkedUsers: Array<SeedUserIdentity & { pocketbase_user_id: string }> = [];

  for (const identity of identities) {
    const pocketbase_user_id = await ensurePocketBaseUser(pocketBaseUrl, adminToken, identity);
    linkedUsers.push({ ...identity, pocketbase_user_id });
  }

  const users = buildPostgresRows(linkedUsers);

  await knex('users')
    .insert(users)
    .onConflict('pocketbase_user_id')
    .merge({
      username: knex.ref('excluded.username'),
      email: knex.ref('excluded.email'),
      role: knex.ref('excluded.role'),
      status: 1,
      updated_at: knex.fn.now(),
    });

  await knex.raw(`
    SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST((SELECT COALESCE(max(id), 1) FROM users), 1))
  `);
}
