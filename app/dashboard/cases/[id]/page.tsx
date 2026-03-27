'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { archiveCase } from '@/lib/contractViemClient';

interface Case {
  caseId: string;
  title: string;
  description: string;
  officer: string;
  status: number;
  createdAt: number;
  closedAt: number;
}

interface Evidence {
  evidenceId: string;
  caseId: string;
  status: number;
  createdAt: number;
}

const STATUS_MAP = ['Đã tải lên', 'Đang xem xét', 'Đã xác thực', 'Từ chối', 'Đã lưu trữ'];

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/cases/${params.id}`);
        const data = await res.json();
        if (res.ok) {
          setCaseData(data.case);
          setEvidences(data.evidences || []);
        }
      } catch (error) {
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchCase();
    }
  }, [params.id]);

  const handleArchive = async () => {
    if (!confirm('Đóng vụ án sẽ lưu trữ tất cả bằng chứng. Tiếp tục?')) return;
    setActionLoading(true);
    try {
      await archiveCase(params.id as string);
      alert('Đã đóng vụ án thành công!');
      router.push('/dashboard/cases');
    } catch (err: any) {
      alert(err.message || 'Không thể đóng vụ án');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleString('vi-VN');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Không tìm thấy vụ án</p>
        <Link href="/dashboard/cases" className="text-blue-600 mt-4 inline-block">
          ← Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/cases" className="text-blue-600 hover:underline inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách
        </Link>
      </div>

      {/* Case Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {caseData.caseId}
            </h1>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-1">
              {caseData.title}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            caseData.status === 0 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400'
          }`}>
            {caseData.status === 0 ? 'Đang xử lý' : 'Đã đóng'}
          </span>
        </div>

        {caseData.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {caseData.description}
          </p>
        )}

        <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span>Người tạo: {formatAddress(caseData.officer)}</span>
          <span>Ngày tạo: {formatDate(caseData.createdAt)}</span>
          {caseData.closedAt > 0 && (
            <span>Ngày đóng: {formatDate(caseData.closedAt)}</span>
          )}
        </div>

        {user?.role === 1 && caseData.status === 0 && (
          <button
            onClick={handleArchive}
            disabled={actionLoading}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? 'Đang xử lý...' : 'Đóng vụ án'}
          </button>
        )}
      </div>

      {/* Evidence List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Danh sách bằng chứng ({evidences.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {evidences.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Chưa có bằng chứng nào trong vụ án này
            </div>
          ) : (
            evidences.map((ev) => (
              <Link
                key={ev.evidenceId}
                href={`/evidence/${encodeURIComponent(ev.evidenceId)}?from=case`}
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                      {ev.evidenceId}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(ev.createdAt)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ev.status === 2 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    ev.status === 3 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    ev.status === 4 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {STATUS_MAP[ev.status]}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}