import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, Lock, Star } from 'lucide-react';

interface UserGroup {
  id: number;
  name: string;
  displayName: string;
  description: string;
  color: string;
  isActive: boolean;
}

interface Permission {
  id: number;
  key: string;
  name: string;
  description: string;
  module: string;
  category: string;
  isActive: boolean;
}

interface GroupPermission {
  groupId: number;
  permissionId: number;
}

export default function AdminPermissions() {
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user groups
  const { data: userGroups = [] } = useQuery({
    queryKey: ['/api/admin/groups'],
    queryFn: () => apiRequest('/api/admin/groups')
  });

  // Fetch all permissions
  const { data: permissions = [] } = useQuery({
    queryKey: ['/api/admin/permissions'],
    queryFn: () => apiRequest('/api/admin/permissions')
  });

  // Fetch group permissions for selected group
  const { data: groupPermissions = [] } = useQuery({
    queryKey: ['/api/admin/groups', selectedGroup?.id, 'permissions'],
    queryFn: () => apiRequest(`/api/admin/user-groups/${selectedGroup?.id}/permissions`),
    enabled: !!selectedGroup
  });

  // Update group permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: ({ groupId, permissionIds }: { groupId: number; permissionIds: number[] }) =>
      apiRequest(`/api/admin/groups/${groupId}/permissions`, 'PUT', { permissionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/groups'] });
      toast({
        title: "Success",
        description: "Permissions updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive"
      });
    }
  });

  // Group permissions by module
  const permissionsByModule = Array.isArray(permissions) ? permissions.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {}) : {};

  // Check if permission is assigned to selected group
  const hasPermission = (permissionId: number) => {
    return Array.isArray(groupPermissions) && groupPermissions.some((gp: any) => gp.id === permissionId);
  };

  // Toggle permission for group
  const togglePermission = (permissionId: number) => {
    if (!selectedGroup || selectedGroup.name === 'admin') return;

    const currentPermissions = Array.isArray(groupPermissions) ? groupPermissions.map((gp: any) => gp.id) : [];
    const newPermissions = hasPermission(permissionId)
      ? currentPermissions.filter(id => id !== permissionId)
      : [...currentPermissions, permissionId];

    updatePermissionsMutation.mutate({
      groupId: selectedGroup.id,
      permissionIds: newPermissions
    });
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'materials': return <Star className="h-4 w-4" />;
      case 'ai_agents': return <Settings className="h-4 w-4" />;
      case 'tickets': return <Users className="h-4 w-4" />;
      case 'tools': return <Lock className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const getModuleDescription = (module: string) => {
    switch (module) {
      case 'admin': return 'Administrative access and system management';
      case 'materials': return 'Educational content and premium materials access';
      case 'ai_agents': return 'AI tools and credit management';
      case 'tickets': return 'Support system and ticket management';
      case 'tools': return 'Directory access and user interactions';
      default: return 'System permissions';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Permissions Management</h1>
        <p className="text-muted-foreground">Configure group permissions and access levels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Groups
            </CardTitle>
            <CardDescription>
              Select a group to manage permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.isArray(userGroups) && userGroups.map((group: UserGroup) => (
              <div
                key={group.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedGroup?.id === group.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                } ${group.name === 'admin' ? 'border-orange-200 bg-orange-50' : ''}`}
                onClick={() => setSelectedGroup(group)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{group.displayName}</div>
                    <div className="text-sm text-muted-foreground">{group.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={group.isActive ? "default" : "secondary"}
                      style={{ backgroundColor: group.color }}
                    >
                      {group.name}
                    </Badge>
                    {group.name === 'admin' && (
                      <Lock className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Permissions Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Permissions Configuration
              {selectedGroup && (
                <Badge className="ml-2" style={{ backgroundColor: selectedGroup.color }}>
                  {selectedGroup.displayName}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {selectedGroup 
                ? selectedGroup.name === 'admin' 
                  ? 'Admin group has full access to all permissions (cannot be modified)'
                  : 'Configure what this group can access and do'
                : 'Select a group to configure permissions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedGroup ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a user group to configure permissions
              </div>
            ) : (
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">All Permissions</TabsTrigger>
                  {Object.keys(permissionsByModule).map(module => (
                    <TabsTrigger key={module} value={module} className="capitalize">
                      {module.replace('_', ' ')}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                    <Card key={module}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-lg">
                          {getModuleIcon(module)}
                          <span className="ml-2 capitalize">{module.replace('_', ' ')}</span>
                        </CardTitle>
                        <CardDescription>
                          {getModuleDescription(module)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {modulePermissions.map((permission: Permission) => (
                            <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-sm text-muted-foreground">{permission.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Key: {permission.key}
                                </div>
                              </div>
                              <Checkbox
                                checked={selectedGroup.name === 'admin' || hasPermission(permission.id)}
                                disabled={selectedGroup.name === 'admin'}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                  <TabsContent key={module} value={module}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          {getModuleIcon(module)}
                          <span className="ml-2 capitalize">{module.replace('_', ' ')} Permissions</span>
                        </CardTitle>
                        <CardDescription>
                          {getModuleDescription(module)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {modulePermissions.map((permission: Permission) => (
                            <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-sm text-muted-foreground">{permission.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Key: {permission.key}
                                </div>
                              </div>
                              <Checkbox
                                checked={selectedGroup.name === 'admin' || hasPermission(permission.id)}
                                disabled={selectedGroup.name === 'admin'}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}