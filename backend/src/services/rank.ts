import db from "@/database";
import { badRequest, notFound } from "@/utils/httpError";


export type UserRankRow = {
  user_id: number;
  game_modes_id: number;
  xp: number;
};

export type RankRow = {
  id: number;
  name: string;
  min_xp: number;
  max_xp: number;
};

export type DivisionRow = {
  id: number;
  name: string;
  min_xp: number;
  max_xp: number;
  order: number;
};


export async function getUserRankById(userId: number, modeId: number) {
  if (isNaN(userId) || isNaN(modeId)) throw badRequest("ID ou modeId invalide", "VALIDATION_ERROR");

  const userRank = await db<UserRankRow>("user_ranks")
    .where({ user_id: userId, game_modes_id: modeId })
    .first();
  if (!userRank) throw notFound("Aucun user_rank trouvé", "USER_RANK_NOT_FOUND", { userId, modeId });

  const xp = userRank.xp;
  let rank = await db<RankRow>("ranks")
    .where("min_xp", "<=", xp)
    .andWhere("max_xp", ">=", xp)
    .first();
  if (!rank) {
    // Si xp dépasse tous les ranks, prendre le dernier
    rank = await db<RankRow>("ranks").orderBy("max_xp", "desc").first();
  }

  let division: DivisionRow | null = null;
  if (rank) {
    division = (await db<DivisionRow>("rank_divisions")
      .andWhere("min_xp", "<=", xp)
      .andWhere("max_xp", ">=", xp)
      .first()) ?? null;
    if (!division) {
      division = (await db<DivisionRow>("rank_divisions")
        .whereRaw('max_xp = (select max(max_xp) from rank_divisions)')
        .first()) ?? null;
    }
  }

  let xpInDivision: number | null = null;
  let xpToNext: number | null = null;
  let nextDivision: DivisionRow | null = null;
    if (division && rank) {
      xpInDivision = Math.max(0, xp - division.min_xp);
      xpToNext = Math.max(0, division.max_xp - xp);
    nextDivision = (await db<DivisionRow>("rank_divisions")
      .andWhere("order", division.order + 1)
      .first()) ?? null;
  }

  return {
    rank: rank ? rank.name : "Unranked",
    division: division ? division.name : null,
    xp,
    xpInDivision,
    xpToNext,
    nextDivision: nextDivision ? nextDivision.name : null,
    nextDivisionMinXp: nextDivision ? nextDivision.min_xp : null,
    nextDivisionMaxXp: nextDivision ? nextDivision.max_xp : null,
  };
}
