import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRoles, saveRole, updateRole, getPermissions } from '../services/mockDb';
import { Role, PermissionItem } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ShieldPlus, Shield, Edit, Trash2 } from 'lucide-react';

export const RoleManagement: React.FC = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<PermissionItem[]>([]);
  
  // State to control Form visibility and mode (Add vs Edit)
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        getRoles(), 
        getPermissions()
      ]);
      setRoles(rolesData);
      setAvailablePermissions(permsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePerm = (permName: string) => {
    if (selectedPerms.includes(permName)) {
      setSelectedPerms(selectedPerms.filter(p => p !== permName));
    } else {
      setSelectedPerms([...selectedPerms, permName]);
    }
  };

  const openAddForm = () => {
      setEditingRole(null);
      setFormName('');
      setFormDesc('');
      setSelectedPerms([]);
      setShowForm(true);
  };

  const openEditForm = (role: Role) => {
      setEditingRole(role);
      setFormName(role.name);
      setFormDesc(role.description || '');
      setSelectedPerms(role.permissions);
      setShowForm(true);
      // Scroll to top to see the form
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    try {
        const roleData = {
            name: formName,
            description: formDesc,
            permissions: selectedPerms
        };

        if (editingRole) {
            // Update Mode
            await updateRole(editingRole.id, roleData);
        } else {
            // Create Mode
            await saveRole(roleData);
        }

        await loadData();
        
        // Reset
        setShowForm(false);
        setEditingRole(null);
        setFormName('');
        setFormDesc('');
        setSelectedPerms([]);
    } catch (error) {
        alert("保存失败: " + error);
    }
  };

  const handleCancel = () => {
      setShowForm(false);
      setEditingRole(null);
      setFormName('');
      setFormDesc('');
      setSelectedPerms([]);
  };

  const handleDeleteMock = () => {
      alert("演示功能：删除角色逻辑可在此扩展。");
  };

  const canAddRole = hasPermission('添加角色');
  // For demo consistency, we assume same permissions govern edit/delete or use '角色管理'
  const canManageRoles = hasPermission('角色管理') || hasPermission('添加角色');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">角色管理</h2>
          <p className="text-gray-500 text-sm">定义系统中的角色及其关联权限。</p>
        </div>
        {canAddRole && !showForm && (
          <Button onClick={openAddForm}>
            <ShieldPlus className="h-4 w-4 mr-2" />
            添加角色
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fade-in">
          <h3 className="text-lg font-medium mb-4">
              {editingRole ? '编辑角色' : '定义新角色'}
          </h3>
          <form onSubmit={handleSaveRole} className="space-y-4">
            <Input 
              label="角色名称" 
              placeholder="例如：审计员"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              required
            />
            <Input 
              label="描述 (可选)" 
              placeholder="该角色拥有什么权限？"
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分配权限</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
                {availablePermissions.map((perm) => (
                  <label key={perm.id} className="flex items-center space-x-2 cursor-pointer hover:opacity-80">
                    <input 
                      type="checkbox" 
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-gray-300"
                      checked={selectedPerms.includes(perm.name)}
                      onChange={() => togglePerm(perm.name)}
                    />
                    <span className="text-sm text-gray-700">{perm.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="secondary" onClick={handleCancel}>取消</Button>
              <Button type="submit">
                  {editingRole ? '更新角色' : '保存角色'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="text-center p-8 text-gray-500">加载中...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">包含权限</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                       <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Shield className="h-4 w-4" />
                       </div>
                       <div className="ml-4">
                         <div className="text-sm font-medium text-gray-900">{role.name}</div>
                         {role.description && <div className="text-xs text-gray-500">{role.description}</div>}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(perm => (
                        <span key={perm} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                          {perm}
                        </span>
                      ))}
                      {role.permissions.length === 0 && (
                          <span className="text-xs text-gray-400 italic">无权限</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     <div className="flex items-center space-x-4">
                        {canManageRoles ? (
                            <>
                                <button onClick={() => openEditForm(role)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="编辑权限">
                                   <Edit className="h-4 w-4" />
                                </button>
                                <button onClick={handleDeleteMock} className="text-red-500 hover:text-red-700 transition-colors" title="删除角色">
                                   <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <span className="text-gray-300 text-xs">仅查看</span>
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