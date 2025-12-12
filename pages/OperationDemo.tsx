import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Eye, Edit3, Trash2, AlertTriangle } from 'lucide-react';

export const OperationDemo: React.FC = () => {
  const { hasPermission, role } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] 成功：执行了 ${action} 操作`, ...prev]);
  };

  const handleRead = () => addLog('查询用户 (Read)');
  const handleWrite = () => addLog('添加用户 (Write)');
  const handleDelete = () => addLog('删除用户 (Delete)');

  // Map the demo actions to specific DB permissions
  // Mapping:
  // "View Data" -> "查询用户"
  // "Edit/Add Data" -> "添加用户"
  // "Delete Data" -> "删除用户"
  const canRead = hasPermission('查询用户');
  const canWrite = hasPermission('添加用户');
  const canDelete = hasPermission('删除用户');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">操作与权限演示</h2>
        <p className="text-gray-500 mt-2">
          此面板演示动态界面控制。下方的按钮将根据您当前的角色（<span className="font-bold text-indigo-600">{role?.name || '无'}</span>）显示、禁用或隐藏。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Read Card */}
        <div className={`p-6 rounded-lg border-2 ${canRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">查询用户</h3>
            <Eye className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-sm text-gray-600 mb-6">需要 '查询用户' 权限。</p>
          <Button 
            onClick={handleRead} 
            disabled={!canRead} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {canRead ? '执行查询' : '访问被拒绝'}
          </Button>
        </div>

        {/* Write Card */}
        <div className={`p-6 rounded-lg border-2 ${canWrite ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">添加用户</h3>
            <Edit3 className="h-6 w-6 text-amber-500" />
          </div>
          <p className="text-sm text-gray-600 mb-6">需要 '添加用户' 权限。</p>
          <Button 
            onClick={handleWrite} 
            disabled={!canWrite} 
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {canWrite ? '执行添加' : '访问被拒绝'}
          </Button>
        </div>

        {/* Delete Card */}
        <div className={`p-6 rounded-lg border-2 ${canDelete ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">删除用户</h3>
            <Trash2 className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-sm text-gray-600 mb-6">需要 '删除用户' 权限。</p>
          <Button 
            variant="danger"
            onClick={handleDelete} 
            disabled={!canDelete} 
            className="w-full"
          >
            {canDelete ? '执行删除' : '访问被拒绝'}
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 text-gray-200 font-mono text-sm h-48 overflow-y-auto">
        <p className="text-gray-500 mb-2 border-b border-gray-700 pb-2">操作日志...</p>
        {logs.length === 0 && <p className="text-gray-600 italic">暂无操作记录。</p>}
        {logs.map((log, idx) => (
          <div key={idx} className="mb-1">{log}</div>
        ))}
        {!canRead && !canWrite && !canDelete && (
             <div className="mt-4 flex items-center text-yellow-500">
                <AlertTriangle className="h-4 w-4 mr-2" />
                您当前的角色没有任何权限。请联系管理员。
             </div>
        )}
      </div>
    </div>
  );
};