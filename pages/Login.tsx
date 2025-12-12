import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Lock, AlertCircle, Server } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(name, password);
      if (success) {
        navigate('/');
      } else {
        setError('用户名或密码错误');
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      
      if (msg.includes('Failed to fetch')) {
        setError('无法连接到服务器。请确认后端服务已启动 (node index.js) 且运行在 3001 端口。');
      } else {
        setError(`登录失败: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          登录
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          RBAC 权限管理系统
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="用户名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            登 录
          </Button>

          <div className="mt-4 text-center text-xs text-gray-500 bg-gray-50 p-3 rounded space-y-1">
             <p className="font-semibold text-gray-700">测试账号 (默认密码: password):</p>
             <div className="grid grid-cols-2 gap-2 mt-1">
               <span className="font-mono bg-gray-200 px-1 rounded block" title="所有权限">admin (管理)</span>
               <span className="font-mono bg-gray-200 px-1 rounded block" title="添加/修改/删除用户">editor (编辑)</span>
               <span className="font-mono bg-gray-200 px-1 rounded block" title="仅查看">viewer (普通)</span>
               <span className="font-mono bg-gray-200 px-1 rounded block" title="多重角色">dualuser (双)</span>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};