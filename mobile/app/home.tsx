import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { currentUser, mockGameRooms } from '@/data/mock-data';
import { GameRoom, RoomStatus } from '@/types/game';
import { Stack, useRouter } from 'expo-router';
import { Eye, GamepadIcon, Users } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  FlatList,
  View,
  Text as RNText,
  Button as RNButton,
  ScrollView,
  TextInput,
} from 'react-native';
import { Badge } from '@/components/ui/badge';
import { usePrivy, useLoginWithEmail, useLoginWithSiws } from '@privy-io/expo';

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

// const getStatusColor = (status: RoomStatus) => {
//   switch (status) {
//     case 'Waiting for Player':
//       return 'text-primary-foreground';
//     case 'In Progress':
//       return 'text-yellow-600';
//     case 'Finished':
//       return 'text-primary-foreground';
//     default:
//       return 'text-primary-foreground';
//   }
// };

const getStatusBgColor = (status: RoomStatus) => {
  switch (status) {
    case 'Waiting for Player':
      return 'bg-green-500 dark:bg-green-900/20';
    case 'In Progress':
      return 'bg-yellow-500 dark:bg-yellow-900/20';
    case 'Finished':
      return 'bg-gray-300 dark:bg-gray-900/20';
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
          className="h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700"
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
          className="h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-white bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
          style={{
            marginLeft: displayPlayers.length + index > 0 ? -8 : 0,
            zIndex: emptySlots - index,
          }}>
          <Icon as={Users} className="h-3 w-3 text-gray-400" />
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
    <Card className="mb-3">
      {/* Room Header */}
      <CardHeader className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon as={GamepadIcon} className="h-5 w-5 text-primary" />
          <Text variant="large" className="font-semibold">
            Room {room.id.split('-')[1]}
          </Text>
        </View>
        <Badge className={getStatusBgColor(room.status)}>
          <Text className={`text-xs font-medium`}>{room.status}</Text>
        </Badge>
      </CardHeader>

      {/* Players and Entry Fee */}
      <CardContent className="flex-row items-center justify-between">
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
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="gap-4">
        <Button
          className="flex-1"
          variant={canJoin ? 'default' : 'noShadow'}
          disabled={!canJoin}
          onPress={() => onJoinGame(room.id)}>
          <Text>{canJoin ? 'Join Game' : 'Room Full'}</Text>
        </Button>
        <Button size="icon" disabled={!canSpectate} onPress={() => onSpectate(room.id)}>
          <Icon as={Eye} className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = React.useState<string>('All');
  const { isReady } = usePrivy();
  const { sendCode, loginWithCode } = useLoginWithEmail();

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

  if (!isReady) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <LoginScreen />
      <View className="hidden flex-1 bg-background">
        {/* Header */}
        <View className="border-b border-border bg-card px-4 py-3 pt-12">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
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
              <Select
                value={{
                  value: selectedStatus,
                  label:
                    statusOptions.find((opt) => opt.value === selectedStatus)?.label || 'All Rooms',
                }}
                onValueChange={(option) => handleStatusChange(option?.value)}>
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
          <View className="mb-4 flex-row items-center justify-between">
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

function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [codeSent, setCodeSent] = React.useState(false);

  const { loginWithCode, sendCode } = useLoginWithEmail();
  const { login } = useLoginWithSiws();

  return (
    <View
      style={{
        marginTop: 140,
      }}>
      <Text>Login</Text>

      {/* prettier-ignore */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        inputMode="email"
      />

      {/* prettier-ignore */}
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Code"
        // inputMode="numeric"
      />

      {!codeSent ? (
        <RNButton
          onPress={async () => {
            await sendCode({ email });
            setCodeSent(true);
          }}
          title="Send Code"
        />
      ) : (
        <RNButton onPress={() => loginWithCode({ code: code, email })} title="Login" />
      )}
    </View>
  );
}
