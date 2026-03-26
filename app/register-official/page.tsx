'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterOfficialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    idNumber: '',
    department: '',
    position: ''
  });

  const switchToSepolia = async (ethereum: any) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          throw new Error('Không thể thêm mạng Sepolia. Vui lòng thêm thủ công.');
        }
      } else {
        throw switchError;
      }
    }
  };

  const fetchAccounts = async () => {
    if (typeof window === 'undefined') return;
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      const accountsList = await ethereum.request({ method: 'eth_accounts' });
      if (accountsList.length > 0) {
        setAccounts(accountsList);
        setSelectedAccount(accountsList[0]);
        setWalletAddress(accountsList[0]);
      }
    } catch (err) {
      console.error('Failed to get accounts:', err);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined') return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      alert('Vui lòng cài MetaMask!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const accountsList = await ethereum.request({
        method: 'eth_requestAccounts',
        params: []
      });

      if (accountsList && accountsList.length > 0) {
        setAccounts(accountsList);
        setSelectedAccount(accountsList[0]);
        setWalletAddress(accountsList[0]);
      }

      // Kiểm tra và chuyển sang mạng Sepolia
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') {
        await switchToSepolia(ethereum);
      }

    } catch (err: any) {
      console.error('Connect wallet error:', err);
      if (err.code === 4001) {
        alert('Bạn đã từ chối kết nối.');
      } else if (err.message?.includes('Sepolia')) {
        alert('Không thể chuyển sang mạng Sepolia. Vui lòng thêm mạng thủ công.');
      } else {
        alert('Có lỗi xảy ra khi kết nối ví.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const switchAccount = (address: string) => {
    setSelectedAccount(address);
    setWalletAddress(address);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!walletAddress) {
      setError('Vui lòng chọn ví MetaMask trước khi đăng ký');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register-official', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          walletAddress
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đăng ký thành công!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Yêu cầu đăng ký của bạn đã được ghi nhận.
            Vui lòng chờ <strong className="text-blue-600 dark:text-blue-400">admin xác nhận</strong>.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Chuyển hướng đến trang đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đăng ký cán bộ</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Dành cho cán bộ (Điều tra viên / Giám định viên / Tòa án)
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Kết nối ví MetaMask
          </p>

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isConnecting ? 'Đang kết nối...' : 'Kết nối MetaMask'}
          </button>

          {accounts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Chọn ví:</label>
              <select
                value={selectedAccount}
                onChange={(e) => switchAccount(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              >
                {accounts.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc.slice(0, 10)}...{acc.slice(-8)}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between mt-2">
                <code className="text-xs text-gray-500 dark:text-gray-400">
                  Đã chọn: {selectedAccount.slice(0, 8)}...{selectedAccount.slice(-6)}
                </code>
                <span className="text-green-600 dark:text-green-400 text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đã kết nối
                </span>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            {accounts.length === 0
              ? 'Nhấn "Kết nối MetaMask" để kết nối ví'
              : 'Bạn có thể chọn ví khác từ danh sách bên trên'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Họ và tên *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              placeholder="Nhập họ và tên"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Số CCCD/CMND *
            </label>
            <input
              type="text"
              required
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              placeholder="Nhập số CCCD/CMND"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Đơn vị công tác
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              placeholder="Nhập đơn vị công tác"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chức vụ
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              placeholder="Nhập chức vụ"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !walletAddress}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}