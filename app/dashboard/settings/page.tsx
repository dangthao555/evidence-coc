'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Đọc dark mode từ localStorage TRƯỚC
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(userData);
      const userId = parsed.id;

      try {
        const res = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.users) {
          const currentUser = data.users.find((u: any) => u.id === userId);

          if (currentUser) {
            setUser({
              id: currentUser.id,
              fullName: currentUser.full_name,
              email: currentUser.email || 'Chưa cập nhật',
              walletAddress: parsed.walletAddress,
              role: currentUser.role,
              isAdmin: parsed.isAdmin || false,
            });
          } else {
            setUser({
              ...parsed,
              fullName: parsed.fullName || parsed.full_name,
              email: parsed.email || 'Chưa cập nhật',
              walletAddress: parsed.walletAddress,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser({
          ...parsed,
          fullName: parsed.fullName || parsed.full_name,
          email: parsed.email || 'Chưa cập nhật',
          walletAddress: parsed.walletAddress,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 dark:text-red-400">Không tìm thấy thông tin người dùng</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Cài đặt</h2>

      <div className="space-y-6">
        {/* Thông tin tài khoản */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Thông tin tài khoản</h3>
          <div className="space-y-3">
            <div className="flex">
              <div className="w-32 text-gray-500 dark:text-gray-400">Họ tên</div>
              <div className="flex-1 font-medium text-gray-900 dark:text-white">{user.fullName}</div>
            </div>
            <div className="flex">
              <div className="w-32 text-gray-500 dark:text-gray-400">Email</div>
              <div className="flex-1 text-gray-900 dark:text-white">{user.email}</div>
            </div>
            <div className="flex">
              <div className="w-32 text-gray-500 dark:text-gray-400">Địa chỉ ví</div>
              <div className="flex-1">
                <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                  {formatAddress(user.walletAddress)}
                </code>
              </div>
            </div>
            <div className="flex">
              <div className="w-32 text-gray-500 dark:text-gray-400">Vai trò</div>
              <div className="flex-1 text-gray-900 dark:text-white">
                {user.isAdmin ? 'Quản trị viên' :
                 user.role === 1 ? 'Cán bộ điều tra' :
                 user.role === 2 ? 'Giám định viên' :
                 user.role === 3 ? 'Tòa án' : 'Công dân'}
              </div>
            </div>
          </div>
        </div>

        {/* Giao diện */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Giao diện</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Chế độ tối</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Chuyển đổi giao diện sáng/tối</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Thông tin hệ thống */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Thông tin hệ thống</h3>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <div className="w-32 text-gray-500 dark:text-gray-400">Phiên bản</div>
              <div className="text-gray-900 dark:text-white">v1.0.0</div>
            </div>
            <div className="flex">
              <div className="w-32 text-gray-500 dark:text-gray-400">Contract</div>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">
                {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(0, 10)}...
              </code>
            </div>
            <div className="flex">
              <div className="w-32 text-gray-500 dark:text-gray-400">Mạng</div>
              <div className="text-gray-900 dark:text-white">Sepolia Testnet</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}