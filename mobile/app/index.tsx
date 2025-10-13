import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { currentUser, mockGameRooms } from '@/data/mock-data';
import { GameRoom, RoomStatus } from '@/types/game';
import { Stack, useRouter } from 'expo-router';
import { Eye, GamepadIcon, Users } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { FlatList, View, ScrollView } from 'react-native';

const SCREEN_OPTIONS = {
  title: 'Monopoly Rooms',
  headerShown: false,
};

const statusOptions = [
  { label: 'All Rooms', value: 'All' },
  { label: 'Waiting for Player', value: 'Waiting for Player' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Finished', value: 'Finished' },
];

const getStatusColor = (status: RoomStatus) => {
  switch (status) {
    case 'Waiting for Player':
      return 'text-green-600';
    case 'In Progress':
      return 'text-yellow-600';
    case 'Finished':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

const getStatusBgColor = (status: RoomStatus) => {
  switch (status) {
    case 'Waiting for Player':
      return 'bg-green-100 dark:bg-green-900/20';
    case 'In Progress':
      return 'bg-yellow-100 dark:bg-yellow-900/20';
    case 'Finished':
      return 'bg-gray-100 dark:bg-gray-900/20';
    default:
      return 'bg-gray-100 dark:bg-gray-900/20';
  }
};

interface PlayerAvatarsProps {
  players: GameRoom['players'];
  maxPlayers: number;
}

function PlayerAvatars({ players, maxPlayers }: PlayerAvatarsProps) {
  const displayPlayers = players.slice(0, 4); // Show max 4 avatars
  const emptySlots = Math.max(0, Math.min(4, maxPlayers) - players.length);

  return (
    <View className="flex-row items-center">
      {displayPlayers.map((player, index) => (
        <View
          key={player.id}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center border-2 border-white dark:border-gray-800"
          style={{
            marginLeft: index > 0 ? -8 : 0,
            zIndex: displayPlayers.length - index,
          }}>
          <Text className="text-xs">{player.avatar}</Text>
        </View>
      ))}
      {Array.from({ length: emptySlots }).map((_, index) => (
        <View
          key={`empty-${index}`}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center border-2 border-white dark:border-gray-800 border-dashed"
          style={{
            marginLeft: displayPlayers.length + index > 0 ? -8 : 0,
            zIndex: emptySlots - index,
          }}>
          <Icon as={Users} className="w-3 h-3 text-gray-400" />
        </View>
      ))}
    </View>
  );
}

interface RoomCardProps {
  room: GameRoom;
  onJoinGame: (roomId: string) => void;
  onSpectate: (roomId: string) => void;
}

function RoomCard({ room, onJoinGame, onSpectate }: RoomCardProps) {
  const canJoin = room.status === 'Waiting for Player' && room.players.length < room.maxPlayers;
  const canSpectate = room.status === 'In Progress';

  return (
    <View className="bg-card border border-border rounded-lg p-4 mb-3 shadow-sm">
      {/* Room Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Icon as={GamepadIcon} className="w-5 h-5 text-primary" />
          <Text variant="large" className="font-semibold">
            Room {room.id.split('-')[1]}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${getStatusBgColor(room.status)}`}>
          <Text className={`text-xs font-medium ${getStatusColor(room.status)}`}>
            {room.status}
          </Text>
        </View>
      </View>

      {/* Players and Entry Fee */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <PlayerAvatars players={room.players} maxPlayers={room.maxPlayers} />
          <Text variant="small" className="text-muted-foreground">
            {room.players.length}/{room.maxPlayers} players
          </Text>
        </View>
        <View className="items-end">
          <Text variant="small" className="text-muted-foreground">
            Entry Fee
          </Text>
          <Text variant="large" className="font-bold text-primary">
            ${room.entryFee}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        <Button
          className="flex-1"
          variant={canJoin ? 'default' : 'outline'}
          disabled={!canJoin}
          onPress={() => onJoinGame(room.id)}>
          <Text>{canJoin ? 'Join Game' : 'Room Full'}</Text>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={!canSpectate}
          onPress={() => onSpectate(room.id)}>
          <Icon as={Eye} className="w-4 h-4" />
        </Button>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = React.useState<string>('All');

  const filteredRooms = React.useMemo(() => {
    if (selectedStatus === 'All') {
      return mockGameRooms;
    }
    return mockGameRooms.filter((room) => room.status === selectedStatus);
  }, [selectedStatus]);

  const handleJoinGame = (roomId: string) => {
    console.log('Joining game:', roomId);
    router.push(`/game?roomId=${roomId}`);
  };

  const handleSpectate = (roomId: string) => {
    console.log('Spectating game:', roomId);
    // TODO: Implement spectate logic
  };

  const handleStatusChange = (value: string | undefined) => {
    if (value) {
      setSelectedStatus(value);
    }
  };

  const renderRoomCard = ({ item }: { item: GameRoom }) => (
    <RoomCard room={item} onJoinGame={handleJoinGame} onSpectate={handleSpectate} />
  );

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="bg-card border-b border-border px-4 py-3 pt-12">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                <Text className="text-lg text-primary-foreground">{currentUser.avatar}</Text>
              </View>
              <View>
                <Text variant="large" className="font-semibold">
                  Welcome back!
                </Text>
                <Text variant="small" className="text-muted-foreground">
                  {currentUser.name}
                </Text>
              </View>
            </View>
            <View className="w-32">
              <Select value={{ value: selectedStatus, label: statusOptions.find(opt => opt.value === selectedStatus)?.label || 'All Rooms' }} onValueChange={(option) => handleStatusChange(option?.value)}>
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Filter rooms" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} label={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
          </View>
        </View>

        {/* Room List */}
        <View className="flex-1 px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text variant="h3">Game Rooms</Text>
            <Text variant="small" className="text-muted-foreground">
              {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <FlatList
            data={filteredRooms}
            renderItem={renderRoomCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </>
  );
}
