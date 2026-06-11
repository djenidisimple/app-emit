// services/api.ts
import axios, { InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('app-emit-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

// Intercepteur pour gérer le 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      Cookies.remove('app-emit-token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Wrapper pour correspondre à l'interface { get, post, put, patch, delete }
export const api = {
  get: <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get(endpoint, config).then((res) => res.data),
  post: <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.post(endpoint, data, config).then((res) => res.data),
  put: <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.put(endpoint, data, config).then((res) => res.data),
  patch: <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.patch(endpoint, data, config).then((res) => res.data),
  delete: <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete(endpoint, config).then((res) => res.data),
};

export default axiosInstance;
