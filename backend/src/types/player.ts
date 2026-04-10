export type PlayerStatus = 'offline' | 'online' | 'in_queue' | 'in_game' | 'waiting';

export class Player {
    id: number | string;
    pocketbase_user_id: string;
    name: string;
    region: string;
    language: string;
    matchmaking_pref: any;
    
    mmr: number;
    rank: string;
    division: number;
    status: PlayerStatus;
    
    queueEnteringTime: number | null = null;
    roomId: string | null = null;
    socketId: string | null = null;

    constructor(
        id: number | string,
        pocketbase_user_id: string,
        name: string,
        region: string,
        language: string,
        matchmaking_pref: any,
        mmr: number,
        rank: string,
        division: number,
        status: PlayerStatus = 'online'
    ) {
        this.id = id;
        this.pocketbase_user_id = pocketbase_user_id;
        this.name = name;
        this.region = region;
        this.language = language;
        this.matchmaking_pref = matchmaking_pref;
        
        this.mmr = mmr;
        this.rank = rank;
        this.division = division;
        this.status = status;
    }

    enterQueue(): boolean {
        if (this.status !== 'online') {
            return false;
        }
        this.status = 'in_queue';
        this.queueEnteringTime = Date.now();
        return true;
    }

    exitQueue(): boolean {
        if (this.status !== 'in_queue') {
            return false;
        }
        this.status = 'online';
        this.queueEnteringTime = null;
        return true;
    }

    setWaiting(gameId: string): boolean {
        if (this.status !== 'in_queue') {
            return false;
        }
        this.status = 'waiting';
        this.queueEnteringTime = null;
        this.roomId = gameId;
        return true;
    }

    startGame(): boolean {
        if (this.status !== 'waiting') {
            return false;
        }
        this.status = 'in_game';
        return true;
    }

    cancelWaiting(): boolean {
        if (this.status !== 'waiting') {
            return false;
        }
        this.status = 'online';
        this.roomId = null;
        return true;
    }

    endGame(): boolean {
        if (this.status !== 'in_game') {
            return false;
        }
        this.status = 'online';
        this.roomId = null;
        return true;
    }

    getWaitTime(): number {
        if (this.status !== 'in_queue' || !this.queueEnteringTime) {
            return 0;
        }
        return Math.floor((Date.now() - this.queueEnteringTime) / 1000);
    }
}
