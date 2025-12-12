import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, getRoles, saveUser, updateUserRole, deleteUser } from '../services/mockDb';
import { User, Role } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { UserPlus, Shield, Trash2 } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRoleId, setNewUserRoleId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [u, r] = await Promise.all([getUsers(), getRoles()]);
      setUsers(u);
      setRoles(r);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserPass || !newUserRoleId) return;

    await saveUser({
      name: newUserName,
      password: newUserPass,
      roleId: parseInt(newUserRoleId)
    });

    await loadData();
    setIsAdding(false);
    setNewUserName('');
    setNewUserPass('');
    setNewUserRoleId('');
  };

  const handleRoleChange = async (userId: number, newRoleId: string) => {
    if (!newRoleId) return;
    await updateUserRole(userId, parseInt(newRoleId));
    await loadData();
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('确定要删除此用户吗？此操作无法撤销。')) {
      try {
        await deleteUser(userId);
        await loadData();
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("删除失败，请重试");
      }
    }
  };

  // Permission check using specific database permission name
  const canAddUser = hasPermission('添加用户');
  const canModifyUser = hasPermission('修改用户');
  const canDeleteUser = hasPermission('删除用户');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
          <p className="text-gray-500 text-sm">创建用户并分配他们的角色。</p>
        </div>
        {canAddUser && (
          <Button onClick={() => setIsAdding(!isAdding)}>
            <UserPlus className="h-4 w-4 mr-2" />
            添加用户
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fade-in">
          <h3 className="text-lg font-medium mb-4">创建新用户</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <Input 
              label="用户名" 
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              required
            />
            <Input 
              label="密码" 
              type="password"
              value={newUserPass}
              onChange={e => setNewUserPass(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分配角色</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={newUserRoleId}
                onChange={e => setNewUserRoleId(e.target.value)}
                required
              >
                <option value="">请选择一个角色...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>取消</Button>
              <Button type="submit">创建用户</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前角色</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4 text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roleNames && user.roleNames.length > 0 ? (
                        user.roleNames.map((rname, idx) => (
                          <span key={idx} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {rname}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">未分配</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      {canModifyUser && (
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <select 
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={user.roleIds?.[0] || ''}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          >
                             <option value="" disabled>更改角色</option>
                             {roles.map(role => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {canDeleteUser && (
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="删除用户"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      
                      {!canModifyUser && !canDeleteUser && (
                        <span className="text-gray-400 italic">仅查看</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};