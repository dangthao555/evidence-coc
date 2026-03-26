'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors relative">
      {/* Tên nhóm góc dưới bên phải */}
      <div className="absolute bottom-4 right-4 text-sm text-gray-400 dark:text-gray-600 font-mono">
        5x21
      </div>

      <div className="text-center max-w-3xl mx-auto">
        {/* Logo / Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/50 dark:shadow-none">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          EvidenceChain
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl mb-4 max-w-2xl mx-auto">
          Hệ thống quản lý bằng chứng số trên blockchain
        </p>

        <p className="text-gray-500 dark:text-gray-400 text-base mb-12 max-w-xl mx-auto">
          Minh bạch - Bất biến - Đáng tin cậy
        </p>

        {/* Buttons - cùng kích thước */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="w-full sm:w-48">
            <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5">
              Đăng nhập
            </button>
          </Link>
          <Link href="/register" className="w-full sm:w-48">
            <button className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md">
              Đăng ký
            </button>
          </Link>
          <Link href="/register-official" className="w-full sm:w-48">
            <button className="w-full bg-white dark:bg-gray-800 border border-green-500 text-green-600 dark:text-green-400 px-6 py-3 rounded-xl font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-all shadow-sm hover:shadow-md">
              Đăng ký cán bộ
            </button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bất biến</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dữ liệu không thể thay đổi sau khi ghi lên blockchain</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Minh bạch</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Mọi giao dịch đều được công khai và xác thực</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Xác thực</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Kiểm tra tính xác thực của bằng chứng dễ dàng</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © 2026 EvidenceChain - Hệ thống quản lý bằng chứng số trên blockchain Sepolia
          </p>
        </div>
      </div>
    </div>
  );
}