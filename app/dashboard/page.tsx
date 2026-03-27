'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  total: number;
  verified: number;
  pending: number;
}

interface Transaction {
  id: string;
  type: string;
  icon: string;
  iconColor: string;
  timestamp: number;
  hash: string;
  blockNumber: number;
}

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, pending: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/evidence/transactions');
        const data = await res.json();

        if (res.ok && data.success) {
          setTransactions(data.data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setTxLoading(false);
      }
    };

    fetchTransactions();
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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading && txLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
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

      {/* Transactions Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Lịch sử giao dịch
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Các hoạt động gần đây trên blockchain</p>
        </div>
        <div className="p-6">
          {txLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 4v16" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.iconColor}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tx.icon} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-white">{tx.type}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{formatTime(tx.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-all flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Etherscan
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}