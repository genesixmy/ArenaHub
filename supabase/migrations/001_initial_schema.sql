-- ArenaHub Database Schema
-- Migration: Initial Schema Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'admin');

-- Lecturer application status
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- Tournament status
CREATE TYPE tournament_status AS ENUM ('draft', 'registration', 'ongoing', 'completed', 'cancelled');

-- Tournament bracket types
CREATE TYPE bracket_type AS ENUM ('single_elimination', 'double_elimination', 'round_robin', 'group_stage');

-- Match status
CREATE TYPE match_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');

-- Team member role
CREATE TYPE team_role AS ENUM ('captain', 'member');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Institutions (Schools/Universities)
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- 'school', 'university', 'college'
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    logo_url TEXT,
    banner_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    secondary_color VARCHAR(7) DEFAULT '#1E40AF',
    description TEXT,
    website_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (extends Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    role user_role DEFAULT 'student',
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    avatar_url TEXT,
    phone_number VARCHAR(20),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lecturer role applications
CREATE TABLE lecturer_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    staff_id VARCHAR(100), -- Employee/Staff ID
    department VARCHAR(255),
    supporting_document_url TEXT,
    reason TEXT,
    status application_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, status) -- One pending application per user
);

-- Tournaments
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    game_category VARCHAR(100) NOT NULL, -- 'Mobile Legends', 'Valorant', 'PUBG Mobile', etc.
    banner_url TEXT,
    logo_url TEXT,

    -- Organizer info
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,

    -- Tournament settings
    bracket_type bracket_type NOT NULL DEFAULT 'single_elimination',
    max_teams INTEGER NOT NULL DEFAULT 16,
    team_size INTEGER NOT NULL DEFAULT 5, -- Players per team

    -- Tournament dates
    registration_start TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
    tournament_start TIMESTAMP WITH TIME ZONE NOT NULL,
    tournament_end TIMESTAMP WITH TIME ZONE,

    -- Status
    status tournament_status DEFAULT 'draft',

    -- Prize info (optional)
    prize_pool DECIMAL(10, 2),
    prize_currency VARCHAR(3) DEFAULT 'MYR',
    prize_description TEXT,

    -- Rules & requirements
    rules TEXT,
    requirements TEXT,

    -- Branding
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),

    -- Meta
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    tag VARCHAR(10), -- Team tag/abbreviation (e.g., 'TSM', 'FNC')
    logo_url TEXT,
    banner_url TEXT,

    -- Team info
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    captain_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Settings
    is_recruiting BOOLEAN DEFAULT FALSE,
    max_members INTEGER DEFAULT 10,

    -- Meta
    description TEXT,
    social_links JSONB, -- {discord: '', twitter: '', instagram: ''}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role team_role DEFAULT 'member',
    in_game_name VARCHAR(100),
    in_game_id VARCHAR(100),
    position VARCHAR(50), -- 'Tank', 'Marksman', 'Mage', etc. (game-specific)
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id) -- User can only join a team once
);

-- Tournament participants (teams in tournaments)
CREATE TABLE tournament_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    -- Registration info
    registered_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Status
    is_approved BOOLEAN DEFAULT TRUE, -- Auto-approve or manual approval
    is_checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP WITH TIME ZONE,

    -- Seeding (for bracket positioning)
    seed_number INTEGER,

    -- Stats (to be updated during tournament)
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0, -- For round robin/group stage

    UNIQUE(tournament_id, team_id) -- Team can only join a tournament once
);

-- Matches (bracket games)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,

    -- Match info
    round INTEGER NOT NULL, -- 1 = Finals, 2 = Semi-finals, 3 = Quarter-finals, etc.
    match_number INTEGER NOT NULL, -- Position in bracket
    best_of INTEGER DEFAULT 1, -- Best of 1, 3, 5, etc.

    -- Teams
    team1_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    team2_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,

    -- Scores
    team1_score INTEGER DEFAULT 0,
    team2_score INTEGER DEFAULT 0,

    -- Match status
    status match_status DEFAULT 'scheduled',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Bracket positioning
    next_match_id UUID REFERENCES matches(id) ON DELETE SET NULL, -- Winner advances to this match
    losers_match_id UUID REFERENCES matches(id) ON DELETE SET NULL, -- For double elimination

    -- Meta
    notes TEXT,
    stream_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tournament_id, round, match_number)
);

