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
import { Shield, Users, Settings, Lock, Star, Plus, Edit, Trash2 } from 'lucide-react';

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

export default function AdminPermissions() {
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
        description: "Não foi possível atualizar as permissões.",
        variant: "destructive"
      });
    }
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (data: z.infer<typeof groupFormSchema>) =>
      apiRequest('/api/admin/groups', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/groups'] });
      setIsCreateGroupOpen(false);
      groupForm.reset();
      toast({
        title: "Grupo criado",
        description: "O grupo foi criado com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o grupo.",
        variant: "destructive"
      });
    }
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: z.infer<typeof groupFormSchema> }) =>
      apiRequest(`/api/admin/groups/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/groups'] });
      setEditingGroup(null);
      groupForm.reset();
      toast({
        title: "Grupo atualizado",
        description: "O grupo foi atualizado com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o grupo.",
        variant: "destructive"
      });
    }
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/groups/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/groups'] });
      if (selectedGroup && selectedGroup.id === deleteGroupMutation.variables) {
        setSelectedGroup(null);
      }
      toast({
        title: "Grupo excluído",
        description: "O grupo foi excluído com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o grupo.",
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Grupos de Usuários
              </div>
              <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Grupo
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
                              <Textarea placeholder="Descreva o propósito deste grupo..." {...field} />
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
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createGroupMutation.isPending}>
                          {createGroupMutation.isPending ? 'Criando...' : 'Criar Grupo'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>
              Gerencie grupos e suas permissões
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
                    {group.name !== 'admin' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGroup(group);
                            groupForm.reset({
                              name: group.name,
                              displayName: group.displayName,
                              description: group.description,
                              color: group.color,
                              isActive: group.isActive
                            });
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Tem certeza que deseja excluir este grupo?')) {
                              deleteGroupMutation.mutate(group.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Edit Group Dialog */}
        {editingGroup && (
          <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Grupo</DialogTitle>
                <DialogDescription>
                  Modifique as informações do grupo {editingGroup.displayName}
                </DialogDescription>
              </DialogHeader>
              <Form {...groupForm}>
                <form onSubmit={groupForm.handleSubmit((data) => updateGroupMutation.mutate({ id: editingGroup.id, data }))} className="space-y-4">
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
                          <Textarea placeholder="Descreva o propósito deste grupo..." {...field} />
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
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={updateGroupMutation.isPending}>
                      {updateGroupMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}

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