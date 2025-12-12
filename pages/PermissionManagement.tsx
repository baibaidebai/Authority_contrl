import React, { useState, useEffect } from 'react';
import { SYSTEM_MENU_STRUCTURE, MenuItem } from '../components/Layout';
import { Button } from '../components/Button';
import { Folder, FileText, ChevronRight, ChevronDown, Eye, EyeOff, Lock } from 'lucide-react';

export const PermissionManagement: React.FC = () => {
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [hiddenMenuIds, setHiddenMenuIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Load the Static Menu Structure
    setMenuTree(SYSTEM_MENU_STRUCTURE);

    // 2. Load Hidden State from LocalStorage
    try {
        const stored = localStorage.getItem('rbac_hidden_menus');
        if (stored) {
            setHiddenMenuIds(JSON.parse(stored));
        }
    } catch (e) {
        console.error("Failed to load hidden menus", e);
    }

    // 3. Auto expand all for editing convenience
    const allIds: Record<string, boolean> = {};
    const traverse = (items: MenuItem[]) => {
        items.forEach(i => {
            if (i.children) {
                allIds[i.id] = true;
                traverse(i.children);
            }
        });
    };
    traverse(SYSTEM_MENU_STRUCTURE);
    setExpandedNodes(allIds);

    setLoading(false);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleVisibility = (id: string) => {
    let newHiddenIds;
    if (hiddenMenuIds.includes(id)) {
        // Show it
        newHiddenIds = hiddenMenuIds.filter(hid => hid !== id);
    } else {
        // Hide it
        newHiddenIds = [...hiddenMenuIds, id];
    }
    
    setHiddenMenuIds(newHiddenIds);
    
    // Persist
    localStorage.setItem('rbac_hidden_menus', JSON.stringify(newHiddenIds));
    
    // Notify Layout to update immediately
    window.dispatchEvent(new Event('menu_config_updated'));
  };

  const renderTree = (nodes: MenuItem[], level: number = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedNodes[node.id];
      const hasChildren = node.children && node.children.length > 0;
      const isHidden = hiddenMenuIds.includes(node.id);
      const Icon = node.icon || (hasChildren ? Folder : FileText);

      return (
        <div key={node.id} className="select-none">
          <div 
            className={`
                flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors
                ${isHidden ? 'bg-gray-50 opacity-75' : 'bg-white'}
            `}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            {/* Left Side: Tree & Name */}
            <div className="flex items-center gap-3 flex-1">
               <div 
                  className={`w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 cursor-pointer ${!hasChildren && 'invisible'}`}
                  onClick={() => hasChildren && toggleExpand(node.id)}
               >
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
               </div>
               
               <div className={`p-1.5 rounded-md ${isHidden ? 'bg-gray-200' : 'bg-indigo-50 text-indigo-600'}`}>
                   <Icon className="w-4 h-4" />
               </div>
               
               <div className="flex flex-col">
                   <div className="flex items-center gap-2">
                       <span className={`text-sm font-medium ${isHidden ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                           {node.label}
                       </span>
                       {node.requiredPermission && (
                           <span className="flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200" title="访问此菜单所需的系统权限">
                               <Lock className="w-3 h-3 mr-1" />
                               {node.requiredPermission}
                           </span>
                       )}
                   </div>
                   <span className="text-xs text-gray-400">ID: {node.id}</span>
               </div>
            </div>

            {/* Right Side: Toggle Action */}
            <div className="flex items-center px-4">
                <button
                    onClick={() => toggleVisibility(node.id)}
                    className={`
                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                        ${!isHidden ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                    role="switch"
                    aria-checked={!isHidden}
                >
                    <span className="sr-only">Toggle Visibility</span>
                    <span
                        aria-hidden="true"
                        className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${!isHidden ? 'translate-x-5' : 'translate-x-0'}
                        `}
                    />
                </button>
                <div className="ml-3 w-16 text-xs font-medium text-gray-500">
                    {isHidden ? (
                        <span className="flex items-center text-gray-400"><EyeOff className="w-3 h-3 mr-1"/> 已隐藏</span>
                    ) : (
                        <span className="flex items-center text-green-600"><Eye className="w-3 h-3 mr-1"/> 显示中</span>
                    )}
                </div>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="animate-fade-in border-l border-gray-100 ml-4">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">菜单维护</h2>
          <p className="text-gray-500 text-sm mt-1">控制菜单的显示/隐藏（本地设置）并查看菜单绑定的系统权限（RBAC）。</p>
        </div>
        <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => {
                if(window.confirm('确定要重置所有菜单为显示状态吗？')) {
                    localStorage.removeItem('rbac_hidden_menus');
                    setHiddenMenuIds([]);
                    window.dispatchEvent(new Event('menu_config_updated'));
                }
            }}>
                重置默认
            </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
         <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="pl-10">菜单结构</span>
            <span className="pr-12">状态设置</span>
         </div>
         {loading ? (
             <div className="p-8 text-center text-gray-500">加载菜单配置中...</div>
         ) : (
             <div className="py-2">
                 {renderTree(menuTree)}
             </div>
         )}
      </div>

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex items-start gap-3">
          <div className="text-blue-600 mt-0.5"><Lock className="w-5 h-5"/></div>
          <div>
              <h4 className="text-blue-800 font-medium text-sm mb-1">权限说明</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                  1. 带有黄色锁图标的菜单项（如“用户维护”）绑定了后端权限。如果您的角色没有对应权限，该菜单将自动隐藏，无论右侧开关是否开启。<br/>
                  2. 右侧的开关是“本地显示设置”，用于个性化隐藏您不常用的菜单，仅对当前浏览器生效。
              </p>
          </div>
      </div>
    </div>
  );
};