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
  view_count: number;
  created_at: string;
  updated_at: string;
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
