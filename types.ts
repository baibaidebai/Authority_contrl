export interface PermissionItem {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[]; // Names of permissions (e.g., '添加用户')
  description?: string; // Optional (not in DB but kept for UI state if needed)
}

export interface User {
  id: number;
  name: string; // Changed from username to name
  roleIds: number[]; // Changed from roleId string to number array
  roleNames?: string[]; // For display
  password?: string;
}

export interface AuthState {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
}