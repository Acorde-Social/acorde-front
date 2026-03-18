export interface FeedAuthor {
  id?: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

export interface IFeedItem {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'track' | 'collaboration';
  author: FeedAuthor;
  createdAt: Date;
  genre?: string;
  bpm?: number;
  key?: string;
  audioUrl?: string;
  duration?: string;
  likes: number;
  comments: number;
  progress?: number;
  currentTime?: string;
  isPlaying?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextPage: number | null;
  total: number;
  hasNextPage: boolean;
}

export interface FeedFilters {
  type?: string;
  genre?: string;
}
