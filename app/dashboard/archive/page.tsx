'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { archiveEvidence } from '@/lib/contractViemClient';

interface Evidence {
  evidenceId: string;
  caseId: string;
  fileHash: string;
  fileURI: string;
  creator: string;
  createdAt: number;
  status: number;
}

const STATUS_MAP = [
  { label: 'Đã tải lên', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { label: 'Đang xem xét', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { label: 'Đã xác thực', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { label: 'Từ chối', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { label: 'Đã lưu trữ', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400' },
];

export default function ArchivePage() {
  const [verifiedEvidences, setVerifiedEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchVerifiedEvidences = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evidence/list');
      const data = await res.json();
      if (res.ok) {
        // Chỉ lấy evidence có status = 2 (VERIFIED)
        const verified = data.data.filter((ev: Evidence) => ev.status === 2);
        setVerifiedEvidences(verified);
      } else {
        setError(data.error || 'Không thể tải danh sách');
      }
    } catch (err) {
      setError('Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (evidenceId: string) => {
    setActionLoading(evidenceId);
    try {
      await archiveEvidence(evidenceId);
      alert('Lưu trữ thành công!');
      fetchVerifiedEvidences(); // Refresh danh sách
    } catch (err: any) {
      console.error('Archive error:', err);
      if (err.message?.includes('User rejected')) {
        alert('Bạn đã từ chối ký giao dịch.');
      } else {
        alert(err.message || 'Không thể lưu trữ');
      }
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchVerifiedEvidences();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('vi-VN');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={fetchVerifiedEvidences}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Lưu trữ bằng chứng
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Danh sách bằng chứng đã xác thực, sẵn sàng để lưu trữ
        </p>
      </div>

      {verifiedEvidences.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
            Không có bằng chứng nào cần lưu trữ
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Tất cả bằng chứng đã được lưu trữ hoặc chưa được xác thực
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {verifiedEvidences.map((ev) => (
            <div
              key={ev.evidenceId}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/evidence/${encodeURIComponent(ev.evidenceId)}`}
                      className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {ev.evidenceId}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Vụ án: {ev.caseId}
                    </p>
                  </div>
                  <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[ev.status]?.color}`}>
                    {STATUS_MAP[ev.status]?.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Người tạo</p>
                    <p className="font-mono text-xs text-gray-700 dark:text-gray-300 mt-1">{formatAddress(ev.creator)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Ngày tạo</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{formatDate(ev.createdAt)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/evidence/${encodeURIComponent(ev.evidenceId)}`}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Xem chi tiết
                  </Link>
                  <button
                    onClick={() => handleArchive(ev.evidenceId)}
                    disabled={actionLoading === ev.evidenceId}
                    className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === ev.evidenceId ? 'Đang xử lý...' : 'Lưu trữ'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}