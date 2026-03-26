'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getContract } from '@/lib/contract';

export default function UploadEvidencePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [caseId, setCaseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txHash, setTxHash] = useState('');

  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload IPFS thất bại');
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  };

  const deleteFromIPFS = async (cid: string) => {
    try {
      await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}` }
      });
    } catch (error) {
      console.error('Delete from IPFS failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Vui lòng chọn file');
      return;
    }

    if (!caseId.trim()) {
      setError('Vui lòng nhập Case ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setTxHash('');

    let uploadedCID = '';

    try {
      const fileHash = await calculateFileHash(file);
      const evidenceId = `EVID_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const fileURI = await uploadToIPFS(file);
      uploadedCID = fileURI.replace('ipfs://', '');

      const contract = await getContract(true);
      if (!contract) throw new Error('Không thể kết nối contract');

      const tx = await contract.addEvidence(evidenceId, caseId, fileHash, fileURI);
      const receipt = await tx.wait();

      setSuccess('Upload thành công!');
      setTxHash(receipt.transactionHash);
      setFile(null);
      setCaseId('');

      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      if (uploadedCID) {
        await deleteFromIPFS(uploadedCID);
      }

      if (err.message?.includes('User rejected')) {
        setError('Bạn đã từ chối ký giao dịch. File đã được xóa khỏi IPFS.');
      } else if (err.message?.includes('MetaMask') || err.message?.includes('ethereum')) {
        setError('Vui lòng cài đặt và kết nối MetaMask.');
      } else {
        setError(err.message || 'Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Upload bằng chứng mới
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Tải lên bằng chứng và xác thực trên blockchain
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case ID Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mã vụ án <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="Nhập mã vụ án (VD: CASE001)"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* File Upload Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File bằng chứng <span className="text-red-500">*</span>
            </label>

            <input
              id="file-input"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
              required
              disabled={loading}
            />
            {file && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Đã chọn: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              PDF, JPG, PNG, DOC (Tối đa 50MB)
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center justify-center gap-3 border border-blue-200 dark:border-blue-800">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
              <div className="text-sm text-blue-700 dark:text-blue-400">
                Đang xử lý... Vui lòng xác nhận giao dịch trong MetaMask
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex items-center gap-3 border border-red-200 dark:border-red-800">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {success && !loading && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 space-y-2 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-green-700 dark:text-green-400 font-medium">{success}</div>
              </div>
              {txHash && (
                <div className="ml-8">
                  <p className="text-xs text-green-600 dark:text-green-500 mb-1">Transaction Hash:</p>
                  <code className="text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded break-all text-green-800 dark:text-green-300">
                    {txHash}
                  </code>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Xem trên Etherscan
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 rounded-xl font-medium transition-all
              ${loading 
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 active:scale-[0.98] shadow-md hover:shadow-lg'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload bằng chứng
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}