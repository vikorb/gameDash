import { describe, it, expect, vi } from 'vitest';
import { MatchmakingRoom } from '../types/MatchmakingRoom';
import { resolveMapVoting } from '../utils/mapVoting';
import { Player } from '../types/player';

describe('Map voting resolution logic', () => {
  it('should choose the map with the highest votes', () => {
    const room = new MatchmakingRoom('test_room');
    room.status = 'map_voting';
    room.voteMaps = [
      { id: 1, title: 'Map A' },
      { id: 2, title: 'Map B' },
      { id: 3, title: 'Map C' }
    ];
    room.votes = {
      p1: 2, p2: 2, p3: 2,
      p4: 1, p5: 3, p6: null
    };

    const ioMock: any = { to: () => ({ emit: () => {} }) };
    const rooms: any[] = [];
    resolveMapVoting(room, ioMock, rooms);

    expect(room.selectedMap).toBeDefined();
    expect(room.selectedMap?.id).toBe(2);
  });

  it('should choose randomly between favorites in case of a tie', () => {
    const room = new MatchmakingRoom('test_room');
    room.status = 'map_voting';
    room.voteMaps = [
      { id: 1, title: 'Map A' },
      { id: 2, title: 'Map B' },
      { id: 3, title: 'Map C' }
    ];
    room.votes = {
      p1: 1, p2: 1,
      p3: 2, p4: 2,
      p5: null
    };

    const ioMock: any = { to: () => ({ emit: () => {} }) };
    resolveMapVoting(room, ioMock, []);

    expect(room.selectedMap).toBeDefined();
    expect([1, 2]).toContain(room.selectedMap?.id);
  });

  it('should fall back to choosing a map randomly if all votes are blank', () => {
    const room = new MatchmakingRoom('test_room');
    room.status = 'map_voting';
    room.voteMaps = [
      { id: 1, title: 'Map A' },
      { id: 2, title: 'Map B' },
      { id: 3, title: 'Map C' }
    ];
    room.votes = {
      p1: null, p2: null, p3: null
    };

    const ioMock: any = { to: () => ({ emit: () => {} }) };
    resolveMapVoting(room, ioMock, []);

    expect(room.selectedMap).toBeDefined();
    expect([1, 2, 3]).toContain(room.selectedMap?.id);
  });
});
