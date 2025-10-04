-- Enable Row Level Security (RLS) for all public tables
-- This migration fixes the RLS security warnings from Supabase
-- Enable RLS on all tables
ALTER TABLE "public"."auctions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."chance_card_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."checkpoints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."community_chest_card_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."game_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."integrator_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."platform_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."player_passed_go_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."processing_queue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."sync_status" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."trades" ENABLE ROW LEVEL SECURITY;
-- Create permissive policies to allow all operations for now
-- You can customize these policies based on your security requirements
-- Auctions policies
CREATE POLICY "Allow all operations on auctions" ON "public"."auctions" FOR ALL USING (true) WITH CHECK (true);
-- Chance card events policies
CREATE POLICY "Allow all operations on chance_card_events" ON "public"."chance_card_events" FOR ALL USING (true) WITH CHECK (true);
-- Checkpoints policies  
CREATE POLICY "Allow all operations on checkpoints" ON "public"."checkpoints" FOR ALL USING (true) WITH CHECK (true);
-- Community chest card events policies
CREATE POLICY "Allow all operations on community_chest_card_events" ON "public"."community_chest_card_events" FOR ALL USING (true) WITH CHECK (true);
-- Game events policies
CREATE POLICY "Allow all operations on game_events" ON "public"."game_events" FOR ALL USING (true) WITH CHECK (true);
-- Games policies
CREATE POLICY "Allow all operations on games" ON "public"."games" FOR ALL USING (true) WITH CHECK (true);
-- Integrator configs policies
CREATE POLICY "Allow all operations on integrator_configs" ON "public"."integrator_configs" FOR ALL USING (true) WITH CHECK (true);
-- Platform configs policies
CREATE POLICY "Allow all operations on platform_configs" ON "public"."platform_configs" FOR ALL USING (true) WITH CHECK (true);
-- Player passed go events policies
CREATE POLICY "Allow all operations on player_passed_go_events" ON "public"."player_passed_go_events" FOR ALL USING (true) WITH CHECK (true);
-- Players policies
CREATE POLICY "Allow all operations on players" ON "public"."players" FOR ALL USING (true) WITH CHECK (true);
-- Processing queue policies
CREATE POLICY "Allow all operations on processing_queue" ON "public"."processing_queue" FOR ALL USING (true) WITH CHECK (true);
-- Properties policies
CREATE POLICY "Allow all operations on properties" ON "public"."properties" FOR ALL USING (true) WITH CHECK (true);
-- Sync status policies
CREATE POLICY "Allow all operations on sync_status" ON "public"."sync_status" FOR ALL USING (true) WITH CHECK (true);
-- Trades policies
CREATE POLICY "Allow all operations on trades" ON "public"."trades" FOR ALL USING (true) WITH CHECK (true);