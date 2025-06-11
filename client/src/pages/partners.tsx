import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Search, Grid, List, Verified, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Link } from 'wouter';

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
  status?: string;
  createdAt: string;
}

export default function Partners() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Fetch partners
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['/api/partners', { search: searchTerm, category: selectedCategory, verified: showVerifiedOnly, page: currentPage }],
    queryFn: () => apiRequest('/api/partners')
  });

  // Filter partners based on search and filters
  const filteredPartners = partners.filter((partner: Partner) => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || partner.category?.name === selectedCategory;
    const matchesVerified = !showVerifiedOnly || partner.isVerified;
    const isPublished = !partner.status || partner.status === 'published';
    
    return matchesSearch && matchesCategory && matchesVerified && isPublished;
  });

  // Get unique categories
  const categories = Array.from(new Set(partners.map((partner: Partner) => partner.category?.name).filter(Boolean)));

  // Pagination
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderStars = (rating: number | string | undefined) => {
    const safeRating = Number(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(safeRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const renderListView = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3">
        <div className="grid grid-cols-12 gap-4 font-medium text-sm">
          <div className="col-span-4">Parceiro</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-3">Avaliação</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Ações</div>
        </div>
      </div>
      <div className="divide-y">
        {paginatedPartners.map((partner: Partner) => (
          <div key={partner.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4 flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={partner.logo} alt={partner.name} />
                  <AvatarFallback>{partner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center space-x-2">
                    <span>{partner.name}</span>
                    {partner.isVerified && <Verified className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {partner.description}
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <Badge variant="secondary">{partner.category?.name || 'Categoria'}</Badge>
              </div>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(partner.averageRating)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Number(partner.averageRating || 0).toFixed(1)} ({partner.reviewCount || 0})
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  {partner.isVerified && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Verificado
                    </Badge>
                  )}
                  {partner.discountInfo && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Desconto
                    </Badge>
                  )}
                </div>
              </div>
              <div className="col-span-1">
                <Link href={`/partners/${partner.id}`}>
                  <Button size="sm" variant="outline">
                    Ver Perfil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedPartners.map((partner: Partner) => (
        <Card key={partner.id} className="shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
          <div className="h-48 bg-gray-100 relative">
            {partner.logo ? (
              <img src={partner.logo} alt={partner.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                <span className="text-2xl font-bold text-primary">
                  {partner.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500">
                ♥
              </div>
            </div>
            {partner.isVerified && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Verificado
              </div>
            )}
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-lg">{partner.name}</h3>
              <div className="flex items-center">
                {renderStars(partner.averageRating)}
                <span className="text-sm font-medium ml-1">{Number(partner.averageRating || 0).toFixed(1)}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {partner.description}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                {partner.category?.name || 'Categoria'}
              </Badge>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Brasil</span>
            </div>
            
            <div className="flex gap-2">
              <Link href={`/partners/${partner.id}`} className="flex-1">
                <Button className="w-full bg-primary text-white text-sm">
                  Ver Detalhes
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Contatar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
          if (page > totalPages) return null;
          
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Próximo
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700 font-medium">Parceiros</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Parceiros de Negócio</h1>
          <p className="text-gray-600 mt-1">Encontre e conecte-se com parceiros verificados para impulsionar seu negócio</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-primary text-white">
          <span className="mr-2">+</span>
          Adicionar Novo Parceiro
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar parceiros por nome, categoria ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:ring-primary focus:border-primary"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] border-gray-200">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={String(category)} value={String(category)}>
                      {String(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Verified Toggle */}
              <div className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg">
                <Switch
                  id="verified"
                  checked={showVerifiedOnly}
                  onCheckedChange={setShowVerifiedOnly}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="verified" className="text-sm text-gray-700">
                  Verificados
                </Label>
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-none ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={`rounded-none ${viewMode === 'cards' ? 'bg-primary text-white' : 'text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredPartners.length} parceiro{filteredPartners.length !== 1 ? 's' : ''} encontrado{filteredPartners.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content */}
      {filteredPartners.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum parceiro encontrado</h3>
              <p>Tente ajustar os filtros ou termo de busca.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'list' ? renderListView() : renderCardsView()}
          {renderPagination()}
        </>
      )}
    </div>
  );
}