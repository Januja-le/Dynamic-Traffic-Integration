import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export async function uploadFiles(endpoint, files, extra = {}) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(extra)) {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  }
  files.forEach((file) => formData.append('files', file));
  const { data } = await api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function saveProfile(role, payload) {
  const { data } = await api.put(`/users/profile`, { role, ...payload });
  return data;
}
