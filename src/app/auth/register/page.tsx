'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '../actions';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { AlertCircle, Loader2 } from 'lucide-react';

interface Institution {
  id: string;
  name: string;
  type: string;
  city: string | null;
  state: string | null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    institutionId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load institutions
  useEffect(() => {
    async function loadInstitutions() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('institutions')
        .select('id, name, type, city, state')
        .order('name');

      if (error) {
        toast.error('Gagal memuatkan senarai institusi');
        console.error(error);
      } else {
        setInstitutions(data || []);
      }
      setLoadingInstitutions(false);
    }

    loadInstitutions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama penuh diperlukan';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email diperlukan';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak sah';
    }

    if (!formData.password) {
      newErrors.password = 'Kata laluan diperlukan';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Kata laluan mestilah sekurang-kurangnya 8 aksara';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Kata laluan tidak sepadan';
    }

    if (!formData.institutionId) {
      newErrors.institutionId = 'Sila pilih institusi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        institutionId: formData.institutionId,
      });

      if (result.success) {
        toast.success('Pendaftaran berjaya! Sila log masuk.');
        router.push('/auth/login');
      } else {
        toast.error(result.error || 'Pendaftaran gagal');
      }
    } catch (error) {
      toast.error('Ralat tidak dijangka berlaku');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Akaun</h1>
            <p className="text-gray-600">Cipta akaun ArenaHub anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Penuh
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ahmad bin Abdullah"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ahmad@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Institution */}
            <div>
              <label htmlFor="institutionId" className="block text-sm font-medium text-gray-700 mb-1">
                Institusi
              </label>
              {loadingInstitutions ? (
                <div className="flex items-center gap-2 text-gray-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memuatkan institusi...</span>
                </div>
              ) : (
                <>
                  <select
                    id="institutionId"
                    name="institutionId"
                    value={formData.institutionId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.institutionId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih institusi anda</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} - {inst.city}, {inst.state}
                      </option>
                    ))}
                  </select>
                  {errors.institutionId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.institutionId}
                    </p>
                  )}
                  {institutions.length === 0 && !loadingInstitutions && (
                    <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Tiada institusi dijumpai. Sila hubungi admin.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Kata Laluan
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Minimum 8 aksara"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Sahkan Kata Laluan
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan semula kata laluan"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || loadingInstitutions || institutions.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Sudah mempunyai akaun?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Log Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
