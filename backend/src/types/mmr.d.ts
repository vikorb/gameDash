export interface MMRHistory {
  date: string;
  mmr: number;
}


export interface MMRResult {
  mmr: number;
  rank: string;
}

export function getCurrentMMR(userId: number, modeId: number): Promise<MMRResult>;
export function getMMRHistory(userId: number, modeId: number): Promise<MMRHistory[]>;

export function getCurrentMMR(userId: number, modeId: number): Promise<MMRResult>;