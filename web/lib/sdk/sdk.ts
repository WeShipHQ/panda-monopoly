import {
  getInitializeGameInstruction,
  getJoinGameInstructionAsync,
  getStartGameInstruction,
  getRollDiceInstructionAsync,
  getEndTurnInstruction,
  getPayJailFineInstructionAsync,
  getMortgagePropertyInstructionAsync,
  getUnmortgagePropertyInstructionAsync,
  getPayRentInstructionAsync,
  getBuildHouseInstructionAsync,
  getBuildHotelInstructionAsync,
  getSellBuildingInstructionAsync,
  getCollectFreeParkingInstructionAsync,
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
  PropertyState,
  decodeGameState,
  decodePlayerState,
  getDeclinePropertyInstruction,
  getCommunityChestCardDrawnCodec,
  getChanceCardDrawnCodec,
  getCreatePlatformConfigInstructionAsync,
  fetchPlatformConfig,
  GAME_STATE_DISCRIMINATOR,
  PANDA_MONOPOLY_PROGRAM_ADDRESS,
  getGameStateDecoder,
  getResetGameHandlerInstruction,
  getCloseGameHandlerInstruction,
  getUndelegateGameHandlerInstruction,
  getBuyPropertyInstruction,
  getInitPropertyHandlerInstruction,
  getCreateTradeInstructionAsync,
  getAcceptTradeInstructionAsync,
  // getRejectTradeInstruction,
  // getCancelTradeInstruction,
  // fetchTradeState,
  // TradeState,
  getRollDiceVrfHandlerInstruction,
  getCreateTradeInstruction,
  getAcceptTradeInstruction,
  getRejectTradeInstruction,
  getCancelTradeInstruction,
  getDeclareBankruptcyInstruction,
  getGameStatusEncoder,
  GameStatus,
  getDrawChanceCardInstruction,
  getDrawCommunityChestCardInstruction,
  getDrawChanceCardVrfHandlerInstruction,
  getUseGetOutOfJailCardInstruction,
  getPayJailFineInstruction,
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
  CollectFreeParkingParams,
  AttendFestivalParams,
  DrawChanceCardParams,
  DrawCommunityChestCardParams,
  PayMevTaxParams,
  PayPriorityFeeTaxParams,
  DeclinePropertyParams,
  GameEvent,
  CreatePlatformParams,
  CreateTradeParams,
  AcceptTradeParams,
  RejectTradeParams,
  CancelTradeParams,
  DeclareBankruptcyParams,
  DrawChanceCardVrfParams,
  UseGetOutOfJailCardParams,
} from "./types";
import {
  getGamePDA,
  getPlatformPDA,
  getPlayerStatePDA,
  getProgramIdentityPDA,
  getPropertyStatePDA,
  getTradeStatePDA,
} from "./pda";
import {
  Account,
  Address,
  getBase58Decoder,
  Rpc,
  SolanaRpcApi,
  type Instruction,
  type GetProgramAccountsMemcmpFilter,
  type ReadonlyUint8Array,
  MaybeEncodedAccount,
  fetchEncodedAccount,
  getBase64Encoder,
  some,
  none,
  Decoder,
  GetProgramAccountsApi,
  VariableSizeDecoder,
  getAddressEncoder,
  RpcSubscriptions,
  SolanaRpcSubscriptionsApi,
  getProgramDerivedAddress,
  WritableAccount,
  AccountRole,
  address,
} from "@solana/kit";
import {
  CHANCE_CARD_DRAWN_EVENT_DISCRIMINATOR,
  COMMUNITY_CHEST_CARD_DRAWN_EVENT_DISCRIMINATOR,
} from "./utils";
import {
  DEFAULT_EPHEMERAL_QUEUE,
  DELEGATION_PROGRAM_ID,
  PLATFORM_ID,
  VRF_PROGRAM_IDENTITY,
} from "@/configs/constants";
import { GameAccount, mapGameStateToAccount } from "@/types/schema";

