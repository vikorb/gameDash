// ────────────────────────────────────────────────────────────────────────────
// utils/pocketbaseMaps.ts – Upload de screenshots de maps vers PocketBase
//
// Les screenshots sont stockés dans la collection PocketBase "map_screenshots".
// L'URL retournée est ensuite persistée dans la table map_screenshots de la DB.
// ────────────────────────────────────────────────────────────────────────────

const PB_URL = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";

/**
 * Crée un enregistrement dans la collection `map_screenshots` de PocketBase
 * puis retourne l'URL publique du fichier uploadé.
 *
 * @param base64Data  Chaîne base64 complète (avec le préfixe "data:image/…;base64,…")
 * @param mapId       ID de la map dans notre DB (stocké comme champ de référence)
 * @param userToken   JWT Bearer de l'utilisateur authentifié
 */
export async function uploadMapScreenshot(
  base64Data: string,
  mapId: number,
  userToken: string
): Promise<string> {
  const [meta, data] = base64Data.split(",");
  if (!meta || !data) {
    throw new Error("Format base64 invalide");
  }

  const mimeType = meta.match(/:(.*?);/)?.[1] ?? "image/png";
  const ext = mimeType.split("/")[1] ?? "png";
  const binary = Buffer.from(data, "base64");
  const blob = new Blob([binary], { type: mimeType });

  const form = new FormData();
  form.append("file", blob, `map-${mapId}-${Date.now()}.${ext}`);
  form.append("map_id", String(mapId));

  const res = await fetch(
    `${PB_URL}/api/collections/map_screenshots/records`,
    {
      method: "POST",
      headers: { Authorization: userToken },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `PocketBase screenshot upload failed: ${res.status} ${err}`
    );
  }

  const record = (await res.json()) as { id: string; file: string };
  return `${PB_URL}/api/files/map_screenshots/${record.id}/${record.file}`;
}

/**
 * Supprime un enregistrement de screenshot dans PocketBase.
 * À appeler avant de supprimer la ligne map_screenshots en DB.
 */
export async function deleteMapScreenshot(
  pbRecordId: string,
  userToken: string
): Promise<void> {
  const res = await fetch(
    `${PB_URL}/api/collections/map_screenshots/records/${pbRecordId}`,
    {
      method: "DELETE",
      headers: { Authorization: userToken },
    }
  );

  // 404 = déjà supprimé → on ignore silencieusement
  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    throw new Error(
      `PocketBase screenshot delete failed: ${res.status} ${err}`
    );
  }
}