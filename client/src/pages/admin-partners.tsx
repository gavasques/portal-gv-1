import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Verified, 
  Upload,
  X,
  Save,
  Building,
  Users,
  FileText
} from 'lucide-react';

interface Partner {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  category: { name: string };
  logo?: string;
  website?: string;
  phone?: string;
  email?: string;
  isVerified: boolean;
  discountInfo?: string;
  averageRating?: number | string;
  reviewCount?: number;
  status: "published" | "draft";
  createdAt: string;
}

interface Contact {
  id?: number;
  name: string;
  position: string;
  email: string;
  phone: string;
}

interface PartnerFile {
  id?: number;
  name: string;
  description: string;
  file?: File;
  url?: string;
}



export default function AdminPartners() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: 0,
    website: '',
    phone: '',
    email: '',
    isVerified: false,
    discountInfo: '',
    status: 'published' as 'published' | 'draft'
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [files, setFiles] = useState<PartnerFile[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch partners
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['/api/admin/partners'],
    queryFn: () => apiRequest('/api/admin/partners')
  });

  // Fetch partner categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/partner-categories'],
    queryFn: () => apiRequest('/api/partner-categories')
  });

  // Create partner mutation
  const createPartnerMutation = useMutation({
    mutationFn: (partnerData: FormData) => 
      apiRequest('/api/admin/partners', 'POST', partnerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/partners'] });
      resetForm();
      setIsCreateDialogOpen(false);
      toast({
        title: "Parceiro criado",
        description: "Novo parceiro adicionado com sucesso."
      });
    }
  });

  // Update partner mutation
  const updatePartnerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      apiRequest(`/api/admin/partners/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/partners'] });
      resetForm();
      setEditingPartner(null);
      toast({
        title: "Parceiro atualizado",
        description: "Informações atualizadas com sucesso."
      });
    }
  });

  // Delete partner mutation
  const deletePartnerMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/partners/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/partners'] });
      toast({
        title: "Parceiro excluído",
        description: "Parceiro removido com sucesso."
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      website: '',
      phone: '',
      email: '',
      address: '',
      isVerified: false,
      exclusiveDiscount: '',
      status: 'published'
    });
    setContacts([]);
    setFiles([]);
    setLogoFile(null);
    setActiveTab('general');
  };

  const handleEdit = (partner: Partner) => {
    setFormData({
      name: partner.name,
      description: partner.description,
      categoryId: partner.categoryId,
      website: partner.website || '',
      phone: partner.phone || '',
      email: partner.email || '',
      isVerified: partner.isVerified,
      discountInfo: partner.discountInfo || '',
      status: partner.status
    });
    setEditingPartner(partner);
    setIsCreateDialogOpen(true);
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', position: '', email: '', phone: '' }]);
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const addFile = () => {
    setFiles([...files, { name: '', description: '' }]);
  };

  const updateFile = (index: number, field: keyof PartnerFile, value: string | File) => {
    const newFiles = [...files];
    newFiles[index] = { ...newFiles[index], [field]: value };
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.category || !formData.description.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const formDataToSend = new FormData();
    
    // Basic data
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value.toString());
    });

    // Logo
    if (logoFile) {
      formDataToSend.append('logo', logoFile);
    }

    // Contacts
    formDataToSend.append('contacts', JSON.stringify(contacts));

    // Files
    files.forEach((file, index) => {
      if (file.file) {
        formDataToSend.append(`files`, file.file);
        formDataToSend.append(`fileNames`, file.name);
        formDataToSend.append(`fileDescriptions`, file.description);
      }
    });

    if (editingPartner) {
      updatePartnerMutation.mutate({ id: editingPartner.id, data: formDataToSend });
    } else {
      createPartnerMutation.mutate(formDataToSend);
    }
  };

  const toggleVerification = (partnerId: number, currentStatus: boolean) => {
    const formData = new FormData();
    formData.append('isVerified', (!currentStatus).toString());
    
    updatePartnerMutation.mutate({ id: partnerId, data: formData });
  };

  const toggleStatus = (partnerId: number, currentStatus: 'published' | 'draft') => {
    const formData = new FormData();
    formData.append('status', currentStatus === 'published' ? 'draft' : 'published');
    
    updatePartnerMutation.mutate({ id: partnerId, data: formData });
  };

  const renderStars = (rating: number | string | undefined) => {
    const safeRating = Number(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(safeRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Parceiros</h1>
          <p className="text-muted-foreground">
            Gerencie todos os parceiros do diretório
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Novo Parceiro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}
              </DialogTitle>
              <DialogDescription>
                {editingPartner 
                  ? 'Atualize as informações do parceiro.'
                  : 'Adicione um novo parceiro ao diretório.'
                }
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="contacts">Contatos</TabsTrigger>
                <TabsTrigger value="files">Arquivos</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Parceiro *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome da empresa"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {PARTNER_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://exemplo.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contato@empresa.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="logo">Logo da Empresa</Label>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Sobre a Empresa *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição completa dos serviços..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="exclusiveDiscount">Desconto Exclusivo para Alunos</Label>
                      <Textarea
                        id="exclusiveDiscount"
                        value={formData.exclusiveDiscount}
                        onChange={(e) => setFormData(prev => ({ ...prev, exclusiveDiscount: e.target.value }))}
                        placeholder="Descreva o benefício oferecido aos alunos..."
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="verified"
                          checked={formData.isVerified}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked }))}
                        />
                        <Label htmlFor="verified">Selo de Verificação</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label htmlFor="status">Status:</Label>
                        <Select value={formData.status} onValueChange={(value: 'published' | 'draft') => setFormData(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="published">Publicado</SelectItem>
                            <SelectItem value="draft">Rascunho</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Contacts Tab */}
              <TabsContent value="contacts" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Contatos da Empresa</h3>
                  <Button onClick={addContact} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Contato
                  </Button>
                </div>

                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhum contato adicionado</p>
                    <p className="text-sm">Clique em "Adicionar Contato" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-medium">Contato {index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeContact(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Nome</Label>
                              <Input
                                value={contact.name}
                                onChange={(e) => updateContact(index, 'name', e.target.value)}
                                placeholder="Nome completo"
                              />
                            </div>
                            
                            <div>
                              <Label>Cargo</Label>
                              <Input
                                value={contact.position}
                                onChange={(e) => updateContact(index, 'position', e.target.value)}
                                placeholder="Cargo/função"
                              />
                            </div>
                            
                            <div>
                              <Label>E-mail</Label>
                              <Input
                                type="email"
                                value={contact.email}
                                onChange={(e) => updateContact(index, 'email', e.target.value)}
                                placeholder="email@empresa.com"
                              />
                            </div>
                            
                            <div>
                              <Label>Telefone</Label>
                              <Input
                                value={contact.phone}
                                onChange={(e) => updateContact(index, 'phone', e.target.value)}
                                placeholder="(11) 99999-9999"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Arquivos e Documentos</h3>
                  <Button onClick={addFile} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Arquivo
                  </Button>
                </div>

                {files.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhum arquivo adicionado</p>
                    <p className="text-sm">Clique em "Adicionar Arquivo" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {files.map((file, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-medium">Arquivo {index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Nome do Arquivo</Label>
                              <Input
                                value={file.name}
                                onChange={(e) => updateFile(index, 'name', e.target.value)}
                                placeholder="Ex: Tabela de Preços"
                              />
                            </div>
                            
                            <div>
                              <Label>Descrição</Label>
                              <Input
                                value={file.description}
                                onChange={(e) => updateFile(index, 'description', e.target.value)}
                                placeholder="Breve descrição do arquivo"
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                              <Label>Arquivo</Label>
                              <Input
                                type="file"
                                onChange={(e) => updateFile(index, 'file', e.target.files?.[0] || '')}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createPartnerMutation.isPending || updatePartnerMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createPartnerMutation.isPending || updatePartnerMutation.isPending 
                  ? 'Salvando...' 
                  : 'Salvar Parceiro'
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Partners Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parceiro</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Verificação</TableHead>
                <TableHead className="text-center">Avaliação</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando parceiros...
                  </TableCell>
                </TableRow>
              ) : partners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum parceiro cadastrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((partner: Partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={partner.logo} alt={partner.name} />
                          <AvatarFallback>
                            {partner.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {partner.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{partner.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={partner.isVerified}
                          onCheckedChange={() => toggleVerification(partner.id, partner.isVerified)}
                        />
                        {partner.isVerified && (
                          <Verified className="h-4 w-4 text-blue-500 ml-2" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {renderStars(partner.averageRating)}
                        <span className="text-sm text-muted-foreground ml-2">
                          {Number(partner.averageRating || 0).toFixed(1)} ({partner.reviewCount || 0})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={partner.status === 'published'}
                          onCheckedChange={() => toggleStatus(partner.id, partner.status)}
                        />
                        <Badge
                          variant={partner.status === 'published' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {partner.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(partner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePartnerMutation.mutate(partner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}