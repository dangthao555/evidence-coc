'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getContract } from '@/lib/contract';


// Định nghĩa interface cho MetaMask
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface WindowWithEthereum extends Window {
  ethereum?: EthereumProvider;
}


export default function VerifyPage() {
  const [hashInput, setHashInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    exists: boolean;
    evidenceId: string;
  } | null>(null);
  const [error, setError] = useState('');

  // Tính hash từ file
  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  };

  // Kết nối MetaMask
  const connectWallet = async () => {
    if (typeof window === 'undefined') return;

    const ethereum = (window as WindowWithEthereum).ethereum;
    if (!ethereum) {
      alert('Vui lòng cài đặt MetaMask!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      alert('Đã kết nối MetaMask!');
    } catch (err) {
      alert('Không thể kết nối MetaMask');
    }
  };

  const verifyHash = async (hash: string) => {
    setLoading(true);
    setError('');
    try {
      const contract = await getContract(false);
      if (!contract) {
        setError('Không thể kết nối contract');
        return;
      }

      console.log('Contract address:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
      console.log('Verifying hash:', hash);

      const [exists, evidenceId] = await contract.verifyEvidence(hash);
      console.log('Result:', { exists, evidenceId });

      setResult({ exists, evidenceId });

    } catch (err: any) {
      console.error('Full error details:', err);

      // Hiển thị lỗi chi tiết
      if (err?.message?.includes('CALL_EXCEPTION')) {
        setError(`Hash không tồn tại hoặc contract lỗi: ${err.message.slice(0, 100)}`);
      } else if (err?.message?.includes('network')) {
        setError('Không thể kết nối mạng. Vui lòng kiểm tra kết nối Internet.');
      } else if (err?.message) {
        setError(`Lỗi: ${err.message.slice(0, 150)}`);
      } else {
        setError('Không thể xác thực');
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">
            Xác thực bằng chứng số
          </h1>
          <p className="text-gray-600">
            Nhập mã hash hoặc tải file lên để kiểm tra tính xác thực
          </p>
        </div>

        {/* Nút kết nối MetaMask */}
        <div className="mb-4 text-center">
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            🔌 Kết nối MetaMask
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã hash (SHA-256)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="0x..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <button
                type="submit"
                disabled={loading || !hashInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Xác thực
              </button>
            </div>
          </form>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-500 mb-3 text-center">
              — Hoặc tải file lên để tự động tính hash —
            </p>
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
                <span className="inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  📁 Chọn file
                </span>
              </label>
            </div>
          </div>

          {loading && (
            <div className="mt-6 text-center text-gray-500">
              Đang xác thực...
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          {result && !loading && (
            <div className={`mt-6 p-4 rounded-lg ${result.exists ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{result.exists ? '✅' : '⚠️'}</span>
                <span className="font-semibold">
                  {result.exists ? 'Bằng chứng tồn tại' : 'Không tìm thấy bằng chứng'}
                </span>
              </div>
              {result.exists && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Evidence ID:</span>{' '}
                    <code className="bg-gray-100 px-1 rounded">{result.evidenceId}</code>
                  </p>
                  <Link
                    href={`/evidence/${result.evidenceId}`}
                    className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}