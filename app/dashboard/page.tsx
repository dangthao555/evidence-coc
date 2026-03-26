'use client';

import { useState, useEffect } from 'react';

interface Stats {
  total: number;
  verified: number;
  pending: number;
}

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/evidence/list');
        const data = await res.json();

        if (res.ok && data.success) {
          const evidences = data.data || [];
          const total = evidences.length;
          const verified = evidences.filter((ev: any) => ev.status === 2).length;
          const pending = evidences.filter((ev: any) => ev.status === 0 || ev.status === 1).length;

          setStats({ total, verified, pending });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getRoleWelcome = () => {
    if (user?.isAdmin) return 'Quản trị viên';
    switch(user?.role) {
      case 0: return 'Công dân';
      case 1: return 'Cán bộ điều tra';
      case 2: return 'Giám định viên';
      case 3: return 'Tòa án';
      default: return 'Người dùng';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Đang tải thống kê...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Chào mừng, {user?.fullName || user?.full_name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Vai trò: <span className="font-semibold text-blue-600 dark:text-blue-400">{getRoleWelcome()}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">tổng số</div>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Tổng bằng chứng</div>
        </div>

        {/* Verified Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.verified}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">đã xác thực</div>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Đã xác thực</div>
        </div>

        {/* Pending Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">chờ xử lý</div>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Chờ xử lý</div>
        </div>
      </div>

      {/* Guide Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hướng dẫn sử dụng
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">Sử dụng menu bên trái để điều hướng</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">Cán bộ điều tra: Upload bằng chứng mới</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">Giám định viên: Xem xét và xác thực bằng chứng</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">4</span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">Tòa án: Tra cứu bằng chứng đã xác thực</span>
            </div>
            <div className="flex items-start gap-3 md:col-span-2">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">5</span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">Quản trị viên: Duyệt tài khoản, quản lý người dùng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}