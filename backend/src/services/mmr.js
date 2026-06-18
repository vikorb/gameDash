/* eslint-disable @typescript-eslint/no-require-imports */
/// <reference path="../types/mmr.d.ts" />
const db = require("../database").default;

/**
 * @param {number} userId
 * @param {number} modeId
 * @returns {Promise<Array<{date: string, mmr: number}>>}
 */
async function getMMRHistory(userId, modeId) {
  return db("mmr_history")
    .where({ user_id: userId, mode_id: modeId })
    .orderBy("date", "asc")
    .select("date", "mmr");
}

/**
 * @param {{ modeId?: number | null; dateFrom?: string; dateTo?: string }} filters
 * @returns {Promise<Array<{date: string, averageMMR: number, sampleSize: number}>>}
 */
async function getAverageMMRHistory(filters = {}) {
  const query = db("mmr_history as mh")
    .select(db.raw("date_trunc('day', mh.date) as date"))
    .avg("mh.mmr as average_mmr")
    .countDistinct("mh.user_id as sample_size")
    .groupByRaw("date_trunc('day', mh.date)")
    .orderBy("date", "asc");

  if (
    filters.modeId &&
    Number.isInteger(filters.modeId) &&
    filters.modeId > 0
  ) {
    query.where("mh.mode_id", filters.modeId);
  }

  if (filters.dateFrom) {
    query.where("mh.date", ">=", filters.dateFrom);
  }

  if (filters.dateTo) {
    query.where("mh.date", "<=", filters.dateTo);
  }

  const rows = await query;
  return rows.map((row) => ({
    date:
      row.date instanceof Date
        ? row.date.toISOString()
        : new Date(row.date).toISOString(),
    averageMMR: Number(row.average_mmr ?? 0),
    sampleSize: Number(row.sample_size ?? 0),
  }));
}

/**
 * @param {number} userId
 * @param {number} modeId
 * @returns {Promise<{mmr: number, rank: string}>}
 */
async function getCurrentMMR(userId, modeId) {
  const row = await db("player_mmr")
    .where({ user_id: userId, mode_id: modeId })
    .first();
  return {
    mmr: row?.mmr ?? 0,
    rank: getRankFromMMR(row?.mmr ?? 0),
  };
}

function getRankFromMMR(mmr) {
  if (mmr >= 1600) return "Gold II";
  if (mmr >= 1400) return "Gold III";
  if (mmr >= 1200) return "Silver";
  return "Bronze";
}

module.exports = {
  getMMRHistory,
  getCurrentMMR,
  getAverageMMRHistory,
};
