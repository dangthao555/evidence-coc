'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Evidence {
  evidenceId: string;
  caseId: string;
  fileHash: string;
  fileURI: string;
  creator: string;
  createdAt: number;
  status: number;
}

const STATUS_MAP: { [key: number]: { label: string; color: string } } = {
  0: { label: 'Đã tải lên', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  1: { label: 'Đang xem xét', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  2: { label: 'Đã xác thực', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  3: { label: 'Đã lưu trữ', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400' },
};

export default function EvidencePage() {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvidences = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/evidence/list');
      const data = await res.json();

      if (res.ok) {
        setEvidences(data.data);
      } else {
        setError(data.error || 'Không thể tải danh sách');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidences();
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
          onClick={fetchEvidences}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (evidences.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Chưa có bằng chứng nào</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Hãy upload bằng chứng đầu tiên</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Danh sách bằng chứng
        </h1>
        <button
          onClick={fetchEvidences}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-4 px-5 text-sm font-medium text-gray-600 dark:text-gray-400">Mã bằng chứng</th>
                <th className="text-left py-4 px-5 text-sm font-medium text-gray-600 dark:text-gray-400">Vụ án</th>
                <th className="text-left py-4 px-5 text-sm font-medium text-gray-600 dark:text-gray-400">Người tạo</th>
                <th className="text-left py-4 px-5 text-sm font-medium text-gray-600 dark:text-gray-400">Ngày tạo</th>
                <th className="text-left py-4 px-5 text-sm font-medium text-gray-600 dark:text-gray-400">Trạng thái</th>
                <th className="text-left py-4 px-5 text-sm font-medium text-gray-600 dark:text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {evidences.map((ev) => (
                <tr key={ev.evidenceId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-5">
                    <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                      {ev.evidenceId.slice(0, 20)}...
                    </code>
                  </td>
                  <td className="py-4 px-5 text-sm text-gray-700 dark:text-gray-300">
                    {ev.caseId}
                  </td>
                  <td className="py-4 px-5 text-sm font-mono text-gray-500 dark:text-gray-400">
                    {formatAddress(ev.creator)}
                  </td>
                  <td className="py-4 px-5 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(ev.createdAt)}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[ev.status]?.color}`}>
                      {STATUS_MAP[ev.status]?.label}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <Link
                      href={`/evidence/${encodeURIComponent(ev.evidenceId)}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}