import type { GameMap } from '@/types/map';
import type { MapFormData } from '@/types/form';

export type MapFormErrors = {
  title?: string;
};

export function parseRouteId(param: unknown): number | null {
  if (typeof param !== 'string') return null;
  const n = Number(param);
  return Number.isFinite(n) ? n : null;
}

export function initMapFormData(): MapFormData {
  return {
    title: '',
    description: '',
    creator_id: 1,
    original: null,
  };
}

export function mapToFormData(
  form: MapFormData,
  map: Pick<GameMap, 'id' | 'creator_id' | 'title' | 'description' | 'status' | 'moderation_status'>
): void {
  form.id = map.id;
  form.creator_id = map.creator_id ?? 1;
  form.title = map.title ?? '';
  form.description = map.description ?? '';
  form.status = map.status;
  form.moderation_status = map.moderation_status;

  form.original = {
    id: map.id,
    creator_id: form.creator_id,
    title: form.title,
    description: map.description,
    status: map.status,
    moderation_status: map.moderation_status,
  };
}

export function resetMapFormData(form: MapFormData): void {
  if (form.original) {
    form.id = form.original.id;
    form.creator_id = form.original.creator_id;
    form.title = form.original.title ?? '';
    form.description = form.original.description ?? '';
    form.status = form.original.status;
    form.moderation_status = form.original.moderation_status;
    return;
  }

  form.id = undefined;
  form.creator_id = 1;
  form.title = '';
  form.description = '';
  form.status = undefined;
  form.moderation_status = undefined;
}

export function validateMapForm(
  form: Pick<MapFormData, 'title'>,
  t: (key: string, params?: Record<string, unknown>) => string,
  errors: MapFormErrors
): boolean {
  errors.title = undefined;

  if (form.title.trim().length < 2) {
    errors.title = t('mapForm.validation.title_min', { min: 2 });
    return false;
  }

  return true;
}

export function toSavePayload(
  form: MapFormData,
  isEditMode: boolean,
  mapId: number | null
): Partial<GameMap> {
  const payload: Partial<GameMap> = {
    title: form.title.trim(),
    description: form.description.trim() === '' ? null : form.description.trim(),
  };

  if (!isEditMode) {
    payload.creator_id = form.creator_id;
  }

  if (isEditMode && mapId !== null) {
    payload.id = mapId;
  }

  if (form.status) payload.status = form.status;
  if (form.moderation_status) payload.moderation_status = form.moderation_status;

  return payload;
}
