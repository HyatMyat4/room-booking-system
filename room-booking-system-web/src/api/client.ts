import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/* ---------- types ---------- */

export interface User {
  id: number;
  name: string;
  role: 'admin' | 'owner' | 'user';
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: { id: number; role: string };
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  floor: number;
  amenities: string;
  description: string;
}

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface CreateBookingBody {
  roomId: number;
  startTime: string;
  endTime: string;
}

export interface CreateUserBody {
  name: string;
  password: string;
  role: string;
}

export interface CreateRoomBody {
  name: string;
  capacity: number;
  floor: number;
  amenities: string;
  description: string;
}

export type UpdateRoomBody = CreateRoomBody;

export interface SummaryStats {
  userId: number;
  userName: string;
  totalBookings: number;
}

export interface SummaryRoomStats {
  roomId: number;
  roomName: string;
  totalBookings: number;
}

export interface SummaryGroupedBooking {
  id: number;
  roomName: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface SummaryGrouped {
  userId: number;
  userName: string;
  bookings: SummaryGroupedBooking[];
}

export interface Summary {
  stats: SummaryStats[];
  roomStats: SummaryRoomStats[];
  grouped: SummaryGrouped[];
}

/* ---------- config ---------- */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: `${BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

/* ---------- token helpers ---------- */

function getTokens() {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
}

/* ---------- request interceptor: attach token ---------- */

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = getTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/* ---------- response interceptor: auto-refresh on 401 ---------- */

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach((p) => {
    if (token) {
      p.resolve(token);
    } else {
      p.reject(error);
    }
  });
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const { refreshToken } = getTokens();

    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE}/api/auth/refresh`, { refreshToken });
        setTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error message for backward compatibility with catch(e => setError(e.message))
    const normalized = new Error(extractMessage(error));
    return Promise.reject(normalized);
  },
);

/* ---------- ISO helper ---------- */

function toISO(val: string | undefined | null): string | undefined | null {
  if (!val) return val;
  if (val.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(val)) return val;
  return new Date(val).toISOString();
}

/* ---------- error message extractor ---------- */

export function extractMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const d = err.response.data as { message?: string | string[] };
    if (d.message) {
      return Array.isArray(d.message) ? d.message.join(', ') : d.message;
    }
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

/* ---------- public API ---------- */

export const api = {
  /* ----- auth ----- */
  async verifyPassword(userId: number, password: string) {
    const { data } = await apiClient.post<LoginData>('/auth/login', { userId, password });
    setTokens(data.accessToken, data.refreshToken);
    const { data: users } = await apiClient.get<User[]>('/users');
    const found = users.find((u) => u.id === data.user.id);
    return {
      token: data.accessToken,
      user: { id: data.user.id, role: data.user.role as User['role'], name: found?.name ?? '' },
    };
  },

  async logout() {
    const { accessToken } = getTokens();
    clearTokens();
    if (accessToken) {
      apiClient.post('/auth/logout').catch(() => {});
    }
  },

  /* ----- users ----- */
  async getUsers() {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },

  async createUser(body: CreateUserBody) {
    const { data } = await apiClient.post('/users', body);
    return data;
  },

  async deleteUser(id: number) {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },

  async updateUserRole(id: number, role: string) {
    const { data } = await apiClient.patch(`/users/${id}/role`, { role });
    return data;
  },

  /* ----- rooms ----- */
  async getRooms() {
    const { data } = await apiClient.get<Room[]>('/rooms');
    return data;
  },

  async createRoom(body: CreateRoomBody) {
    const { data } = await apiClient.post('/rooms', body);
    return data;
  },

  async updateRoom(id: number, body: UpdateRoomBody) {
    const { data } = await apiClient.put(`/rooms/${id}`, body);
    return data;
  },

  async deleteRoom(id: number) {
    const { data } = await apiClient.delete(`/rooms/${id}`);
    return data;
  },

  /* ----- bookings ----- */
  async getBookings() {
    const { data } = await apiClient.get<Booking[]>('/bookings');
    return data;
  },

  async createBooking(body: CreateBookingBody) {
    const { data } = await apiClient.post('/bookings', {
      roomId: Number(body.roomId),
      startTime: toISO(body.startTime),
      endTime: toISO(body.endTime),
    });
    return data;
  },

  async deleteBooking(id: number) {
    const { data } = await apiClient.delete(`/bookings/${id}`);
    return data;
  },

  /* ----- summary ----- */
  async getSummary() {
    const { data } = await apiClient.get<Summary>('/summary');
    return data;
  },
};
