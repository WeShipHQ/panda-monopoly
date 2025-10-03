use crate::constants::*;
use crate::error::GameError;
use crate::state::*;
use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::cpi::DelegateConfig;

// #[derive(Accounts)]
// #[instruction(game_key: Pubkey, position: u8)]
// pub struct InitTrade<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.config_id.as_ref(), &game.game_id.to_le_bytes().as_ref()],
//         bump = game.bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     // #[account(
//     //     init,
//     //     payer = authority,
//     //     space = 8 + PropertyState::INIT_SPACE,
//     //     seeds = [b"property", game_key.as_ref(), position.to_le_bytes().as_ref()],
//     //     bump
//     // )]
//     // pub property_state: Account<'info, PropertyState>,
//     #[account(
//         init,
//         payer = proposer,
//         space = 8 + TradeState::INIT_SPACE,
//         seeds = [b"trade", game.key().as_ref(), proposer.key().as_ref()],
//         bump
//     )]
//     pub trade: Account<'info, TradeState>,

//     /// CHECK: Validate by CPI
//     #[account(mut)]
//     pub trade_buffer_account: UncheckedAccount<'info>,

//     /// CHECK: Validate by CPI
//     #[account(mut)]
//     pub trade_delegation_record_account: UncheckedAccount<'info>,

//     /// CHECK: Validate by CPI
//     #[account(mut)]
//     pub trade_delegation_metadata_account: UncheckedAccount<'info>,

//     #[account(mut)]
//     pub proposer: Signer<'info>,

//     pub system_program: Program<'info, System>,

//     /// CHECK: Validate by CPI
//     pub delegation_program: UncheckedAccount<'info>,

//     /// CHECK: Validate by CPI
//     pub owner_program: UncheckedAccount<'info>,
// }

// pub fn init_trade_handler(ctx: Context<InitTrade>, game_key: Pubkey, position: u8) -> Result<()> {
//     msg!("Init trade {} for game {}", position, game_key);
//     msg!("property: {}", ctx.accounts.property_state.key());

//     {
//         let property = &mut ctx.accounts.property_state;
//         property.position = position;
//         property.game = game_key;
//         property.init = false;
//     }

//     {
//         let property = &ctx.accounts.property_state;
//         property.exit(&crate::ID)?;

//         let del_accounts = ephemeral_rollups_sdk::cpi::DelegateAccounts {
//             payer: &ctx.accounts.authority.to_account_info(),
//             pda: &property.to_account_info(),
//             owner_program: &ctx.accounts.owner_program.to_account_info(),
//             buffer: &ctx.accounts.property_buffer_account.to_account_info(),
//             delegation_record: &ctx
//                 .accounts
//                 .property_delegation_record_account
//                 .to_account_info(),
//             delegation_metadata: &ctx
//                 .accounts
//                 .property_delegation_metadata_account
//                 .to_account_info(),
//             delegation_program: &ctx.accounts.delegation_program.to_account_info(),
//             system_program: &ctx.accounts.system_program.to_account_info(),
//         };

//         let pos_seed = property.position.to_le_bytes();
//         let seeds = &[b"property", property.game.as_ref(), pos_seed.as_ref()];

//         msg!("seeds: {:?}", seeds);

//         let config = DelegateConfig {
//             commit_frequency_ms: 30_000,
//             validator: Some(pubkey!("MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57")),
//         };

//         ephemeral_rollups_sdk::cpi::delegate_account(del_accounts, seeds, config)?;

//         msg!("Property {} delegated");
//     }

//     Ok(())
// }

