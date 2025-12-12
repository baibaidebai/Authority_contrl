import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Cloud, Database, Server, Cpu } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">控制面板</h1>
        <p className="text-gray-500 mt-2">
          欢迎回来，<span className="font-semibold text-indigo-600">{user?.name}</span>！
          当前身份：<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{role?.name || '无角色'}</span>
        </p>
      </div>

      {/* Placeholders Row matching main.html */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {/* Placeholder 1 */}
        <div className="flex flex-col items-center">
          <div className="bg-blue-100 p-6 rounded-full mb-4">
            <Cloud className="h-16 w-16 text-blue-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">云服务状态</h4>
          <span className="text-sm text-gray-500">运行正常</span>
        </div>

        {/* Placeholder 2 */}
        <div className="flex flex-col items-center">
          <div className="bg-green-100 p-6 rounded-full mb-4">
            <Database className="h-16 w-16 text-green-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">数据库连接</h4>
          <span className="text-sm text-gray-500">已连接 (远程)</span>
        </div>

        {/* Placeholder 3 */}
        <div className="flex flex-col items-center">
          <div className="bg-purple-100 p-6 rounded-full mb-4">
            <Server className="h-16 w-16 text-purple-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">节点负载</h4>
          <span className="text-sm text-gray-500">低负载 (12%)</span>
        </div>

        {/* Placeholder 4 */}
        <div className="flex flex-col items-center">
          <div className="bg-orange-100 p-6 rounded-full mb-4">
            <Cpu className="h-16 w-16 text-orange-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">系统性能</h4>
          <span className="text-sm text-gray-500">优化中</span>
        </div>
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">系统公告</h3>
        <p className="text-gray-600">
            本系统已连接至远程数据库 <code className="bg-gray-200 px-1 rounded text-sm">101.132.178.161</code>。
            所有用户、角色和权限的修改将实时同步。请谨慎操作“用户管理”与“角色管理”模块。
        </p>
      </div>
    </div>
  );
};