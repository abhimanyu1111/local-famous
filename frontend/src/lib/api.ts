import axios from 'axios';

const DEFAULT = 'http://localhost:4000'; // good for local dev
const API = (import.meta.env.VITE_API_BASE || DEFAULT).replace(/\/+$/, ''); // trim trailing slash

export const api = axios.create({ baseURL: API });

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
