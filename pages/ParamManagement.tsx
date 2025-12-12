import React from 'react';
import { Button } from '../components/Button';
import { Save, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ParamManagement: React.FC = () => {
    const { hasPermission } = useAuth();
    const params = [
        { key: 'SYSTEM_NAME', label: '系统名称', value: 'RBAC 权限管理系统', type: 'text' },
        { key: 'MAX_LOGIN_ATTEMPTS', label: '最大登录尝试次数', value: '5', type: 'number' },
        { key: 'SESSION_TIMEOUT', label: '会话超时时间 (分钟)', value: '30', type: 'number' },
        { key: 'ALLOW_REGISTRATION', label: '允许开放注册', value: 'false', type: 'boolean' },
        { key: 'SMTP_SERVER', label: '邮件服务器地址', value: 'smtp.example.com', type: 'text' },
        { key: 'MAINTENANCE_MODE', label: '维护模式', value: 'false', type: 'boolean' },
    ];

    if (!hasPermission('参数管理')) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <Lock className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">访问被拒绝</h2>
                <p className="text-gray-600 max-w-md">
                    您当前的角色没有访问 <strong>参数管理</strong> 模块的权限。请联系管理员申请授权。
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">参数管理</h2>
                    <p className="text-gray-500 text-sm mt-1">全局系统配置参数。</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={() => window.location.reload()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        重置
                    </Button>
                    <Button onClick={() => alert('[演示] 参数保存成功！')}>
                        <Save className="w-4 h-4 mr-2" />
                        保存配置
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">参数键名</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">参数说明</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">参数值</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {params.map((param) => (
                            <tr key={param.key} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                    {param.key}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {param.label}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {param.type === 'boolean' ? (
                                        <div className="flex items-center space-x-4">
                                            <label className="inline-flex items-center">
                                                <input type="radio" name={param.key} defaultChecked={param.value === 'true'} className="text-indigo-600" />
                                                <span className="ml-2">是</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input type="radio" name={param.key} defaultChecked={param.value === 'false'} className="text-indigo-600" />
                                                <span className="ml-2">否</span>
                                            </label>
                                        </div>
                                    ) : (
                                        <input 
                                            type={param.type} 
                                            defaultValue={param.value}
                                            className="w-full max-w-md border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border px-2 py-1"
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            警告：修改系统参数可能会影响系统运行稳定性，请谨慎操作。修改后可能需要重启服务生效。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};