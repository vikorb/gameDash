import { Player } from '../types/player';

export interface MMRBalance {
    max: number;
    min: number;
    difference: number;
}

export interface GameCreationResult {
    teams: Player[][];
    createdAt: number;
    mmrBalance: MMRBalance;
}

// Helper: Calculate MMR range (max - min)
function calculateMMRRange(players: Player[]): number {
    if (players.length === 0) return 0;
    const mmrs = players.map(p => p.mmr);
    return Math.max(...mmrs) - Math.min(...mmrs);
}

// Helper: Calculate target MMR from sample of longest-waiting players
function getTargetMMR(sortedPlayers: Player[], sampleSizePercent: number): number {
    if (sortedPlayers.length === 0) return 0;
    const sampleSize = Math.max(1, Math.ceil(sortedPlayers.length * sampleSizePercent));
    const sample = sortedPlayers.slice(0, sampleSize);
    const sumMMR = sample.reduce((sum, p) => sum + p.mmr, 0);
    return Math.round(sumMMR / sample.length);
}

// Helper: Calculate MMR balance statistics
function calculateMMRBalance(teamMMRTotals: number[]): MMRBalance {
    const max = Math.max(...teamMMRTotals);
    const min = Math.min(...teamMMRTotals);
    return { max, min, difference: max - min };
}

// Helper: Select players with progressive tolerance based on MMR range
function selectPlayersWithTolerance(
    players: Player[], 
    roomId: string, 
    totalNeeded: number, 
    targetMMR: number, 
    mmrRange: number
): Player[] {
    const selected: Player[] = [];
    const remaining = [...players];
    const maxTolerance = mmrRange * 0.30; // Start at ±30% of range
    const minTolerance = mmrRange * 0.10; // End at ±10% of range
    
    for (let i = 0; i < totalNeeded; i++) {
        // Failsafe: if no more players available, stop trying
        if (remaining.length === 0) break;
        
        // Calculate tolerance for this position (decreasing as we fill)
        const progress = i / totalNeeded;
        const tolerance = maxTolerance - (maxTolerance - minTolerance) * progress;
        
        // Find candidates within tolerance
        const candidates = remaining.filter(p => 
            Math.abs(p.mmr - targetMMR) <= tolerance
        );
        
        let selectedPlayer: Player;
        
        if (candidates.length > 0) {
            // Prefer candidate closest to target MMR
            candidates.sort((a, b) => Math.abs(a.mmr - targetMMR) - Math.abs(b.mmr - targetMMR));
            selectedPlayer = candidates[0];
        } else {
            // Fallback: take whoever has waited longest
            selectedPlayer = remaining[0];
        }
        
        // Try to set to waiting state
        if (selectedPlayer.setWaiting(roomId)) {
            selected.push(selectedPlayer);
            remaining.splice(remaining.indexOf(selectedPlayer), 1);
        } else {
            // Player not available, try next in remaining
            remaining.splice(remaining.indexOf(selectedPlayer), 1);
            i--; // Don't count this as a slot filled
        }
    }
    
    return selected;
}

export async function createGame(
    players: Player[], 
    roomId: string, 
    teamSize: number = 4, 
    numTeams: number = 2, 
    sampleSizePercent: number = 0.25
): Promise<GameCreationResult | null> {
    const totalPlayersNeeded = teamSize * numTeams;
    
    if (players.length < totalPlayersNeeded) {
        return null;
    }
    
    // Sort by queue entering time (earliest first for longest wait)
    // Handle nulls by defaulting to 0 for sorting purposes
    players.sort((a, b) => (a.queueEnteringTime ?? 0) - (b.queueEnteringTime ?? 0)); 
    
    // Calculate target MMR from sample and MMR range
    const targetMMR = getTargetMMR(players, sampleSizePercent);
    const mmrRange = calculateMMRRange(players);
    
    // Select players with progressive tolerance
    const selectedPlayers = selectPlayersWithTolerance(
        players,
        roomId,
        totalPlayersNeeded,
        targetMMR,
        mmrRange
    );
    
    // Safety check: if players become unavailable during selection (setWaiting returns false),
    // we may end up with fewer selected players than needed. Cancel waiting and retry.
    if (selectedPlayers.length < totalPlayersNeeded) {
        selectedPlayers.forEach(p => p.cancelWaiting());
        return null;
    }
    
    // Distribute selected players into teams with balancing
    const teams: Player[][] = Array.from({ length: numTeams }, () => []);
    const teamMMRTotals = Array(numTeams).fill(0);
    
    // Sort selected players by MMR descending for balanced distribution
    selectedPlayers.sort((a, b) => b.mmr - a.mmr);
    
    // Distribute to teams using rotating pattern for better balance
    // Each round rotates the starting team to avoid favoring team 0
    for (let i = 0; i < selectedPlayers.length; i++) {
        const round = Math.floor(i / numTeams);
        const positionInRound = i % numTeams;
        const teamIndex = (round + positionInRound) % numTeams;
        
        teams[teamIndex].push(selectedPlayers[i]);
        teamMMRTotals[teamIndex] += selectedPlayers[i].mmr;
    }
    
    // Calculate final balance statistics
    const balance = calculateMMRBalance(teamMMRTotals);
    
    // Start the game
    selectedPlayers.forEach(p => p.startGame());
    
    return {
        teams,
        createdAt: Date.now(),
        mmrBalance: balance
    };
}