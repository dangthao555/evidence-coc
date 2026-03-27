'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { startReview, markVerified, rejectEvidence } from '@/lib/contractViemClient';

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
  { label: 'Từ chối', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Đã lưu trữ', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
];

export default function ReviewPage() {
  const [uploadedEvidences, setUploadedEvidences] = useState<Evidence[]>([]);
  const [underReviewEvidences, setUnderReviewEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchEvidences = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evidence/list');
      const data = await res.json();
      if (res.ok) {
        // Chỉ lấy status 0 (UPLOADED) và 1 (UNDER_REVIEW)
        const uploaded = data.data.filter((ev: Evidence) => ev.status === 0);
        const underReview = data.data.filter((ev: Evidence) => ev.status === 1);
        setUploadedEvidences(uploaded);
        setUnderReviewEvidences(underReview);
      } else {
        setError(data.error || 'Không thể tải danh sách');
      }
    } catch (err) {
      setError('Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = async (evidenceId: string) => {
    setActionLoading(evidenceId);
    try {
      const receipt = await startReview(evidenceId);
      console.log('Review started:', receipt.transactionHash);
      await fetchEvidences();
    } catch (err: any) {
      console.error('Start review error:', err);
      if (err.message?.includes('User rejected')) {
        alert('Bạn đã từ chối ký giao dịch.');
      } else {
        alert(err.message || 'Không thể bắt đầu review');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async (evidenceId: string) => {
    setActionLoading(evidenceId);
    try {
      const receipt = await markVerified(evidenceId);
      console.log('Verified:', receipt.transactionHash);
      await fetchEvidences();
      alert('Xác thực thành công!');
    } catch (err: any) {
      console.error('Verify error:', err);
      if (err.message?.includes('User rejected')) {
        alert('Bạn đã từ chối ký giao dịch.');
      } else {
        alert(err.message || 'Không thể xác thực');
      }
    } finally {
      setActionLoading(null);
    }
  };

  // 👉 THÊM HÀM TỪ CHỐI
  const handleReject = async (evidenceId: string) => {
    setActionLoading(evidenceId);
    try {
      const receipt = await rejectEvidence(evidenceId);
      console.log('Rejected:', receipt.transactionHash);
      await fetchEvidences();
      alert('Đã từ chối bằng chứng!');
    } catch (err: any) {
      console.error('Reject error:', err);
      if (err.message?.includes('User rejected')) {
        alert('Bạn đã từ chối ký giao dịch.');
      } else {
        alert(err.message || 'Không thể từ chối');
      }
    } finally {
      setActionLoading(null);
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

  const EvidenceCard = ({ evidence, showStartButton, showVerifyButton }: {
    evidence: Evidence;
    showStartButton: boolean;
    showVerifyButton: boolean;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Link
            href={`/evidence/${encodeURIComponent(evidence.evidenceId)}?from=review`}
            className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {evidence.evidenceId}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vụ án: {evidence.caseId}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_MAP[evidence.status]?.color}`}>
          {STATUS_MAP[evidence.status]?.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Người tạo</p>
          <p className="font-mono text-xs text-gray-700 dark:text-gray-300">{formatAddress(evidence.creator)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Ngày tạo</p>
          <p className="text-xs text-gray-700 dark:text-gray-300">{formatDate(evidence.createdAt)}</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link
          href={`/evidence/${encodeURIComponent(evidence.evidenceId)}?from=review`}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        >
          Xem chi tiết
        </Link>

        {showStartButton && (
          <button
            onClick={() => handleStartReview(evidence.evidenceId)}
            disabled={actionLoading === evidence.evidenceId}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {actionLoading === evidence.evidenceId ? 'Đang xử lý' : 'Bắt đầu review'}
          </button>
        )}

        {showVerifyButton && (
          <>
            <button
              onClick={() => handleVerify(evidence.evidenceId)}
              disabled={actionLoading === evidence.evidenceId}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading === evidence.evidenceId ? 'Đang xử lý' : 'Xác thực'}
            </button>
            <button
              onClick={() => handleReject(evidence.evidenceId)}
              disabled={actionLoading === evidence.evidenceId}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading === evidence.evidenceId ? 'Đang xử lý' : 'Từ chối'}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Cần review
            {uploadedEvidences.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                {uploadedEvidences.length}
              </span>
            )}
          </h2>
        </div>

        {uploadedEvidences.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
            Không có bằng chứng nào cần review
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedEvidences.map((ev) => (
              <EvidenceCard
                key={ev.evidenceId}
                evidence={ev}
                showStartButton={true}
                showVerifyButton={false}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Đang review
            {underReviewEvidences.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                {underReviewEvidences.length}
              </span>
            )}
          </h2>
        </div>

        {underReviewEvidences.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
            Không có bằng chứng nào đang được review
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {underReviewEvidences.map((ev) => (
              <EvidenceCard
                key={ev.evidenceId}
                evidence={ev}
                showStartButton={false}
                showVerifyButton={true}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={fetchEvidences}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Làm mới
        </button>
      </div>
    </div>
  );
}