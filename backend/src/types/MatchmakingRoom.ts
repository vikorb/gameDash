import { Player } from './player';

export type RoomStatus = 'searching' | 'ready_check' | 'in_game';

export class MatchmakingRoom {
    id: string;
    teamA: Player[] = [];
    teamB: Player[] = [];
    status: RoomStatus = 'searching';
    readyStates: Record<string | number, boolean> = {};
    readyTimeout: NodeJS.Timeout | null = null;
    gameTimeout: NodeJS.Timeout | null = null;
    readyCheckStartTime: number = 0;

    constructor(id: string) {
        this.id = id;
    }

    getAllPlayers(): Player[] {
        return [...this.teamA, ...this.teamB];
    }
}
