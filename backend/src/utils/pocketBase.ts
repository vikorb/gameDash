const PB_URL = process.env.POCKETBASE_INTERNAL_URL ?? "http://pocketbase:8090";
const PB_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

// ─── Auth utilisateur (pas admin) ────────────────────────────────────────────

export async function authPocketbaseUser(
  email: string,
  password: string,
): Promise<{ token: string; record: Record<string, unknown> }> {
  const res = await fetch(
    `${PB_URL}/api/collections/users/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, password }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PocketBase auth failed: ${res.status} ${err}`);
  }

  return res.json() as Promise<{
    token: string;
    record: Record<string, unknown>;
  }>;
}

// ─── Création user dans PocketBase ───────────────────────────────────────────

export async function createPocketbaseUser(fields: {
  email: string;
  password: string;
  passwordConfirm: string;
  username?: string;
}): Promise<Record<string, unknown>> {
  const res = await fetch(`${PB_URL}/api/collections/users/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PocketBase create user failed: ${res.status} ${err}`);
  }

  return res.json() as Promise<Record<string, unknown>>;
}

// ─── Mise à jour user (token utilisateur requis) ──────────────────────────────

export async function updatePocketbaseUser(
  pbUserId: string,
  fields: Record<string, string>,
  userToken: string,
): Promise<void> {
  const res = await fetch(
    `${PB_URL}/api/collections/users/records/${pbUserId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: userToken,
      },
      body: JSON.stringify(fields),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PocketBase update failed: ${res.status} ${err}`);
  }
}

async function authPocketbaseSuperuser(): Promise<string> {
  if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
    throw new Error("PocketBase superuser credentials are not configured");
  }

  const res = await fetch(
    `${PB_URL}/api/collections/_superusers/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: PB_ADMIN_EMAIL,
        password: PB_ADMIN_PASSWORD,
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PocketBase superuser auth failed: ${res.status} ${err}`);
  }

  const payload = (await res.json()) as { token?: string };
  if (!payload.token) {
    throw new Error("PocketBase superuser auth failed: missing token");
  }

  return payload.token;
}

export async function updatePocketbaseUserAsSuperuser(
  pbUserId: string,
  fields: Record<string, string>,
): Promise<void> {
  const adminToken = await authPocketbaseSuperuser();

  const res = await fetch(
    `${PB_URL}/api/collections/users/records/${pbUserId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(fields),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PocketBase superuser update failed: ${res.status} ${err}`);
  }
}

// ─── Upload avatar (token utilisateur requis) ─────────────────────────────────

export async function uploadPocketbaseAvatar(
  pbUserId: string,
  base64Data: string,
  userToken: string,
): Promise<string> {
  const [meta, data] = base64Data.split(",");
  const mimeType = meta.match(/:(.*?);/)?.[1] ?? "image/png";
  const ext = mimeType.split("/")[1];
  const binary = Buffer.from(data, "base64");
  const blob = new Blob([binary], { type: mimeType });

  const form = new FormData();
  form.append("avatar", blob, `avatar.${ext}`);

  const res = await fetch(
    `${PB_URL}/api/collections/users/records/${pbUserId}`,
    {
      method: "PATCH",
      headers: { Authorization: userToken },
      body: form,
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PocketBase avatar upload failed: ${res.status} ${err}`);
  }

  const record = (await res.json()) as { avatar: string };
  return `${PB_URL}/api/files/_pb_users_auth_/${pbUserId}/${record.avatar}`;
}

// ─── Get user (public, pas de token requis) ───────────────────────────────────

export async function getPocketbaseUser(
  pbUserId: string,
): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `${PB_URL}/api/collections/users/records/${pbUserId}`,
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`PocketBase get user failed: ${res.status}`);

  return res.json() as Promise<Record<string, unknown>>;
}
