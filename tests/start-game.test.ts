import { expect } from "chai";
import { setupTest, TestContext, getPlayerStatePDA } from "./utils/setup";
import { assertGameState } from "./utils/helpers";
import { TEST_CONSTANTS, GAME_STATUS } from "./utils/constants";
import { SystemProgram } from "@solana/web3.js";

describe("Start Game", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest(2);

    await ctx.program.methods
      .initializeGame()
      .accountsPartial({
        game: ctx.gameAccount,
        playerState: ctx.playerAccount,
        config: ctx.configAccount,
        authority: ctx.authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([ctx.authority])
      .rpc();

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
    console.log("game acc", ctx.gameAccount.toBase58());
    let tx = await ctx.program.methods
      .startGame()
      .accountsPartial({
        game: ctx.gameAccount,
        authority: ctx.authority.publicKey,
      })
      // .remainingAccounts(
      //   ctx.players.map((player) => ({
      //     pubkey: player.publicKey,
      //     isSigner: false,
      //     isWritable: false,
      //   }))
      // )
      .signers([ctx.authority])
      .transaction();

    tx.feePayer = ctx.provider.wallet.publicKey;
    tx.recentBlockhash = (
      await ctx.provider.connection.getLatestBlockhash()
    ).blockhash;
    tx = await ctx.providerER.wallet.signTransaction(tx);

    // console.dir(tx, { depth: null });

    const txHash = await ctx.provider.sendAndConfirm(tx, [ctx.authority], {
      skipPreflight: true,
      commitment: "confirmed",
    });

    console.log("Transaction signature:", txHash);

    await assertGameState(
      ctx,
      GAME_STATUS.IN_PROGRESS,
      TEST_CONSTANTS.MIN_PLAYERS + 1
    );

    const gameState = await ctx.program.account.gameState.fetch(
      ctx.gameAccount
    );
    expect(gameState.currentTurn).to.equal(0); // First player's turn
  });

  it.skip("should set correct turn start timestamp", async () => {
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
