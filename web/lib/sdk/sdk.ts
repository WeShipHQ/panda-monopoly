import {
  getInitializeGameInstruction,
  getJoinGameInstructionAsync,
  getStartGameInstruction,
  getRollDiceInstructionAsync,
  getEndTurnInstruction,
  getPayJailFineInstructionAsync,
  getBuyPropertyInstructionAsync,
  getMortgagePropertyInstructionAsync,
  getUnmortgagePropertyInstructionAsync,
  getPayRentInstructionAsync,
  getBuildHouseInstructionAsync,
  getBuildHotelInstructionAsync,
  getSellBuildingInstructionAsync,
  getCollectGoInstructionAsync,
  getCollectFreeParkingInstructionAsync,
  getGoToJailInstructionAsync,
  getAttendFestivalInstructionAsync,
  getDrawChanceCardInstructionAsync,
  getDrawCommunityChestCardInstructionAsync,
  getPayMevTaxHandlerInstructionAsync,
  getPayPriorityFeeTaxHandlerInstructionAsync,
  fetchGameState,
  GameState,
  PlayerState,
  fetchPlayerState,
  fetchAllPropertyState,
  PROPERTY_STATE_DISCRIMINATOR,
  fetchPropertyState,
  PropertyState,
  decodeGameState,
  decodePlayerState,
  getDeclinePropertyInstruction,
  getCommunityChestCardDrawnCodec,
  getChanceCardDrawnCodec,
} from "./generated";
import {
  CreateGameIxs,
  CreateGameParams,
  JoinGameParams,
  JoinGameIxs,
  StartGameParams,
  RollDiceParams,
  EndTurnParams,
  PayJailFineParams,
  BuyPropertyParams,
  MortgagePropertyParams,
  UnmortgagePropertyParams,
  PayRentParams,
  BuildHouseParams,
  BuildHotelParams,
  SellBuildingParams,
  CollectGoParams,
  CollectFreeParkingParams,
  GoToJailParams,
  AttendFestivalParams,
  DrawChanceCardParams,
  DrawCommunityChestCardParams,
  PayMevTaxParams,
  PayPriorityFeeTaxParams,
  DeclinePropertyParams,
  GameEvent,
} from "./types";
import { getGamePDA, getPlayerStatePDA, getPropertyStatePDA } from "./pda";
import {
  Account,
  Address,
  address,
  getBase58Decoder,
  Rpc,
  SolanaRpcApi,
  type Instruction,
  type GetProgramAccountsMemcmpFilter,
  type ReadonlyUint8Array,
  MaybeEncodedAccount,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  fetchEncodedAccount,
  getBase64Encoder,
  some,
  none,
  isAddress,
  Decoder,
} from "@solana/kit";
import {
  CHANCE_CARD_DRAWN_EVENT_DISCRIMINATOR,
  COMMUNITY_CHEST_CARD_DRAWN_EVENT_DISCRIMINATOR,
} from "./utils";

class MonopolyGameSDK {
  /**
   * Create a new monopoly game
   */
  async createGameIx(params: CreateGameParams): Promise<CreateGameIxs> {
    const [gameAccountPDA] = await getGamePDA(
      params.gameId,
      params.creator.address
    );

    const [playerStateAddress] = await getPlayerStatePDA(
      gameAccountPDA,
      params.creator.address
    );

    const instruction = getInitializeGameInstruction({
      game: gameAccountPDA,
      authority: params.creator,
      gameId: BigInt(params.gameId),
      playerState: playerStateAddress,
    });

    return {
      instruction,
      gameAccountAddress: gameAccountPDA,
    };
  }

