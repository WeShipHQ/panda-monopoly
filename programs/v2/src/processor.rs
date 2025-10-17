use pinocchio::{
    account_info::AccountInfo,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    ProgramResult,
};

use crate::{
    instruction::MonopolyInstruction,
    GameError,
};

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let (instruction, data) = MonopolyInstruction::unpack(instruction_data)?;

        match instruction {
            MonopolyInstruction::CreatePlatformConfig => {
                msg!("Instruction: CreatePlatformConfig");
                Self::process_create_platform_config(program_id, accounts, data)
            }
            MonopolyInstruction::UpdatePlatformConfig => {
                msg!("Instruction: UpdatePlatformConfig");
                Self::process_update_platform_config(program_id, accounts, data)
            }
            MonopolyInstruction::InitializeGame => {
                msg!("Instruction: InitializeGame");
                Self::process_initialize_game(program_id, accounts, data)
            }
            MonopolyInstruction::JoinGame => {
                msg!("Instruction: JoinGame");
                Self::process_join_game(program_id, accounts, data)
            }
            MonopolyInstruction::LeaveGame => {
                msg!("Instruction: LeaveGame");
                Self::process_leave_game(program_id, accounts, data)
            }
            MonopolyInstruction::StartGame => {
                msg!("Instruction: StartGame");
                Self::process_start_game(program_id, accounts, data)
            }
            MonopolyInstruction::CancelGame => {
                msg!("Instruction: CancelGame");
                Self::process_cancel_game(program_id, accounts, data)
            }
            MonopolyInstruction::EndGame => {
                msg!("Instruction: EndGame");
                Self::process_end_game(program_id, accounts, data)
            }
            MonopolyInstruction::RollDice => {
                msg!("Instruction: RollDice");
                Self::process_roll_dice(program_id, accounts, data)
            }
            MonopolyInstruction::CallbackRollDice => {
                msg!("Instruction: CallbackRollDice");
                Self::process_callback_roll_dice(program_id, accounts, data)
            }
            MonopolyInstruction::EndTurn => {
                msg!("Instruction: EndTurn");
                Self::process_end_turn(program_id, accounts, data)
            }
            MonopolyInstruction::CallbackDrawChanceCard => {
                msg!("Instruction: CallbackDrawChanceCard");
                Self::process_callback_draw_chance_card(program_id, accounts, data)
            }
            MonopolyInstruction::CallbackDrawCommunityChestCard => {
                msg!("Instruction: CallbackDrawCommunityChestCard");
                Self::process_callback_draw_community_chest_card(program_id, accounts, data)
            }
            MonopolyInstruction::PayJailFine => {
                msg!("Instruction: PayJailFine");
                Self::process_pay_jail_fine(program_id, accounts, data)
            }
            MonopolyInstruction::UseGetOutOfJailCard => {
                msg!("Instruction: UseGetOutOfJailCard");
                Self::process_use_get_out_of_jail_card(program_id, accounts, data)
            }
            MonopolyInstruction::DeclareBankruptcy => {
                msg!("Instruction: DeclareBankruptcy");
                Self::process_declare_bankruptcy(program_id, accounts, data)
            }
            MonopolyInstruction::PayMevTax => {
                msg!("Instruction: PayMevTax");
                Self::process_pay_mev_tax(program_id, accounts, data)
            }
            MonopolyInstruction::PayPriorityFeeTax => {
                msg!("Instruction: PayPriorityFeeTax");
                Self::process_pay_priority_fee_tax(program_id, accounts, data)
            }
            MonopolyInstruction::DrawChanceCard => {
                msg!("Instruction: DrawChanceCard");
                Self::process_draw_chance_card(program_id, accounts, data)
            }
            MonopolyInstruction::DrawCommunityChestCard => {
                msg!("Instruction: DrawCommunityChestCard");
                Self::process_draw_community_chest_card(program_id, accounts, data)
            }
            MonopolyInstruction::BuyPropertyV2 => {
                msg!("Instruction: BuyPropertyV2");
                Self::process_buy_property_v2(program_id, accounts, data)
            }
            MonopolyInstruction::DeclinePropertyV2 => {
                msg!("Instruction: DeclinePropertyV2");
                Self::process_decline_property_v2(program_id, accounts, data)
            }
            MonopolyInstruction::PayRentV2 => {
                msg!("Instruction: PayRentV2");
                Self::process_pay_rent_v2(program_id, accounts, data)
            }
            MonopolyInstruction::BuildHouseV2 => {
                msg!("Instruction: BuildHouseV2");
                Self::process_build_house_v2(program_id, accounts, data)
            }
            MonopolyInstruction::BuildHotelV2 => {
                msg!("Instruction: BuildHotelV2");
                Self::process_build_hotel_v2(program_id, accounts, data)
            }
            MonopolyInstruction::SellBuildingV2 => {
                msg!("Instruction: SellBuildingV2");
                Self::process_sell_building_v2(program_id, accounts, data)
            }
            MonopolyInstruction::MortgagePropertyV2 => {
                msg!("Instruction: MortgagePropertyV2");
                Self::process_mortgage_property_v2(program_id, accounts, data)
            }
            MonopolyInstruction::UnmortgagePropertyV2 => {
                msg!("Instruction: UnmortgagePropertyV2");
                Self::process_unmortgage_property_v2(program_id, accounts, data)
            }
            MonopolyInstruction::CreateTrade => {
                msg!("Instruction: CreateTrade");
                Self::process_create_trade(program_id, accounts, data)
            }
            MonopolyInstruction::AcceptTrade => {
                msg!("Instruction: AcceptTrade");
                Self::process_accept_trade(program_id, accounts, data)
            }
            MonopolyInstruction::RejectTrade => {
                msg!("Instruction: RejectTrade");
                Self::process_reject_trade(program_id, accounts, data)
            }
            MonopolyInstruction::CancelTrade => {
                msg!("Instruction: CancelTrade");
                Self::process_cancel_trade(program_id, accounts, data)
            }
            MonopolyInstruction::CleanupExpiredTrades => {
                msg!("Instruction: CleanupExpiredTrades");
                Self::process_cleanup_expired_trades(program_id, accounts, data)
            }
            MonopolyInstruction::ClaimReward => {
                msg!("Instruction: ClaimReward");
                Self::process_claim_reward(program_id, accounts, data)
            }
            MonopolyInstruction::ForceEndTurn => {
                msg!("Instruction: ForceEndTurn");
                Self::process_force_end_turn(program_id, accounts, data)
            }
            MonopolyInstruction::ForceBankruptcyForTimeout => {
                msg!("Instruction: ForceBankruptcyForTimeout");
                Self::process_force_bankruptcy_for_timeout(program_id, accounts, data)
            }
            MonopolyInstruction::ResetGame => {
                msg!("Instruction: ResetGame");
                Self::process_reset_game(program_id, accounts, data)
            }
            MonopolyInstruction::UndelegateGame => {
                msg!("Instruction: UndelegateGame");
                Self::process_undelegate_game(program_id, accounts, data)
            }
            MonopolyInstruction::CloseGame => {
                msg!("Instruction: CloseGame");
                Self::process_close_game(program_id, accounts, data)
            }
        }
    }

    // Platform instructions
    fn process_create_platform_config(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        data: &[u8],
    ) -> ProgramResult {
        use crate::instruction::CreatePlatformConfigData;
        use crate::utils::{next_account_info, check_signer, check_writable, read_account_data_mut};
        use crate::{PLATFORM_CONFIG_DISCRIMINATOR, PlatformConfig};
        
        // Parse instruction data
        if data.len() < core::mem::size_of::<CreatePlatformConfigData>() {
            return Err(ProgramError::InvalidInstructionData);
        }
        
        let ix_data = unsafe { &*(data.as_ptr() as *const CreatePlatformConfigData) };
        
        // Get accounts
        let accounts_iter = &mut accounts.iter();
        let admin = next_account_info(accounts_iter)?;
        let config_account = next_account_info(accounts_iter)?;
        let _system_program = next_account_info(accounts_iter)?;
        
        // Validate accounts
        check_signer(admin, GameError::Unauthorized.into())?;
        check_writable(config_account, GameError::InvalidAccount.into())?;
        
        // Verify PDA
        let platform_id_bytes: &[u8] = &ix_data.platform_id;
        let seeds = &[b"platform" as &[u8], platform_id_bytes];
        use pinocchio::pubkey::find_program_address;
        let (expected_key, bump) = find_program_address(seeds, program_id);
        
        if config_account.key() != &expected_key {
            return Err(GameError::InvalidAccount.into());
        }
        
        // Initialize or update config
        let config = read_account_data_mut::<PlatformConfig>(config_account)?;
        
        // Set discriminator if not already set
        if config.discriminator == [0u8; 8] {
            config.discriminator = PLATFORM_CONFIG_DISCRIMINATOR;
        }
        
        // Initialize config
        config.id = ix_data.platform_id;
        config.fee_basis_points = ix_data.fee_basis_points;
        config.fee_vault = ix_data.fee_vault;
        config.bump = bump;
        config.authority.copy_from_slice(admin.key().as_ref());
        config.total_games_created = 0;
        config.next_game_id = 1;
        
        msg!("Platform config created");
        
        Ok(())
    }

    fn process_update_platform_config(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement update_platform_config");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Game management instructions
    fn process_initialize_game(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        data: &[u8],
    ) -> ProgramResult {
        use crate::instruction::InitializeGameData;
        use crate::utils::{next_account_info, check_signer, read_account_data_mut};
        use crate::{GAME_STATE_DISCRIMINATOR, PLAYER_STATE_DISCRIMINATOR, PLATFORM_CONFIG_DISCRIMINATOR};
        use crate::{GameState, PlayerState, PlatformConfig, GameStatus, PropertyInfo};
        use crate::{MAX_PLAYERS, TOTAL_HOUSES, TOTAL_HOTELS, STARTING_MONEY};
        use crate::{DEFAULT_TURN_TIMEOUT_SECONDS, DEFAULT_GRACE_PERIOD_SECONDS};
        use pinocchio::sysvars::{clock::Clock, Sysvar};
        
        // Parse instruction data
        if data.len() < core::mem::size_of::<InitializeGameData>() {
            return Err(ProgramError::InvalidInstructionData);
        }
        
        let ix_data = unsafe { &*(data.as_ptr() as *const InitializeGameData) };
        
        // Get accounts
        let accounts_iter = &mut accounts.iter();
        let game_account = next_account_info(accounts_iter)?;
        let player_account = next_account_info(accounts_iter)?;
        let creator = next_account_info(accounts_iter)?;
        let config_account = next_account_info(accounts_iter)?;
        let _system_program = next_account_info(accounts_iter)?;
        let _clock_account = next_account_info(accounts_iter)?;
        
        // Validate accounts
        check_signer(creator, GameError::Unauthorized.into())?;
        check_owner(config_account, program_id, GameError::InvalidAccount.into())?;
        
        // Load config
        let config = read_account_data_mut::<PlatformConfig>(config_account)?;
        
        if config.discriminator != PLATFORM_CONFIG_DISCRIMINATOR {
            return Err(GameError::InvalidAccount.into());
        }
        
        // Get clock
        let clock = Clock::get()?;
        
        // TODO: Handle entry fee and token transfers
        // For now, we only support free games (entry_fee = 0)
        if ix_data.entry_fee > 0 {
            msg!("Entry fee games not yet supported in Pinocchio version");
            return Err(GameError::FeatureNotImplemented.into());
        }
        
        // Initialize game state
        let game = read_account_data_mut::<GameState>(game_account)?;
        
        // Set discriminator
        game.discriminator = GAME_STATE_DISCRIMINATOR;
        
        // Assign game ID and increment
        let game_id = config.next_game_id;
        config.next_game_id += 1;
        config.total_games_created += 1;
        
        game.game_id = game_id;
        game.config_id = config.id;
        game.creator.copy_from_slice(creator.key().as_ref());
        
        // Verify PDA
        let game_id_bytes = game_id.to_le_bytes();
        let seeds = &[b"game" as &[u8], config.id.as_ref(), &game_id_bytes];
        use pinocchio::pubkey::find_program_address;
        let (_expected_key, bump) = find_program_address(seeds, program_id);
        game.bump = bump;
        
        game.game_status = GameStatus::WaitingForPlayers as u8;
        game.current_turn = 0;
        game.current_players = 0;
        game.max_players = MAX_PLAYERS;
        game.total_players = 0;
        game.active_players = 0;
        game.houses_remaining = TOTAL_HOUSES;
        game.hotels_remaining = TOTAL_HOTELS;
        game.created_at = clock.unix_timestamp;
        game.bank_balance = 1_000_000; // Initial bank balance
        game.entry_fee = ix_data.entry_fee;
        game.token_mint_flag = 0;
        game.token_vault_flag = 0;
        game.total_prize_pool = 0;
        game.prize_claimed = 0;
        game.end_condition_met = 0;
        game.end_reason_flag = 0;
        game.winner_flag = 0;
        game.turn_started_at = clock.unix_timestamp;
        game.active_trades_count = 0;
        game.next_trade_id = 0;
        game.turn_timeout_seconds = DEFAULT_TURN_TIMEOUT_SECONDS;
        game.turn_grace_period_seconds = DEFAULT_GRACE_PERIOD_SECONDS;
        game.timeout_enforcement_enabled = 1;
        
        // Set time limit
        if ix_data.time_limit_seconds_flag != 0 {
            game.time_limit_flag = 1;
            game.time_limit = ix_data.time_limit_seconds;
        } else {
            game.time_limit_flag = 0;
        }
        game.game_end_time_flag = 0;
        
        game.started_at_flag = 0;
        game.ended_at_flag = 0;
        
        // Initialize properties
        game.properties = [PropertyInfo::default(); 40];
        
        // Initialize player state
        let player = read_account_data_mut::<PlayerState>(player_account)?;
        player.discriminator = PLAYER_STATE_DISCRIMINATOR;
        player.wallet.copy_from_slice(creator.key().as_ref());
        player.game.copy_from_slice(game_account.key().as_ref());
        player.cash_balance = STARTING_MONEY as u64;
        player.position = 0;
        player.in_jail = 0;
        player.jail_turns = 0;
        player.doubles_count = 0;
        player.is_bankrupt = 0;
        player.properties_owned_count = 0;
        player.get_out_of_jail_cards = 0;
        player.net_worth = STARTING_MONEY as u64;
        player.last_rent_collected = clock.unix_timestamp;
        player.festival_boost_turns = 0;
        player.has_rolled_dice = 0;
        player.last_dice_roll = [0, 0];
        player.needs_property_action = 0;
        player.pending_property_position_flag = 0;
        player.needs_chance_card = 0;
        player.needs_community_chest_card = 0;
        player.needs_bankruptcy_check = 0;
        player.needs_special_space_action = 0;
        player.pending_special_space_position_flag = 0;
        player.card_drawn_at_flag = 0;
        player.timeout_penalty_count = 0;
        player.last_action_timestamp = clock.unix_timestamp;
        player.total_timeout_penalties = 0;
        
        // Add creator as first player
        game.players[0].copy_from_slice(creator.key().as_ref());
        game.player_eliminated[0] = 0;
        game.current_players = 1;
        
        msg!("Game {} initialized by creator", game_id);
        
        Ok(())
    }

    fn process_join_game(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        use crate::utils::{next_account_info, check_signer, read_account_data_mut, pubkeys_equal};
        use crate::{GAME_STATE_DISCRIMINATOR, PLAYER_STATE_DISCRIMINATOR};
        use crate::{GameState, PlayerState, GameStatus, STARTING_MONEY, MAX_PLAYERS};
        use pinocchio::sysvars::{clock::Clock, Sysvar};
        
        // Get accounts
        let accounts_iter = &mut accounts.iter();
        let game_account = next_account_info(accounts_iter)?;
        let player_account = next_account_info(accounts_iter)?;
        let player = next_account_info(accounts_iter)?;
        let _system_program = next_account_info(accounts_iter)?;
        let _clock_account = next_account_info(accounts_iter)?;
        
        // Validate accounts
        check_signer(player, GameError::Unauthorized.into())?;
        check_owner(game_account, program_id, GameError::InvalidAccount.into())?;
        
        // Load game state
        let game = read_account_data_mut::<GameState>(game_account)?;
        
        if game.discriminator != GAME_STATE_DISCRIMINATOR {
            return Err(GameError::InvalidAccount.into());
        }
        
        // Verify game status
        if game.game_status != GameStatus::WaitingForPlayers as u8 {
            return Err(GameError::GameAlreadyStarted.into());
        }
        
        // Check if max players reached
        if game.current_players >= MAX_PLAYERS {
            return Err(GameError::MaxPlayersReached.into());
        }
        
        // Check if player already in game
        for i in 0..game.current_players {
            if pubkeys_equal(&game.players[i as usize], player.key().as_ref()) {
                return Err(GameError::PlayerAlreadyExists.into());
            }
        }
        
        // Get clock
        let clock = Clock::get()?;
        
        // TODO: Handle entry fee payment for paid games
        if game.entry_fee > 0 {
            msg!("Entry fee games not yet supported in Pinocchio version");
            return Err(GameError::FeatureNotImplemented.into());
        }
        
        // Initialize player state
        let player_state = read_account_data_mut::<PlayerState>(player_account)?;
        player_state.discriminator = PLAYER_STATE_DISCRIMINATOR;
        player_state.wallet.copy_from_slice(player.key().as_ref());
        player_state.game.copy_from_slice(game_account.key().as_ref());
        player_state.cash_balance = STARTING_MONEY as u64;
        player_state.position = 0;
        player_state.in_jail = 0;
        player_state.jail_turns = 0;
        player_state.doubles_count = 0;
        player_state.is_bankrupt = 0;
        player_state.properties_owned_count = 0;
        player_state.get_out_of_jail_cards = 0;
        player_state.net_worth = STARTING_MONEY as u64;
        player_state.last_rent_collected = clock.unix_timestamp;
        player_state.festival_boost_turns = 0;
        player_state.has_rolled_dice = 0;
        player_state.last_dice_roll = [0, 0];
        player_state.needs_property_action = 0;
        player_state.pending_property_position_flag = 0;
        player_state.needs_chance_card = 0;
        player_state.needs_community_chest_card = 0;
        player_state.needs_bankruptcy_check = 0;
        player_state.needs_special_space_action = 0;
        player_state.pending_special_space_position_flag = 0;
        player_state.card_drawn_at_flag = 0;
        player_state.timeout_penalty_count = 0;
        player_state.last_action_timestamp = clock.unix_timestamp;
        player_state.total_timeout_penalties = 0;
        
        // Add player to game
        game.players[game.current_players as usize].copy_from_slice(player.key().as_ref());
        game.player_eliminated[game.current_players as usize] = 0;
        game.current_players += 1;
        game.total_players = game.current_players;
        game.active_players = game.current_players;
        
        msg!("Player joined game. Total players: {}", game.current_players);
        
        Ok(())
    }

    fn process_leave_game(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement leave_game");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_start_game(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        use crate::utils::{next_account_info, check_signer, read_account_data_mut, pubkeys_equal};
        use crate::{GAME_STATE_DISCRIMINATOR, GameState, GameStatus, MIN_PLAYERS};
        use pinocchio::sysvars::{clock::Clock, Sysvar};
        
        // Get accounts
        let accounts_iter = &mut accounts.iter();
        let game_account = next_account_info(accounts_iter)?;
        let authority = next_account_info(accounts_iter)?;
        let _clock_account = next_account_info(accounts_iter)?;
        
        // Validate accounts
        check_signer(authority, GameError::Unauthorized.into())?;
        check_owner(game_account, program_id, GameError::InvalidAccount.into())?;
        
        // Load game state
        let game = read_account_data_mut::<GameState>(game_account)?;
        
        if game.discriminator != GAME_STATE_DISCRIMINATOR {
            return Err(GameError::InvalidAccount.into());
        }
        
        // Verify creator
        if !pubkeys_equal(&game.creator, authority.key().as_ref()) {
            return Err(GameError::Unauthorized.into());
        }
        
        // Verify game status
        if game.game_status != GameStatus::WaitingForPlayers as u8 {
            return Err(GameError::GameAlreadyStarted.into());
        }
        
        // Verify minimum players
        if game.current_players < MIN_PLAYERS {
            return Err(GameError::MinPlayersNotMet.into());
        }
        
        // Get clock
        let clock = Clock::get()?;
        
        // Change game status to in progress
        game.game_status = GameStatus::InProgress as u8;
        game.current_turn = 0; // First player starts
        game.turn_started_at = clock.unix_timestamp;
        game.started_at_flag = 1;
        game.started_at = clock.unix_timestamp;
        
        // Set game end time if time limit specified
        if game.time_limit_flag != 0 {
            game.game_end_time_flag = 1;
            game.game_end_time = clock.unix_timestamp
                .checked_add(game.time_limit)
                .ok_or(GameError::ArithmeticOverflow)?;
        }
        
        msg!("Game started with {} players", game.current_players);
        
        // TODO: Handle ephemeral rollups delegation
        // This would require delegating the game account and all player accounts
        // to the ephemeral rollups program for off-chain processing
        
        Ok(())
    }

    fn process_cancel_game(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement cancel_game");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_end_game(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement end_game");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Dice and movement instructions
    fn process_roll_dice(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        data: &[u8],
    ) -> ProgramResult {
        use crate::instruction::RollDiceData;
        use crate::utils::{next_account_info, check_signer, read_account_data_mut, pubkeys_equal};
        use crate::{GAME_STATE_DISCRIMINATOR, PLAYER_STATE_DISCRIMINATOR, GameState, PlayerState, GameStatus};
        use crate::{GO_SALARY, GO_TO_JAIL_POSITION, JAIL_POSITION, PropertyType, get_property_data};
        use crate::{BOARD_SIZE, MAX_JAIL_TURNS};
        use pinocchio::sysvars::{clock::Clock, Sysvar};
        
        // Parse instruction data
        if data.len() < core::mem::size_of::<RollDiceData>() {
            return Err(ProgramError::InvalidInstructionData);
        }
        
        let ix_data = unsafe { &*(data.as_ptr() as *const RollDiceData) };
        
        // Get accounts
        let accounts_iter = &mut accounts.iter();
        let game_account = next_account_info(accounts_iter)?;
        let player_account = next_account_info(accounts_iter)?;
        let player = next_account_info(accounts_iter)?;
        let _clock_account = next_account_info(accounts_iter)?;
        
        // Validate accounts
        check_signer(player, GameError::Unauthorized.into())?;
        check_owner(game_account, program_id, GameError::InvalidAccount.into())?;
        check_owner(player_account, program_id, GameError::InvalidAccount.into())?;
        
        // Load state
        let game = read_account_data_mut::<GameState>(game_account)?;
        let player_state = read_account_data_mut::<PlayerState>(player_account)?;
        
        // Verify discriminators
        if game.discriminator != GAME_STATE_DISCRIMINATOR {
            return Err(GameError::InvalidAccount.into());
        }
        if player_state.discriminator != PLAYER_STATE_DISCRIMINATOR {
            return Err(GameError::InvalidAccount.into());
        }
        
        // Verify game status
        if game.game_status != GameStatus::InProgress as u8 {
            return Err(GameError::GameNotInProgress.into());
        }
        
        // Find player index
        let mut player_index = None;
        for i in 0..game.current_players {
            if pubkeys_equal(&game.players[i as usize], player.key().as_ref()) {
                player_index = Some(i);
                break;
            }
        }
        
        let player_index = player_index.ok_or(GameError::PlayerNotFound)?;
        
        // Verify it's the player's turn
        if game.current_turn != player_index {
            return Err(GameError::NotPlayerTurn.into());
        }
        
        // Check if player already rolled
        if player_state.has_rolled_dice != 0 {
            return Err(GameError::AlreadyRolledDice.into());
        }
        
        // Get clock
        let clock = Clock::get()?;
        player_state.last_action_timestamp = clock.unix_timestamp;
        
        // Handle VRF
        if ix_data.use_vrf != 0 {
            msg!("VRF not yet implemented in Pinocchio version");
            return Err(GameError::FeatureNotImplemented.into());
        }
        
        // Get dice roll (must be provided if not using VRF)
        if ix_data.dice_roll_flag == 0 {
            return Err(GameError::InvalidInputData.into());
        }
        
        let dice = ix_data.dice_roll;
        
        // Validate dice values
        if dice[0] < 1 || dice[0] > 6 || dice[1] < 1 || dice[1] > 6 {
            return Err(GameError::InvalidDiceRoll.into());
        }
        
        player_state.last_dice_roll = dice;
        let is_doubles = dice[0] == dice[1];
        
        msg!("Rolled: {} and {}", dice[0], dice[1]);
        
        // Handle jail
        if player_state.in_jail != 0 {
            if is_doubles {
                // Got out of jail with doubles
                player_state.in_jail = 0;
                player_state.jail_turns = 0;
                msg!("Player rolled doubles and got out of jail!");
            } else {
                player_state.jail_turns += 1;
                
                if player_state.jail_turns >= MAX_JAIL_TURNS {
                    // Must pay fine or use card next turn
                    msg!("Maximum jail turns reached. Must pay fine or use card.");
                    player_state.has_rolled_dice = 1;
                    return Ok(());
                } else {
                    msg!("Still in jail. Turns in jail: {}", player_state.jail_turns);
                    player_state.has_rolled_dice = 1;
                    return Ok(());
                }
            }
        }
        
        // Handle doubles
        if is_doubles {
            player_state.doubles_count += 1;
            
            if player_state.doubles_count >= 3 {
                // Three doubles in a row - go to jail
                msg!("Rolled 3 doubles in a row! Go to jail.");
                player_state.position = JAIL_POSITION;
                player_state.in_jail = 1;
                player_state.jail_turns = 0;
                player_state.doubles_count = 0;
                player_state.has_rolled_dice = 1;
                return Ok(());
            } else {
                msg!("Rolled doubles! ({} in a row)", player_state.doubles_count);
            }
        }
        
        // Move player
        let old_position = player_state.position;
        let spaces_to_move = dice[0] + dice[1];
        let new_position = (old_position + spaces_to_move) % BOARD_SIZE;
        
        // Check if passed GO
        if new_position < old_position {
            player_state.cash_balance = player_state.cash_balance
                .checked_add(GO_SALARY as u64)
                .ok_or(GameError::ArithmeticOverflow)?;
            msg!("Player passed GO! Collected ${}", GO_SALARY);
        }
        
        player_state.position = new_position;
        msg!("Player moved from {} to {}", old_position, new_position);
        
        // Handle landing on GO TO JAIL
        if new_position == GO_TO_JAIL_POSITION {
            msg!("Landed on Go To Jail!");
            player_state.position = JAIL_POSITION;
            player_state.in_jail = 1;
            player_state.jail_turns = 0;
            player_state.doubles_count = 0;
            player_state.has_rolled_dice = 1;
            return Ok(());
        }
        
        // Handle landing on property/special space
        let property_data = get_property_data(new_position)?;
        
        match property_data.property_type {
            PropertyType::Street | PropertyType::Railroad | PropertyType::Utility => {
                player_state.needs_property_action = 1;
                player_state.pending_property_position_flag = 1;
                player_state.pending_property_position = new_position;
                msg!("Landed on property at position {}", new_position);
            }
            PropertyType::Chance => {
                player_state.needs_chance_card = 1;
                msg!("Landed on Chance!");
            }
            PropertyType::CommunityChest => {
                player_state.needs_community_chest_card = 1;
                msg!("Landed on Community Chest!");
            }
            PropertyType::Tax => {
                player_state.needs_special_space_action = 1;
                player_state.pending_special_space_position_flag = 1;
                player_state.pending_special_space_position = new_position;
                msg!("Landed on Tax space at position {}", new_position);
            }
            PropertyType::Corner => {
                // GO, Jail (just visiting), Free Parking - no action needed
                msg!("Landed on corner space at position {}", new_position);
            }
        }
        
        player_state.has_rolled_dice = 1;
        
        msg!("Dice roll complete");
        
        Ok(())
    }

    fn process_callback_roll_dice(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement callback_roll_dice");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_end_turn(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        use crate::utils::{next_account_info, check_signer, read_account_data_mut, pubkeys_equal};
        use crate::{GAME_STATE_DISCRIMINATOR, PLAYER_STATE_DISCRIMINATOR, GameState, PlayerState, GameStatus};
        use pinocchio::sysvars::{clock::Clock, Sysvar};
        
        // Get accounts
        let accounts_iter = &mut accounts.iter();
        let game_account = next_account_info(accounts_iter)?;
        let player_account = next_account_info(accounts_iter)?;
        let player_authority = next_account_info(accounts_iter)?;
        let _clock_account = next_account_info(accounts_iter)?;
        
        // Validate accounts
        check_signer(player_authority, GameError::Unauthorized.into())?;
        check_owner(game_account, program_id, GameError::InvalidAccount.into())?;
        check_owner(player_account, program_id, GameError::InvalidAccount.into())?;
        
        // Load state
        let game = read_account_data_mut::<GameState>(game_account)?;
        let player = read_account_data_mut::<PlayerState>(player_account)?;
        
        // Verify discriminators
        if game.discriminator != GAME_STATE_DISCRIMINATOR {
            return Err(GameError::InvalidAccount.into());
        }
        if player.discriminator != PLAYER_STATE_DISCRIMINATOR {
            return Err(GameError::InvalidAccount.into());
        }
        
        // Verify game status
        if game.game_status != GameStatus::InProgress as u8 {
            return Err(GameError::GameNotInProgress.into());
        }
        
        // Validate player is in this game
        if !pubkeys_equal(&player.game, game_account.key().as_ref()) {
            return Err(GameError::PlayerNotFound.into());
        }
        
        // Validate it's the player's turn
        let current_player = &game.players[game.current_turn as usize];
        if !pubkeys_equal(current_player, &player.wallet) {
            return Err(GameError::NotPlayerTurn.into());
        }
        
        // Validate player has completed all required actions
        if player.has_rolled_dice == 0 {
            return Err(GameError::HasNotRolledDice.into());
        }
        if player.needs_property_action != 0 {
            return Err(GameError::MustHandleSpecialSpace.into());
        }
        if player.needs_chance_card != 0 {
            return Err(GameError::MustHandleSpecialSpace.into());
        }
        if player.needs_community_chest_card != 0 {
            return Err(GameError::MustHandleSpecialSpace.into());
        }
        if player.needs_bankruptcy_check != 0 {
            return Err(GameError::MustDeclareBankruptcy.into());
        }
        
        // Get current time
        let clock = Clock::get()?;
        
        // Check if time limit reached
        if game.time_limit_flag != 0 && game.game_end_time_flag != 0 {
            if clock.unix_timestamp >= game.game_end_time {
                msg!("Time limit reached! Game should be ended via end_game instruction.");
                game.end_condition_met = 1;
                game.end_reason_flag = 1;
                game.end_reason = crate::state::GameEndReason::TimeLimit as u8;
            }
        }
        
        // Reset player turn state
        player.has_rolled_dice = 0;
        player.last_dice_roll = [0, 0];
        player.doubles_count = 0;
        player.needs_property_action = 0;
        player.pending_property_position_flag = 0;
        player.needs_chance_card = 0;
        player.needs_community_chest_card = 0;
        player.needs_special_space_action = 0;
        player.pending_special_space_position_flag = 0;
        player.last_action_timestamp = clock.unix_timestamp;
        
        // Advance turn
        let mut attempts = 0;
        let max_attempts = game.max_players as usize;
        
        loop {
            game.current_turn = (game.current_turn + 1) % game.max_players;
            
            // Skip eliminated players
            if game.player_eliminated[game.current_turn as usize] == 0 {
                break;
            }
            
            attempts += 1;
            if attempts >= max_attempts {
                return Err(GameError::NoActivePlayers.into());
            }
        }
        
        // Update turn start time
        game.turn_started_at = clock.unix_timestamp;
        
        msg!("Turn ended. Next turn: Player {}", game.current_turn);
        
        Ok(())
    }

    fn process_callback_draw_chance_card(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement callback_draw_chance_card");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_callback_draw_community_chest_card(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement callback_draw_community_chest_card");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Jail instructions
    fn process_pay_jail_fine(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement pay_jail_fine");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_use_get_out_of_jail_card(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement use_get_out_of_jail_card");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Bankruptcy instruction
    fn process_declare_bankruptcy(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement declare_bankruptcy");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Tax instructions
    fn process_pay_mev_tax(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement pay_mev_tax");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_pay_priority_fee_tax(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement pay_priority_fee_tax");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Card drawing instructions
    fn process_draw_chance_card(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement draw_chance_card");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_draw_community_chest_card(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement draw_community_chest_card");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Property instructions
    fn process_buy_property_v2(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement buy_property_v2");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_decline_property_v2(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement decline_property_v2");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_pay_rent_v2(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement pay_rent_v2");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_build_house_v2(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement build_house_v2");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_build_hotel_v2(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement build_hotel_v2");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_sell_building_v2(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement sell_building_v2");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_mortgage_property_v2(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement mortgage_property_v2");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_unmortgage_property_v2(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement unmortgage_property_v2");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Trading instructions
    fn process_create_trade(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement create_trade");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_accept_trade(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement accept_trade");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_reject_trade(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement reject_trade");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_cancel_trade(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement cancel_trade");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_cleanup_expired_trades(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement cleanup_expired_trades");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Reward instruction
    fn process_claim_reward(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement claim_reward");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Permissionless instructions
    fn process_force_end_turn(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement force_end_turn");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_force_bankruptcy_for_timeout(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement force_bankruptcy_for_timeout");
        Err(GameError::FeatureNotImplemented.into())
    }

    // Test instructions
    fn process_reset_game(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement reset_game");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_undelegate_game(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement undelegate_game");
        Err(GameError::FeatureNotImplemented.into())
    }

    fn process_close_game(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _data: &[u8],
    ) -> ProgramResult {
        msg!("TODO: Implement close_game");
        Err(GameError::FeatureNotImplemented.into())
    }
}
