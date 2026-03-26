'use client';

import { useState, useEffect } from 'react';

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  id_number: string;
  username: string;
  created_at: string;
}

export default function PendingCitizensPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/pending-citizens', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/approve-citizen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchPendingUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Duyệt tài khoản công dân
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Xác nhận và phê duyệt tài khoản công dân mới đăng ký
        </p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
            Không có yêu cầu đăng ký nào đang chờ duyệt
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Tất cả tài khoản công dân đã được xử lý
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Họ tên</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Tên đăng nhập</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Email</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">CCCD</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Đăng ký lúc</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                        {user.username}
                      </code>
                    </td>
                    <td className="py-4 px-5 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="py-4 px-5">
                      <code className="text-sm font-mono text-gray-600 dark:text-gray-400">{user.id_number}</code>
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => approveUser(user.id)}
                        disabled={actionLoading === user.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === user.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Duyệt
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}