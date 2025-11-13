import Link from 'next/link';
import { Trophy, Users, Calendar, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Platform Esports Malaysia</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Selamat Datang ke{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ArenaHub
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Platform pengurusan kejohanan esports yang fokus kepada sekolah dan universiti di Malaysia.
            Atur, urus, dan sertai tournament dengan mudah!
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/auth/login"
              className="bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-blue-600 transition-colors"
            >
              Log Masuk
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Urus Tournament
            </h3>
            <p className="text-gray-600">
              Cipta dan urus kejohanan dengan sistem bracket automatik. Sokong pelbagai format seperti single/double elimination.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bentuk Pasukan
            </h3>
            <p className="text-gray-600">
              Cipta pasukan anda, jemput ahli, dan daftar untuk kejohanan. Urus roster dan statistik dengan mudah.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Jejak Prestasi
            </h3>
            <p className="text-gray-600">
              Lihat statistik pasukan dan pemain. Paparan keputusan real-time dan sejarah pertandingan lengkap.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-blue-100">Institusi</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Pasukan</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Tournament</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2K+</div>
              <div className="text-blue-100">Pemain</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; 2025 ArenaHub. Platform esports untuk institusi pendidikan Malaysia.
          </p>
        </div>
      </footer>
    </div>
  );
}
