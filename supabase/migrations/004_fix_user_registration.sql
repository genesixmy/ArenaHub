-- Migration: Fix user registration RLS issue
-- This migration adds a trigger to automatically create user profile on signup

-- ============================================================================
-- DROP OLD POLICY (if needed to recreate)
-- ============================================================================

-- We'll keep the existing policies but add a trigger-based approach

-- ============================================================================
-- TRIGGER FUNCTION: Auto-create user profile on auth signup
-- ============================================================================

-- This function will be called whenever a new user signs up via Supabase Auth
-- It automatically creates a corresponding row in the public.users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, username, role, institution_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    -- Generate username from email prefix + random string
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1) || '-' || substring(NEW.id::text from 1 for 8)
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
    -- Handle institution_id from metadata (can be UUID string or null)
    CASE
      WHEN NEW.raw_user_meta_data->>'institution_id' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'institution_id')::UUID
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Call handle_new_user on auth.users insert
-- ============================================================================

-- Drop trigger if it already exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- UPDATE RLS POLICY: Allow trigger to insert
-- ============================================================================

-- The trigger function uses SECURITY DEFINER so it can bypass RLS
-- But let's also ensure the policy is correct for manual operations

-- This policy already exists but let's document that it allows
-- authenticated users to insert their own profile
-- (policy from line 343-345 of 001_initial_schema.sql)
