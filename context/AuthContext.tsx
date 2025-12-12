import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, AuthState } from '../types';
import { findUserByCredentials, getRoleById } from '../services/mockDb';

interface AuthContextType extends AuthState {
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    // Check local storage for active session on load
    const storedUser = localStorage.getItem('rbac_session_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      refreshUserRole(parsedUser);
    }
  }, []);

  const refreshUserRole = async (userData: User) => {
    try {
      // Fetch fresh role data from backend
      // We assume for now we use the first role as the primary context
      if (userData.roleIds && userData.roleIds.length > 0) {
        const currentRole = await getRoleById(userData.roleIds[0]);
        setRole(currentRole || null);
      } else {
        setRole(null);
      }
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh role:", error);
    }
  };

  const login = async (name: string, password: string): Promise<boolean> => {
    try {
      const foundUser = await findUserByCredentials(name, password);
      if (foundUser) {
        localStorage.setItem('rbac_session_user', JSON.stringify(foundUser));
        await refreshUserRole(foundUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('rbac_session_user');
    setUser(null);
    setRole(null);
  };

  const hasPermission = (perm: string): boolean => {
    if (!role) return false;
    return role.permissions.some(p => p === perm);
  };

  const refreshSession = () => {
    if (user) {
        const storedUser = localStorage.getItem('rbac_session_user');
        if(storedUser) {
           refreshUserRole(JSON.parse(storedUser));
        }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      hasPermission,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};