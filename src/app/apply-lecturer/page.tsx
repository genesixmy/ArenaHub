'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { submitLecturerApplication } from '../auth/actions';
import toast from 'react-hot-toast';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Institution {
  id: string;
  name: string;
  type: string;
  city: string | null;
  state: string | null;
}

export default function ApplyLecturerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    institutionId: '',
    phoneNumber: '',
    staffId: '',
    department: '',
    reason: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama penuh diperlukan';
    }

    if (!formData.institutionId) {
      newErrors.institutionId = 'Sila pilih institusi';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Nombor telefon diperlukan';
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
      const result = await submitLecturerApplication({
        fullName: formData.fullName,
        institutionId: formData.institutionId,
        phoneNumber: formData.phoneNumber,
        staffId: formData.staffId || undefined,
        department: formData.department || undefined,
        reason: formData.reason || undefined,
      });

      if (result.success) {
        toast.success('Permohonan berjaya dihantar!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Permohonan gagal');
      }
    } catch (error) {
      toast.error('Ralat tidak dijangka berlaku');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mohon Peranan Lecturer</h1>
            <p className="text-gray-600">
              Lengkapkan borang di bawah untuk memohon peranan lecturer.
              Admin akan menyemak dan meluluskan permohonan anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Penuh <span className="text-red-500">*</span>
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
                placeholder="Dr. Ahmad bin Abdullah"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Institution */}
            <div>
              <label htmlFor="institutionId" className="block text-sm font-medium text-gray-700 mb-1">
                Institusi <span className="text-red-500">*</span>
              </label>
              {loadingInstitutions ? (
                <div className="flex items-center gap-2 text-gray-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memuatkan institusi...</span>
                </div>
              ) : (
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
              )}
              {errors.institutionId && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.institutionId}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Nombor Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="012-3456789"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Staff ID */}
            <div>
              <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-1">
                ID Kakitangan (Pilihan)
              </label>
              <input
                type="text"
                id="staffId"
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Staff001"
              />
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan (Pilihan)
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Fakulti Kejuruteraan Komputer"
              />
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Alasan Permohonan (Pilihan)
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Saya ingin menganjurkan kejohanan esports untuk pelajar..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading || loadingInstitutions}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menghantar...
                  </>
                ) : (
                  'Hantar Permohonan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
