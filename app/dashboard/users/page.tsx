'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: number;
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleName = (role: number) => {
    switch(role) {
      case 0: return 'Công dân';
      case 1: return 'Cán bộ điều tra';
      case 2: return 'Giám định viên';
      case 3: return 'Tòa án';
      default: return 'Không xác định';
    }
  };

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
          Quản lý người dùng
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Danh sách tất cả người dùng trong hệ thống
        </p>
      </div>

      {/* Danh sách người dùng */}
      {users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
            Không có người dùng nào
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
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Vai trò</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400">Trạng thái</th>
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 0 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                        user.role === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        user.role === 2 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {user.is_active ? 'Hoạt động' : 'Khóa'}
                      </span>
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