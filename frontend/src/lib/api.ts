import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Video,
  Profile,
  Playlist,
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  AddVideoToPlaylistRequest,
  PlaylistVideo,
  SubscriptionWithProfile,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  LikeCommentRequest,
  WatchHistory,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Set token to localStorage
export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

// Remove token from localStorage
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

// API client
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Add Content-Type for JSON requests
    if (options.body && typeof options.body === "string") {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "API request failed");
    }

    return response.json();
  }

  // Auth
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    return this.request("/api/auth/logout", {
      method: "POST",
    });
  }

  // Videos
  async getVideos(limit: number = 15, offset: number = 0): Promise<Video[]> {
    return this.request(`/api/videos?limit=${limit}&offset=${offset}`);
  }

  async getVideo(id: number): Promise<Video> {
    return this.request(`/api/videos/${id}`);
  }

  async createVideo(formData: FormData): Promise<Video> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to upload video");
    }

    return response.json();
  }

  async updateVideo(
    id: number,
    data: { title?: string; description?: string }
  ): Promise<Video> {
    return this.request(`/api/videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateVideoWithFiles(id: number, formData: FormData): Promise<Video> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/videos/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to update video");
    }

    return response.json();
  }

  async deleteVideo(id: number): Promise<void> {
    return this.request(`/api/videos/${id}`, {
      method: "DELETE",
    });
  }

  // Profile
  async getMyProfile(): Promise<Profile> {
    return this.request("/api/profile");
  }

  async getProfile(userId: number): Promise<Profile> {
    return this.request(`/api/profile/${userId}`);
  }

  async updateProfile(formData: FormData): Promise<Profile> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to update profile");
    }

    return response.json();
  }

  // Playlists
  async getUserPlaylists(): Promise<Playlist[]> {
    return this.request("/api/playlists");
  }

  async createPlaylist(data: CreatePlaylistRequest): Promise<Playlist> {
    return this.request("/api/playlists", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePlaylist(
    id: number,
    data: UpdatePlaylistRequest
  ): Promise<Playlist> {
    return this.request(`/api/playlists/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePlaylist(id: number): Promise<void> {
    return this.request(`/api/playlists/${id}`, {
      method: "DELETE",
    });
  }

  async addVideoToPlaylist(playlistId: number, videoId: number): Promise<void> {
    return this.request(`/api/playlists/${playlistId}/videos`, {
      method: "POST",
      body: JSON.stringify({ video_id: videoId }),
    });
  }

  async removeVideoFromPlaylist(
    playlistId: number,
    videoId: number
  ): Promise<void> {
    return this.request(`/api/playlists/${playlistId}/videos/${videoId}`, {
      method: "DELETE",
    });
  }

  async getPlaylistsContainingVideo(videoId: number): Promise<number[]> {
    const response = await this.request<{ playlist_ids: number[] }>(
      `/api/playlists/check/${videoId}`
    );
    return response.playlist_ids || [];
  }

  async getPlaylist(id: number): Promise<Playlist> {
    return this.request(`/api/playlists/${id}`);
  }

  async getPlaylistVideos(id: number): Promise<PlaylistVideo[]> {
    return this.request(`/api/playlists/${id}/videos`);
  }

  // Subscriptions
  async subscribeToChannel(userId: number): Promise<void> {
    return this.request(`/api/users/${userId}/subscription`, {
      method: "POST",
    });
  }

  async unsubscribeFromChannel(userId: number): Promise<void> {
    return this.request(`/api/users/${userId}/subscription`, {
      method: "DELETE",
    });
  }

  async getSubscriptionStatus(userId: number): Promise<boolean> {
    const response = await this.request<{ is_subscribed: boolean }>(
      `/api/users/${userId}/subscription`
    );
    return response.is_subscribed;
  }

  async getSubscriberCount(userId: number): Promise<number> {
    const response = await this.request<{ subscriber_count: number }>(
      `/api/users/${userId}/subscriber-count`
    );
    return response.subscriber_count;
  }

  async getSubscribedChannels(): Promise<SubscriptionWithProfile[]> {
    return this.request("/api/subscriptions");
  }

  async getSubscriptionFeed(
    limit: number = 20,
    offset: number = 0
  ): Promise<Video[]> {
    return this.request(
      `/api/feed/subscriptions?limit=${limit}&offset=${offset}`
    );
  }

  // Likes
  async likeVideo(videoId: number): Promise<void> {
    return this.request(`/api/videos/${videoId}/like`, {
      method: "POST",
    });
  }

  async unlikeVideo(videoId: number): Promise<void> {
    return this.request(`/api/videos/${videoId}/like`, {
      method: "DELETE",
    });
  }

  async getLikeStatus(videoId: number): Promise<boolean> {
    const response = await this.request<{ is_liked: boolean }>(
      `/api/videos/${videoId}/like`
    );
    return response.is_liked;
  }

  async getLikedVideos(): Promise<PlaylistVideo[]> {
    return this.request("/api/videos/liked");
  }

  // Comments
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    return this.request("/api/comments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCommentsByVideoID(
    videoId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<Comment[]> {
    return this.request(
      `/api/comments/videos/${videoId}?limit=${limit}&offset=${offset}`
    );
  }

  async getRepliesByParentID(
    parentCommentId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<Comment[]> {
    return this.request(
      `/api/comments/${parentCommentId}/replies?limit=${limit}&offset=${offset}`
    );
  }

  async updateComment(
    commentId: number,
    data: UpdateCommentRequest
  ): Promise<Comment> {
    return this.request(`/api/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteComment(commentId: number): Promise<void> {
    return this.request(`/api/comments/${commentId}`, {
      method: "DELETE",
    });
  }

  async pinComment(commentId: number, isPinned: boolean): Promise<void> {
    return this.request(`/api/comments/${commentId}/pin`, {
      method: "POST",
      body: JSON.stringify({ is_pinned: isPinned }),
    });
  }

  async setCreatorLiked(
    commentId: number,
    isCreatorLiked: boolean
  ): Promise<void> {
    return this.request(`/api/comments/${commentId}/creator-like`, {
      method: "POST",
      body: JSON.stringify({ is_creator_liked: isCreatorLiked }),
    });
  }

  async likeComment(
    commentId: number,
    data: LikeCommentRequest
  ): Promise<void> {
    return this.request(`/api/comments/${commentId}/like`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async unlikeComment(commentId: number): Promise<void> {
    return this.request(`/api/comments/${commentId}/like`, {
      method: "DELETE",
    });
  }

  async getCommentCount(videoId: number): Promise<number> {
    const response = await this.request<{ count: number }>(
      `/api/comments/videos/${videoId}/count`
    );
    return response.count;
  }

  // Watch History
  async addToHistory(videoId: number): Promise<void> {
    return this.request(`/api/videos/${videoId}/history`, {
      method: "POST",
    });
  }

  async getWatchHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<WatchHistory[]> {
    return this.request(`/api/history?limit=${limit}&offset=${offset}`);
  }

  async removeFromHistory(videoId: number): Promise<void> {
    return this.request(`/api/history/${videoId}`, {
      method: "DELETE",
    });
  }

  async clearHistory(): Promise<void> {
    return this.request("/api/history", {
      method: "DELETE",
    });
  }

  async getHistoryCount(): Promise<number> {
    const response = await this.request<{ count: number }>("/api/history/count");
    return response.count;
  }
}

export const api = new ApiClient();
