import { expect } from "chai";
import { setupTest, TestContext, getPlayerStatePDA } from "./utils/setup";
import { assertGameState } from "./utils/helpers";
import { TEST_CONSTANTS, GAME_STATUS } from "./utils/constants";
import {
  SystemProgram,
  SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
} from "@solana/web3.js";

describe("Roll Dice", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest(2);

    // Initialize and start game
    await ctx.program.methods
      .initializeGame()
      .accountsPartial({
        game: ctx.gameAccount,
        authority: ctx.authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([ctx.authority])
      .rpc();

    // Add players
    for (let i = 0; i < 2; i++) {
      const [playerStateAccount] = getPlayerStatePDA(
        ctx.program,
        ctx.gameAccount,
        ctx.players[i].publicKey
      );

      await ctx.program.methods
        .joinGame()
        .accountsPartial({
          game: ctx.gameAccount,
          playerState: playerStateAccount,
          player: ctx.players[i].publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([ctx.players[i]])
        .rpc();
    }

    // Start game
    await ctx.program.methods
      .startGame()
      .accountsPartial({
        game: ctx.gameAccount,
        authority: ctx.authority.publicKey,
      })
      .signers([ctx.authority])
      .rpc();
  });

  it("should allow current player to roll dice", async () => {
    const [playerStateAccount] = getPlayerStatePDA(
      ctx.program,
      ctx.gameAccount,
      ctx.players[0].publicKey
    );

    await ctx.program.methods
      .rollDice()
      .accountsPartial({
        game: ctx.gameAccount,
        playerState: playerStateAccount,
        player: ctx.players[0].publicKey,
        recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
      })
      .signers([ctx.players[0]])
      .rpc();

    // Verify game is still in progress
    await assertGameState(ctx, GAME_STATUS.IN_PROGRESS, 2);

    // Check that turn timestamp was updated
    const gameState = await ctx.program.account.gameState.fetch(
      ctx.gameAccount
    );
    expect(gameState.turnStartedAt.toNumber()).to.be.greaterThan(0);
  });

  it("should handle dice roll for non-jailed player", async () => {
    const [playerStateAccount] = getPlayerStatePDA(
      ctx.program,
      ctx.gameAccount,
      ctx.players[0].publicKey
    );

    // Verify player is not in jail initially
    const playerStateBefore = await ctx.program.account.playerState.fetch(
      playerStateAccount
    );
    expect(playerStateBefore.inJail).to.be.false;
    expect(playerStateBefore.doublesCount).to.equal(0);

    await ctx.program.methods
      .rollDice()
      .accountsPartial({
        game: ctx.gameAccount,
        playerState: playerStateAccount,
        player: ctx.players[0].publicKey,
        recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
      })
      .signers([ctx.players[0]])
      .rpc();

    // Verify player state after roll
    const playerStateAfter = await ctx.program.account.playerState.fetch(
      playerStateAccount
    );
    expect(playerStateAfter.inJail).to.be.false;
  });
});
