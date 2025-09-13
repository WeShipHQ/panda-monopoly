import { expect } from "chai";
import { setupTest, TestContext, getPlayerStatePDA } from "./utils/setup";
import { assertGameState } from "./utils/helpers";
import { TEST_CONSTANTS, GAME_STATUS } from "./utils/constants";
import { SystemProgram } from "@solana/web3.js";

describe("Start Game", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest(2);

    // Initialize game
    await ctx.program.methods
      .initializeGame()
      .accountsPartial({
        game: ctx.gameAccount,
        authority: ctx.authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([ctx.authority])
      .rpc();

    // Add minimum players
    for (let i = 0; i < TEST_CONSTANTS.MIN_PLAYERS; i++) {
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
  });

  it("should successfully start game with minimum players", async () => {
    await ctx.program.methods
      .startGame()
      .accountsPartial({
        game: ctx.gameAccount,
        authority: ctx.authority.publicKey,
      })
      .signers([ctx.authority])
      .rpc();

    // Verify game status changed to InProgress
    await assertGameState(
      ctx,
      GAME_STATUS.IN_PROGRESS,
      TEST_CONSTANTS.MIN_PLAYERS
    );

    const gameState = await ctx.program.account.gameState.fetch(
      ctx.gameAccount
    );
    expect(gameState.currentTurn).to.equal(0); // First player's turn
  });

  it("should set correct turn start timestamp", async () => {
    const beforeTime = Math.floor(Date.now() / 1000);

    await ctx.program.methods
      .startGame()
      .accountsPartial({
        game: ctx.gameAccount,
        authority: ctx.authority.publicKey,
      })
      .signers([ctx.authority])
      .rpc();

    const afterTime = Math.floor(Date.now() / 1000);
    const gameState = await ctx.program.account.gameState.fetch(
      ctx.gameAccount
    );

    expect(gameState.turnStartedAt.toNumber()).to.be.at.least(beforeTime - 5);
    expect(gameState.turnStartedAt.toNumber()).to.be.at.most(afterTime + 5);
  });
});
