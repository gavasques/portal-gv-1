import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  ArrowLeft, 
  Verified, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Download, 
  ThumbsUp, 
  MessageCircle,
  Send,
  FileText,
  Building,
  User
} from 'lucide-react';
import { Link } from 'wouter';

interface Partner {
  id: number;
  name: string;
  description: string;
  category: string;
  logo?: string;
  website?: string;
  phone?: string;
  email?: string;
  isVerified: boolean;
  averageRating?: number | string;
  reviewCount?: number;
  discountInfo?: string;
  status?: string;
  createdAt: string;
}

interface Contact {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
}

interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Comment {
  id: number;
  userId: number;
  userName: string;
  content: string;
  likes: number;
  hasLiked: boolean;
  replies: Comment[];
  createdAt: string;
}

interface PartnerFile {
  id: number;
  name: string;
  description: string;
  url: string;
  fileType: string;
  size: number;
}

export default function PartnerProfile() {
  const [, params] = useRoute('/partners/:id');
  const partnerId = params?.id ? parseInt(params.id) : null;
  const [activeTab, setActiveTab] = useState('general');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch partner data
  const { data: partner, isLoading } = useQuery({
    queryKey: ['/api/partners', partnerId],
    queryFn: () => apiRequest(`/api/partners/${partnerId}`),
    enabled: !!partnerId
  });

  // Fetch partner contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['/api/partners', partnerId, 'contacts'],
    queryFn: () => apiRequest(`/api/partners/${partnerId}/contacts`),
    enabled: !!partnerId
  });

  // Fetch partner reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['/api/partners', partnerId, 'reviews'],
    queryFn: () => apiRequest(`/api/partners/${partnerId}/reviews`),
    enabled: !!partnerId
  });

  // Fetch partner comments
  const { data: comments = [] } = useQuery({
    queryKey: ['/api/partners', partnerId, 'comments'],
    queryFn: () => apiRequest(`/api/partners/${partnerId}/comments`),
    enabled: !!partnerId
  });

  // Fetch partner files
  const { data: files = [] } = useQuery({
    queryKey: ['/api/partners', partnerId, 'files'],
    queryFn: () => apiRequest(`/api/partners/${partnerId}/files`),
    enabled: !!partnerId
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: (reviewData: { rating: number; comment: string }) =>
      apiRequest(`/api/partners/${partnerId}/reviews`, 'POST', reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId] });
      setNewReview({ rating: 5, comment: '' });
      toast({
        title: "Avaliação enviada",
        description: "Sua avaliação foi publicada com sucesso."
      });
    }
  });

  // Submit comment mutation
  const submitCommentMutation = useMutation({
    mutationFn: (commentData: { content: string; parentId?: number }) =>
      apiRequest(`/api/partners/${partnerId}/comments`, 'POST', commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'comments'] });
      setNewComment('');
      setReplyTo(null);
      setReplyContent('');
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi publicado com sucesso."
      });
    }
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      apiRequest(`/api/partners/${partnerId}/comments/${commentId}/like`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'comments'] });
    }
  });

  const renderStars = (rating: number | string | undefined, interactive = false, onRatingChange?: (rating: number) => void) => {
    const safeRating = Number(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < safeRating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
      />
    ));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmitReview = () => {
    if (!newReview.comment.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreva um comentário sobre sua experiência.",
        variant: "destructive"
      });
      return;
    }
    submitReviewMutation.mutate(newReview);
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    submitCommentMutation.mutate({ content: newComment });
  };

  const handleSubmitReply = (parentId: number) => {
    if (!replyContent.trim()) return;
    submitCommentMutation.mutate({ content: replyContent, parentId });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Parceiro não encontrado</h2>
        <Link href="/partners">
          <Button>Voltar para a lista</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fixed Header */}
      <Card className="sticky top-0 z-10 border-b">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/partners">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para a lista
                </Button>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={partner.logo} alt={partner.name} />
                  <AvatarFallback className="text-lg">
                    {partner.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold">{partner.name}</h1>
                    {partner.isVerified && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        <Verified className="h-4 w-4 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    {partner.category.name}
                  </Badge>
                  <div className="flex items-center space-x-1 mt-2">
                    {renderStars(partner.averageRating)}
                    <span className="text-sm text-muted-foreground ml-2">
                      {Number(partner.averageRating || 0).toFixed(1)} ({partner.reviewCount || 0} avaliações)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Dados Gerais</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações e Comunidade</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Sobre a Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {partner.description}
              </p>
            </CardContent>
          </Card>

          {/* Exclusive Discount */}
          {partner.discountInfo && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-300">
                  🎯 Desconto Exclusivo para Alunos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 dark:text-green-400 font-medium">
                  {partner.discountInfo}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Files and Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Arquivos e Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum arquivo disponível no momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {files.map((file: PartnerFile) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {file.description} • {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={file.url} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contatos da Empresa
              </CardTitle>
              <CardDescription>
                Entre em contato diretamente com a equipe do parceiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum contato cadastrado no momento.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contacts.map((contact: Contact) => (
                    <Card key={contact.id} className="border border-gray-200">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium">{contact.name}</h4>
                            <p className="text-sm text-muted-foreground">{contact.position}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={`mailto:${contact.email}`}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {contact.email}
                              </a>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={`tel:${contact.phone}`}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {contact.phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews and Community Tab */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Submit Review */}
          <Card>
            <CardHeader>
              <CardTitle>Deixar Avaliação</CardTitle>
              <CardDescription>
                Compartilhe sua experiência com este parceiro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Sua avaliação</Label>
                <div className="flex items-center space-x-1">
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview(prev => ({ ...prev, rating }))
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Comentário sobre sua experiência *
                </Label>
                <Textarea
                  placeholder="Descreva sua experiência com este parceiro..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleSubmitReview}
                disabled={submitReviewMutation.isPending || !newReview.comment.trim()}
              >
                {submitReviewMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
              </Button>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliações ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Seja o primeiro a avaliar este parceiro!
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review: Review) => (
                    <div key={review.id}>
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {review.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{review.userName}</span>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                      {reviews.indexOf(review) < reviews.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments and Discussion */}
          <Card>
            <CardHeader>
              <CardTitle>Comentários e Dúvidas</CardTitle>
              <CardDescription>
                Espaço para discussão e troca de experiências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>EU</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Faça uma pergunta ou compartilhe uma dica..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                  />
                  <Button 
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitCommentMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Comentar
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Inicie a conversa! Faça uma pergunta ou compartilhe uma dica.
                </p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment: Comment) => (
                    <div key={comment.id}>
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{comment.content}</p>
                          
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => likeCommentMutation.mutate(comment.id)}
                              className={comment.hasLiked ? 'text-blue-600' : ''}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {comment.likes}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Responder
                            </Button>
                          </div>

                          {/* Reply Form */}
                          {replyTo === comment.id && (
                            <div className="mt-3 ml-4 flex space-x-2">
                              <Input
                                placeholder="Escreva sua resposta..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSubmitReply(comment.id);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyContent.trim()}
                              >
                                Enviar
                              </Button>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-4 mt-4 space-y-3 border-l-2 border-gray-100 pl-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {reply.userName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-xs">{reply.userName}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(reply.createdAt).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                    <p className="text-xs">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {comments.indexOf(comment) < comments.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}