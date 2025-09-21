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

declare_id!("4vucUqMcXN4sgLsgnrXTUC9U7ACZ5DmoRBLbWt4vrnyR");

#[program]
pub mod panda_monopoly {
    use super::*;

    // Game management instructions
    pub fn initialize_game(ctx: Context<InitializeGame>, game_id: u64) -> Result<()> {
        instructions::initialize::initialize_game_handler(ctx, game_id)
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        instructions::initialize::join_game_handler(ctx)
    }

    pub fn start_game(ctx: Context<StartGame>) -> Result<()> {
        instructions::initialize::start_game_handler(ctx)
    }

    // Dice and movement instructions
    pub fn roll_dice(ctx: Context<RollDice>, dice_roll: Option<[u8; 2]>) -> Result<()> {
        instructions::dice::roll_dice_handler(ctx, dice_roll)
    }

    pub fn test_dice_handler(ctx: Context<RollDice>, dice_roll: Option<[u8; 2]>) -> Result<()> {
        instructions::dice::test_dice_handler(ctx, dice_roll)
    }

    pub fn end_turn(ctx: Context<EndTurn>) -> Result<()> {
        instructions::end_turn::end_turn_handler(ctx)
    }

    pub fn pay_jail_fine(ctx: Context<PayJailFine>) -> Result<()> {
        instructions::dice::pay_jail_fine_handler(ctx)
    }

    // Special spaces instructions
    pub fn go_to_jail(ctx: Context<GoToJail>) -> Result<()> {
        instructions::special_spaces::go_to_jail_handler(ctx)
    }

    pub fn pay_mev_tax_handler(ctx: Context<PayTax>) -> Result<()> {
        instructions::special_spaces::pay_mev_tax_handler(ctx)
    }

    pub fn pay_priority_fee_tax_handler(ctx: Context<PayTax>) -> Result<()> {
        instructions::special_spaces::pay_priority_fee_tax_handler(ctx)
    }

    pub fn draw_chance_card(ctx: Context<DrawChanceCard>) -> Result<()> {
        instructions::special_spaces::draw_chance_card_handler(ctx)
    }

    pub fn draw_community_chest_card(ctx: Context<DrawCommunityChestCard>) -> Result<()> {
        instructions::special_spaces::draw_community_chest_card_handler(ctx)
    }

    pub fn collect_free_parking(ctx: Context<CollectFreeParking>) -> Result<()> {
        instructions::special_spaces::collect_free_parking_handler(ctx)
    }

    pub fn visit_beach_resort(ctx: Context<VisitBeachResort>) -> Result<()> {
        instructions::special_spaces::visit_beach_resort_handler(ctx)
    }

    pub fn attend_festival(ctx: Context<AttendFestival>) -> Result<()> {
        instructions::special_spaces::attend_festival_handler(ctx)
    }

    // pub fn collect_go(ctx: Context<CollectGo>) -> Result<()> {
    //     instructions::special_spaces::collect_go_handler(ctx)
    // }

    // property instructions
    pub fn buy_property(ctx: Context<BuyProperty>, position: u8) -> Result<()> {
        instructions::property::buy_property_handler(ctx, position)
    }

    pub fn decline_property(ctx: Context<DeclineProperty>, position: u8) -> Result<()> {
        instructions::property::decline_property_handler(ctx, position)
    }

    pub fn pay_rent(ctx: Context<PayRent>, position: u8) -> Result<()> {
        instructions::property::pay_rent_handler(ctx, position)
    }

    pub fn build_house(ctx: Context<BuildHouse>, position: u8) -> Result<()> {
        instructions::property::build_house_handler(ctx, position)
    }

    pub fn build_hotel(ctx: Context<BuildHotel>, position: u8) -> Result<()> {
        instructions::property::build_hotel_handler(ctx, position)
    }

    pub fn sell_building(
        ctx: Context<SellBuilding>,
        position: u8,
        building_type: BuildingType,
    ) -> Result<()> {
        instructions::property::sell_building_handler(ctx, position, building_type)
    }

    pub fn mortgage_property(ctx: Context<MortgageProperty>, position: u8) -> Result<()> {
        instructions::property::mortgage_property_handler(ctx, position)
    }

    pub fn unmortgage_property(ctx: Context<UnmortgageProperty>, position: u8) -> Result<()> {
        instructions::property::unmortgage_property_handler(ctx, position)
    }

    // Trading instructions
    pub fn create_trade(
        ctx: Context<CreateTrade>,
        trade_type: TradeType,
        proposer_money: u64,
        receiver_money: u64,
        proposer_property: Option<u8>,
        receiver_property: Option<u8>,
    ) -> Result<()> {
        instructions::trading::create_trade_handler(
            ctx,
            trade_type,
            proposer_money,
            receiver_money,
            proposer_property,
            receiver_property,
        )
    }

    pub fn accept_trade(ctx: Context<AcceptTrade>) -> Result<()> {
        instructions::trading::accept_trade_handler(ctx)
    }

    pub fn reject_trade(ctx: Context<RejectTrade>) -> Result<()> {
        instructions::trading::reject_trade_handler(ctx)
    }

    pub fn cancel_trade(ctx: Context<CancelTrade>) -> Result<()> {
        instructions::trading::cancel_trade_handler(ctx)
    }

    // Auction instructions
    // pub fn start_auction(ctx: Context<StartAuction>, property_position: u8) -> Result<()> {
    //     instructions::auction::start_auction_handler(ctx, property_position)
    // }

    // pub fn place_bid(ctx: Context<PlaceBid>, bid_amount: u64) -> Result<()> {
    //     instructions::auction::place_bid_handler(ctx, bid_amount)
    // }

    // pub fn end_auction(ctx: Context<EndAuction>) -> Result<()> {
    //     instructions::auction::end_auction_handler(ctx)
    // }
}
