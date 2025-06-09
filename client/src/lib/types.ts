export interface DashboardMetrics {
  suppliersCount: number;
  productsCount: number;
  aiCredits: number;
  openTickets: number;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  isImportant: boolean;
  createdAt: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  url: string;
}

export interface ViewMode {
  type: 'list' | 'grid';
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface FilterState {
  query: string;
  category?: string;
  productType?: string;
  country?: string;
  primaryFunction?: string;
}

export interface Material {
  id: number;
  title: string;
  description?: string;
  type: string;
  content?: string;
  filePath?: string;
  url?: string;
  accessLevel: string;
  category?: string;
  tags?: string[];
  downloadCount: number;
  viewCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    email: string;
    fullName?: string;
  };
}
