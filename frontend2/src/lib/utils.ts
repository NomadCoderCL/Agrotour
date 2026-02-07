import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combina clases de manera eficiente
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Para Create React App:
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export function getAuthHeaders(): Record<string, string> {
  const accessToken = localStorage.getItem('access_token');
  return accessToken
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }
    : { 'Content-Type': 'application/json' };
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { ...getAuthHeaders(), ...(options.headers as Record<string, string> || {}) };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
  return response;
}

export function handleApiError(error: any, setError: (msg: string) => void) {
  if (error instanceof Error) {
    setError(error.message);
  } else {
    setError('Error desconocido.');
  }
}
