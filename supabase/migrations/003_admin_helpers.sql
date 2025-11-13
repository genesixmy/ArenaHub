-- ArenaHub Admin Helpers
-- Migration: Helper functions for creating and managing admin accounts

-- ============================================================================
-- HELPER FUNCTION: Promote user to admin by email
-- ============================================================================

-- Function to promote a user to admin role
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE users
    SET role = 'admin'
    WHERE email = user_email;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    RAISE NOTICE 'User % has been promoted to admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote a user to lecturer role
CREATE OR REPLACE FUNCTION promote_user_to_lecturer(user_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE users
    SET role = 'lecturer'
    WHERE email = user_email;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    RAISE NOTICE 'User % has been promoted to lecturer', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to list all users with their roles
CREATE OR REPLACE FUNCTION list_all_users()
RETURNS TABLE (
    user_id UUID,
    email VARCHAR,
    full_name VARCHAR,
    role user_role,
    institution_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        u.full_name,
        u.role,
        i.name as institution_name,
        u.created_at
    FROM users u
    LEFT JOIN institutions i ON u.institution_id = i.id
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USAGE EXAMPLES (Comment these out after reading)
-- ============================================================================

-- Example 1: Promote a user to admin
-- SELECT promote_user_to_admin('admin@example.com');

-- Example 2: Promote a user to lecturer
-- SELECT promote_user_to_lecturer('lecturer@utm.my');

-- Example 3: List all users
-- SELECT * FROM list_all_users();

-- Example 4: Direct UPDATE (if functions don't work)
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
