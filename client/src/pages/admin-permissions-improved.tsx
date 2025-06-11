import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Users, Settings, Lock, Star, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface UserGroup {
  id: number;
  name: string;
  displayName: string;
  description: string;
  color: string;
  isActive: boolean;
}

const groupFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  displayName: z.string().min(1, "Nome de exibição é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  color: z.string().min(1, "Cor é obrigatória"),
  isActive: z.boolean().default(true)
});

interface Permission {
  id: number;
  key: string;
  name: string;
  description: string;
  module: string;
  category: string;
  isActive: boolean;
}

export default function AdminPermissionsImproved() {
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [pendingChanges, setPendingChanges] = useState<number[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const groupForm = useForm<z.infer<typeof groupFormSchema>>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      color: "#3b82f6",
      isActive: true
    }
  });

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
        description: "Falha ao salvar as permissões.",
        variant: "destructive"
      });
    }
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (data: z.infer<typeof groupFormSchema>) =>
      apiRequest('/api/admin/user-groups', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/groups'] });
      setIsCreateGroupOpen(false);
      groupForm.reset();
      toast({
        title: "Grupo criado",
        description: "Novo grupo de usuários criado com sucesso."
      });
    }
  });

  // Edit group mutation
  const editGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: z.infer<typeof groupFormSchema> }) =>
      apiRequest(`/api/admin/user-groups/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/groups'] });
      setEditingGroup(null);
      toast({
        title: "Grupo atualizado",
        description: "Grupo atualizado com sucesso."
      });
    }
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/user-groups/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/groups'] });
      toast({
        title: "Grupo excluído",
        description: "Grupo removido com sucesso."
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

  // Group permissions by category
  const permissionsByCategory = Array.isArray(permissions) ? permissions.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
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

  // Handle permission toggle with bulk state change
  const handlePermissionToggle = (permissionId: number) => {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'principal': return <Shield className="h-4 w-4" />;
      case 'educacional': return <Star className="h-4 w-4" />;
      case 'fornecedores_produtos': return <Users className="h-4 w-4" />;
      case 'ferramentas': return <Settings className="h-4 w-4" />;
      case 'suporte': return <Users className="h-4 w-4" />;
      case 'admin': return <Lock className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'principal': return 'Principal';
      case 'educacional': return 'Educacional';
      case 'fornecedores_produtos': return 'Fornecedores & Produtos';
      case 'ferramentas': return 'Ferramentas';
      case 'suporte': return 'Suporte';
      case 'admin': return 'Administração';
      default: return 'Sistema';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'principal': return 'Acesso ao dashboard e informações principais';
      case 'educacional': return 'Cursos, materiais educacionais e templates';
      case 'fornecedores_produtos': return 'Parceiros, fornecedores e gestão de produtos';
      case 'ferramentas': return 'Ferramentas, simuladores e agentes de IA';
      case 'suporte': return 'Sistema de chamados e suporte técnico';
      case 'admin': return 'Funções administrativas e configurações do sistema';
      default: return 'Permissões do sistema';
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Controle de Acesso</h1>
        <p className="text-muted-foreground">Configure permissões de grupos e níveis de acesso</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Groups List - Sidebar compacta */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Grupos
                </div>
                <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Grupo</DialogTitle>
                      <DialogDescription>
                        Crie um novo grupo de usuários para organizar permissões
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...groupForm}>
                      <form onSubmit={groupForm.handleSubmit((data) => createGroupMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={groupForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Grupo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: premium_users" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={groupForm.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome de Exibição</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Usuários Premium" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={groupForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Descrição do grupo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={groupForm.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cor</FormLabel>
                              <FormControl>
                                <Input type="color" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={createGroupMutation.isPending}>
                          {createGroupMutation.isPending ? 'Criando...' : 'Criar Grupo'}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userGroups.map((group: UserGroup) => (
                <div
                  key={group.id}
                  className={`p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                    selectedGroup?.id === group.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleGroupSelect(group)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div
                        className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs truncate">{group.displayName}</div>
                        <div className="text-xs text-muted-foreground truncate">{group.description}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Permissions Area */}
        <div className="col-span-12 lg:col-span-9">
          {selectedGroup ? (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Configuração de Permissões
                      <Badge variant="outline" className="ml-2" style={{ backgroundColor: selectedGroup.color, color: 'white' }}>
                        {selectedGroup.displayName}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Configure o que este grupo pode acessar e fazer
                    </CardDescription>
                  </div>
                  
                  {hasUnsavedChanges && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelChanges}
                        disabled={!hasUnsavedChanges}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={savePermissions}
                        disabled={!hasUnsavedChanges || updatePermissionsMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {updatePermissionsMutation.isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <Card key={category} className="border-l-4" style={{ borderLeftColor: selectedGroup.color }}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-sm">
                          {getCategoryIcon(category)}
                          <span className="ml-2">{getCategoryName(category)}</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {getCategoryDescription(category)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(categoryPermissions as Permission[]).map((permission: Permission) => (
                          <div key={permission.id} className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                            <Checkbox
                              checked={selectedGroup.name === 'admin' || hasPermission(permission.id)}
                              disabled={selectedGroup.name === 'admin'}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{permission.name}</div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {permission.description}
                              </div>
                              <div className="flex items-center mt-1">
                                <Badge variant="secondary" className="text-xs mr-1">
                                  {permission.module}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Selecione um Grupo</h3>
                  <p className="text-muted-foreground">
                    Escolha um grupo de usuários para configurar suas permissões
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}