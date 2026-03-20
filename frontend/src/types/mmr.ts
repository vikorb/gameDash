export interface MMRHistory {
  date: string;
  mmr: number;
}

export interface MMRData {
  postgresUserId: number | string;
  mmr: number;
  rank: string;
  history: MMRHistory[];
}
