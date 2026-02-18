import { Platform } from 'react-native';
import {
  Celebrity,
  DailyChallengeResponse,
  GuessRequest,
  GuessResponse,
} from '../types';

// Android emulator uses 10.0.2.2 to reach host localhost
const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.error?.message ?? error.message ?? 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Celebrity CRUD (Admin)
export const celebrityApi = {
  getAll: () => request<Celebrity[]>('/celebrities'),

  getById: (id: string) => request<Celebrity>(`/celebrities/${id}`),

  create: (celebrity: Omit<Celebrity, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Celebrity>('/celebrities', {
      method: 'POST',
      body: JSON.stringify(celebrity),
    }),

  update: (id: string, celebrity: Omit<Celebrity, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<void>(`/celebrities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(celebrity),
    }),

  delete: (id: string) =>
    request<void>(`/celebrities/${id}`, {
      method: 'DELETE',
    }),
};

// Daily Challenge (Game)
export const dailyChallengeApi = {
  getToday: () => request<DailyChallengeResponse>('/dailychallenge'),

  submitGuess: (guess: GuessRequest) =>
    request<GuessResponse>('/dailychallenge/guess', {
      method: 'POST',
      body: JSON.stringify(guess),
    }),
};
