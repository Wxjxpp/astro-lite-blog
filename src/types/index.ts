export interface PostFrontmatter {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  category: string;
  tags: string[];
  cover?: string;
  draft?: boolean;
  author?: string;
}

export interface PostItem {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  category: string;
  tags: string[];
  cover?: string;
  draft?: boolean;
  author?: string;
  readingTime: number;
}

export interface Comment {
  id: string;
  postSlug: string;
  userId: string;
  username: string;
  avatarUrl: string;
  content: string;
  createdAt: number;
  parentId?: string;
  likes?: number;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
}

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  githubUrl: string;
}

export interface CategoryInfo { name: string; count: number; posts: PostItem[]; }
export interface TagInfo { name: string; count: number; posts: PostItem[]; }
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
export interface PaginationParams { page?: number; pageSize?: number; }
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
