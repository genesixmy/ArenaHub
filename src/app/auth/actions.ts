'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { generateSlug } from '@/lib/utils';

export interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Register new user
 */
export async function registerUser(formData: {
  email: string;
  password: string;
  fullName: string;
  institutionId: string;
}): Promise<AuthResult> {
  const supabase = await createClient();

  try {
    // 1. Create auth user with metadata
    // The database trigger will automatically create the user profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          institution_id: formData.institutionId,
          role: 'student',
        },
      },
    });

    if (authError) {
      // Provide helpful error messages for common issues
      let errorMessage = authError.message;

      if (authError.message.includes('Email signups are disabled')) {
        errorMessage =
          'Email signup tidak diaktifkan. Sila aktifkan di Supabase Dashboard:\n' +
          '1. Pergi ke Authentication > Providers\n' +
          '2. Pastikan Email provider ENABLED\n' +
          '3. Pergi ke Authentication > Settings\n' +
          '4. Enable "Enable email signup"\n' +
          '5. Klik Save';
      } else if (authError.message.includes('Email not confirmed')) {
        errorMessage =
          'Email perlu disahkan. Untuk development, disable "Enable Email Confirmations" ' +
          'di Supabase Dashboard > Authentication > Settings';
      }

      return { success: false, error: errorMessage };
    }

    if (!authData.user) {
      return { success: false, error: 'Gagal membuat akaun' };
    }

    // Note: User profile is automatically created by database trigger (handle_new_user)
    // The trigger reads user metadata and creates the profile with all fields including institution_id

    return {
      success: true,
      data: { user: authData.user },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ralat tidak dijangka' };
  }
}

/**
 * Login user
 */
export async function loginUser(formData: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Gagal log masuk' };
    }

    // Revalidate paths to ensure server-side auth state is refreshed
    revalidatePath('/', 'layout');
    revalidatePath('/dashboard');

    // Return success - client will trigger router refresh for middleware to pick up auth
    return {
      success: true,
      data: { user: data.user },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ralat tidak dijangka' };
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<AuthResult> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ralat tidak dijangka' };
  }
}

/**
 * Submit lecturer application
 */
export async function submitLecturerApplication(formData: {
  fullName: string;
  institutionId: string;
  phoneNumber: string;
  staffId?: string;
  department?: string;
  reason?: string;
}): Promise<AuthResult> {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Anda perlu log masuk terlebih dahulu' };
    }

    // Check if user already has a pending application
    const { data: existingApp } = await supabase
      .from('lecturer_applications')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingApp) {
      return { success: false, error: 'Anda sudah mempunyai permohonan yang sedang diproses' };
    }

    // Create application
    const { error } = await supabase.from('lecturer_applications').insert({
      user_id: user.id,
      full_name: formData.fullName,
      institution_id: formData.institutionId,
      phone_number: formData.phoneNumber,
      staff_id: formData.staffId || null,
      department: formData.department || null,
      reason: formData.reason || null,
      status: 'pending',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ralat tidak dijangka' };
  }
}
