pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;
pub use utils::*;

declare_id!("7HQX6PXWbo9TS4hiaZezC6ATYvMa3LCU3pNFutsVkLqz");

#[program]
pub mod panda_monopoly {
    use super::*;

    // Game management instructions
    pub fn initialize_game(ctx: Context<InitializeGame>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }
    
    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        instructions::initialize::join_game_handler(ctx)
    }
    
    pub fn start_game(ctx: Context<StartGame>) -> Result<()> {
        instructions::initialize::start_game_handler(ctx)
    }
    
    // Dice and movement instructions
    pub fn roll_dice(ctx: Context<RollDice>) -> Result<()> {
        instructions::dice::roll_dice_handler(ctx)
    }
    
    pub fn move_player(ctx: Context<MovePlayer>) -> Result<()> {
        instructions::movement::move_player_handler(ctx)
    }
    
    pub fn end_turn(ctx: Context<EndTurn>) -> Result<()> {
        instructions::movement::end_turn_handler(ctx)
    }
    
    // Property instructions
    // pub fn buy_property(ctx: Context<BuyProperty>, position: u8) -> Result<()> {
    //     instructions::property::buy_property_handler(ctx, position)
    // }
    
    // pub fn build_house(ctx: Context<BuildHouse>, position: u8) -> Result<()> {
    //     instructions::property::build_house_handler(ctx, position)
    // }
    
    // pub fn build_hotel(ctx: Context<BuildHotel>, position: u8) -> Result<()> {
    //     instructions::property::build_hotel_handler(ctx, position)
    // }
    
    // pub fn mortgage_property(ctx: Context<MortgageProperty>, position: u8) -> Result<()> {
    //     instructions::property::mortgage_property_handler(ctx, position)
    // }
    
    // pub fn unmortgage_property(ctx: Context<UnmortgageProperty>, position: u8) -> Result<()> {
    //     instructions::property::unmortgage_property_handler(ctx, position)
    // }
    
    // pub fn pay_rent(ctx: Context<PayRent>, position: u8) -> Result<()> {
    //     instructions::property::pay_rent_handler(ctx, position)
    // }
    
    // Trading instructions
    // pub fn create_trade(
    //     ctx: Context<CreateTrade>,
    //     target_player: Pubkey,
    //     offered_properties: Vec<u8>,
    //     requested_properties: Vec<u8>,
    //     offered_money: u32,
    //     requested_money: u32,
    // ) -> Result<()> {
    //     instructions::trading::create_trade_handler(
    //         ctx,
    //         target_player,
    //         offered_properties,
    //         requested_properties,
    //         offered_money,
    //         requested_money,
    //     )
    // }
    
    // pub fn accept_trade(ctx: Context<AcceptTrade>) -> Result<()> {
    //     instructions::trading::accept_trade_handler(ctx)
    // }
    
    // pub fn cancel_trade(ctx: Context<CancelTrade>) -> Result<()> {
    //     instructions::trading::cancel_trade_handler(ctx)
    // }
    
    // Special spaces instructions
    // pub fn collect_go(ctx: Context<CollectGo>) -> Result<()> {
    //     instructions::special_spaces::collect_go_handler(ctx)
    // }
    
    // pub fn go_to_jail(ctx: Context<GoToJail>) -> Result<()> {
    //     instructions::special_spaces::go_to_jail_handler(ctx)
    // }
    
    pub fn pay_jail_fine(ctx: Context<PayJailFine>) -> Result<()> {
        instructions::dice::pay_jail_fine_handler(ctx)
    }
    
    // pub fn draw_chance_card(ctx: Context<DrawChanceCard>) -> Result<()> {
    //     instructions::special_spaces::draw_chance_card_handler(ctx)
    // }
    
    // pub fn draw_community_chest_card(ctx: Context<DrawCommunityChestCard>) -> Result<()> {
    //     instructions::special_spaces::draw_community_chest_card_handler(ctx)
    // }
    
    // pub fn collect_free_parking(ctx: Context<CollectFreeParking>) -> Result<()> {
    //     instructions::special_spaces::collect_free_parking_handler(ctx)
    // }
    
    // pub fn visit_beach_resort(ctx: Context<VisitBeachResort>) -> Result<()> {
    //     instructions::special_spaces::visit_beach_resort_handler(ctx)
    // }
    
    // pub fn attend_festival(ctx: Context<AttendFestival>) -> Result<()> {
    //     instructions::special_spaces::attend_festival_handler(ctx)
    // }
}
