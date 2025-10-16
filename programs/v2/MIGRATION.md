# Migration Guide: Anchor to Pinocchio

This document outlines the migration from the Anchor-based implementation to Pinocchio.

## Overview

The Pinocchio implementation maintains byte-level compatibility with the Anchor version where possible, allowing for:
- Same PDA addresses
- Compatible account discriminators
- Identical error codes
- Same instruction signatures

## Key Architectural Changes

### 1. No Macro Magic

**Anchor:**
```rust
#[derive(Accounts)]
pub struct BuyProperty<'info> {
    #[account(mut)]
    pub game: Account<'info, GameState>,
    #[account(mut)]
    pub player: Account<'info, PlayerState>,
    pub player_authority: Signer<'info>,
}
```

**Pinocchio:**
```rust
// Manual account parsing in processor
let game_account = &accounts[0];
let player_account = &accounts[1];
let player_authority = &accounts[2];

// Manual validation
check_signer(player_authority, GameError::Unauthorized.into())?;
check_owner(game_account, program_id, GameError::InvalidAccount.into())?;
```

### 2. Manual Serialization

**Anchor:**
```rust
#[account]
#[derive(InitSpace)]
pub struct GameState {
    pub game_id: u64,
    #[max_len(4)]
    pub players: Vec<Pubkey>,
}
```

**Pinocchio:**
```rust
#[repr(C)]
pub struct GameState {
    pub discriminator: [u8; 8],
    pub game_id: u64,
    pub players: [[u8; 32]; 4],  // Fixed-size array
    pub players_count: u8,
}
```

### 3. Option Types

**Anchor:**
```rust
pub winner: Option<Pubkey>,
```

**Pinocchio:**
```rust
pub winner_flag: u8,         // 0 = None, 1 = Some
pub winner: [u8; 32],        // Pubkey bytes
```

### 4. Error Handling

**Anchor:**
```rust
#[error_code]
pub enum GameError {
    #[msg("Insufficient funds")]
    InsufficientFunds,
}

return Err(error!(GameError::InsufficientFunds));
```

**Pinocchio:**
```rust
#[repr(u32)]
pub enum GameError {
    InsufficientFunds = 6019,
}

return Err(GameError::InsufficientFunds.into());
```

## Account Layout Compatibility

### Discriminators

All account discriminators are preserved from Anchor:

```rust
// Calculated as sha256("account:<AccountName>")[..8]
PLATFORM_CONFIG_DISCRIMINATOR = [155, 234, 147, 216, 16, 213, 139, 133]
GAME_STATE_DISCRIMINATOR      = [26, 222, 181, 182, 107, 235, 135, 212]
PLAYER_STATE_DISCRIMINATOR    = [218, 190, 172, 174, 199, 101, 213, 169]
TRADE_STATE_DISCRIMINATOR     = [187, 124, 210, 158, 155, 112, 123, 191]
AUCTION_STATE_DISCRIMINATOR   = [18, 203, 187, 155, 109, 220, 124, 216]
```

### Memory Layout

The Pinocchio implementation uses explicit padding to match Rust's memory layout:

```rust
#[repr(C)]
pub struct ExampleAccount {
    pub discriminator: [u8; 8],    // Always first, 8 bytes
    pub field1: u64,                // 8 bytes
    pub field2: u8,                 // 1 byte
    pub _padding: [u8; 7],          // 7 bytes padding for alignment
    pub field3: u64,                // 8 bytes (now aligned)
}
```

### Vector Handling

Anchor's `Vec<T>` becomes fixed-size arrays:

**Anchor:**
```rust
#[max_len(4)]
pub players: Vec<Pubkey>,
```

**Pinocchio:**
```rust
pub players: [[u8; 32]; 4],    // Max 4 players
pub players_count: u8,          // Actual count
```

## Instruction Compatibility

### Instruction Discriminators

Instruction discriminators in Anchor are calculated as:
```
sha256("global:<instruction_name>")[..8]
```

For Pinocchio, we use simple u8 tags (0-38) for efficiency. This means **clients must be updated** to send the new instruction format.

### Instruction Data Layout

**Anchor (with discriminator):**
```
[discriminator: 8 bytes][instruction_data: N bytes]
```

**Pinocchio:**
```
[tag: 1 byte][instruction_data: N bytes]
```

Example for `BuyPropertyV2`:
```rust
// Anchor client sends:
// [disc_0, disc_1, ..., disc_7, position]

// Pinocchio client sends:
// [20, position]  // 20 = BuyPropertyV2 tag
```

## PDA Compatibility

All PDA seeds remain identical:

```rust
// Platform Config
["platform", platform_id]

// Game State
["game", config_id, game_id_bytes]

// Player State  
["player", game, wallet]

// Trade State
["trade", game, proposer, receiver, trade_id_byte]

// Auction State
["auction", game, property_position_byte]

// Game Authority
["game_authority", game]

// Token Vault
["token_vault", game]
```

This ensures that PDAs resolve to the same addresses in both implementations.

## Error Code Compatibility

All error codes are preserved (6000-6132). This means:
- Error messages in transactions remain consistent
- Client error handling doesn't need updates
- Monitoring/logging continues to work

## Missing Features / TODOs

### 1. VRF Integration

The Anchor version uses `ephemeral-vrf-sdk`. For Pinocchio:

```rust
// TODO: Implement VRF callback handling
fn process_callback_roll_dice(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    // Need to:
    // 1. Verify VRF program called us
    // 2. Extract randomness from data
    // 3. Use randomness for dice roll
    // 4. Update player position
    Err(GameError::FeatureNotImplemented.into())
}
```

