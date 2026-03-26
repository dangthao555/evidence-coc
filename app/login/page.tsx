'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getContract } from '@/lib/contract';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'metamask' | 'username'>('metamask');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const switchToSepolia = async (ethereum: any) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (switchError: any) {
      // Nếu chưa có network Sepolia, thêm mới
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

  const connectMetaMask = async () => {
    if (typeof window === 'undefined') return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      alert('Vui lòng cài MetaMask!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Kết nối ví
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      const normalizedWallet = walletAddress.toLowerCase();

      // Kiểm tra và chuyển sang mạng Sepolia
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') {
        await switchToSepolia(ethereum);
      }

      const contract = await getContract(false);
      if (!contract) {
        throw new Error('Không thể kết nối contract');
      }
      const adminAddress = await contract.admin();
      const isAdmin = normalizedWallet === adminAddress.toLowerCase();

      const res = await fetch('/api/auth/login-metamask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: normalizedWallet })
      });

      const data = await res.json();

      if (res.ok && data.user) {
        const contractRole = await contract.roles(walletAddress);
        const roleNumber = Number(contractRole);

        const userInfo = {
          ...data.user,
          role: roleNumber,
          walletAddress: walletAddress,
          isAdmin: isAdmin || data.user.isAdmin || false
        };

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userInfo));

        router.push('/dashboard');
      } else {
        setError(data.error || 'Tài khoản chưa được duyệt hoặc không tồn tại');
      }

    } catch (err: any) {
      console.error('MetaMask login error:', err);
      if (err.message?.includes('User rejected')) {
        setError('Bạn đã từ chối kết nối.');
      } else {
        setError(err.message || 'Không thể kết nối MetaMask');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Đăng nhập</h1>

        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('metamask')}
            className={`flex-1 py-2 text-center transition-all ${
              activeTab === 'metamask' 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-medium' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              MetaMask
            </span>
          </button>
          <button
            onClick={() => setActiveTab('username')}
            className={`flex-1 py-2 text-center transition-all ${
              activeTab === 'username' 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-medium' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Tên đăng nhập
            </span>
          </button>
        </div>

        {activeTab === 'metamask' && (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Dành cho cán bộ đã đăng ký và quản trị viên
            </p>
            <button
              onClick={connectMetaMask}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {loading ? 'Đang kết nối...' : 'Kết nối MetaMask'}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              Chưa có tài khoản?{' '}
              <Link href="/register-official" className="text-blue-600 dark:text-blue-400 hover:underline">
                Đăng ký cán bộ
              </Link>
            </p>
          </div>
        )}

        {activeTab === 'username' && (
          <form onSubmit={handleUsernameLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                placeholder="Nhập mật khẩu"
              />
            </div>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                Đăng ký
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}