  /**
   * Join an existing game
   */
  async joinGameIx(params: JoinGameParams): Promise<JoinGameIxs> {
    const instruction = await getJoinGameInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });

    const playerStateAddress = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    return {
      instruction,
      playerStateAddress: playerStateAddress[0],
    };
  }

  /**
   * Start a game (only game creator can call this)
   */
  async startGameIx(params: StartGameParams): Promise<Instruction> {
    return getStartGameInstruction({
      game: params.gameAddress,
      authority: params.authority,
    });
  }

  /**
   * Roll dice for current player - handles movement automatically
   */
  async rollDiceIx(params: RollDiceParams): Promise<Instruction> {
    return await getRollDiceInstructionAsync({
      game: params.gameAddress,
      player: params.player,
      diceRoll: params.diceRoll
        ? some(params.diceRoll as unknown as ReadonlyUint8Array)
        : none(),
    });
  }

  /**
   * End current player's turn
   */
  async endTurnIx(params: EndTurnParams): Promise<Instruction> {
    const [playerStatePda] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );
    return getEndTurnInstruction({
      game: params.gameAddress,
      player: params.player,
      playerState: playerStatePda,
    });
  }

  /**
   * Pay jail fine to get out of jail
   */
  async payJailFineIx(params: PayJailFineParams): Promise<Instruction> {
    return await getPayJailFineInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });
  }

  // Property-related methods

  /**
   * Buy a property at the specified position
   */
  async buyPropertyIx(params: BuyPropertyParams): Promise<Instruction> {
    const [propertyStateAddress] = await getPropertyStatePDA(
      params.gameAddress,
      params.position
    );

    return await getBuyPropertyInstructionAsync({
      game: params.gameAddress,
      player: params.player,
      propertyState: propertyStateAddress,
      position: params.position,
    });
  }

  async declinePropertyIx(params: DeclinePropertyParams): Promise<Instruction> {
    const [playerStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    return await getDeclinePropertyInstruction({
      game: params.gameAddress,
      playerState: playerStateAddress,
      player: params.player,
      position: params.position,
    });
  }

  /**
   * Mortgage a property to get cash
   */
  async mortgagePropertyIx(
    params: MortgagePropertyParams
  ): Promise<Instruction> {
    const [propertyStateAddress] = await getPropertyStatePDA(
      params.gameAddress,
      params.position
    );

    return await getMortgagePropertyInstructionAsync({
      game: params.gameAddress,
      player: params.player,
      propertyState: propertyStateAddress,
      position: params.position,
    });
  }

  /**
   * Unmortgage a property by paying the mortgage plus interest
   */
  async unmortgagePropertyIx(
    params: UnmortgagePropertyParams
  ): Promise<Instruction> {
    const [propertyStateAddress] = await getPropertyStatePDA(
      params.gameAddress,
      params.position
    );

    return await getUnmortgagePropertyInstructionAsync({
      game: params.gameAddress,
      player: params.player,
      propertyState: propertyStateAddress,
      position: params.position,
    });
  }

  /**
   * Pay rent when landing on another player's property
   */
  async payRentIx(params: PayRentParams): Promise<Instruction> {
    const [payerStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    const [owerStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.propertyOwner
    );

    const [propertyStateAddress] = await getPropertyStatePDA(
      params.gameAddress,
      params.position
    );

    return await getPayRentInstructionAsync({
      game: params.gameAddress,
      payerState: payerStateAddress,
      payer: params.player,
      ownerState: owerStateAddress,
      propertyOwner: params.propertyOwner,
      propertyState: propertyStateAddress,
      position: params.position,
    });
  }

  // Building-related methods

  /**
   * Build a house on a property
   */
  async buildHouseIx(params: BuildHouseParams): Promise<Instruction> {
    const [propertyStateAddress] = await getPropertyStatePDA(
      params.gameAddress,
      params.position
    );

    return await getBuildHouseInstructionAsync({
      game: params.gameAddress,
      player: params.player,
      propertyState: propertyStateAddress,
      position: params.position,
    });
  }

  /**
   * Build a hotel on a property (requires 4 houses)
   */
  async buildHotelIx(params: BuildHotelParams): Promise<Instruction> {
    const [propertyStateAddress] = await getPropertyStatePDA(
      params.gameAddress,
      params.position
    );

    return await getBuildHotelInstructionAsync({
      game: params.gameAddress,
      player: params.player,
      propertyState: propertyStateAddress,
      position: params.position,
    });
  }

  /**
   * Sell buildings on a property
   */
  async sellBuildingIx(params: SellBuildingParams): Promise<Instruction> {
    const [propertyStateAddress] = await getPropertyStatePDA(
      params.gameAddress,
      params.position
    );

    return await getSellBuildingInstructionAsync({
      game: params.gameAddress,
      player: params.player,
      propertyState: propertyStateAddress,
      position: params.position,
      buildingType: params.buildingType,
    });
  }

  // Special space methods

  /**
   * Collect GO salary when passing or landing on GO
   */
  async collectGoIx(params: CollectGoParams): Promise<Instruction> {
    return await getCollectGoInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });
  }

  /**
   * Collect money from Free Parking
   */
  async collectFreeParkingIx(
    params: CollectFreeParkingParams
  ): Promise<Instruction> {
    return await getCollectFreeParkingInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });
  }

  /**
   * Go to jail (from Go to Jail space or card)
   */
  async goToJailIx(params: GoToJailParams): Promise<Instruction> {
    return await getGoToJailInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });
  }

  /**
   * Attend festival (special space)
   */
  async attendFestivalIx(params: AttendFestivalParams): Promise<Instruction> {
    return await getAttendFestivalInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });
  }

  // Card-related methods

  /**
   * Draw a Chance card
   */
  async drawChanceCardIx(params: DrawChanceCardParams): Promise<Instruction> {
    return await getDrawChanceCardInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });
  }

  /**
   * Draw a Community Chest card
   */
  async drawCommunityChestCardIx(
    params: DrawCommunityChestCardParams
  ): Promise<Instruction> {
    return await getDrawCommunityChestCardInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });
  }

  // Tax methods

  /**
   * Pay MEV tax
   */
  async payMevTaxIx(params: PayMevTaxParams): Promise<Instruction> {
    return await getPayMevTaxHandlerInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });
  }

  /**
   * Pay priority fee tax
   */
  async payPriorityFeeTaxIx(
    params: PayPriorityFeeTaxParams
  ): Promise<Instruction> {
    return await getPayPriorityFeeTaxHandlerInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });
  }

  // Account fetching methods

  async getGameAccount(
    rpc: Rpc<SolanaRpcApi>,
    gameAccount: Address
  ): Promise<Account<GameState, string> | null> {
    try {
      return await fetchGameState(rpc, gameAccount);
    } catch (error) {
      return null;
    }
  }

  async getPlayerAccount(
    rpc: Rpc<SolanaRpcApi>,
    gamePDA: Address,
    player: Address
  ): Promise<Account<PlayerState, string> | null> {
    try {
      const [playerStateAddress] = await getPlayerStatePDA(gamePDA, player);
      return await fetchPlayerState(rpc, playerStateAddress);
    } catch (error) {
      return null;
    }
  }

  async getPropertyStateAccounts(
    rpc: Rpc<SolanaRpcApi>,
    gamePDA: Address,
    positions: number[]
  ): Promise<Account<PropertyState, string>[] | null> {
    try {
      const addresses = (
        await Promise.all(
          positions.map((position) => getPropertyStatePDA(gamePDA, position))
        )
      ).flatMap((item) => item[0]);

      return await fetchAllPropertyState(rpc, addresses);
    } catch (error) {
      return null;
    }
  }

  private async subscribeToAccountInfo(
    accAddress: Address,
    onAccountChange: (accountInfo: MaybeEncodedAccount<string> | null) => void,
    er: boolean = false
  ) {
    let ignoreFetch = false;

    // const rpc = er ? this.erRpc : this.rpc;
    // const rpcSubscriptions = er
    //   ? this.erRpcSubscriptions
    //   : this.rpcSubscriptions;
    const rpc = createSolanaRpc("http://127.0.0.1:8899");
    const rpcSubscriptions = createSolanaRpcSubscriptions(
      "ws://127.0.0.1:8900"
    );

    fetchEncodedAccount(rpc, accAddress)
      .then((response) => {
        if (ignoreFetch) {
          return;
        }
        onAccountChange(response);
      })
      .catch((error) => {
        onAccountChange(null);
      });

    const abortController = new AbortController();

    const notifications = await rpcSubscriptions
      .accountNotifications(accAddress, {
        commitment: "confirmed",
        encoding: "base64",
      })
      .subscribe({ abortSignal: abortController.signal });

    (async () => {
      for await (const notification of notifications) {
        ignoreFetch = true;

        const encodedData = getBase64Encoder().encode(
          notification.value.data[0]
        );

        const data: MaybeEncodedAccount<string> = {
          address: accAddress,
          exists: true,
          executable: notification.value.executable,
          lamports: notification.value.lamports,
          programAddress: notification.value.owner,
          space: notification.value.space,
          data: encodedData as any,
        };

        onAccountChange(data);
      }
    })();

    return () => {
      ignoreFetch = true;
      abortController.abort();
    };
  }

  public async subscribeToGameAccount(
    gameAddress: Address,
    callback: (gameState: GameState | null) => void,
    er: boolean = false
  ) {
    // Set up a flag to track if we've unsubscribed
    let unsubscribed = false;
    let cleanup: (() => void) | null = null;

    if (unsubscribed) return;

    cleanup = await this.subscribeToAccountInfo(
      gameAddress,
      (encodedAccount) => {
        if (encodedAccount === null) {
          callback(null);
          return;
        }

        try {
          const gameAccount = decodeGameState(encodedAccount);
          if (gameAccount.exists) {
            callback(gameAccount.data);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error("Error decoding game account:", error);
          callback(null);
        }
      },
      er
    );

    return () => {
      unsubscribed = true;
      if (cleanup) {
        cleanup();
      }
    };
  }

  public async subscribePlayerStateAccount(
    gameAddress: Address,
    player: Address,
    callback: (playerState: PlayerState | null) => void,
    er: boolean = false
  ) {
    const [playerStateAddress] = await getPlayerStatePDA(gameAddress, player);

    let unsubscribed = false;
    let cleanup: (() => void) | null = null;

    if (unsubscribed) return;

    cleanup = await this.subscribeToAccountInfo(
      playerStateAddress,
      (encodedAccount) => {
        if (encodedAccount === null) {
          callback(null);
          return;
        }

        try {
          const playerAccount = decodePlayerState(encodedAccount);
          if (playerAccount.exists) {
            callback(playerAccount.data);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error("Error decoding player account:", error);
          callback(null);
        }
      },
      er
    );

    return () => {
      unsubscribed = true;
      if (cleanup) {
        cleanup();
      }
    };
  }

  public async subscribeToEvents(
    onEvent: (event: GameEvent) => void,
    er: boolean = false
  ) {
    const rpcSubscriptions = createSolanaRpcSubscriptions(
      "ws://127.0.0.1:8900"
    );

    const abortController = new AbortController();

    const notifications = await rpcSubscriptions
      .logsNotifications(
        {
          mentions: [address("4vucUqMcXN4sgLsgnrXTUC9U7ACZ5DmoRBLbWt4vrnyR")],
        },
        { commitment: "confirmed" }
      )
      .subscribe({
        abortSignal: abortController.signal,
      });

    (async () => {
      for await (const notification of notifications) {
        try {
          const logs = notification.value.logs;
          if (!logs || logs.length === 0) {
            continue;
          }

          for (const log of logs) {
            const trimmed = log.trim();

            if (trimmed.startsWith(PROGRAM_DATA)) {
              console.log("EEE log trimmed", trimmed);
              const base64 = trimmed.slice(PROGRAM_DATA_START_INDEX);
              const buf = Buffer.from(base64, "base64");

              if (buf.length <= 8) {
                continue;
              }
              const discriminator = buf.subarray(0, 8);
              if (
                discriminator.equals(
                  Buffer.from(CHANCE_CARD_DRAWN_EVENT_DISCRIMINATOR)
                )
              ) {
                const data = getChanceCardDrawnCodec().decode(buf.subarray(8));
                onEvent({ type: "ChanceCardDrawn", data });
              } else if (
                discriminator.equals(
                  Buffer.from(COMMUNITY_CHEST_CARD_DRAWN_EVENT_DISCRIMINATOR)
                )
              ) {
                const data = getCommunityChestCardDrawnCodec().decode(
                  buf.subarray(8)
                );
                onEvent({ type: "CommunityChestCardDrawn", data });
              }
            }
          }
        } catch (error) {
          console.error("Error parsing event:", error);
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }

  // async fetchAllPropertyAccount(
  //   rpc: Rpc<SolanaRpcApi>,
  //   gamePDA: Address,
  //   player: Address
  // ): Promise<Account<PlayerState, string> | null> {
  //   try {
  //     const discriminator = getBase58Decoder().decode(
  //       PROPERTY_STATE_DISCRIMINATOR
  //     );
  //     const discriminatorFilter: GetProgramAccountsMemcmpFilter = {
  //       memcmp: {
  //         offset: BigInt(0),
  //         // @ts-expect-error
  //         bytes: discriminator,
  //         encoding: "base58",
  //       },
  //     };
  //   } catch (error) {
  //     return null;
  //   }
  // }
}

const PROGRAM_LOG = "Program log: ";
const PROGRAM_DATA = "Program data: ";
const PROGRAM_LOG_START_INDEX = PROGRAM_LOG.length;
const PROGRAM_DATA_START_INDEX = PROGRAM_DATA.length;

function parseEvent<T>(
  logs: readonly string[],
  programIdStr: string,
  discriminator: Uint8Array,
  decoder: Decoder<T>
): T | undefined {
  const stack: string[] = [];
  console.log("EEE logAll", logs);
  for (const log of logs) {
    // console.log("EEE log", log);
    const trimmed = log.trim();

    // if (trimmed.startsWith(`Program ${programIdStr} invoke`)) {
    //   stack.push(programIdStr);
    //   continue;
    // }

    // if (
    //   trimmed.startsWith(`Program ${programIdStr} success`) ||
    //   trimmed.startsWith(`Program ${programIdStr} failed`)
    // ) {
    //   stack.pop();
    //   continue;
    // }

    // if (stack.length === 0 || stack[stack.length - 1] !== programIdStr) {
    //   continue;
    // }

    console.log("EEE log trim", trimmed);

    if (
      trimmed.startsWith(PROGRAM_DATA)
      // || trimmed.startsWith(PROGRAM_LOG)
    ) {
      const base64 = trimmed.startsWith(PROGRAM_DATA)
        ? trimmed.slice(PROGRAM_DATA_START_INDEX)
        : trimmed.slice(PROGRAM_LOG_START_INDEX);

      console.log("EEE log base64", base64);

      const buf = Buffer.from(base64, "base64");
      console.log(
        "EEE log buf",
        buf,
        buf.subarray(0, 8)
        // buf.subarray(0, 8).equals(discriminator)
      );
      if (buf.length >= 8 && buf.subarray(0, 8).equals(discriminator)) {
        return decoder.decode(buf.subarray(8));
      }
    }
  }

  return undefined;
}

const sdk = new MonopolyGameSDK();
export { sdk };