#[derive(Accounts)]
pub struct CreateTrade<'info> {
    #[account(
        mut,
        seeds = [b"game", game.config_id.as_ref(), &game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
    )]
    pub game: Account<'info, GameState>,

    #[account(
        init,
        payer = proposer,
        space = 8 + TradeState::INIT_SPACE,
        seeds = [b"trade", game.key().as_ref(), proposer.key().as_ref()],
        bump
    )]
    pub trade: Account<'info, TradeState>,

    #[account(
        mut,
        seeds = [b"player", game.key().as_ref(), proposer.key().as_ref()],
        bump
    )]
    pub proposer_state: Account<'info, PlayerState>,

    #[account(
        seeds = [b"player", game.key().as_ref(), receiver.key().as_ref()],
        bump
    )]
    pub receiver_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub proposer: Signer<'info>,

    /// CHECK: This is validated by the receiver_state account constraint
    pub receiver: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn create_trade_handler(
    ctx: Context<CreateTrade>,
    trade_type: TradeType,
    proposer_money: u64,
    receiver_money: u64,
    proposer_property: Option<u8>,
    receiver_property: Option<u8>,
) -> Result<()> {
    let game = &ctx.accounts.game;
    let trade = &mut ctx.accounts.trade;
    let proposer_state = &ctx.accounts.proposer_state;
    let receiver_state = &ctx.accounts.receiver_state;
    let proposer_pubkey = ctx.accounts.proposer.key();
    let receiver_pubkey = ctx.accounts.receiver.key();
    let clock = &ctx.accounts.clock;

    // Validate players are different
    if proposer_pubkey == receiver_pubkey {
        return Err(GameError::CannotTradeWithSelf.into());
    }

    // Validate trade type matches the provided data
    match trade_type {
        TradeType::MoneyOnly => {
            if proposer_property.is_some() || receiver_property.is_some() {
                return Err(GameError::InvalidTradeType.into());
            }
            if proposer_money == 0 && receiver_money == 0 {
                return Err(GameError::InvalidTradeProposal.into());
            }
        }
        TradeType::PropertyOnly => {
            if proposer_money > 0 || receiver_money > 0 {
                return Err(GameError::InvalidTradeType.into());
            }
            if proposer_property.is_none() && receiver_property.is_none() {
                return Err(GameError::InvalidTradeProposal.into());
            }
        }
        TradeType::MoneyForProperty => {
            if proposer_money == 0 || receiver_property.is_none() {
                return Err(GameError::InvalidTradeType.into());
            }
            if proposer_property.is_some() || receiver_money > 0 {
                return Err(GameError::InvalidTradeType.into());
            }
        }
        TradeType::PropertyForMoney => {
            if proposer_property.is_none() || receiver_money == 0 {
                return Err(GameError::InvalidTradeType.into());
            }
            if proposer_money > 0 || receiver_property.is_some() {
                return Err(GameError::InvalidTradeType.into());
            }
        }
    }

    // Validate proposer has sufficient money
    if proposer_money > proposer_state.cash_balance {
        return Err(GameError::InsufficientFunds.into());
    }

    // Validate receiver has sufficient money
    if receiver_money > receiver_state.cash_balance {
        return Err(GameError::InsufficientFunds.into());
    }

    // Validate property ownership
    if let Some(prop_pos) = proposer_property {
        if !proposer_state.properties_owned.contains(&prop_pos) {
            return Err(GameError::PropertyNotOwnedByPlayer.into());
        }
    }

    if let Some(prop_pos) = receiver_property {
        if !receiver_state.properties_owned.contains(&prop_pos) {
            return Err(GameError::PropertyNotOwnedByPlayer.into());
        }
    }

    // Initialize trade
    trade.game = game.key();
    trade.proposer = proposer_pubkey;
    trade.receiver = receiver_pubkey;
    trade.trade_type = trade_type;
    trade.proposer_money = proposer_money;
    trade.receiver_money = receiver_money;
    trade.proposer_property = proposer_property;
    trade.receiver_property = receiver_property;
    trade.status = TradeStatus::Pending;
    trade.created_at = clock.unix_timestamp;
    trade.expires_at = clock.unix_timestamp + TRADE_EXPIRY_SECONDS;
    trade.bump = ctx.bumps.trade;

    msg!(
        "Trade created by {} for player {}",
        proposer_pubkey,
        receiver_pubkey
    );
    msg!("Trade type: {:?}", trade.trade_type);

    Ok(())
}

