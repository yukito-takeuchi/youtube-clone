export interface User {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  channel_name: string;
  description: string;
  icon_url: string;
  banner_url: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: number;
  user_id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration?: number; // Duration in seconds
  view_count: number;
  like_count?: number; // Total number of likes
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface Playlist {
  id: number;
  user_id: number;
  title: string;
  description: string;
  visibility: "public" | "unlisted" | "private";
  video_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PlaylistVideo {
  id: number;
  playlist_id: number;
  video_id: number;
  position: number;
  video?: Video;
  created_at: string;
}

export interface CreatePlaylistRequest {
  title: string;
  description?: string;
  visibility?: "public" | "unlisted" | "private";
}

export interface UpdatePlaylistRequest {
  title?: string;
  description?: string;
  visibility?: "public" | "unlisted" | "private";
}

export interface AddVideoToPlaylistRequest {
  video_id: number;
}

export interface Subscription {
  id: number;
  subscriber_user_id: number;
  subscribed_to_user_id: number;
  created_at: string;
}

export interface SubscriptionWithProfile extends Subscription {
  profile: Profile;
}
