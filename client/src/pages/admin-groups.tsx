import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Shield, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const groupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  isActive: z.boolean().default(true)
});

type GroupFormData = z.infer<typeof groupFormSchema>;

interface UserGroup {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
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

export default function AdminGroups() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user groups
  const { data: userGroups = [], isLoading: isGroupsLoading } = useQuery({
    queryKey: ['/api/admin/user-groups'],
    queryFn: () => apiRequest('/api/admin/user-groups')
  });

  // Fetch all permissions
  const { data: allPermissions = [] } = useQuery({
    queryKey: ['/api/admin/permissions'],
    queryFn: () => apiRequest('/api/admin/permissions')
  });

  // Fetch group permissions
  const { data: groupPermissions = [] } = useQuery({
    queryKey: ['/api/admin/user-groups', selectedGroupId, 'permissions'],
    queryFn: () => selectedGroupId ? apiRequest(`/api/admin/user-groups/${selectedGroupId}/permissions`) : [],
    enabled: !!selectedGroupId,
    onSuccess: (data) => {
      setSelectedPermissions(data.map((p: Permission) => p.id));
    }
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (groupData: GroupFormData) => 
      apiRequest('/api/admin/user-groups', {
        method: 'POST',
        body: JSON.stringify(groupData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-groups'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "User group created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user group",
        variant: "destructive"
      });
    }
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: ({ id, ...groupData }: GroupFormData & { id: number }) => 
      apiRequest(`/api/admin/user-groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(groupData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-groups'] });
      setEditingGroup(null);
      toast({
        title: "Success",
        description: "User group updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user group",
        variant: "destructive"
      });
    }
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/user-groups/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-groups'] });
      toast({
        title: "Success",
        description: "User group deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user group",
        variant: "destructive"
      });
    }
  });

  // Update group permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: ({ groupId, permissionIds }: { groupId: number; permissionIds: number[] }) => 
      apiRequest(`/api/admin/user-groups/${groupId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissionIds })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-groups', selectedGroupId, 'permissions'] });
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

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true
    }
  });

  const onSubmit = (data: GroupFormData) => {
    if (editingGroup) {
      updateGroupMutation.mutate({ ...data, id: editingGroup.id });
    } else {
      createGroupMutation.mutate(data);
    }
  };

  const handleEdit = (group: UserGroup) => {
    setEditingGroup(group);
    form.reset({
      name: group.name,
      description: group.description,
      isActive: group.isActive
    });
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingGroup(null);
    form.reset();
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = () => {
    if (selectedGroupId) {
      updatePermissionsMutation.mutate({
        groupId: selectedGroupId,
        permissionIds: selectedPermissions
      });
    }
  };

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Groups Management</h1>
          <p className="text-muted-foreground">
            Manage user groups and their permissions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen || !!editingGroup} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingGroup ? 'Edit Group' : 'Create New Group'}</DialogTitle>
              <DialogDescription>
                {editingGroup ? 'Update group information.' : 'Add a new user group to the system.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Administrators" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the purpose and responsibilities of this group..."
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable or disable this group
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createGroupMutation.isPending || updateGroupMutation.isPending}>
                    {editingGroup ? 'Update Group' : 'Create Group'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Groups List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Groups ({userGroups.length})
            </CardTitle>
            <CardDescription>
              Manage user groups and their basic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGroupsLoading ? (
              <div className="text-center py-8">Loading groups...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userGroups.map((group: UserGroup) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {group.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={group.isActive ? "default" : "secondary"}>
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(group)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedGroupId(group.id)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteGroupMutation.mutate(group.id)}
                            disabled={deleteGroupMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Permissions Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Group Permissions
            </CardTitle>
            <CardDescription>
              {selectedGroupId 
                ? `Configure permissions for selected group`
                : "Select a group to manage its permissions"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedGroupId ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a group from the list to manage its permissions
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {selectedPermissions.length} of {allPermissions.length} permissions selected
                  </div>
                  <Button 
                    onClick={handleSavePermissions}
                    disabled={updatePermissionsMutation.isPending}
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {Object.entries(permissionsByModule).map(([module, permissions]) => (
                    <div key={module} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{module}</h4>
                      <div className="space-y-2">
                        {permissions.map((permission: Permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <label 
                              htmlFor={`permission-${permission.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                            >
                              <div>{permission.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {permission.description}
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}