import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

// Demo Data Generators
const getDemoData = (type: string) => {
    const base = [
        { id: 1001, applicant: '杭州科技股份有限公司', date: '2023-10-24 10:30', status: '待审核' },
        { id: 1002, applicant: '李明 (个人)', date: '2023-10-24 11:15', status: '审核中' },
        { id: 1003, applicant: '云端创新工作室', date: '2023-10-23 09:00', status: '待审核' },
        { id: 1004, applicant: '上海贸易集团', date: '2023-10-22 16:45', status: '已驳回' },
    ];

    switch(type) {
        case 'real-name': 
            return base.map(i => ({ ...i, title: '企业实名认证申请', content: '营业执照.pdf, 法人身份证.jpg' }));
        case 'advertisement': 
            return base.map(i => ({ ...i, title: '双十一大促横幅广告', content: 'banner_v1.png (720x300)' }));
        case 'project': 
            return base.map(i => ({ ...i, title: '智慧城市二期项目申报', content: 'Project_Proposal.docx' }));
        default: return [];
    }
};

const getPageTitle = (path: string) => {
    if (path.includes('real-name')) return '实名认证审核';
    if (path.includes('advertisement')) return '广告审核';
    if (path.includes('project')) return '项目审核';
    return '业务审核';
};

export const BusinessAudit: React.FC = () => {
    const location = useLocation();
    const type = location.pathname.split('/').pop() || '';
    const title = getPageTitle(location.pathname);
    const data = getDemoData(type);

    const handleAudit = (id: number, approved: boolean) => {
        alert(`[演示] 审核操作已提交: \nID: ${id}\n结果: ${approved ? '通过' : '驳回'}`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-500 text-sm mt-1">处理待办的{title}任务列表。</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请标题</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人/单位</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交内容</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">#{item.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.applicant}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                    <FileText className="w-4 h-4 mr-1 text-gray-400" />
                                    {item.content}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${item.status === '待审核' ? 'bg-yellow-100 text-yellow-800' : 
                                          item.status === '审核中' ? 'bg-blue-100 text-blue-800' : 
                                          item.status === '已驳回' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => handleAudit(item.id, true)}
                                            className="text-green-600 hover:text-green-900 flex items-center" title="通过"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleAudit(item.id, false)}
                                            className="text-red-600 hover:text-red-900 flex items-center" title="驳回"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="flex justify-center">
                 <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">上一页</button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">2</button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">下一页</button>
                 </nav>
            </div>
        </div>
    );
};