#[derive(Accounts)]
pub struct AcceptTrade<'info> {
    #[account(
        mut,
        // seeds = [b"game", game.authority.as_ref(), &game.game_id.to_le_bytes()],
        seeds = [b"game", game.config_id.as_ref(), &game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
    )]
    pub game: Account<'info, GameState>,

    #[account(
        mut,
        seeds = [b"trade", game.key().as_ref(), trade.proposer.as_ref()],
        bump = trade.bump,
        constraint = trade.status == TradeStatus::Pending @ GameError::TradeNotPending,
        constraint = trade.receiver == accepter.key() @ GameError::NotTradeTarget,
        close = accepter
    )]
    pub trade: Account<'info, TradeState>,

    #[account(
        mut,
        seeds = [b"player", game.key().as_ref(), trade.proposer.as_ref()],
        bump
    )]
    pub proposer_state: Account<'info, PlayerState>,

    #[account(
        mut,
        seeds = [b"player", game.key().as_ref(), accepter.key().as_ref()],
        bump
    )]
    pub accepter_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub accepter: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn accept_trade_handler(ctx: Context<AcceptTrade>) -> Result<()> {
    let trade = &mut ctx.accounts.trade;
    let proposer_state = &mut ctx.accounts.proposer_state;
    let accepter_state = &mut ctx.accounts.accepter_state;
    let clock = &ctx.accounts.clock;

    // Check if trade has expired
    if clock.unix_timestamp > trade.expires_at {
        return Err(GameError::TradeExpired.into());
    }

    // Validate both players still have sufficient funds and properties
    if trade.proposer_money > proposer_state.cash_balance {
        return Err(GameError::InsufficientFunds.into());
    }

    if trade.receiver_money > accepter_state.cash_balance {
        return Err(GameError::InsufficientFunds.into());
    }

    if let Some(prop_pos) = trade.proposer_property {
        if !proposer_state.properties_owned.contains(&prop_pos) {
            return Err(GameError::PropertyNotOwnedByPlayer.into());
        }
    }

    if let Some(prop_pos) = trade.receiver_property {
        if !accepter_state.properties_owned.contains(&prop_pos) {
            return Err(GameError::PropertyNotOwnedByPlayer.into());
        }
    }

    // Execute money transfers
    if trade.proposer_money > 0 {
        proposer_state.cash_balance = proposer_state
            .cash_balance
            .checked_sub(trade.proposer_money)
            .ok_or(GameError::ArithmeticUnderflow)?;
        accepter_state.cash_balance = accepter_state
            .cash_balance
            .checked_add(trade.proposer_money)
            .ok_or(GameError::ArithmeticOverflow)?;
    }

    if trade.receiver_money > 0 {
        accepter_state.cash_balance = accepter_state
            .cash_balance
            .checked_sub(trade.receiver_money)
            .ok_or(GameError::ArithmeticUnderflow)?;
        proposer_state.cash_balance = proposer_state
            .cash_balance
            .checked_add(trade.receiver_money)
            .ok_or(GameError::ArithmeticOverflow)?;
    }

    // Execute property transfers
    if let Some(prop_pos) = trade.proposer_property {
        // Remove from proposer
        proposer_state.properties_owned.retain(|&x| x != prop_pos);
        // Add to accepter
        accepter_state.properties_owned.push(prop_pos);
    }

    if let Some(prop_pos) = trade.receiver_property {
        // Remove from accepter
        accepter_state.properties_owned.retain(|&x| x != prop_pos);
        // Add to proposer
        proposer_state.properties_owned.push(prop_pos);
    }

    trade.status = TradeStatus::Accepted;

    msg!(
        "Trade accepted! Exchange completed between {} and {}",
        trade.proposer,
        trade.receiver
    );

    Ok(())
}

#[derive(Accounts)]
pub struct RejectTrade<'info> {
    #[account(
        mut,
        seeds = [b"trade", trade.game.as_ref(), trade.proposer.as_ref()],
        bump = trade.bump,
        constraint = trade.status == TradeStatus::Pending @ GameError::TradeNotPending,
        constraint = trade.receiver == rejecter.key() @ GameError::NotTradeTarget,
        close = rejecter
    )]
    pub trade: Account<'info, TradeState>,

    #[account(mut)]
    pub rejecter: Signer<'info>,
}

pub fn reject_trade_handler(ctx: Context<RejectTrade>) -> Result<()> {
    let trade = &mut ctx.accounts.trade;
    let rejecter_pubkey = ctx.accounts.rejecter.key();

    trade.status = TradeStatus::Rejected;

    msg!("Trade rejected by target player {}", rejecter_pubkey);

    Ok(())
}

#[derive(Accounts)]
pub struct CancelTrade<'info> {
    #[account(
        mut,
        seeds = [b"trade", trade.game.as_ref(), trade.proposer.as_ref()],
        bump = trade.bump,
        constraint = trade.status == TradeStatus::Pending @ GameError::TradeNotPending,
        constraint = trade.proposer == canceller.key() @ GameError::NotTradeProposer,
        close = canceller
    )]
    pub trade: Account<'info, TradeState>,

    #[account(mut)]
    pub canceller: Signer<'info>,
}

pub fn cancel_trade_handler(ctx: Context<CancelTrade>) -> Result<()> {
    let trade = &mut ctx.accounts.trade;
    let canceller_pubkey = ctx.accounts.canceller.key();

    trade.status = TradeStatus::Cancelled;

    msg!("Trade cancelled by proposer {}", canceller_pubkey);

    Ok(())
}
