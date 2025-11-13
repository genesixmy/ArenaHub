// Authentication helper functions
import { createClient as createServerClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type User = Database['public']['Tables']['users']['Row'];

/**
 * Get current user from server-side
 * Use this in Server Components and Server Actions
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  // Get user profile from users table
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Check if user has required role
 */
export async function requireRole(allowedRoles: User['role'][]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not authenticated');
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Unauthorized: Required role is one of [${allowedRoles.join(', ')}]`);
  }

  return user;
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
  return requireRole(['admin']);
}

/**
 * Check if user is lecturer or admin
 */
export async function requireLecturerOrAdmin() {
  return requireRole(['lecturer', 'admin']);
}
