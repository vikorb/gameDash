export interface MMRHistory {
  date: string;
  mmr: number;
  isCurrent?: boolean
}

export interface MMRData {
  postgresUserId: number | string;
  mmr: number;
  rank: string;
  history: MMRHistory[];
}
