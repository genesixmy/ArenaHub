'use client';

import { useState } from 'react';
import { approveLecturerApplication, rejectLecturerApplication } from '../actions';
import toast from 'react-hot-toast';
import { Check, X, Loader2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Application {
  id: string;
  full_name: string;
  phone_number: string;
  staff_id: string | null;
  department: string | null;
  reason: string | null;
  created_at: string;
  users: {
    full_name: string;
    email: string;
    username: string | null;
  } | null;
  institutions: {
    name: string;
  } | null;
}

interface Props {
  applications: Application[];
}

export default function LecturerApplicationsTable({ applications }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (applicationId: string) => {
    setLoading(applicationId);
    try {
      const result = await approveLecturerApplication(applicationId);
      if (result.success) {
        toast.success('Permohonan diluluskan!');
      } else {
        toast.error(result.error || 'Gagal meluluskan permohonan');
      }
    } catch (error) {
      toast.error('Ralat tidak dijangka');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    const reason = prompt('Alasan penolakan (pilihan):');
    setLoading(applicationId);
    try {
      const result = await rejectLecturerApplication(applicationId, reason || undefined);
      if (result.success) {
        toast.success('Permohonan ditolak');
      } else {
        toast.error(result.error || 'Gagal menolak permohonan');
      }
    } catch (error) {
      toast.error('Ralat tidak dijangka');
    } finally {
      setLoading(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Tiada permohonan pending pada masa ini
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pemohon
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Institusi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Telefon
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tarikh
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tindakan
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">{app.full_name}</div>
                  <div className="text-sm text-gray-500">{app.users?.email}</div>
                  {app.staff_id && (
                    <div className="text-xs text-gray-400">ID: {app.staff_id}</div>
                  )}
                  {app.department && (
                    <div className="text-xs text-gray-400">{app.department}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {app.institutions?.name || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {app.phone_number}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDateTime(app.created_at)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleApprove(app.id)}
                    disabled={loading === app.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading === app.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Lulus
                  </button>
                  <button
                    onClick={() => handleReject(app.id)}
                    disabled={loading === app.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Tolak
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
