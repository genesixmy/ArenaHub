-- ArenaHub Seed Data
-- Migration: Sample data for development and testing

-- ============================================================================
-- INSTITUTIONS
-- ============================================================================

INSERT INTO institutions (id, name, slug, type, city, state, logo_url, primary_color, secondary_color, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Universiti Teknologi Malaysia', 'utm', 'university', 'Johor Bahru', 'Johor', 'https://upload.wikimedia.org/wikipedia/en/3/3e/UTM_LOGO.png', '#DC143C', '#8B0000', 'Leading research university in Malaysia'),
('550e8400-e29b-41d4-a716-446655440002', 'Universiti Malaya', 'um', 'university', 'Kuala Lumpur', 'Wilayah Persekutuan', 'https://upload.wikimedia.org/wikipedia/en/e/e4/University_of_Malaya_coat_of_arms.png', '#0066CC', '#003366', 'Oldest university in Malaysia'),
('550e8400-e29b-41d4-a716-446655440003', 'SMK Bandar Utama Damansara', 'smk-bud', 'school', 'Petaling Jaya', 'Selangor', null, '#0066FF', '#003399', 'Secondary school in Petaling Jaya'),
('550e8400-e29b-41d4-a716-446655440004', 'Universiti Kebangsaan Malaysia', 'ukm', 'university', 'Bangi', 'Selangor', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/UKM_Logo.png', '#006633', '#003319', 'National University of Malaysia'),
('550e8400-e29b-41d4-a716-446655440005', 'Universiti Sains Malaysia', 'usm', 'university', 'George Town', 'Pulau Pinang', 'https://upload.wikimedia.org/wikipedia/commons/6/6c/USM_Logo.png', '#CC0000', '#990000', 'Premier university in northern Malaysia');

-- ============================================================================
-- SAMPLE GAME CATEGORIES
-- ============================================================================

-- Note: Game categories are stored as VARCHAR in tournaments table.
-- Common games in Malaysia esports scene:
-- - Mobile Legends: Bang Bang (MLBB)
-- - Valorant
-- - PUBG Mobile
-- - League of Legends (LoL)
-- - Dota 2
-- - Free Fire
-- - Call of Duty Mobile
-- - Tekken
-- - Street Fighter
