import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">欢迎回来，{user?.name}!</h1>
        <p className="text-gray-600 mb-4">
          您当前的登录身份是：<span className="font-semibold text-indigo-600">{role?.name || '暂无角色'}</span>。
        </p>
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">您当前拥有的权限:</h3>
          <div className="flex gap-2 flex-wrap">
            {role?.permissions.map(perm => (
              <span key={perm} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium uppercase tracking-wider">
                {perm}
              </span>
            ))}
            {(!role || role.permissions.length === 0) && (
              <span className="text-gray-500 text-sm italic">未分配特定权限。</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="font-bold text-gray-900 mb-2">用户管理</h3>
          <p className="text-sm text-gray-600">
            管理员可以添加新用户并为他们分配角色。
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="font-bold text-gray-900 mb-2">角色管理</h3>
          <p className="text-sm text-gray-600">
            定义系统中的角色，并关联具体的细粒度权限（如修改角色、删除角色）。
          </p>
        </div>
      </div>
    </div>
  );
};