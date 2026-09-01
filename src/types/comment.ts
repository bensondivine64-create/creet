interface CommentAuthor {
  username: string;
  full_name: string;
  avatar?: string | null;
  verified: boolean;
}

export interface Comment {
  id: number;
  listing_id: number;
  author: CommentAuthor;
  content: string;
  created_at: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
}