-- Match games (individual games in a best-of series)
CREATE TABLE match_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    game_number INTEGER NOT NULL, -- Game 1, 2, 3, etc.

    -- Game result
    winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    team1_score INTEGER, -- Game-specific score (kills, etc.)
    team2_score INTEGER,

    -- Game stats (flexible JSON for game-specific data)
    game_data JSONB, -- MVP, kills, deaths, objectives, etc.

    -- Proof
    screenshot_url TEXT,
    video_url TEXT,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(match_id, game_number)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_lecturer_applications_user ON lecturer_applications(user_id);
CREATE INDEX idx_lecturer_applications_status ON lecturer_applications(status);
CREATE INDEX idx_lecturer_applications_institution ON lecturer_applications(institution_id);

CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX idx_tournaments_institution ON tournaments(institution_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_game ON tournaments(game_category);
CREATE INDEX idx_tournaments_dates ON tournaments(tournament_start, tournament_end);

CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_teams_institution ON teams(institution_id);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_team ON tournament_participants(team_id);

CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_teams ON matches(team1_id, team2_id);
CREATE INDEX idx_matches_status ON matches(status);

CREATE INDEX idx_match_games_match ON match_games(match_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_games ENABLE ROW LEVEL SECURITY;

-- Institutions: Public read, admin write
CREATE POLICY "Institutions are viewable by everyone"
    ON institutions FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert institutions"
    ON institutions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update institutions"
    ON institutions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Users: Users can view all, update own profile
CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Admins can update any user (for role changes)
CREATE POLICY "Admins can update any user"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Lecturer Applications: Users can view own and submit, admins can view all
CREATE POLICY "Users can view own applications"
    ON lecturer_applications FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can submit applications"
    ON lecturer_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update applications"
    ON lecturer_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Tournaments: Public read, lecturers/admins can create
CREATE POLICY "Tournaments are viewable by everyone"
    ON tournaments FOR SELECT
    USING (true);

CREATE POLICY "Lecturers and admins can create tournaments"
    ON tournaments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('lecturer', 'admin')
        )
    );

CREATE POLICY "Tournament organizers can update their tournaments"
    ON tournaments FOR UPDATE
    USING (
        auth.uid() = organizer_id
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Teams: Public read, students can create
CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

CREATE POLICY "Students can create teams"
    ON teams FOR INSERT
    WITH CHECK (
        auth.uid() = captain_id
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Team captains can update their teams"
    ON teams FOR UPDATE
    USING (auth.uid() = captain_id);

-- Team Members: Public read, team operations
CREATE POLICY "Team members are viewable by everyone"
    ON team_members FOR SELECT
    USING (true);

CREATE POLICY "Team captains can add members"
    ON team_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_id
            AND teams.captain_id = auth.uid()
        )
    );

CREATE POLICY "Team captains can remove members"
    ON team_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_id
            AND teams.captain_id = auth.uid()
        )
    );

-- Tournament Participants: Public read, teams can register
CREATE POLICY "Tournament participants are viewable by everyone"
    ON tournament_participants FOR SELECT
    USING (true);

CREATE POLICY "Team captains can register for tournaments"
    ON tournament_participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_id
            AND teams.captain_id = auth.uid()
        )
    );

-- Matches: Public read, organizers can update
CREATE POLICY "Matches are viewable by everyone"
    ON matches FOR SELECT
    USING (true);

CREATE POLICY "Tournament organizers can manage matches"
    ON matches FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE tournaments.id = tournament_id
            AND tournaments.organizer_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Match Games: Public read, organizers can update
CREATE POLICY "Match games are viewable by everyone"
    ON match_games FOR SELECT
    USING (true);

CREATE POLICY "Tournament organizers can manage match games"
    ON match_games FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM matches
            JOIN tournaments ON tournaments.id = matches.tournament_id
            WHERE matches.id = match_id
            AND tournaments.organizer_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lecturer_applications_updated_at BEFORE UPDATE ON lecturer_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-create team captain as member
CREATE OR REPLACE FUNCTION auto_add_captain_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (NEW.id, NEW.captain_id, 'captain');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_add_captain
    AFTER INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION auto_add_captain_as_member();

-- Function: Generate slug from title/name
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(text_input, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
