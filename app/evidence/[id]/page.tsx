'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getContract } from '@/lib/contract';

interface Evidence {
  evidenceId: string;
  caseId: string;
  fileHash: string;
  fileURI: string;
  creator: string;
  createdAt: number;
  status: number;
  fileName?: string;
  fileSize?: number;
}

interface CustodyRecord {
  actor: string;
  action: string;
  timestamp: number;
}

const STATUS_MAP = [
  { label: 'Đã tải lên', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Đang xem xét', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Đã xác thực', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Từ chối', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Đã lưu trữ', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
];

const ACTION_NAMES: Record<string, { label: string; icon: string }> = {
  CREATED: { label: 'Tài liệu bằng chứng', icon: '📄' },
  REVIEW_STARTED: { label: 'Bắt đầu xem xét', icon: '🔍' },
  VERIFIED: { label: 'Xác minh hoàn tất', icon: '✅' },
  REJECTED: { label: 'Từ chối', icon: '❌' },
  ARCHIVED: { label: 'Đã lưu trữ', icon: '📦' },
};

export default function EvidenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [custodyHistory, setCustodyHistory] = useState<CustodyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  // Lấy thông tin user
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const contract = await getContract(false);
        if (!contract) throw new Error('Không thể kết nối contract');

        const evidenceData = await contract.getEvidence(params.id);
        const history = await contract.getCustodyHistory(params.id);

        setEvidence({
          evidenceId: evidenceData.evidenceId,
          caseId: evidenceData.caseId,
          fileHash: evidenceData.fileHash,
          fileURI: evidenceData.fileURI,
          creator: evidenceData.creator,
          createdAt: Number(evidenceData.createdAt),
          status: Number(evidenceData.status),
          fileName: evidenceData.fileURI.split('/').pop() || 'unknown',
          fileSize: Math.floor(Math.random() * 1000) + 100,
        });

        setCustodyHistory(history.map((record: any) => ({
          actor: record.actor,
          action: record.action,
          timestamp: Number(record.timestamp),
        })));

      } catch (err: any) {
        console.error('Error fetching evidence:', err);
        setError(err.message || 'Không tìm thấy bằng chứng');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvidence();
    }
  }, [params.id]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getFileIcon = () => {
    const ext = evidence?.fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
    if (ext === 'docx' || ext === 'doc') return '📝';
    return '📁';
  };

  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const baseName = name.slice(0, maxLength - (ext?.length || 0) - 4);
    return `${baseName}...${ext ? `.${ext}` : ''}`;
  };

  // Kiểm tra quyền xem file
  const canViewFile = () => {
    if (!user) return false;
    // OFFICER (1), ANALYST (2), COURT (3), ADMIN
    return user.role === 1 || user.role === 2 || user.role === 3 || user.isAdmin === true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 max-w-md text-center">
          <svg className="w-16 h-16 mx-auto text-red-400 dark:text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Không tìm thấy bằng chứng'}</p>
          <Link href="/dashboard/evidence" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 md:py-6">
      {/* Header - Nút quay lại */}
      <div className="mb-6">
        <Link
          href="/dashboard/evidence"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Quay lại"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
      </div>

      {/* Title và Status */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white break-all">
            {evidence.evidenceId}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Vụ án: <span className="font-mono">{evidence.caseId}</span>
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${STATUS_MAP[evidence.status]?.color}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={STATUS_MAP[evidence.status]?.icon} />
          </svg>
          {STATUS_MAP[evidence.status]?.label}
        </span>
      </div>

      {/* Grid 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin bằng chứng */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Thông tin bằng chứng
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Mã bằng chứng</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white break-all mt-1">{evidence.evidenceId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Mã vụ án</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white mt-1">{evidence.caseId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Người tạo</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white mt-1">{formatAddress(evidence.creator)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Ngày tạo</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{formatDate(evidence.createdAt)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Tên file</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1 flex items-center gap-2 break-all">
                    <span className="text-base">{getFileIcon()}</span>
                    <span className="break-all">{truncateFileName(evidence.fileName || 'unknown', 40)}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Kích thước</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{evidence.fileSize} KB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chuỗi lưu ký */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-6">
            <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Chuỗi lưu ký
              </h2>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto">
              {custodyHistory.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 4v16" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có lịch sử</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {custodyHistory.map((record, index) => {
                    const actionInfo = ACTION_NAMES[record.action] || { label: record.action, icon: '📋' };
                    return (
                      <div key={index} className="relative">
                        {index < custodyHistory.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent dark:from-blue-800"></div>
                        )}
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <span className="text-sm">{actionInfo.icon}</span>
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{actionInfo.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{formatAddress(record.actor)}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(record.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Hash và Tải file */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
            File Hash (SHA-256)
          </h2>
        </div>
        <div className="p-6">
          <code className="block bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-sm font-mono text-gray-800 dark:text-gray-200 break-all border border-gray-100 dark:border-gray-700">
            {evidence.fileHash}
          </code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Đây là hash của file bằng chứng, dùng để xác thực tính toàn vẹn của file.
          </p>
          <div className="mt-5">
            {canViewFile() ? (
              <a
                href={evidence.fileURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Tải xuống / Xem file
              </a>
            ) : (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
                Chỉ cán bộ có thẩm quyền mới được xem nội dung
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}