import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Users, Building2, FileCheck, UserCog } from 'lucide-react';
import LecturerApplicationsTable from './components/LecturerApplicationsTable';
import CreateInstitutionForm from './components/CreateInstitutionForm';

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  // Get pending lecturer applications
  const { data: pendingApplications } = await supabase
    .from('lecturer_applications')
    .select(`
      *,
      users (
        id,
        full_name,
        email,
        username
      ),
      institutions (
        name
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Get all users count
  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Get institutions count
  const { count: institutionsCount } = await supabase
    .from('institutions')
    .select('*', { count: 'exact', head: true });

  // Get tournaments count
  const { count: tournamentsCount } = await supabase
    .from('tournaments')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Panel Admin</h1>
          <p className="text-purple-100 mt-1">Urus pengguna, institusi, dan permohonan</p>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Jumlah Pengguna</p>
                <p className="text-2xl font-bold text-gray-900">{usersCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Institusi</p>
                <p className="text-2xl font-bold text-gray-900">{institutionsCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tournament</p>
                <p className="text-2xl font-bold text-gray-900">{tournamentsCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <UserCog className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Permohonan Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingApplications?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lecturer Applications */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Permohonan Lecturer</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <LecturerApplicationsTable applications={pendingApplications || []} />
          </div>
        </div>

        {/* Create Institution */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Institusi Baharu</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <CreateInstitutionForm />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Link
            href="/admin/users"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Urus Pengguna</h3>
            <p className="text-sm text-gray-600">Lihat dan ubah peranan pengguna</p>
          </Link>

          <Link
            href="/admin/institutions"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Urus Institusi</h3>
            <p className="text-sm text-gray-600">Edit maklumat institusi</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