class MonopolyGameSDK {
  async createPlatformIx(params: CreatePlatformParams): Promise<any> {
    const [configPda] = await getPlatformPDA(params.platformId);

    const instruction = await getCreatePlatformConfigInstructionAsync({
      admin: params.creator,
      config: configPda,
      platformId: params.platformId,
      feeBasisPoints: 100,
      feeVault: params.creator.address,
    });

    return {
      instruction,
      configAddress: configPda,
    };
  }
  /**
   * Create a new monopoly game
   */
  async createGameIx(params: CreateGameParams): Promise<CreateGameIxs> {
    const [configPda] = await getPlatformPDA(params.platformId);

    const configAccount = await fetchPlatformConfig(params.rpc, configPda);

    const [gameAccountPDA] = await getGamePDA(
      configAccount.data.id,
      Number(configAccount.data.nextGameId)
    );

    const [playerStateAddress] = await getPlayerStatePDA(
      gameAccountPDA,
      params.creator.address
    );

    const instruction = getInitializeGameInstruction({
      game: gameAccountPDA,
      authority: params.creator,
      config: configPda,
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
    const [bufferGamePda] = await getProgramDerivedAddress({
      programAddress: PANDA_MONOPOLY_PROGRAM_ADDRESS,
      seeds: ["buffer", getAddressEncoder().encode(params.gameAddress)],
    });

    const [delegationRecordGamePda] = await getProgramDerivedAddress({
      programAddress: DELEGATION_PROGRAM_ID,
      seeds: ["delegation", getAddressEncoder().encode(params.gameAddress)],
    });

    const [delegationMetadataGamePda] = await getProgramDerivedAddress({
      programAddress: DELEGATION_PROGRAM_ID,
      seeds: [
        "delegation-metadata",
        getAddressEncoder().encode(params.gameAddress),
      ],
    });

    const ix = getStartGameInstruction({
      bufferGame: bufferGamePda,
      delegationRecordGame: delegationRecordGamePda,
      delegationMetadataGame: delegationMetadataGamePda,
      game: params.gameAddress,
      authority: params.authority,
    });

    const remainingAccounts: WritableAccount[] = [];

    for (const player of params.players) {
      const [playerPda] = await getPlayerStatePDA(params.gameAddress, player);
      remainingAccounts.push({
        address: playerPda,
        role: AccountRole.WRITABLE,
      });

      const [bufferGamePda] = await getProgramDerivedAddress({
        programAddress: PANDA_MONOPOLY_PROGRAM_ADDRESS,
        seeds: ["buffer", getAddressEncoder().encode(playerPda)],
      });

      remainingAccounts.push({
        address: bufferGamePda,
        role: AccountRole.WRITABLE,
      });

      const [delegationRecordGamePda] = await getProgramDerivedAddress({
        programAddress: DELEGATION_PROGRAM_ID,
        seeds: ["delegation", getAddressEncoder().encode(playerPda)],
      });

      remainingAccounts.push({
        address: delegationRecordGamePda,
        role: AccountRole.WRITABLE,
      });

      const [delegationMetadataGamePda] = await getProgramDerivedAddress({
        programAddress: DELEGATION_PROGRAM_ID,
        seeds: ["delegation-metadata", getAddressEncoder().encode(playerPda)],
      });

      remainingAccounts.push({
        address: delegationMetadataGamePda,
        role: AccountRole.WRITABLE,
      });
    }

    ix.accounts.push(...remainingAccounts);

    return ix;
  }

  async resetGameIx(params: StartGameParams): Promise<Instruction> {
    const ix = getResetGameHandlerInstruction({
      game: params.gameAddress,
      authority: params.authority,
    });

    const remainingAccounts: WritableAccount[] = [];

    for (const player of params.players) {
      const [playerPda] = await getPlayerStatePDA(params.gameAddress, player);
      remainingAccounts.push({
        address: playerPda,
        role: AccountRole.WRITABLE,
      });
    }
    ix.accounts.push(...remainingAccounts);

    return ix;
  }

  async closeGameIx(params: StartGameParams): Promise<Instruction[]> {
    const ix1 = getUndelegateGameHandlerInstruction({
      game: params.gameAddress,
      authority: params.authority,
    });

    const remainingAccounts1: WritableAccount[] = [];

    for (const player of params.players) {
      const [playerPda] = await getPlayerStatePDA(params.gameAddress, player);
      remainingAccounts1.push({
        address: playerPda,
        role: AccountRole.WRITABLE,
      });
    }

    ix1.accounts.push(...remainingAccounts1);

    const ix2 = getCloseGameHandlerInstruction({
      game: params.gameAddress,
      authority: params.authority,
    });

    const remainingAccounts2: WritableAccount[] = [];

    for (const player of params.players) {
      const [playerPda] = await getPlayerStatePDA(params.gameAddress, player);
      remainingAccounts2.push({
        address: playerPda,
        role: AccountRole.WRITABLE,
      });
    }

    ix2.accounts.push(...remainingAccounts2);

    return [ix1, ix2];
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

  async rollDiceVrfIx(params: RollDiceParams): Promise<Instruction> {
    const [playerStatePda] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    const [programIdentityPda] = await getProgramIdentityPDA();

    return getRollDiceVrfHandlerInstruction({
      game: params.gameAddress,
      playerState: playerStatePda,
      player: params.player,
      oracleQueue: DEFAULT_EPHEMERAL_QUEUE,
      programIdentity: programIdentityPda,
      seed: Math.floor(Math.random() * 254) + 1,
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
    const [playerStatePda] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    return await getPayJailFineInstruction({
      game: params.gameAddress,
      player: params.player,
      playerState: playerStatePda,
    });
  }

  async useGetOutOfJailCardIx(
    params: UseGetOutOfJailCardParams
  ): Promise<Instruction> {
    const [playerStatePda] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    return await getUseGetOutOfJailCardInstruction({
      game: params.gameAddress,
      player: params.player,
      playerState: playerStatePda,
    });
  }

  /**
   * Buy a property at the specified position
   */
  async initPropertyIx(params: BuyPropertyParams): Promise<Instruction> {
    const [propertyStateAddress] = await getPropertyStatePDA(
      params.gameAddress,
      params.position
    );

    const [bufferGamePda] = await getProgramDerivedAddress({
      programAddress: PANDA_MONOPOLY_PROGRAM_ADDRESS,
      seeds: ["buffer", getAddressEncoder().encode(propertyStateAddress)],
    });

    const [delegationRecordGamePda] = await getProgramDerivedAddress({
      programAddress: DELEGATION_PROGRAM_ID,
      seeds: ["delegation", getAddressEncoder().encode(propertyStateAddress)],
    });

    const [delegationMetadataGamePda] = await getProgramDerivedAddress({
      programAddress: DELEGATION_PROGRAM_ID,
      seeds: [
        "delegation-metadata",
        getAddressEncoder().encode(propertyStateAddress),
      ],
    });

    return getInitPropertyHandlerInstruction({
      propertyState: propertyStateAddress,
      propertyBufferAccount: bufferGamePda,
      propertyDelegationRecordAccount: delegationRecordGamePda,
      propertyDelegationMetadataAccount: delegationMetadataGamePda,
      authority: params.player,
      ownerProgram: PANDA_MONOPOLY_PROGRAM_ADDRESS,
      delegationProgram: DELEGATION_PROGRAM_ID,
      gameKey: params.gameAddress,
      position: params.position,
    });
  }

  async buyPropertyIx(params: BuyPropertyParams): Promise<Instruction> {
    const [playerStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    const [propertyStateAddress] = await getPropertyStatePDA(
      params.gameAddress,
      params.position
    );

    return getBuyPropertyInstruction({
      game: params.gameAddress,
      player: params.player,
      playerState: playerStateAddress,
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
   * Attend festival (special space)
   */
  async attendFestivalIx(params: AttendFestivalParams): Promise<Instruction> {
    return await getAttendFestivalInstructionAsync({
      game: params.gameAddress,
      player: params.player,
    });
  }

  /**
   * Draw a Chance card
   */
  async drawChanceCardIx(params: DrawChanceCardParams): Promise<Instruction> {
    const [playerStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    return getDrawChanceCardInstruction({
      game: params.gameAddress,
      player: params.player,
      playerState: playerStateAddress,
      cardIndex: params.index ? some(params.index) : none(),
    });
  }

  async drawChanceCardVrfIx(
    params: DrawChanceCardVrfParams
  ): Promise<Instruction> {
    const [playerStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    const [programIdentityPda] = await getProgramIdentityPDA();

    return getDrawChanceCardVrfHandlerInstruction({
      game: params.gameAddress,
      player: params.player,
      playerState: playerStateAddress,
      oracleQueue: DEFAULT_EPHEMERAL_QUEUE,
      programIdentity: programIdentityPda,
      clientSeed: Math.floor(Math.random() * 254) + 1,
      cardIndex: params.index ? some(params.index) : none(),
    });
  }

  /**
   * Draw a Community Chest card
   */
  async drawCommunityChestCardIx(
    params: DrawCommunityChestCardParams
  ): Promise<Instruction> {
    const [playerStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    const [programIdentityPda] = await getProgramIdentityPDA();

    return await getDrawCommunityChestCardInstruction({
      game: params.gameAddress,
      player: params.player,
      playerState: playerStateAddress,
      cardIndex: params.index ? some(params.index) : none(),
      oracleQueue: DEFAULT_EPHEMERAL_QUEUE,
      programIdentity: programIdentityPda,
      clientSeed: Math.floor(Math.random() * 254) + 1,
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

  // trading

  async createTradeIx(params: CreateTradeParams): Promise<Instruction> {
    const [proposerStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.proposer.address
    );

    const [receiverStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.receiver
    );

    return getCreateTradeInstruction({
      game: params.gameAddress,
      proposerState: proposerStateAddress,
      receiverState: receiverStateAddress,
      proposer: params.proposer,
      receiver: params.receiver,
      tradeType: params.tradeType,
      proposerMoney: params.proposerMoney,
      receiverMoney: params.receiverMoney,
      proposerProperty: params.proposerProperty
        ? some(params.proposerProperty)
        : none(),
      receiverProperty: params.receiverProperty
        ? some(params.receiverProperty)
        : none(),
    });
  }

  async acceptTradeIx(params: AcceptTradeParams): Promise<Instruction> {
    const [accepterStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.accepter.address
    );

    const [proposerStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.proposer
    );

    return getAcceptTradeInstruction({
      game: params.gameAddress,
      proposerState: proposerStateAddress,
      accepterState: accepterStateAddress,
      accepter: params.accepter,
      tradeId: params.tradeId,
    });
  }

  async rejectTradeIx(params: RejectTradeParams): Promise<Instruction> {
    return getRejectTradeInstruction({
      game: params.gameAddress,
      rejecter: params.rejecter,
      tradeId: params.tradeId,
    });
  }

  async cancelTradeIx(params: CancelTradeParams): Promise<Instruction> {
    return getCancelTradeInstruction({
      game: params.gameAddress,
      canceller: params.canceller,
      tradeId: params.tradeId,
    });
  }

  async declareBankruptcyIx(
    params: DeclareBankruptcyParams
  ): Promise<Instruction> {
    const [playerStateAddress] = await getPlayerStatePDA(
      params.gameAddress,
      params.player.address
    );

    const ix = getDeclareBankruptcyInstruction({
      game: params.gameAddress,
      player: params.player,
      playerState: playerStateAddress,
    });

    const addresses = await Promise.all(
      params.propertiesOwned.map(async (position) =>
        getPropertyStatePDA(params.gameAddress, position)
      )
    );

    const remainingAccounts = addresses.map(
      ([address, _]) =>
        ({
          address,
          role: AccountRole.WRITABLE,
        } as WritableAccount)
    );

    ix.accounts.push(...remainingAccounts);

    return ix;
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

  async getGameAccounts(rpc: Rpc<SolanaRpcApi>): Promise<GameAccount[]> {
    const discriminator = getBase58Decoder().decode(GAME_STATE_DISCRIMINATOR);
    const discriminatorFilter: GetProgramAccountsMemcmpFilter = {
      memcmp: {
        offset: BigInt(0),
        // @ts-expect-error
        bytes: discriminator,
        encoding: "base58",
      },
    };

    const configFilter: GetProgramAccountsMemcmpFilter = {
      memcmp: {
        offset: BigInt(16),
        // @ts-expect-error
        bytes: getBase58Decoder().decode(
          getAddressEncoder().encode(PLATFORM_ID)
        ),
        encoding: "base58",
      },
    };

    const statusFilter: GetProgramAccountsMemcmpFilter = {
      memcmp: {
        offset: BigInt(348),
        // @ts-expect-error
        bytes: getBase58Decoder().decode(
          getGameStatusEncoder().encode(GameStatus.InProgress)
        ),
        encoding: "base58",
      },
    };

    const gameAccount = await fetchDecodedProgramAccounts(
      rpc,
      PANDA_MONOPOLY_PROGRAM_ADDRESS,
      [discriminatorFilter, configFilter],
      getGameStateDecoder()
    );

    return gameAccount.map((acc) =>
      mapGameStateToAccount(acc.data, acc.address)
    );
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

  /**
   * Get a specific trade by proposer
   */
  async getTradeAccount(
    rpc: Rpc<SolanaRpcApi>,
    gamePDA: Address,
    proposer: Address
  ): Promise<Account<any, string> | null> {
    try {
      const [tradeStateAddress] = await getTradeStatePDA(gamePDA, proposer);
      // @ts-expect-error
      return await fetchTradeState(rpc, tradeStateAddress);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all active trades for a game
   */
  async getActiveTradesForGame(
    rpc: Rpc<SolanaRpcApi>,
    gamePDA: Address
    // @ts-expect-error
  ): Promise<Account<TradeState, string>[]> {
    try {
      // Import trade discriminator and decoder if available
      // This is a placeholder - would need to implement similar to getGameAccounts
      // For now, we'll return empty array and implement later
      return [];
    } catch (error) {
      console.error("Error fetching trades:", error);
      return [];
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
    rpc: Rpc<SolanaRpcApi>,
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
    accAddress: Address,
    onAccountChange: (accountInfo: MaybeEncodedAccount<string> | null) => void
    // er: boolean = false
  ) {
    let ignoreFetch = false;

    fetchEncodedAccount(rpc, accAddress)
      .then((response) => {
        if (ignoreFetch) {
          return;
        }
        onAccountChange(response);
      })
      .catch((error) => {
        console.error("Error fetching account:", accAddress, error);
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
    rpc: Rpc<SolanaRpcApi>,
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
    gameAddress: Address,
    callback: (gameState: GameState | null) => void
  ) {
    let unsubscribed = false;
    let cleanup: (() => void) | null = null;

    if (unsubscribed) return;

    cleanup = await this.subscribeToAccountInfo(
      rpc,
      rpcSubscriptions,
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
      }
    );

    return () => {
      unsubscribed = true;
      if (cleanup) {
        cleanup();
      }
    };
  }

  public async subscribePlayerStateAccount(
    rpc: Rpc<SolanaRpcApi>,
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
    gameAddress: Address,
    player: Address,
    callback: (playerState: PlayerState | null) => void
  ) {
    const [playerStateAddress] = await getPlayerStatePDA(gameAddress, player);

    let unsubscribed = false;
    let cleanup: (() => void) | null = null;

    if (unsubscribed) return;

    cleanup = await this.subscribeToAccountInfo(
      rpc,
      rpcSubscriptions,
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
      }
    );

    return () => {
      unsubscribed = true;
      if (cleanup) {
        cleanup();
      }
    };
  }

  public async subscribeToEvents(
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
    onEvent: (event: GameEvent) => void
  ) {
    const abortController = new AbortController();

    const notifications = await rpcSubscriptions
      .logsNotifications(
        {
          mentions: [
            // address("4vucUqMcXN4sgLsgnrXTUC9U7ACZ5DmoRBLbWt4vrnyR")
            PANDA_MONOPOLY_PROGRAM_ADDRESS,
          ],
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

// function parseEvent<T>(
//   logs: readonly string[],
//   programIdStr: string,
//   discriminator: Uint8Array,
//   decoder: Decoder<T>
// ): T | undefined {
//   const stack: string[] = [];
//   for (const log of logs) {
//     // console.log("EEE log", log);
//     const trimmed = log.trim();

//     // if (trimmed.startsWith(`Program ${programIdStr} invoke`)) {
//     //   stack.push(programIdStr);
//     //   continue;
//     // }

//     // if (
//     //   trimmed.startsWith(`Program ${programIdStr} success`) ||
//     //   trimmed.startsWith(`Program ${programIdStr} failed`)
//     // ) {
//     //   stack.pop();
//     //   continue;
//     // }

//     // if (stack.length === 0 || stack[stack.length - 1] !== programIdStr) {
//     //   continue;
//     // }

//     console.log("EEE log trim", trimmed);

//     if (
//       trimmed.startsWith(PROGRAM_DATA)
//       // || trimmed.startsWith(PROGRAM_LOG)
//     ) {
//       const base64 = trimmed.startsWith(PROGRAM_DATA)
//         ? trimmed.slice(PROGRAM_DATA_START_INDEX)
//         : trimmed.slice(PROGRAM_LOG_START_INDEX);

//       console.log("EEE log base64", base64);

//       const buf = Buffer.from(base64, "base64");
//       console.log(
//         "EEE log buf",
//         buf,
//         buf.subarray(0, 8)
//         // buf.subarray(0, 8).equals(discriminator)
//       );
//       if (buf.length >= 8 && buf.subarray(0, 8).equals(discriminator)) {
//         return decoder.decode(buf.subarray(8));
//       }
//     }
//   }

//   return undefined;
// }

const sdk = new MonopolyGameSDK();
export { sdk };

export async function fetchDecodedProgramAccounts<T extends object>(
  rpc: Rpc<GetProgramAccountsApi>,
  programAddress: Address,
  filters: GetProgramAccountsMemcmpFilter[],
  decoder: VariableSizeDecoder<T>
): Promise<Account<T>[]> {
  const accountInfos = await rpc
    .getProgramAccounts(programAddress, {
      encoding: "base64",
      filters,
    })
    .send();
  const encoder = getBase64Encoder();
  const datas = accountInfos.map((x) => encoder.encode(x.account.data[0]));
  const decoded = datas.map((x) => decoder.decode(x));
  return decoded.map((data, i) => ({
    ...accountInfos[i]!.account,
    address: accountInfos[i]!.pubkey,
    programAddress: programAddress,
    data,
  }));
}
