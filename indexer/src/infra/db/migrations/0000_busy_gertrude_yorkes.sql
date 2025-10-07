CREATE TYPE "public"."building_type" AS ENUM('House', 'Hotel');
--> statement-breakpoint
CREATE TYPE "public"."color_group" AS ENUM(
  'Brown',
  'LightBlue',
  'Pink',
  'Orange',
  'Red',
  'Yellow',
  'Green',
  'DarkBlue',
  'Railroad',
  'Utility',
  'Special'
);
--> statement-breakpoint
CREATE TYPE "public"."game_log_type" AS ENUM(
  'move',
  'purchase',
  'rent',
  'card',
  'jail',
  'bankruptcy',
  'turn',
  'dice',
  'building',
  'trade',
  'game',
  'skip',
  'join'
);
--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('WaitingForPlayers', 'InProgress', 'Finished');
--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM(
  'Property',
  'Street',
  'Railroad',
  'Utility',
  'Corner',
  'Chance',
  'CommunityChest',
  'Tax',
  'Beach',
  'Festival'
);
--> statement-breakpoint
CREATE TYPE "public"."sync_component" AS ENUM(
  'historical_sync',
  'account_listener',
  'queue_processor',
  'live_sync',
  'gap_recovery'
);
--> statement-breakpoint
CREATE TYPE "public"."sync_status_type" AS ENUM('running', 'stopped', 'completed', 'failed');
--> statement-breakpoint
CREATE TYPE "public"."trade_status" AS ENUM(
  'Pending',
  'Accepted',
  'Rejected',
  'Cancelled',
  'Expired'
);
--> statement-breakpoint
CREATE TYPE "public"."trade_type" AS ENUM(
  'MoneyOnly',
  'PropertyOnly',
  'MoneyForProperty',
  'PropertyForMoney'
);
--> statement-breakpoint
CREATE TABLE "auctions" (
  "pubkey" varchar(44) PRIMARY KEY NOT NULL,
  "game" varchar(44) NOT NULL,
  "property_position" smallint NOT NULL,
  "current_bid" bigint DEFAULT 0,
  "highest_bidder" varchar(44),
  "started_at" bigint NOT NULL,
  "ends_at" bigint NOT NULL,
  "is_active" boolean DEFAULT true,
  "bump" smallint NOT NULL,
  "account_created_at" timestamp with time zone DEFAULT now(),
  "account_updated_at" timestamp with time zone DEFAULT now(),
  "created_slot" bigint NOT NULL,
  "updated_slot" bigint NOT NULL,
  "last_signature" varchar(88)
);
--> statement-breakpoint
CREATE TABLE "chance_card_events" (
  "id" varchar(88) PRIMARY KEY NOT NULL,
  "player" varchar(44) NOT NULL,
  "game" varchar(44) NOT NULL,
  "card_index" smallint NOT NULL,
  "effect_type" smallint NOT NULL,
  "amount" integer NOT NULL,
  "timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_chest_card_events" (
  "id" varchar(88) PRIMARY KEY NOT NULL,
  "player" varchar(44) NOT NULL,
  "game" varchar(44) NOT NULL,
  "card_index" smallint NOT NULL,
  "effect_type" smallint NOT NULL,
  "amount" integer NOT NULL,
  "timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_events" (
  "id" varchar(88) PRIMARY KEY NOT NULL,
  "game" varchar(44) NOT NULL,
  "player" varchar(44) NOT NULL,
  "event_type" varchar(50) NOT NULL,
  "event_data" json NOT NULL,
  "timestamp" timestamp with time zone NOT NULL,
  "slot" bigint NOT NULL,
  "signature" varchar(88),
  "created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_logs" (
  "id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "game_id" varchar(44) NOT NULL,
  "player_id" varchar(44) NOT NULL,
  "player_name" varchar(100),
  "type" "game_log_type" NOT NULL,
  "message" text NOT NULL,
  "property_name" varchar(100),
  "position" smallint,
  "price" bigint,
  "owner" varchar(44),
  "card_type" varchar(20),
  "card_title" varchar(200),
  "card_description" text,
  "card_index" smallint,
  "effect_type" smallint,
  "amount" bigint,
  "trade_id" varchar(44),
  "action" varchar(50),
  "target_player" varchar(44),
  "target_player_name" varchar(100),
  "offered_properties" json,
  "requested_properties" json,
  "offered_money" bigint,
  "requested_money" bigint,
  "from_position" smallint,
  "to_position" smallint,
  "dice_roll" json,
  "doubles_count" smallint,
  "passed_go" boolean,
  "jail_reason" varchar(20),
  "fine_amount" bigint,
  "building_type" varchar(10),
  "tax_type" varchar(50),
  "signature" varchar(88),
  "error" text,
  "slot" bigint,
  "timestamp" bigint NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "account_created_at" timestamp with time zone DEFAULT now(),
  "account_updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "games" (
  "pubkey" varchar(44) PRIMARY KEY NOT NULL,
  "game_id" bigint NOT NULL,
  "config_id" varchar(44) NOT NULL,
  "authority" varchar(44) NOT NULL,
  "bump" smallint NOT NULL,
  "max_players" smallint NOT NULL,
  "current_players" smallint DEFAULT 0,
  "current_turn" smallint DEFAULT 0,
  "players" json NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "game_status" "game_status" NOT NULL,
  "bank_balance" bigint DEFAULT 0,
  "free_parking_pool" bigint DEFAULT 0,
  "houses_remaining" smallint DEFAULT 32,
  "hotels_remaining" smallint DEFAULT 12,
  "time_limit" bigint,
  "turn_started_at" bigint NOT NULL,
  "winner" varchar(44),
  "account_created_at" timestamp with time zone DEFAULT now(),
  "account_updated_at" timestamp with time zone DEFAULT now(),
  "created_slot" bigint NOT NULL,
  "updated_slot" bigint NOT NULL,
  "last_signature" varchar(88)
);
--> statement-breakpoint
CREATE TABLE "integrator_configs" (
  "pubkey" varchar(44) PRIMARY KEY NOT NULL,
  "integrator_id" varchar(44) NOT NULL,
  "integrator" varchar(44) NOT NULL,
  "fee_basis_points" smallint NOT NULL,
  "fee_vault" varchar(44) NOT NULL,
  "total_games_created" bigint DEFAULT 0,
  "active_games_count" integer DEFAULT 0,
  "total_volume" bigint DEFAULT 0,
  "platform_fees_collected" bigint DEFAULT 0,
  "next_game_id" bigint DEFAULT 0,
  "bump" smallint NOT NULL,
  "account_created_at" timestamp with time zone DEFAULT now(),
  "account_updated_at" timestamp with time zone DEFAULT now(),
  "created_slot" bigint NOT NULL,
  "updated_slot" bigint NOT NULL,
  "last_signature" varchar(88)
);
--> statement-breakpoint
CREATE TABLE "platform_configs" (
  "pubkey" varchar(44) PRIMARY KEY NOT NULL,
  "id" varchar(44) NOT NULL,
  "fee_basis_points" smallint NOT NULL,
  "authority" varchar(44) NOT NULL,
  "fee_vault" varchar(44) NOT NULL,
  "total_games_created" bigint DEFAULT 0,
  "next_game_id" bigint DEFAULT 0,
  "bump" smallint NOT NULL,
  "account_created_at" timestamp with time zone DEFAULT now(),
  "account_updated_at" timestamp with time zone DEFAULT now(),
  "created_slot" bigint NOT NULL,
  "updated_slot" bigint NOT NULL,
  "last_signature" varchar(88)
);
--> statement-breakpoint
CREATE TABLE "player_passed_go_events" (
  "id" varchar(88) PRIMARY KEY NOT NULL,
  "player" varchar(44) NOT NULL,
  "game" varchar(44) NOT NULL,
  "salary_collected" bigint NOT NULL,
  "new_position" smallint NOT NULL,
  "timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "players" (
  "pubkey" varchar(44) PRIMARY KEY NOT NULL,
  "wallet" varchar(44) NOT NULL,
  "game" varchar(44) NOT NULL,
  "cash_balance" bigint DEFAULT 1500,
  "net_worth" bigint DEFAULT 1500,
  "position" smallint DEFAULT 0,
  "in_jail" boolean DEFAULT false,
  "jail_turns" smallint DEFAULT 0,
  "doubles_count" smallint DEFAULT 0,
  "is_bankrupt" boolean DEFAULT false,
  "properties_owned" json DEFAULT '[]'::json,
  "get_out_of_jail_cards" smallint DEFAULT 0,
  "has_rolled_dice" boolean DEFAULT false,
  "last_dice_roll" json DEFAULT '[0,0]'::json,
  "last_rent_collected" bigint NOT NULL,
  "festival_boost_turns" smallint DEFAULT 0,
  "card_drawn_at" bigint,
  "needs_property_action" boolean DEFAULT false,
  "pending_property_position" smallint,
  "needs_chance_card" boolean DEFAULT false,
  "needs_community_chest_card" boolean DEFAULT false,
  "needs_bankruptcy_check" boolean DEFAULT false,
  "needs_special_space_action" boolean DEFAULT false,
  "pending_special_space_position" smallint,
  "account_created_at" timestamp with time zone DEFAULT now(),
  "account_updated_at" timestamp with time zone DEFAULT now(),
  "created_slot" bigint NOT NULL,
  "updated_slot" bigint NOT NULL,
  "last_signature" varchar(88)
);
--> statement-breakpoint
CREATE TABLE "processing_queue" (
  "id" serial PRIMARY KEY NOT NULL,
  "account_pubkey" varchar(44) NOT NULL,
  "account_type" varchar(30) NOT NULL,
  "account_data" json NOT NULL,
  "event_type" varchar(20) NOT NULL,
  "slot" bigint NOT NULL,
  "signature" varchar(88),
  "status" varchar(20) DEFAULT 'pending',
  "retry_count" integer DEFAULT 0,
  "max_retries" integer DEFAULT 3,
  "error_message" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "processing_started_at" timestamp with time zone,
  "processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "properties" (
  "pubkey" varchar(44) PRIMARY KEY NOT NULL,
  "position" smallint NOT NULL,
  "owner" varchar(44),
  "price" smallint NOT NULL,
  "color_group" "color_group" NOT NULL,
  "property_type" "property_type" NOT NULL,
  "houses" smallint DEFAULT 0,
  "has_hotel" boolean DEFAULT false,
  "is_mortgaged" boolean DEFAULT false,
  "rent_base" smallint NOT NULL,
  "rent_with_color_group" smallint NOT NULL,
  "rent_with_houses" json NOT NULL,
  "rent_with_hotel" smallint NOT NULL,
  "house_cost" smallint NOT NULL,
  "mortgage_value" smallint NOT NULL,
  "last_rent_paid" bigint NOT NULL,
  "account_created_at" timestamp with time zone DEFAULT now(),
  "account_updated_at" timestamp with time zone DEFAULT now(),
  "created_slot" bigint NOT NULL,
  "updated_slot" bigint NOT NULL,
  "last_signature" varchar(88)
);
--> statement-breakpoint
CREATE TABLE "sync_status" (
  "id" serial PRIMARY KEY NOT NULL,
  "component" "sync_component" NOT NULL,
  "last_processed_slot" bigint,
  "last_processed_signature" varchar(88),
  "last_processed_timestamp" bigint,
  "accounts_processed" integer DEFAULT 0,
  "status" "sync_status_type" NOT NULL,
  "error_message" text,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "sync_status_component_unique" UNIQUE("component")
);
--> statement-breakpoint
CREATE TABLE "trades" (
  "pubkey" varchar(44) PRIMARY KEY NOT NULL,
  "game" varchar(44) NOT NULL,
  "proposer" varchar(44) NOT NULL,
  "receiver" varchar(44) NOT NULL,
  "trade_type" "trade_type" NOT NULL,
  "proposer_money" bigint DEFAULT 0,
  "receiver_money" bigint DEFAULT 0,
  "proposer_property" smallint,
  "receiver_property" smallint,
  "status" "trade_status" NOT NULL,
  "created_at" bigint NOT NULL,
  "expires_at" bigint NOT NULL,
  "bump" smallint NOT NULL,
  "account_created_at" timestamp with time zone DEFAULT now(),
  "account_updated_at" timestamp with time zone DEFAULT now(),
  "created_slot" bigint NOT NULL,
  "updated_slot" bigint NOT NULL,
  "last_signature" varchar(88)
);
--> statement-breakpoint
CREATE INDEX "idx_auction_game" ON "auctions" USING btree ("game");
--> statement-breakpoint
CREATE INDEX "idx_auction_property" ON "auctions" USING btree ("property_position");
--> statement-breakpoint
CREATE INDEX "idx_auction_bidder" ON "auctions" USING btree ("highest_bidder");
--> statement-breakpoint
CREATE INDEX "idx_auction_active" ON "auctions" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX "idx_auction_ends_at" ON "auctions" USING btree ("ends_at");
--> statement-breakpoint
CREATE INDEX "idx_auction_updated_at" ON "auctions" USING btree ("account_updated_at");
--> statement-breakpoint
CREATE INDEX "idx_auction_updated_slot" ON "auctions" USING btree ("updated_slot");
--> statement-breakpoint
CREATE INDEX "idx_chance_player" ON "chance_card_events" USING btree ("player");
--> statement-breakpoint
CREATE INDEX "idx_chance_game" ON "chance_card_events" USING btree ("game");
--> statement-breakpoint
CREATE INDEX "idx_chance_timestamp" ON "chance_card_events" USING btree ("timestamp");
--> statement-breakpoint
CREATE INDEX "idx_chance_created_at" ON "chance_card_events" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "idx_community_player" ON "community_chest_card_events" USING btree ("player");
--> statement-breakpoint
CREATE INDEX "idx_community_game" ON "community_chest_card_events" USING btree ("game");
--> statement-breakpoint
CREATE INDEX "idx_community_timestamp" ON "community_chest_card_events" USING btree ("timestamp");
--> statement-breakpoint
CREATE INDEX "idx_community_created_at" ON "community_chest_card_events" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "idx_game_event_game" ON "game_events" USING btree ("game");
--> statement-breakpoint
CREATE INDEX "idx_game_event_player" ON "game_events" USING btree ("player");
--> statement-breakpoint
CREATE INDEX "idx_game_event_type" ON "game_events" USING btree ("event_type");
--> statement-breakpoint
CREATE INDEX "idx_game_event_timestamp" ON "game_events" USING btree ("timestamp");
--> statement-breakpoint
CREATE INDEX "idx_game_event_slot" ON "game_events" USING btree ("slot");
--> statement-breakpoint
CREATE INDEX "idx_game_logs_game_id" ON "game_logs" USING btree ("game_id");
--> statement-breakpoint
CREATE INDEX "idx_game_logs_player_id" ON "game_logs" USING btree ("player_id");
--> statement-breakpoint
CREATE INDEX "idx_game_logs_type" ON "game_logs" USING btree ("type");
--> statement-breakpoint
CREATE INDEX "idx_game_logs_timestamp" ON "game_logs" USING btree ("timestamp");
--> statement-breakpoint
CREATE INDEX "idx_game_logs_position" ON "game_logs" USING btree ("position");
--> statement-breakpoint
CREATE INDEX "idx_game_logs_created_at" ON "game_logs" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "idx_game_id" ON "games" USING btree ("game_id");
--> statement-breakpoint
CREATE INDEX "idx_game_config_id" ON "games" USING btree ("config_id");
--> statement-breakpoint
CREATE INDEX "idx_game_authority" ON "games" USING btree ("authority");
--> statement-breakpoint
CREATE INDEX "idx_game_status" ON "games" USING btree ("game_status");
--> statement-breakpoint
CREATE INDEX "idx_current_turn" ON "games" USING btree ("current_turn");
--> statement-breakpoint
CREATE INDEX "idx_game_winner" ON "games" USING btree ("winner");
--> statement-breakpoint
CREATE INDEX "idx_game_created_at" ON "games" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "idx_game_updated_at" ON "games" USING btree ("account_updated_at");
--> statement-breakpoint
CREATE INDEX "idx_game_updated_slot" ON "games" USING btree ("updated_slot");
--> statement-breakpoint
CREATE INDEX "idx_integrator_id" ON "integrator_configs" USING btree ("integrator_id");
--> statement-breakpoint
CREATE INDEX "idx_integrator" ON "integrator_configs" USING btree ("integrator");
--> statement-breakpoint
CREATE INDEX "idx_integrator_total_games" ON "integrator_configs" USING btree ("total_games_created");
--> statement-breakpoint
CREATE INDEX "idx_integrator_active_games" ON "integrator_configs" USING btree ("active_games_count");
--> statement-breakpoint
CREATE INDEX "idx_platform_authority" ON "platform_configs" USING btree ("authority");
--> statement-breakpoint
CREATE INDEX "idx_platform_fee_vault" ON "platform_configs" USING btree ("fee_vault");
--> statement-breakpoint
CREATE INDEX "idx_next_game_id" ON "platform_configs" USING btree ("next_game_id");
--> statement-breakpoint
CREATE INDEX "idx_passed_go_player" ON "player_passed_go_events" USING btree ("player");
--> statement-breakpoint
CREATE INDEX "idx_passed_go_game" ON "player_passed_go_events" USING btree ("game");
--> statement-breakpoint
CREATE INDEX "idx_passed_go_timestamp" ON "player_passed_go_events" USING btree ("timestamp");
--> statement-breakpoint
CREATE INDEX "idx_passed_go_created_at" ON "player_passed_go_events" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "idx_player_wallet" ON "players" USING btree ("wallet");
--> statement-breakpoint
CREATE INDEX "idx_player_game" ON "players" USING btree ("game");
--> statement-breakpoint
CREATE INDEX "idx_player_position" ON "players" USING btree ("position");
--> statement-breakpoint
CREATE INDEX "idx_player_in_jail" ON "players" USING btree ("in_jail");
--> statement-breakpoint
CREATE INDEX "idx_player_cash_balance" ON "players" USING btree ("cash_balance");
--> statement-breakpoint
CREATE INDEX "idx_player_bankrupt" ON "players" USING btree ("is_bankrupt");
--> statement-breakpoint
CREATE INDEX "idx_player_updated_at" ON "players" USING btree ("account_updated_at");
--> statement-breakpoint
CREATE INDEX "idx_player_updated_slot" ON "players" USING btree ("updated_slot");
--> statement-breakpoint
CREATE INDEX "idx_processing_status_created" ON "processing_queue" USING btree ("status", "created_at");
--> statement-breakpoint
CREATE INDEX "idx_processing_account_pubkey" ON "processing_queue" USING btree ("account_pubkey");
--> statement-breakpoint
CREATE INDEX "idx_processing_slot" ON "processing_queue" USING btree ("slot");
--> statement-breakpoint
CREATE INDEX "idx_processing_event_type" ON "processing_queue" USING btree ("event_type");
--> statement-breakpoint
CREATE INDEX "idx_property_position" ON "properties" USING btree ("position");
--> statement-breakpoint
CREATE INDEX "idx_property_owner" ON "properties" USING btree ("owner");
--> statement-breakpoint
CREATE INDEX "idx_property_color_group" ON "properties" USING btree ("color_group");
--> statement-breakpoint
CREATE INDEX "idx_property_type" ON "properties" USING btree ("property_type");
--> statement-breakpoint
CREATE INDEX "idx_property_mortgaged" ON "properties" USING btree ("is_mortgaged");
--> statement-breakpoint
CREATE INDEX "idx_property_updated_at" ON "properties" USING btree ("account_updated_at");
--> statement-breakpoint
CREATE INDEX "idx_property_updated_slot" ON "properties" USING btree ("updated_slot");
--> statement-breakpoint
CREATE INDEX "idx_sync_component" ON "sync_status" USING btree ("component");
--> statement-breakpoint
CREATE INDEX "idx_sync_status" ON "sync_status" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "idx_sync_updated_at" ON "sync_status" USING btree ("updated_at");
--> statement-breakpoint
CREATE INDEX "idx_trade_game" ON "trades" USING btree ("game");
--> statement-breakpoint
CREATE INDEX "idx_trade_proposer" ON "trades" USING btree ("proposer");
--> statement-breakpoint
CREATE INDEX "idx_trade_receiver" ON "trades" USING btree ("receiver");
--> statement-breakpoint
CREATE INDEX "idx_trade_status" ON "trades" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "idx_trade_expires_at" ON "trades" USING btree ("expires_at");
--> statement-breakpoint
CREATE INDEX "idx_trade_updated_at" ON "trades" USING btree ("account_updated_at");
--> statement-breakpoint
CREATE INDEX "idx_trade_updated_slot" ON "trades" USING btree ("updated_slot");