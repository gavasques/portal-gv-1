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
