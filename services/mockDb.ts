import { User, Role, PermissionItem } from '../types';

// Detect the environment to choose the best API URL.
// 1. If running on localhost/127.0.0.1, point to port 3001 (standard local dev).
// 2. If running elsewhere (e.g. cloud IDE), try relative path '/api' assuming a proxy is set up, 
//    or fallback to the hostname on port 3001.
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:3001/api`;
    }
    // Fallback for cloud environments or custom setups
    // You might need to adjust this if your backend is hosted on a specific URL
    return `http://${hostname}:3001/api`; 
  }
  return 'http://127.0.0.1:3001/api';
};

const API_BASE = getApiBase();

/**
 * Generic helper to handle API requests
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMessage = errorData.error;
      } catch {
        // Fallback to status text if JSON parse fails
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
}

export const getRoles = async (): Promise<Role[]> => {
  return request<Role[]>('/roles');
};

export const getPermissions = async (): Promise<PermissionItem[]> => {
  return request<PermissionItem[]>('/permissions');
};

export const saveRole = async (role: Partial<Role>) => {
  return request<{success: boolean, id: number}>('/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role)
  });
};

export const updateRole = async (id: number, role: Partial<Role>) => {
  return request<{success: boolean}>(`/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role)
  });
};

export const deleteRole = async (id: number) => {
  return request<{success: boolean}>(`/roles/${id}`, {
      method: 'DELETE'
  });
};

export const getUsers = async (): Promise<User[]> => {
  return request<User[]>('/users');
};

export const saveUser = async (user: Partial<User> & { roleId: number }) => {
  return request<{success: boolean, id: number}>('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
};

export const updateUserRole = async (userId: number, roleId: number) => {
  return request<{success: boolean}>(`/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleId })
  });
};

export const deleteUser = async (userId: number) => {
  return request<{success: boolean}>(`/users/${userId}`, {
    method: 'DELETE'
  });
};

export const findUserByCredentials = async (name: string, password: string): Promise<User | undefined> => {
  // Special handling for login to catch 401 specifically
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password })
  });
  
  if (response.status === 401) return undefined;
  
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     throw new Error(errorData.error || `Login failed: ${response.status}`);
  }
  
  return response.json();
};

// New function for impersonation
export const loginAsUser = async (userId: number): Promise<User> => {
    return request<User>('/login-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
};

export const getRoleById = async (id: number): Promise<Role | undefined> => {
  const response = await fetch(`${API_BASE}/roles/${id}`);
  if (response.status === 404) return undefined;
  
  if (!response.ok) {
    throw new Error(`Failed to fetch role: ${response.status}`);
  }
  
  return response.json();
};