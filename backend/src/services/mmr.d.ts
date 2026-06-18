import type { MMRResult, MMRHistory } from "../types/mmr";

export function getCurrentMMR(userId: number, modeId: number): Promise<MMRResult>;
export function getMMRHistory(userId: number, modeId: number): Promise<MMRHistory[]>;
export function getAverageMMRHistory(filters?: {
	modeId?: number | null;
	dateFrom?: string;
	dateTo?: string;
}): Promise<Array<{ date: string; averageMMR: number; sampleSize: number }>>;
