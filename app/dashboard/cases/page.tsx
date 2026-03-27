'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createCase } from '@/lib/contractViemClient';

interface Case {
  caseId: string;
  title: string;
  description: string;
  officer: string;
  status: number; // 0 = ACTIVE, 1 = CLOSED
  createdAt: number;
  closedAt: number;
}

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    caseId: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('/api/cases/list');
        const data = await res.json();
        if (res.ok) {
          setCases(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseId.trim() || !formData.title.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setCreateLoading(true);
    try {
      await createCase(formData.caseId, formData.title, formData.description);
      alert('Tạo vụ án thành công!');
      setShowCreateForm(false);
      setFormData({ caseId: '', title: '', description: '' });
      // Refresh danh sách
      const res = await fetch('/api/cases/list');
      const data = await res.json();
      if (res.ok) {
        setCases(data.data || []);
      }
    } catch (err: any) {
      alert(err.message || 'Không thể tạo vụ án');
    } finally {
      setCreateLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleDateString('vi-VN');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Quản lý vụ án
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Danh sách tất cả vụ án đang xử lý và đã đóng
          </p>
        </div>
        {user?.role === 1 && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo vụ án
          </button>
        )}
      </div>

      {/* Create Case Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tạo vụ án mới
          </h3>
          <form onSubmit={handleCreateCase} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mã vụ án <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.caseId}
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value.toUpperCase() })}
                placeholder="VD: CASE001"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề vụ án"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Nhập mô tả chi tiết về vụ án"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createLoading ? 'Đang tạo...' : 'Tạo vụ án'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Chưa có vụ án nào</p>
          {user?.role === 1 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Nhấn "Tạo vụ án" để bắt đầu
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cases.map((c) => (
            <Link
              key={c.caseId}
              href={`/dashboard/cases/${c.caseId}`}
              className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all p-5"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {c.caseId}
                  </h3>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {c.title}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  c.status === 0 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400'
                }`}>
                  {c.status === 0 ? 'Đang xử lý' : 'Đã đóng'}
                </span>
              </div>
              {c.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {c.description}
                </p>
              )}
              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span>Người tạo: {formatAddress(c.officer)}</span>
                <span>{formatDate(c.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}