'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getContract } from '@/lib/contract';

export default function VerifyDashboardPage() {
  const [hashInput, setHashInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    exists: boolean;
    evidenceId: string;
  } | null>(null);
  const [error, setError] = useState('');

  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  };

  const verifyHash = async (hash: string) => {
    setLoading(true);
    setError('');
    try {
      const contract = await getContract(true);
      if (!contract) {
        setError('Không thể kết nối contract');
        return;
      }

      const [exists, evidenceId] = await contract.verifyEvidence(hash);
      setResult({ exists, evidenceId });

    } catch (err: any) {
      console.error('Error:', err);
      if (err.message?.includes('Only court')) {
        setError('Chỉ Tòa án mới có quyền xác thực. Vui lòng đăng nhập với tài khoản COURT.');
      } else {
        setError(err.message || 'Không thể xác thực');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (selectedFile: File) => {
    setLoading(true);
    try {
      const hash = await calculateFileHash(selectedFile);
      setHashInput(hash);
      await verifyHash(hash);
    } catch {
      setError('Không thể tính hash file');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput.trim()) return;
    await verifyHash(hashInput);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Xác thực bằng chứng
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Chỉ Tòa án (COURT) mới có quyền xác thực tính hợp pháp của bằng chứng
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mã hash (SHA-256)
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="0x..."
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !hashInput.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý' : 'Xác thực'}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Hoặc tải file lên
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <span className="inline-block px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer text-gray-700 dark:text-gray-300">
                Chọn file
              </span>
            </label>
          </div>

          {loading && (
            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Đang xác thực...</span>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className={`mt-6 rounded-xl p-5 border ${
              result.exists 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <p className={`font-medium ${
                result.exists ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'
              }`}>
                {result.exists ? '✓ Bằng chứng tồn tại' : '⚠ Không tìm thấy bằng chứng'}
              </p>
              {result.exists && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Evidence ID:
                  </p>
                  <code className="block bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                    {result.evidenceId}
                  </code>
                  <Link
                    href={`/evidence/${result.evidenceId}`}
                    className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Xem chi tiết bằng chứng →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}