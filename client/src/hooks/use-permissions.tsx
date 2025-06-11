
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Permission {
  id: number;
  key: string;
  name: string;
  description: string;
  module: string;
  category: string;
}

export function usePermissions(module?: string) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const url = module ? `/api/auth/permissions?module=${module}` : '/api/auth/permissions';
        const data = await apiRequest(url);
        setPermissions(data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [module]);

  const hasPermission = (permissionKey: string) => {
    return permissions.some(p => p.key === permissionKey);
  };

  const checkPermission = async (permissionKey: string): Promise<boolean> => {
    try {
      const response = await apiRequest('/api/auth/check-permission', 'POST', {
        permission: permissionKey
      });
      return response.hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  return {
    permissions,
    loading,
    hasPermission,
    checkPermission
  };
}
