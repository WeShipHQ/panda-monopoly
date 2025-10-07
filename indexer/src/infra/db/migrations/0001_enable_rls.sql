-- Enable RLS for all tables and create security policies
-- This migration enables Row Level Security (RLS) for all tables in the monopoly game database
-- Platform and config tables
ALTER TABLE platform_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrator_configs ENABLE ROW LEVEL SECURITY;
-- Core game tables  
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
-- Event and log tables
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chance_card_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_chest_card_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_passed_go_events ENABLE ROW LEVEL SECURITY;
-- Auction tables
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
-- Infrastructure tables
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
-- Create basic RLS policies (allow all operations for now - can be refined later)
-- Platform configs - only allow read access
CREATE POLICY "platform_configs_read_policy" ON platform_configs FOR
SELECT USING (true);
-- Games - allow read access to all, write access for indexer
CREATE POLICY "games_read_policy" ON games FOR
SELECT USING (true);
CREATE POLICY "games_write_policy" ON games FOR ALL USING (true);
-- Players - allow read access to all, write access for indexer  
CREATE POLICY "players_read_policy" ON players FOR
SELECT USING (true);
CREATE POLICY "players_write_policy" ON players FOR ALL USING (true);
-- Properties - allow read access to all, write access for indexer
CREATE POLICY "properties_read_policy" ON properties FOR
SELECT USING (true);
CREATE POLICY "properties_write_policy" ON properties FOR ALL USING (true);
-- Trades - allow read access to all, write access for indexer
CREATE POLICY "trades_read_policy" ON trades FOR
SELECT USING (true);
CREATE POLICY "trades_write_policy" ON trades FOR ALL USING (true);
-- Game events - allow read access to all, write access for indexer
CREATE POLICY "game_events_read_policy" ON game_events FOR
SELECT USING (true);
CREATE POLICY "game_events_write_policy" ON game_events FOR ALL USING (true);
-- Game logs - allow read access to all, write access for indexer
CREATE POLICY "game_logs_read_policy" ON game_logs FOR
SELECT USING (true);
CREATE POLICY "game_logs_write_policy" ON game_logs FOR ALL USING (true);
-- Event tables - allow read access to all, write access for indexer
CREATE POLICY "chance_card_events_read_policy" ON chance_card_events FOR
SELECT USING (true);
CREATE POLICY "chance_card_events_write_policy" ON chance_card_events FOR ALL USING (true);
CREATE POLICY "community_chest_card_events_read_policy" ON community_chest_card_events FOR
SELECT USING (true);
CREATE POLICY "community_chest_card_events_write_policy" ON community_chest_card_events FOR ALL USING (true);
CREATE POLICY "player_passed_go_events_read_policy" ON player_passed_go_events FOR
SELECT USING (true);
CREATE POLICY "player_passed_go_events_write_policy" ON player_passed_go_events FOR ALL USING (true);
-- Auctions - allow read access to all, write access for indexer
CREATE POLICY "auctions_read_policy" ON auctions FOR
SELECT USING (true);
CREATE POLICY "auctions_write_policy" ON auctions FOR ALL USING (true);
-- Integrator configs - only allow read access
CREATE POLICY "integrator_configs_read_policy" ON integrator_configs FOR
SELECT USING (true);
-- Infrastructure tables - allow full access for system operations
CREATE POLICY "processing_queue_policy" ON processing_queue FOR ALL USING (true);
CREATE POLICY "sync_status_policy" ON sync_status FOR ALL USING (true);