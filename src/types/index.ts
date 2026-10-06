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
}

export interface CategoryInfo { name: string; count: number; posts: PostItem[]; }
export interface TagInfo { name: string; count: number; posts: PostItem[]; }