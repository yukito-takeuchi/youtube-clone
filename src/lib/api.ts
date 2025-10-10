import { AuthResponse, LoginRequest, RegisterRequest, Video, Profile } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Set token to localStorage
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Remove token from localStorage
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
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
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add Content-Type for JSON requests
    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Auth
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // Videos
  async getVideos(): Promise<Video[]> {
    return this.request('/api/videos');
  }

  async getVideo(id: number): Promise<Video> {
    return this.request(`/api/videos/${id}`);
  }

  async createVideo(formData: FormData): Promise<Video> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/videos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to upload video');
    }

    return response.json();
  }

  async updateVideo(id: number, data: { title?: string; description?: string }): Promise<Video> {
    return this.request(`/api/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVideo(id: number): Promise<void> {
    return this.request(`/api/videos/${id}`, {
      method: 'DELETE',
    });
  }

  // Profile
  async getMyProfile(): Promise<Profile> {
    return this.request('/api/profile');
  }

  async getProfile(userId: number): Promise<Profile> {
    return this.request(`/api/profile/${userId}`);
  }

  async updateProfile(formData: FormData): Promise<Profile> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to update profile');
    }

    return response.json();
  }
}

export const api = new ApiClient();
