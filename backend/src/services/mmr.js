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
};
