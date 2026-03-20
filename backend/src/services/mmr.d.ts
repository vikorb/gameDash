import type { MMRResult } from "../types/mmr";

export function getCurrentMMR(userId: number, modeId: number): Promise<MMRResult>;
