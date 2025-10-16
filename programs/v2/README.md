# Panda Monopoly V2 - Pinocchio Implementation

This is a reimplementation of the Panda Monopoly Solana program using the Pinocchio framework (zero-dependency Rust) instead of Anchor.

## Project Status

**🚧 IN PROGRESS - SKELETON IMPLEMENTATION 🚧**

This is an initial skeleton/framework that provides:
- ✅ Basic project structure
- ✅ Error codes matching Anchor version (6000+)
- ✅ State structures with compatible layouts
- ✅ Instruction enum and data structures
- ✅ Processor dispatch framework
- ✅ Constants (all property data, game rules)
- ✅ Utility functions for common operations
- ✅ Proper entrypoint setup

**⚠️ Individual instruction handlers are NOT yet implemented - they return FeatureNotImplemented error.**

## Architecture

### Structure

```
v2/
├── src/
│   ├── lib.rs                 # Main library entry point
│   ├── entrypoint.rs          # Program entrypoint (pinocchio macros)
│   ├── processor.rs           # Instruction dispatch and handlers
│   ├── instruction.rs         # Instruction enum and data structures
│   ├── state.rs               # Account state structures
│   ├── error.rs               # Error codes (compatible with Anchor)
│   ├── constants.rs           # Game constants and property data
│   └── utils.rs               # Helper functions
├── Cargo.toml
└── README.md (this file)
```

### Key Differences from Anchor Version

1. **No Dependencies**: Only `pinocchio` and `bytemuck` (for alignment)
2. **Manual Account Parsing**: No `#[derive(Accounts)]` macro - must manually validate
3. **Manual Serialization**: State structs use `#[repr(C)]` for C-compatible layout
4. **Fixed-Size Layouts**: All variable-length data uses fixed-size arrays
5. **Option Types**: Represented as `(flag: u8, data: [u8; N])` pairs
6. **Error Codes**: Simple enum with `u32` repr, compatible with Anchor error codes (6000+)

## Account Layouts

### PlatformConfig (LEN ≈ 123 bytes)
- Discriminator: `[155, 234, 147, 216, 16, 213, 139, 133]`
- Compatible with Anchor `PlatformConfig`

### GameState (LEN ≈ 8192 bytes)
- Discriminator: `[26, 222, 181, 182, 107, 235, 135, 212]`
- Fixed arrays: 4 players, 40 properties, 20 trades
- Compatible with Anchor `GameState`

### PlayerState (LEN ≈ 512 bytes)
- Discriminator: `[218, 190, 172, 174, 199, 101, 213, 169]`
- Fixed array: 40 property slots
- Compatible with Anchor `PlayerState`

### TradeState (LEN ≈ 256 bytes)
- Discriminator: `[187, 124, 210, 158, 155, 112, 123, 191]`
- Compatible with Anchor `TradeState`

### AuctionState (LEN ≈ 256 bytes)
- Discriminator: `[18, 203, 187, 155, 109, 220, 124, 216]`
- Compatible with Anchor `AuctionState`

## Instructions

All 39 instructions from the Anchor version are defined:

### Platform (0-1)
- `CreatePlatformConfig` (0)
- `UpdatePlatformConfig` (1)

### Game Management (2-7)
- `InitializeGame` (2)
- `JoinGame` (3)
- `LeaveGame` (4)
- `StartGame` (5)
- `CancelGame` (6)
- `EndGame` (7)

### Dice & Movement (8-12)
- `RollDice` (8)
- `CallbackRollDice` (9)
- `EndTurn` (10)
- `CallbackDrawChanceCard` (11)
- `CallbackDrawCommunityChestCard` (12)

### Jail (13-14)
- `PayJailFine` (13)
- `UseGetOutOfJailCard` (14)

### Bankruptcy (15)
- `DeclareBankruptcy` (15)

### Taxes (16-17)
- `PayMevTax` (16)
- `PayPriorityFeeTax` (17)

### Cards (18-19)
- `DrawChanceCard` (18)
- `DrawCommunityChestCard` (19)

### Properties (20-27)
- `BuyPropertyV2` (20)
- `DeclinePropertyV2` (21)
- `PayRentV2` (22)
- `BuildHouseV2` (23)
- `BuildHotelV2` (24)
- `SellBuildingV2` (25)
- `MortgagePropertyV2` (26)
- `UnmortgagePropertyV2` (27)

### Trading (28-32)
- `CreateTrade` (28)
- `AcceptTrade` (29)
- `RejectTrade` (30)
- `CancelTrade` (31)
- `CleanupExpiredTrades` (32)

### Rewards (33)
- `ClaimReward` (33)

### Permissionless (34-35)
- `ForceEndTurn` (34)
- `ForceBankruptcyForTimeout` (35)

