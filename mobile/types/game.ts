export type RoomStatus = 'Waiting for Player' | 'In Progress' | 'Finished';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface GameRoom {
  id: string;
  status: RoomStatus;
  entryFee: number;
  players: Player[];
  maxPlayers: number;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}