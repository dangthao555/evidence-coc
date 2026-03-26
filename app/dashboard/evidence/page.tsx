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

const STATUS_MAP = [
  { label: 'Đã tải lên', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Đang xem xét', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Đã xác thực', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Đã lưu trữ', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
];

export default function EvidencePage() {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [filteredEvidences, setFilteredEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCaseId, setSearchCaseId] = useState('');
  const [error, setError] = useState('');

  const fetchEvidences = async (caseId?: string) => {
    setLoading(true);
    setError('');
    try {
      const url = caseId
        ? `/api/evidence/list?caseId=${encodeURIComponent(caseId)}`
        : '/api/evidence/list';
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        setEvidences(data.data);
        setFilteredEvidences(data.data);
      } else {
        setError(data.error || 'Không thể tải dữ liệu');
      }
    } catch (error) {
      setError('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCaseId.trim()) {
      fetchEvidences(searchCaseId.trim());
    } else {
      fetchEvidences();
    }
  };

  const handleReset = () => {
    setSearchCaseId('');
    fetchEvidences();
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

  const truncate = (str: string, length: number = 20) => {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Quản lý bằng chứng
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Danh sách tất cả bằng chứng đã được ghi nhận trên blockchain
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tìm theo Case ID
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchCaseId}
                onChange={(e) => setSearchCaseId(e.target.value)}
                placeholder="Nhập Case ID (ví dụ: CASE001)"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm hover:shadow-md"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tìm kiếm
              </span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Xem tất cả
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng số bằng chứng</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredEvidences.length}</p>
          </div>
          {searchCaseId && (
            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Case ID: {searchCaseId}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Evidence List */}
      {filteredEvidences.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
            {searchCaseId
              ? `Không tìm thấy bằng chứng cho Case ID "${searchCaseId}"`
              : 'Chưa có bằng chứng nào trong hệ thống'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredEvidences.map((ev) => (
            <div
              key={ev.evidenceId}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/evidence/${encodeURIComponent(ev.evidenceId)}`}
                      className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {truncate(ev.evidenceId, 24)}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Vụ án: {ev.caseId}
                    </p>
                  </div>
                  <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${STATUS_MAP[ev.status]?.color}`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={STATUS_MAP[ev.status]?.icon} />
                    </svg>
                    {STATUS_MAP[ev.status]?.label}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Người tạo</p>
                    <p className="font-mono text-xs text-gray-700 dark:text-gray-300 mt-1">{formatAddress(ev.creator)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Ngày tạo</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{formatDate(ev.createdAt)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">File Hash</p>
                    <p className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{truncate(ev.fileHash, 28)}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/evidence/${encodeURIComponent(ev.evidenceId)}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all group-hover:gap-3"
                >
                  <span>Xem chi tiết</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}