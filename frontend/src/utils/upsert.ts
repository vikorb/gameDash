export function upsertById<T extends { id: number }>(arr: T[], item: T) {
  const idx = arr.findIndex((x) => x.id === item.id);
  if (idx === -1) arr.push(item);
  else arr[idx] = item;
}

export function replaceAll<T>(arr: T[], items: T[]) {
  arr.splice(0, arr.length, ...items);
}
