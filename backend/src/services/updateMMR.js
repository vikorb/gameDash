/* eslint-disable @typescript-eslint/no-require-imports */
const db = require("../database");

/**
 * @param {number} userId
 * @param {number} modeId
 * @param {number} newMMR
 */
async function updateMMR(userId, modeId, newMMR) {
  const old = await db("player_mmr")
    .where({ user_id: userId, mode_id: modeId })
    .first();

  if (old) {
    await db("mmr_history").insert({
      user_id: userId,
      mode_id: modeId,
      mmr: old.mmr,
      date: old.updated_at || old.created_at,
    });
    await db("player_mmr")
      .where({ user_id: userId, mode_id: modeId })
      .update({ mmr: newMMR, updated_at: db.fn.now() });
  } else {
    await db("player_mmr").insert({
      user_id: userId,
      mode_id: modeId,
      mmr: newMMR,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
  }
}

module.exports = {
  updateMMR,
};
