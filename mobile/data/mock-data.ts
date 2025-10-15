import { GameRoom, Player, User, RoomStatus } from '@/types/game';

// Mock current user
export const currentUser: User = {
  id: 'user-1',
  name: 'John Doe',
  avatar: '👤',
};

// Mock players
export const mockPlayers: Player[] = [
  { id: 'player-1', name: 'Alice', avatar: '👩', color: '#ffbf00' },
  { id: 'player-2', name: 'Bob', avatar: '👨', color: '#04e17a' },
  { id: 'player-3', name: 'Charlie', avatar: '🧑', color: '#0099ff' },
  { id: 'player-4', name: 'Diana', avatar: '👩‍🦰', color: '#e96bff' },
  { id: 'player-5', name: 'Eve', avatar: '👱‍♀️', color: '#ff6b6b' },
  { id: 'player-6', name: 'Frank', avatar: '👨‍🦱', color: '#4ecdc4' },
  { id: 'player-7', name: 'Grace', avatar: '👩‍🦳', color: '#45b7d1' },
  { id: 'player-8', name: 'Henry', avatar: '👨‍🦲', color: '#96ceb4' },
];

// Mock game rooms
export const mockGameRooms: GameRoom[] = [
  {
    id: 'room-1',
    status: 'Waiting for Player' as RoomStatus,
    entryFee: 100,
    players: [mockPlayers[0], mockPlayers[1]],
    maxPlayers: 4,
    createdAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: 'room-2',
    status: 'In Progress' as RoomStatus,
    entryFee: 250,
    players: [mockPlayers[2], mockPlayers[3], mockPlayers[4], mockPlayers[5]],
    maxPlayers: 4,
    createdAt: new Date('2024-01-15T09:15:00'),
  },
  {
    id: 'room-3',
    status: 'Waiting for Player' as RoomStatus,
    entryFee: 50,
    players: [mockPlayers[6]],
    maxPlayers: 4,
    createdAt: new Date('2024-01-15T11:45:00'),
  },
  {
    id: 'room-4',
    status: 'Finished' as RoomStatus,
    entryFee: 500,
    players: [mockPlayers[0], mockPlayers[2], mockPlayers[4], mockPlayers[6]],
    maxPlayers: 4,
    createdAt: new Date('2024-01-15T08:00:00'),
  },
  {
    id: 'room-5',
    status: 'In Progress' as RoomStatus,
    entryFee: 150,
    players: [mockPlayers[1], mockPlayers[3], mockPlayers[7]],
    maxPlayers: 4,
    createdAt: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 'room-6',
    status: 'Waiting for Player' as RoomStatus,
    entryFee: 75,
    players: [mockPlayers[5], mockPlayers[7]],
    maxPlayers: 4,
    createdAt: new Date('2024-01-15T12:00:00'),
  },
  {
    id: 'room-7',
    status: 'Finished' as RoomStatus,
    entryFee: 300,
    players: [mockPlayers[0], mockPlayers[1], mockPlayers[2], mockPlayers[3]],
    maxPlayers: 4,
    createdAt: new Date('2024-01-15T07:30:00'),
  },
  {
    id: 'room-8',
    status: 'Waiting for Player' as RoomStatus,
    entryFee: 200,
    players: [mockPlayers[4]],
    maxPlayers: 4,
    createdAt: new Date('2024-01-15T12:30:00'),
  },
];