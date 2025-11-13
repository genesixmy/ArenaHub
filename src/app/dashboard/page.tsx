import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Trophy, Users, Calendar, Award, LogOut, User, Shield } from 'lucide-react';
import { logoutUser } from '../auth/actions';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  const supabase = await createClient();

  // Get user's institution
  const { data: institution } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', user.institution_id || '')
    .single();

  // Get user's teams
  const { data: teams } = await supabase
    .from('team_members')
    .select('*, teams(*)')
    .eq('user_id', user.id);

  // Get active tournaments
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .in('status', ['registration', 'ongoing'])
    .order('tournament_start', { ascending: true })
    .limit(5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard ArenaHub</h1>
              <p className="text-sm text-gray-600 mt-1">
                Selamat datang, {user.full_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Panel Admin
                </Link>
              )}
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Keluar
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.full_name}</h2>
                  <p className="text-blue-100">@{user.username}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm">
                  <span className="font-semibold">Peranan:</span>{' '}
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {user.role === 'student' && 'Pelajar'}
                    {user.role === 'lecturer' && 'Pensyarah'}
                    {user.role === 'admin' && 'Admin'}
                  </span>
                </p>
                {institution && (
                  <p className="text-sm">
                    <span className="font-semibold">Institusi:</span> {institution.name}
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/profile"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              Edit Profil
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/teams/create"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Cipta Pasukan</h3>
            <p className="text-sm text-gray-600">
              Bentuk pasukan baharu dan jemput ahli
            </p>
          </Link>

          <Link
            href="/tournaments"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Lihat Tournament</h3>
            <p className="text-sm text-gray-600">
              Cari dan sertai tournament
            </p>
          </Link>

          {(user.role === 'lecturer' || user.role === 'admin') && (
            <Link
              href="/tournaments/create"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Cipta Tournament</h3>
              <p className="text-sm text-gray-600">
                Anjurkan kejohanan baharu
              </p>
            </Link>
          )}

          {user.role === 'student' && (
            <Link
              href="/apply-lecturer"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Mohon Jadi Lecturer</h3>
              <p className="text-sm text-gray-600">
                Cipta dan urus tournament
              </p>
            </Link>
          )}
        </div>

        {/* My Teams */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pasukan Saya</h2>
          {teams && teams.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((teamMember: any) => (
                <Link
                  key={teamMember.id}
                  href={`/teams/${teamMember.teams.slug}`}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900">{teamMember.teams.name}</h3>
                  {teamMember.teams.tag && (
                    <p className="text-sm text-gray-600">[{teamMember.teams.tag}]</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {teamMember.role === 'captain' ? 'Kapten' : 'Ahli'}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">Anda belum menyertai mana-mana pasukan</p>
              <Link
                href="/teams/create"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Cipta Pasukan Sekarang →
              </Link>
            </div>
          )}
        </div>

        {/* Active Tournaments */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tournament Aktif</h2>
          {tournaments && tournaments.length > 0 ? (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.slug}`}
                  className="block bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{tournament.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{tournament.game_category}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Max: {tournament.max_teams} teams</span>
                        <span>Format: {tournament.bracket_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tournament.status === 'registration'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {tournament.status === 'registration' ? 'Pendaftaran Dibuka' : 'Sedang Berlangsung'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">Tiada tournament aktif pada masa ini</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
