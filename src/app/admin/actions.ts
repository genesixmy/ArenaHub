'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export interface AdminActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Approve lecturer application
 */
export async function approveLecturerApplication(applicationId: string): Promise<AdminActionResult> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    // Get application details
    const { data: application, error: appError } = await supabase
      .from('lecturer_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return { success: false, error: 'Permohonan tidak dijumpai' };
    }

    // Update application status
    const { error: updateAppError } = await supabase
      .from('lecturer_applications')
      .update({
        status: 'approved',
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateAppError) {
      return { success: false, error: updateAppError.message };
    }

    // Update user role to lecturer
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ role: 'lecturer' })
      .eq('id', application.user_id);

    if (updateUserError) {
      return { success: false, error: updateUserError.message };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ralat tidak dijangka' };
  }
}

/**
 * Reject lecturer application
 */
export async function rejectLecturerApplication(
  applicationId: string,
  reason?: string
): Promise<AdminActionResult> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('lecturer_applications')
      .update({
        status: 'rejected',
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason || null,
      })
      .eq('id', applicationId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ralat tidak dijangka' };
  }
}

/**
 * Create new institution
 */
export async function createInstitution(formData: {
  name: string;
  type: string;
  city?: string;
  state?: string;
  description?: string;
}): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const slug = generateSlug(formData.name);

    // Check if institution with same name exists
    const { data: existing } = await supabase
      .from('institutions')
      .select('id')
      .eq('name', formData.name)
      .single();

    if (existing) {
      return { success: false, error: 'Institusi dengan nama yang sama sudah wujud' };
    }

    const { data, error } = await supabase
      .from('institutions')
      .insert({
        name: formData.name,
        slug: slug,
        type: formData.type,
        city: formData.city || null,
        state: formData.state || null,
        description: formData.description || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ralat tidak dijangka' };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, newRole: 'student' | 'lecturer' | 'admin'): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ralat tidak dijangka' };
  }
}