### 2. Ephemeral Rollups

The Anchor version uses `ephemeral-rollups-sdk`. For Pinocchio:

```rust
// TODO: Implement delegation mechanics
// The Anchor version has #[ephemeral] macro
// Need to manually handle delegation account checks
```

### 3. Token Operations

SPL Token CPIs need manual instruction building:

```rust
// TODO: Build token transfer instruction manually
pub fn transfer_tokens(
    from: &AccountInfo,
    to: &AccountInfo,
    authority: &AccountInfo,
    token_program: &AccountInfo,
    amount: u64,
) -> ProgramResult {
    // Build instruction data: [1, amount_bytes...]
    // Build account metas
    // Call invoke_signed()
    Err(GameError::FeatureNotImplemented.into())
}
```

### 4. Event Emission

Anchor's `emit!` macro needs replacement:

```rust
// Anchor
emit!(PropertyPurchased {
    game: game.key(),
    player: player.key(),
    position,
});

// Pinocchio - use msg! or custom logging
msg!("PropertyPurchased: game={}, player={}, position={}",
     game.key(), player.key(), position);

// Or implement custom event serialization
```

## Client Migration

### TypeScript/JavaScript Clients

Clients need updates for instruction building:

```typescript
// OLD (Anchor)
const ix = await program.methods
    .buyPropertyV2(position)
    .accounts({
        game: gameAccount,
        player: playerAccount,
        playerAuthority: wallet.publicKey,
    })
    .instruction();

// NEW (Pinocchio)
const data = Buffer.from([
    20,        // BuyPropertyV2 tag
    position   // position parameter
]);

const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
        { pubkey: gameAccount, isSigner: false, isWritable: true },
        { pubkey: playerAccount, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
    ],
    data,
});
```

### Account Deserialization

Account parsing also changes:

```typescript
// OLD (Anchor)
const game = await program.account.gameState.fetch(gameAccount);

// NEW (Pinocchio)
const accountInfo = await connection.getAccountInfo(gameAccount);
const game = deserializeGameState(accountInfo.data);

function deserializeGameState(data: Buffer): GameState {
    // Manual deserialization based on layout
    // Use borsh or custom deserializer
}
```

## Testing Strategy

### 1. Unit Tests

Test individual functions:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_property_data() {
        let prop = get_property_data(1).unwrap();
        assert_eq!(prop.price, 60);
        assert_eq!(prop.color_group, ColorGroup::Brown);
    }
}
```

### 2. Integration Tests

Port from `tests/` directory:

```typescript
// Use solana-bankrun or local validator
// Send transactions to Pinocchio program
// Verify state changes match expected
```

### 3. Compatibility Tests

Verify layout compatibility:

```rust
#[test]
fn test_account_size_compatibility() {
    // Ensure sizes match Anchor version
    assert_eq!(
        core::mem::size_of::<GameState>(),
        EXPECTED_GAME_STATE_SIZE
    );
}
```

## Deployment Strategy

### Option 1: New Program ID

Deploy as separate program:
- Zero risk to existing games
- Requires client updates
- Can run both versions in parallel

### Option 2: Upgrade Existing

If program has upgrade authority:
- Maintains existing program ID
- **High risk** - thorough testing required
- All clients must update simultaneously

### Option 3: Gradual Migration

1. Deploy new program ID
2. Add "migration" instruction to copy state
3. Clients gradually switch
4. Eventually deprecate old program

## Performance Considerations

### Compute Units

Pinocchio should use fewer CUs due to:
- No Anchor overhead
- Manual account parsing (only parse what's needed)
- No unnecessary serialization/deserialization

### Binary Size

Expected to be significantly smaller:
- No Anchor dependencies
- No large dependency tree
- Just pinocchio (~20KB compiled)

## Security Considerations

### 1. Manual Validation

Without Anchor's automatic checks, must manually verify:
- Account ownership
- Signer requirements  
- PDA derivation
- Account data sizes

### 2. Integer Overflow

Rust's default overflow checks help, but be explicit:

```rust
let new_balance = player.cash_balance
    .checked_sub(cost)
    .ok_or(GameError::ArithmeticUnderflow)?;
```

### 3. Reentrancy

Same considerations as Anchor - avoid:
- Multiple mutable borrows
- Calling back into own program
- Modifying state after CPI

## Rollback Plan

If issues discovered post-deployment:

1. **Program Upgrade**: If possible, revert to Anchor version
2. **Feature Flag**: Disable problematic instructions
3. **Emergency Shutdown**: Admin instruction to pause game creation
4. **State Migration**: Tool to export state from Pinocchio to Anchor

## Checklist for Production

- [ ] All instruction handlers implemented
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Compatibility tests passing
- [ ] VRF integration working
- [ ] Token operations working
- [ ] Deployed to devnet and tested
- [ ] Client libraries updated
- [ ] Documentation updated
- [ ] Audit completed (if required)
- [ ] Rollback plan tested
- [ ] Monitoring in place

## Conclusion

The migration from Anchor to Pinocchio requires:
- **Minimal changes** to account layouts (mostly compatible)
- **Moderate changes** to instruction handling (manual validation)
- **Significant changes** to client code (new instruction format)

Benefits include:
- ✅ Zero dependencies (except pinocchio)
- ✅ Smaller binary size
- ✅ Lower compute unit costs  
- ✅ More control over program logic
- ✅ Faster compilation times

Trade-offs:
- ⚠️ More manual code (no macros)
- ⚠️ More opportunities for bugs (less automatic validation)
- ⚠️ Longer initial development time
- ⚠️ Client updates required
