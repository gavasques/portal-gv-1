import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function AdminPermissions() {
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [pendingChanges, setPendingChanges] = useState<number[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/groups', selectedGroup?.id, 'permissions'] });
      toast({
        title: "Permissões atualizadas",
        description: "As permissões do grupo foram salvas com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as permissões.",
        variant: "destructive"
      });
    }
  });

  // Initialize pending changes when group permissions change
  useEffect(() => {
    if (selectedGroup && Array.isArray(groupPermissions)) {
      const currentPermissions = groupPermissions.map((gp: any) => gp.id);
      setPendingChanges(currentPermissions);
      setHasUnsavedChanges(false);
    }
  }, [selectedGroup, groupPermissions]);

  // Group permissions by module
  const permissionsByModule = Array.isArray(permissions) ? permissions.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {}) : {};

  // Check if permission is assigned to selected group (from pending changes)
  const hasPermission = (permissionId: number) => {
    return pendingChanges.includes(permissionId);
  };

  // Toggle permission for group (only update pending state)
  const togglePermission = (permissionId: number) => {
    if (!selectedGroup || selectedGroup.name === 'admin') return;

    const newPendingChanges = pendingChanges.includes(permissionId)
      ? pendingChanges.filter(id => id !== permissionId)
      : [...pendingChanges, permissionId];

    setPendingChanges(newPendingChanges);
    setHasUnsavedChanges(true);
  };

  // Save changes
  const savePermissions = () => {
    if (!selectedGroup) return;

    updatePermissionsMutation.mutate({
      groupId: selectedGroup.id,
      permissionIds: pendingChanges
    });
  };

  // Cancel changes
  const cancelChanges = () => {
    if (selectedGroup && Array.isArray(groupPermissions)) {
      const currentPermissions = groupPermissions.map((gp: any) => gp.id);
      setPendingChanges(currentPermissions);
      setHasUnsavedChanges(false);
    }
  };

  const handleGroupSelect = (group: UserGroup) => {
    setSelectedGroup(group);
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
      case 'admin': return 'Acesso administrativo e gerenciamento do sistema';
      case 'materials': return 'Acesso a conteúdo educacional e materiais premium';
      case 'ai_agents': return 'Ferramentas de IA e gerenciamento de créditos';
      case 'tickets': return 'Sistema de suporte e gerenciamento de tickets';
      case 'tools': return 'Acesso ao diretório e interações do usuário';
      default: return 'Permissões do sistema';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Controle de Acesso</h1>
        <p className="text-muted-foreground">Configure permissões de grupos e níveis de acesso</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Grupos de Usuários
            </CardTitle>
            <CardDescription>
              Selecione um grupo para gerenciar permissões
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.isArray(userGroups) && userGroups.map((group: UserGroup) => (
              <div
                key={group.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedGroup?.id === group.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                } ${group.name === 'admin' ? 'border-orange-200 bg-orange-50' : ''}`}
                onClick={() => handleGroupSelect(group)}
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
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Admin
                      </Badge>
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
              Configuração de Permissões
              {selectedGroup && (
                <Badge className="ml-2" style={{ backgroundColor: selectedGroup.color }}>
                  {selectedGroup.displayName}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {selectedGroup 
                ? selectedGroup.name === 'admin' 
                  ? 'Grupo admin possui acesso total a todas as permissões (não pode ser modificado)'
                  : 'Configure o que este grupo pode acessar e fazer'
                : 'Selecione um grupo para configurar permissões'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedGroup ? (
              <div className="text-center py-8 text-muted-foreground">
                Selecione um grupo de usuários para configurar permissões
              </div>
            ) : (
              <div className="space-y-4">
                {/* Save/Cancel Buttons */}
                {selectedGroup.name !== 'admin' && (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {hasUnsavedChanges && (
                        <div className="text-sm text-amber-600">
                          ⚠️ Você tem alterações não salvas
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={cancelChanges}
                        disabled={!hasUnsavedChanges}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={savePermissions}
                        disabled={!hasUnsavedChanges || updatePermissionsMutation.isPending}
                      >
                        {updatePermissionsMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  </div>
                )}

                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="all">Todas as Permissões</TabsTrigger>
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
                            {(modulePermissions as Permission[]).map((permission: Permission) => (
                              <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium">{permission.name}</div>
                                  <div className="text-sm text-muted-foreground">{permission.description}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Chave: {permission.key}
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
                            <span className="ml-2 capitalize">Permissões de {module.replace('_', ' ')}</span>
                          </CardTitle>
                          <CardDescription>
                            {getModuleDescription(module)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {(modulePermissions as Permission[]).map((permission: Permission) => (
                              <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium">{permission.name}</div>
                                  <div className="text-sm text-muted-foreground">{permission.description}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Chave: {permission.key}
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}