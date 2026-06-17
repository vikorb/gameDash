import { Player } from './player';

export type RoomStatus = 'searching' | 'ready_check' | 'map_voting' | 'in_game';

export interface VoteMap {
    id: number;
    title: string;
}

export class MatchmakingRoom {
    id: string;
    gameModeId: number = 1;
    teamA: Player[] = [];
    teamB: Player[] = [];
    status: RoomStatus = 'searching';
    readyStates: Record<string | number, boolean> = {};
    votes: Record<string | number, number | null> = {};
    voteMaps: VoteMap[] = [];
    readyTimeout: NodeJS.Timeout | null = null;
    voteTimeout: NodeJS.Timeout | null = null;
    gameTimeout: NodeJS.Timeout | null = null;
    readyCheckStartTime: number = 0;
    voteStartTime: number = 0;
    selectedMap: VoteMap | null = null;
    botVoteTimeouts: NodeJS.Timeout[] = [];

    constructor(id: string) {
        this.id = id;
    }

    getAllPlayers(): Player[] {
        return [...this.teamA, ...this.teamB];
    }
}
