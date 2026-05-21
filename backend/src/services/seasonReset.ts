import { randomUUID } from 'node:crypto';

import type { Knex } from 'knex';

import db from '@/database';
import { computeSoftResetMmr } from '@/services/seasonResetFormula';
import { badRequest, notFound } from '@/utils/httpError';

type PlayerMmrRow = {
  id: number;
  user_id: number;
  mmr: number;
};

type AuditLogInsert = {
  action: string;
  actor_user_id: number;
  payload: Record<string, unknown>;
};

export type SeasonResetParams = {
  modeId: number;
  baseMmr: number;
  actorUserId: number;
};

export type SeasonResetResult = {
  modeId: number;
  baseMmr: number;
  affectedPlayers: number;
  resetId: string;
  minBefore: number;
  maxBefore: number;
  minAfter: number;
  maxAfter: number;
};

async function insertInChunks<T extends Record<string, unknown>>(
  trx: Knex.Transaction,
  table: string,
  rows: T[],
  chunkSize = 500,
) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    if (chunk.length > 0) {
      await trx(table).insert(chunk);
    }
  }
}

export async function runSeasonReset({ modeId, baseMmr, actorUserId }: SeasonResetParams): Promise<SeasonResetResult> {
  if (!Number.isInteger(modeId) || modeId <= 0) {
    throw badRequest('mode_id doit etre un entier positif', 'VALIDATION_ERROR', { field: 'mode_id' });
  }

  if (!Number.isInteger(baseMmr) || baseMmr <= 0) {
    throw badRequest('base doit etre un entier positif', 'VALIDATION_ERROR', { field: 'base' });
  }

  const mode = await db('game_modes').where({ id: modeId }).first<{ id: number }>();
  if (!mode) {
    throw notFound('Mode de jeu introuvable', 'GAME_MODE_NOT_FOUND', { modeId });
  }

  return db.transaction(async (trx) => {
    const resetId = randomUUID();
    const rows = (await trx('player_mmr')
      .where({ mode_id: modeId })
      .select('id', 'user_id', 'mmr')) as PlayerMmrRow[];

    const mmrValues = rows.map((row) => row.mmr);
    const minBefore = mmrValues.length > 0 ? Math.min(...mmrValues) : baseMmr;
    const maxBefore = mmrValues.length > 0 ? Math.max(...mmrValues) : baseMmr;

    const now = new Date();

    const beforeHistory = rows.map((row) => ({
      user_id: row.user_id,
      mode_id: modeId,
      mmr: row.mmr,
      date: now,
      event_type: 'SEASON_RESET_BEFORE',
      metadata: {
        reset_id: resetId,
        base_mmr: baseMmr,
        formula: '(mmr + base) / 2',
      },
    }));

    const updates = rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      previousMmr: row.mmr,
      nextMmr: computeSoftResetMmr(row.mmr, baseMmr),
    }));

    for (const update of updates) {
      await trx('player_mmr')
        .where({ id: update.id })
        .update({ mmr: update.nextMmr, updated_at: trx.fn.now() });
    }

    const afterHistory = updates.map((row) => ({
      user_id: row.user_id,
      mode_id: modeId,
      mmr: row.nextMmr,
      date: now,
      event_type: 'SEASON_RESET_AFTER',
      metadata: {
        reset_id: resetId,
        base_mmr: baseMmr,
        previous_mmr: row.previousMmr,
      },
    }));

    await insertInChunks(trx, 'mmr_history', beforeHistory);
    await insertInChunks(trx, 'mmr_history', afterHistory);

    const nextValues = updates.map((row) => row.nextMmr);
    const minAfter = nextValues.length > 0 ? Math.min(...nextValues) : baseMmr;
    const maxAfter = nextValues.length > 0 ? Math.max(...nextValues) : baseMmr;

    const auditPayload: AuditLogInsert = {
      action: 'SEASON_RESET',
      actor_user_id: actorUserId,
      payload: {
        reset_id: resetId,
        mode_id: modeId,
        base_mmr: baseMmr,
        affected_players: updates.length,
        min_before: minBefore,
        max_before: maxBefore,
        min_after: minAfter,
        max_after: maxAfter,
      },
    };

    await trx('audit_logs').insert(auditPayload);

    return {
      modeId,
      baseMmr,
      affectedPlayers: updates.length,
      resetId,
      minBefore,
      maxBefore,
      minAfter,
      maxAfter,
    };
  });
}
