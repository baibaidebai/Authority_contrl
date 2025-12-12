import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings2, 
  User, 
  Shield, 
  Lock, 
  CheckCircle, 
  Grid, 
  List, 
  ChevronDown, 
  ChevronRight, 
  LogOut, 
  HelpCircle,
  User as UserIcon,
  MessageSquare,
  Cog,
  Menu
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  badge?: number;
  children?: MenuItem[];
  requiredPermission?: string; // New: Permission required to view this menu
}

// Exporting the static menu definition so it can be used in PermissionManagement
export const SYSTEM_MENU_STRUCTURE: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: '控制面板', 
      icon: LayoutDashboard, 
      path: '/' 
    },
    {
      id: 'authority',
      label: '权限管理',
      icon: Settings2,
      badge: 3,
      children: [
        { id: 'user', label: '用户维护', icon: User, path: '/users', requiredPermission: '查询用户' },
        { id: 'role', label: '角色维护', icon: Shield, path: '/roles', requiredPermission: '角色管理' },
        { id: 'perm', label: '菜单维护', icon: Lock, path: '/permissions', requiredPermission: '角色管理' },
      ]
    },
    {
      id: 'audit',
      label: '业务审核',
      icon: CheckCircle,
      badge: 3,
      requiredPermission: '业务审核', // Control access to the entire Audit module
      children: [
        { id: 'auth_real', label: '实名认证审核', icon: CheckCircle, path: '/audit/real-name' },
        { id: 'auth_adv', label: '广告审核', icon: CheckCircle, path: '/audit/advertisement' },
        { id: 'auth_proj', label: '项目审核', icon: CheckCircle, path: '/audit/project' },
      ]
    },
    {
      id: 'business',
      label: '业务管理',
      icon: Grid,
      badge: 7,
      requiredPermission: '业务管理', // Control access to the entire Business Management module
      children: [
        { id: 'cert', label: '资质维护', icon: Grid, path: '/business/cert' },
        { id: 'type', label: '分类管理', icon: Grid, path: '/business/type' },
        { id: 'process', label: '流程管理', icon: Grid, path: '/business/process' },
        { id: 'ads', label: '广告管理', icon: Grid, path: '/business/ads' },
        { id: 'msg', label: '消息模板', icon: Grid, path: '/business/message' },
        { id: 'proj_type', label: '项目分类', icon: Grid, path: '/business/project-type' },
        { id: 'tag', label: '项目标签', icon: Grid, path: '/business/tag' },
      ]
    },
    {
      id: 'param',
      label: '参数管理',
      icon: List,
      path: '/params',
      requiredPermission: '参数管理' // Control access to Parameter Management
    }
];

export const Layout: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'authority': true,
    'audit': false,
    'business': false
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hiddenMenuIds, setHiddenMenuIds] = useState<string[]>([]);

  // Load hidden state and listen for changes
  useEffect(() => {
    const loadHiddenState = () => {
        try {
            const stored = localStorage.getItem('rbac_hidden_menus');
            if (stored) {
                setHiddenMenuIds(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to parse hidden menus", e);
        }
    };

    loadHiddenState();

    // Listen for custom event from PermissionManagement
    const handleMenuChange = () => loadHiddenState();
    window.addEventListener('menu_config_updated', handleMenuChange);

    return () => {
        window.removeEventListener('menu_config_updated', handleMenuChange);
    };
  }, []);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to filter menus based on hidden IDs AND RBAC Permissions
  const getVisibleMenus = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => {
            // 1. Check Local Hidden Config
            if (hiddenMenuIds.includes(item.id)) return false;
            
            // 2. Check RBAC Permission
            // If the item has a requiredPermission, check if user has it.
            // If item has no requiredPermission, it defaults to Visible (public to auth users).
            if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
                return false;
            }
            return true;
        })
        .map(item => {
            if (item.children) {
                const visibleChildren = getVisibleMenus(item.children);
                // Optional: If parent has no visible children, hide parent? 
                // Currently keeping parent if it passes permission check itself.
                // But usually better UX: hide parent if all children are hidden.
                // Let's attach the filtered children
                return { ...item, children: visibleChildren };
            }
            return item;
        })
        // Filter out parents that became empty after permission filtering (only if they are containers with no path)
        .filter(item => {
            if (item.children && item.children.length === 0 && !item.path) {
                return false;
            }
            return true;
        });
  };

  const visibleMenuItems = getVisibleMenus(SYSTEM_MENU_STRUCTURE);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar (Bootstrap Inverse Style) */}
      <header className="fixed top-0 left-0 w-full h-[50px] bg-[#222] text-[#9d9d9d] z-50 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center">
          <Link to="/" className="text-white text-xl font-bold tracking-tight hover:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-white" />
            <span>用户权限系统 - 控制面板</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#5cb85c] hover:bg-[#449d44] text-white rounded text-sm transition-colors border border-[#4cae4c]"
            >
              <UserIcon className="h-4 w-4" />
              <span className="font-medium">{user?.name || 'User'}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 text-gray-700 z-50 animate-fade-in">
                <button className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">
                  <Cog className="h-4 w-4 mr-2" /> 个人设置
                </button>
                <button className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">
                  <MessageSquare className="h-4 w-4 mr-2" /> 消息
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" /> 退出系统
                </button>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button className="flex items-center gap-1 px-3 py-1.5 bg-[#d9534f] hover:bg-[#c9302c] text-white rounded text-sm transition-colors border border-[#d43f3a]">
            <HelpCircle className="h-4 w-4" />
            <span>帮助</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 pt-[50px]">
        {/* Sidebar */}
        <aside className="fixed left-0 top-[50px] bottom-0 w-[240px] bg-white border-r border-gray-200 overflow-y-auto z-40">
          <div className="py-2">
            <ul className="space-y-1">
              {visibleMenuItems.map(item => {
                const isActive = item.path === location.pathname;
                const isExpanded = expandedMenus[item.id];
                const hasChildren = item.children && item.children.length > 0;
                
                // Check if any child is active to highlight parent
                const isChildActive = item.children?.some(child => location.pathname.startsWith(child.path || 'impossible_path'));

                return (
                  <li key={item.id} className="px-2">
                    {/* Parent Menu Item */}
                    <div 
                      onClick={() => hasChildren ? toggleMenu(item.id) : (item.path && navigate(item.path))}
                      className={`
                        flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm font-medium transition-colors
                        ${(isActive || isChildActive) && !hasChildren ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-gray-500" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                        {hasChildren && (
                          <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        )}
                      </div>
                    </div>

                    {/* Children Submenu */}
                    {hasChildren && isExpanded && (
                      <ul className="mt-1 ml-4 border-l border-gray-200 space-y-1 pl-2">
                        {item.children?.map(child => {
                          const isCurrent = child.path === location.pathname;
                          return (
                            <li key={child.id}>
                              <Link
                                to={child.path || '#'}
                                className={`
                                  flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                  ${isCurrent ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                                `}
                              >
                                <child.icon className="h-3.5 w-3.5" />
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Content Area */}
        <main className="ml-[240px] flex-1 p-6 md:p-10 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};