export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  category: 'Anime' | 'Game' | 'Marvel' | 'DC' | 'Other';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Revision {
  id: string;
  page_id: string;
  content: string;
  edited_by: string;
  created_at: string;
  summary?: string;
}

export interface Discussion {
  id: string;
  page_id: string;
  user_id: string;
  content: string;
  created_at: string;
}
