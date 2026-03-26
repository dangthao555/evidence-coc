'use client';

import { useState, useEffect } from 'react';

interface PendingOfficial {
  id: string;
  full_name: string;
  email: string;
  id_number: string;
  wallet_address: string;
  department: string;
  position: string;
  created_at: string;
}

export default function PendingOfficialsPage() {
  const [users, setUsers] = useState<PendingOfficial[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, number>>({});

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/pending-officials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        const defaultRoles: Record<string, number> = {};
        data.users?.forEach((user: PendingOfficial) => {
          defaultRoles[user.id] = 1;
        });
        setSelectedRoles(defaultRoles);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    const role = selectedRoles[userId];
    if (!role) {
      alert('Vui lòng chọn vai trò');
      return;
    }

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/approve-official', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, role })
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

  const getRoleName = (role: number) => {
    switch(role) {
      case 1: return 'Cán bộ điều tra';
      case 2: return 'Giám định viên';
      case 3: return 'Tòa án';
      default: return 'Chọn vai trò';
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
          Duyệt tài khoản cán bộ
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Xác nhận và phân quyền cho cán bộ mới đăng ký
        </p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
            Không có yêu cầu đăng ký nào đang chờ duyệt
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Tất cả tài khoản cán bộ đã được xử lý
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Họ tên</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Email</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">CCCD</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Đơn vị</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Chức vụ</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Địa chỉ ví</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Vai trò</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-medium text-gray-900 dark:text-white">{user.full_name}</span>
                    </td>
                    <td className="py-4 px-5 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="py-4 px-5">
                      <code className="text-sm font-mono text-gray-600 dark:text-gray-400">{user.id_number}</code>
                    </td>
                    <td className="py-4 px-5 text-gray-600 dark:text-gray-400">{user.department || '—'}</td>
                    <td className="py-4 px-5 text-gray-600 dark:text-gray-400">{user.position || '—'}</td>
                    <td className="py-4 px-5">
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-gray-700 dark:text-gray-300">
                        {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-6)}
                      </code>
                    </td>
                    <td className="py-4 px-5">
                      <select
                        value={selectedRoles[user.id] || 1}
                        onChange={(e) => setSelectedRoles({
                          ...selectedRoles,
                          [user.id]: parseInt(e.target.value)
                        })}
                        className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                      >
                        <option value={1}>Cán bộ điều tra</option>
                        <option value={2}>Giám định viên</option>
                        <option value={3}>Tòa án</option>
                      </select>
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => approveUser(user.id)}
                        disabled={actionLoading === user.id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === user.id ? 'Đang xử lý...' : 'Duyệt'}
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