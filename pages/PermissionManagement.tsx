import React, { useState, useEffect } from 'react';
import { getPermissions } from '../services/mockDb';
import { PermissionItem } from '../types';
import { Button } from '../components/Button';
import { Folder, FileText, ChevronRight, ChevronDown, Plus, Trash2, Edit } from 'lucide-react';

interface PermissionNode extends PermissionItem {
  children: PermissionNode[];
  level: number;
}

export const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [treeData, setTreeData] = useState<PermissionNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch real data from Remote DB
      const data = await getPermissions();
      // Add 'super_ID' support if backend returns it (currently backend returns flat list with super_ID implied or explicit)
      // The current backend types.ts doesn't explicitly show super_ID in interface, but the DB has it.
      // We'll assume the API returns what's in the DB.
      setPermissions(data);
      setTreeData(buildTree(data as any));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (items: any[]): PermissionNode[] => {
    const map: Record<number, PermissionNode> = {};
    const roots: PermissionNode[] = [];

    // Initialize map
    items.forEach(item => {
      map[item.id || item.ID] = { ...item, children: [], level: 0 };
    });

    // Build hierarchy
    items.forEach(item => {
      const node = map[item.id || item.ID];
      if (item.super_ID && map[item.super_ID]) {
        node.level = map[item.super_ID].level + 1;
        map[item.super_ID].children.push(node);
      } else {
        roots.push(node);
      }
      
      // Auto expand root nodes
      if (!item.super_ID) {
          setExpandedNodes(prev => ({...prev, [item.id || item.ID]: true}));
      }
    });

    return roots;
  };

  const toggleExpand = (id: number) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDemoAction = (action: string, nodeName: string) => {
      alert(`[演示模式] ${action}: "${nodeName}"\n\n提示：当前后端仅提供权限查询接口，添加/修改/删除操作仅为UI演示，未连接到真实数据库。`);
  };

  const renderTree = (nodes: PermissionNode[]) => {
    return nodes.map(node => {
      const isExpanded = expandedNodes[node.id || (node as any).ID];
      const hasChildren = node.children && node.children.length > 0;
      const Icon = hasChildren ? Folder : FileText;

      return (
        <div key={node.id || (node as any).ID} className="select-none">
          <div 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border-b border-gray-100 group transition-colors"
            style={{ paddingLeft: `${node.level * 24 + 12}px` }}
          >
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => hasChildren && toggleExpand(node.id || (node as any).ID)}>
              <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                {hasChildren && (
                  isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                )}
              </div>
              <Icon className={`w-4 h-4 ${hasChildren ? 'text-indigo-500' : 'text-gray-500'}`} />
              <span className="text-sm text-gray-700 font-medium">{node.name}</span>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => handleDemoAction('添加子菜单', node.name)}
                className="p-1 hover:bg-indigo-50 text-indigo-600 rounded" title="添加子节点"
               >
                   <Plus className="w-3.5 h-3.5" />
               </button>
               <button 
                onClick={() => handleDemoAction('编辑菜单', node.name)}
                className="p-1 hover:bg-blue-50 text-blue-600 rounded" title="编辑"
               >
                   <Edit className="w-3.5 h-3.5" />
               </button>
               <button 
                onClick={() => handleDemoAction('删除菜单', node.name)}
                className="p-1 hover:bg-red-50 text-red-600 rounded" title="删除"
               >
                   <Trash2 className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div className="animate-fade-in">
              {renderTree(node.children)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">菜单维护</h2>
          <p className="text-gray-500 text-sm mt-1">管理系统菜单结构与权限节点 (当前展示为数据库真实结构)。</p>
        </div>
        <Button onClick={() => handleDemoAction('创建根节点', 'New Root')}>
            <Plus className="w-4 h-4 mr-2" />
            添加根菜单
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
         <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>菜单名称</span>
            <span>操作</span>
         </div>
         {loading ? (
             <div className="p-8 text-center text-gray-500">加载权限树中...</div>
         ) : (
             <div className="py-2">
                 {treeData.length > 0 ? renderTree(treeData) : (
                     <div className="p-4 text-center text-gray-400">暂无数据</div>
                 )}
             </div>
         )}
      </div>

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
          <h4 className="text-blue-800 font-medium mb-2 text-sm">功能说明</h4>
          <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
              <li>此页面展示了远程数据库中 <code>Permission</code> 表的层级结构。</li>
              <li>点击文件夹图标或箭头可折叠/展开子菜单。</li>
              <li>悬停在菜单行上可显示操作按钮 (添加、编辑、删除)。</li>
              <li>由于后端API限制，目前的增删改操作为演示效果，不会写入数据库。</li>
          </ul>
      </div>
    </div>
  );
};