### Test (36-38)
- `ResetGame` (36)
- `UndelegateGame` (37)
- `CloseGame` (38)

## Error Codes

All error codes match the Anchor version (6000-6132):

- Game State Errors: 6000-6012
- Player Errors: 6013-6023
- Property Errors: 6024-6040
- Movement/Dice Errors: 6041-6044
- Trade Errors: 6045-6053
- Auction Errors: 6054-6060
- Rent Errors: 6061-6064
- Jail Errors: 6065-6068
- Special Space Errors: 6069-6071
- Tax Errors: 6072-6073
- Bankruptcy Errors: 6074-6077
- Account/Authorization Errors: 6078-6082
- Math Errors: 6083-6087
- Randomness Errors: 6088-6090
- Time Errors: 6091-6093
- General Errors: 6094-6111
- Token/Fee Errors: 6112-6124
- Timeout Errors: 6125-6132

## Building

This program is designed to be built with the Solana BPF toolchain. Since it's a no_std crate:

```bash
# Install Solana CLI tools if not already installed
# Then build the program:
cargo build-sbf --features bpf-entrypoint

# Or from workspace root:
cd programs/v2
cargo build-sbf --features bpf-entrypoint
```

Note: Regular `cargo check` or `cargo build` will fail because this is a no_std program that requires the SBF target.

## Testing

The program currently returns `FeatureNotImplemented` (error 6095) for all instructions. Once handlers are implemented, tests should be ported from the Anchor version.

## PDA Seeds

All PDA seeds match the Anchor version:

- Platform Config: `["platform", platform_id]`
- Game State: `["game", config_id, game_id (as bytes)]`
- Player State: `["player", game, wallet]`
- Trade State: `["trade", game, proposer, receiver, trade_id]`
- Auction State: `["auction", game, property_position]`
- Game Authority: `["game_authority", game]`
- Token Vault: `["token_vault", game]`

## Next Steps

To complete the implementation, each instruction handler in `processor.rs` needs to be implemented:

1. **Account Validation**: Parse accounts from `&[AccountInfo]` and validate PDAs
2. **Instruction Data Parsing**: Extract instruction-specific data
3. **Business Logic**: Port from Anchor handlers (in `programs/panda-monopoly/src/instructions/`)
4. **State Updates**: Update account data directly (manual serialization)
5. **CPI Calls**: Implement cross-program invocations (e.g., for token transfers, VRF callbacks)
6. **Event Emission**: Implement event logging (if needed)

### Example Implementation Pattern

```rust
fn process_buy_property_v2(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    // 1. Parse instruction data
    let position = data[0];
    
    // 2. Get accounts
    let game_account = &accounts[0];
    let player_account = &accounts[1];
    let player_signer = &accounts[2];
    
    // 3. Validate accounts
    check_signer(player_signer, GameError::Unauthorized.into())?;
    check_owner(game_account, program_id, GameError::InvalidAccount.into())?;
    
    // 4. Load state
    let game = read_account_data_mut::<GameState>(game_account)?;
    let player = read_account_data_mut::<PlayerState>(player_account)?;
    
    // 5. Validate business logic
    let property_data = get_property_data(position)?;
    if player.cash_balance < property_data.price {
        return Err(GameError::InsufficientFunds.into());
    }
    
    // 6. Update state
    player.cash_balance -= property_data.price;
    game.properties[position as usize].set_owner(Some(&player.wallet));
    
    Ok(())
}
```

## Compatibility Notes

### Serialization
- All state structs use `#[repr(C)]` for deterministic memory layout
- Option types stored as `(flag, data)` pairs to avoid Rust's niche optimization
- Arrays are fixed-size (no Vec or dynamic allocations)

### VRF and Ephemeral Rollups
- The Anchor version uses `ephemeral-rollups-sdk` and `ephemeral-vrf-sdk`
- These will need to be ported or replaced with compatible Pinocchio implementations
- For now, VRF instructions are marked as TODO

### Token Operations
- Token transfers via CPI need manual instruction building
- SPL Token program interactions require proper account metas and instruction data

## Migration Path

For existing on-chain games:

1. **Same Program ID**: Can deploy to a new address or upgrade existing (if upgrade authority permits)
2. **Account Compatibility**: Layouts are designed to be compatible, but thorough testing required
3. **Client Updates**: Clients would need to update instruction building logic
4. **Gradual Migration**: Could run both versions side-by-side during transition

## Resources

- [Pinocchio Documentation](https://github.com/anza-xyz/pinocchio)
- [Original Anchor Implementation](../panda-monopoly/)
- [Solana Program Library](https://github.com/solana-labs/solana-program-library)

## License

Same as parent project
