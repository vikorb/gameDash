import type { MMRResult, MMRHistory } from "../types/mmr";

export function getCurrentMMR(userId: number, modeId: number): Promise<MMRResult>;
export function getMMRHistory(userId: number, modeId: number): Promise<MMRHistory[]>;
