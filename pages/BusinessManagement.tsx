import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';

const getPageConfig = (path: string) => {
    if (path.includes('cert')) return { title: '资质维护', columns: ['资质ID', '资质名称', '有效期', '适用范围'] };
    if (path.includes('type')) return { title: '分类管理', columns: ['分类ID', '分类名称', '层级', '排序'] };
    if (path.includes('process')) return { title: '流程管理', columns: ['流程编码', '流程名称', '节点数', '状态'] };
    if (path.includes('ads')) return { title: '广告管理', columns: ['广告ID', '广告位', '投放客户', '点击量'] };
    if (path.includes('message')) return { title: '消息模板', columns: ['模板ID', '模板标题', '触发事件', '渠道'] };
    if (path.includes('project-type')) return { title: '项目分类', columns: ['分类代码', '名称', '主管部门', '备注'] };
    if (path.includes('tag')) return { title: '项目标签', columns: ['标签ID', '标签名', '热度', '创建时间'] };
    return { title: '业务管理', columns: ['ID', '名称', '属性1', '属性2'] };
};

export const BusinessManagement: React.FC = () => {
    const location = useLocation();
    const { title, columns } = getPageConfig(location.pathname);

    // Mock Data Generator
    const rows = Array.from({ length: 5 }).map((_, i) => ({
        id: i + 1,
        col1: `${title} - 示例数据 ${i + 1}`,
        col2: i % 2 === 0 ? '启用' : '禁用/过期',
        col3: `Detail Info ${i + 1}`
    }));

    const handleAction = (action: string) => {
        alert(`[演示] 执行了 ${action} 操作`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <p className="text-gray-500 text-sm mt-1">配置系统的核心业务数据。</p>
                </div>
                <Button onClick={() => handleAction('新建')}>
                    <Plus className="w-4 h-4 mr-2" />
                    新建{title.slice(0, 2)}
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4 items-end">
                <div className="w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-1">关键词搜索</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="请输入名称..." />
                </div>
                <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态筛选</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option>全部</option>
                        <option>启用</option>
                        <option>禁用</option>
                    </select>
                </div>
                <Button variant="secondary">
                    <Filter className="w-4 h-4 mr-2" />
                    查询
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {col}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.col1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.col2}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.col3}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleAction('编辑')} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                                            <Edit className="w-4 h-4 mr-1" /> 编辑
                                        </button>
                                        <button onClick={() => handleAction('删除')} className="text-red-600 hover:text-red-900 flex items-center">
                                            <Trash2 className="w-4 h-4 mr-1" /> 删除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="text-center text-xs text-gray-400 mt-4">
                此页面为通用演示模板，不同业务模块共享此结构。
            </div>
        </div>
    );
};