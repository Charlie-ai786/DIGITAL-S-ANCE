import type {
  Story,
  StoryGenerateRequest,
  StoryGenerateResponse,
  AlternateEndingRequest,
  AlternateEndingResponse,
  WhisperRequest,
  WhisperResponse,
  ModelStatus,
  HealthStatus,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    
    if (res.status === 204) {
      return {} as T;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const detail = data?.detail || `HTTP Error ${res.status}`;
      throw new ApiError(detail, res.status);
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Network connection to the machine failed.';
    throw new ApiError(message, 0);
  }
}

export const api = {
  // System Health & Diagnostics
  getHealth: () => request<HealthStatus>('/api/health'),
  getModelStatus: () => request<ModelStatus>('/api/model/status'),
  loadModel: () => request<{ message: string; status: string }>('/api/model/load', { method: 'POST' }),

  // Real Open-weight Story Generation
  generateStory: (req: StoryGenerateRequest) =>
    request<StoryGenerateResponse>('/api/stories/generate', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  // Alternate Endings
  generateAlternateEnding: (req: AlternateEndingRequest) =>
    request<AlternateEndingResponse>('/api/stories/alternate-ending', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  // The Final Whisper
  summonWhisper: (req: WhisperRequest) =>
    request<WhisperResponse>('/api/stories/whisper', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  // Haunted Archive CRUD
  getStories: (params?: { search?: string; spirit?: string; tone?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.spirit) query.append('spirit', params.spirit);
    if (params?.tone) query.append('tone', params.tone);
    if (params?.sort) query.append('sort', params.sort);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Story[]>(`/api/stories${qs}`);
  },

  getStory: (id: string) => request<Story>(`/api/stories/${id}`),

  saveStory: (story: Omit<Story, 'id' | 'created_at'>) =>
    request<Story>('/api/stories', {
      method: 'POST',
      body: JSON.stringify(story),
    }),

  deleteStory: (id: string) =>
    request<void>(`/api/stories/${id}`, {
      method: 'DELETE',
    }),

  saveAlternateEnding: (storyId: string, alternateEnding: string) =>
    request<Story>(`/api/stories/${storyId}/alternate-ending?alternate_ending=${encodeURIComponent(alternateEnding)}`, {
      method: 'PATCH',
    }),
};
