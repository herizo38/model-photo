export interface Photo {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  tags: string[];
  featured: boolean;
  created_at: string;
  views: number;
  clicks: number;
  shares: number;
}

export interface Category {
  id: string;
  name: string;
  name_fr: string;
  name_en: string;
  description?: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  status: 'unread' | 'read' | 'replied';
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface SocialMedia {
  platform: string;
  url: string;
  icon: string;
}