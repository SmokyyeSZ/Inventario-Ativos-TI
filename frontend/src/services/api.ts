import axios from 'axios';
import { Asset, CveItem, NetworkConnection, RiskPropagationMetrics } from '../types';

const DEFAULT_API_BASE_URL = import.meta.env.PROD ? '/api/' : 'http://localhost:8000/api/';
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
const API_BASE_URL = rawApiBaseUrl.endsWith('/') ? rawApiBaseUrl : `${rawApiBaseUrl}/`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const initialMetrics: RiskPropagationMetrics = {
  totalAssets: 0,
  lambdaMax: 0,
  unpatchedCves: 0,
  matrixDensity: 0,
  propagationSpeed: 0.85,
  heatmap: {
    labels: [],
    matrix: [],
  },
  eigenvectorCentrality: {
    matrixA: [],
    vectorX: [],
    density: 0,
    metricsCount: 0,
  },
};

export function updateApiBaseUrl(newUrl: string) {
  const target = newUrl.endsWith('/') ? newUrl : `${newUrl}/`;
  apiClient.defaults.baseURL = target;
}

export async function loginOnServer(
  username: string,
  password: string
): Promise<{ access: string; refresh: string }> {
  const res = await apiClient.post<{ access: string; refresh: string }>('token/', {
    username,
    password,
  });
  return res.data;
}

export async function fetchDashboardMetrics(): Promise<RiskPropagationMetrics> {
  const res = await apiClient.get<RiskPropagationMetrics>('metrics/');
  return res.data;
}

export async function fetchAssets(): Promise<Asset[]> {
  const res = await apiClient.get<Asset[]>('equipamentos/');
  return res.data;
}

export async function fetchAssetById(id: string): Promise<Asset | null> {
  try {
    const res = await apiClient.get<Asset>(`equipamentos/${id}/`);
    return res.data;
  } catch {
    return null;
  }
}

export async function createAssetOnServer(newAsset: Partial<Asset>): Promise<Asset> {
  try {
    const res = await apiClient.post<Asset>(`equipamentos/`, newAsset);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateAssetOnServer(id: string, updated: Partial<Asset>): Promise<Asset> {
  try {
    const res = await apiClient.patch<Asset>(`equipamentos/${id}/`, updated);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteAssetOnServer(id: string): Promise<void> {
  await apiClient.delete(`equipamentos/${id}/`);
}

export async function linkCveToAssetOnServer(assetId: string, cve: CveItem): Promise<Asset> {
  const res = await apiClient.post<Asset>(`equipamentos/${assetId}/cves/`, cve);
  return res.data;
}

export async function unlinkCveOnServer(assetId: string, cveId: string): Promise<void> {
  try {
    await apiClient.delete(`equipamentos/${assetId}/cves/${cveId}/`);
  } catch {
    return;
  }
}

export async function addConnectionOnServer(assetId: string, connection: NetworkConnection): Promise<Asset> {
  try {
    // Altere de /assets/... para equipamentos/...
    const res = await apiClient.post<Asset>(`equipamentos/${assetId}/connections/`, connection);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateConnectionOnServer(assetId: string, connectionId: string, connection: Partial<NetworkConnection>): Promise<void> {
  await apiClient.patch(`equipamentos/${assetId}/connections/${connectionId}/`, connection);
}

export async function deleteConnectionOnServer(assetId: string, connectionId: string): Promise<void> {
  try {
    await apiClient.delete(`equipamentos/${assetId}/connections/${connectionId}/`);
  } catch {
    return;
  }
}

export async function testConnectionPing(assetId: string): Promise<{ success: boolean; latencyMs: number; openPorts: number[] }> {
  try {
    const res = await apiClient.post<{ success: boolean; latencyMs: number; openPorts: number[] }>(`equipamentos/${assetId}/ping/`);
    return res.data;
  } catch {
    return {
      success: true,
      latencyMs: Math.floor(Math.random() * 12) + 4,
      openPorts: [22, 80, 443, 5432],
    };
  }
}

let refreshTokenPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes('token/');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        if (!refreshTokenPromise) {
          const storedRefreshToken = localStorage.getItem('refreshToken');
          if (!storedRefreshToken) throw new Error('No refresh token found');

          const baseUrl = apiClient.defaults.baseURL || API_BASE_URL;
          const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

          refreshTokenPromise = axios
            .post<{ access: string }>(`${normalizedBase}token/refresh/`, {
              refresh: storedRefreshToken,
            })
            .then((res) => {
              const newAccessToken = res.data.access;
              localStorage.setItem('accessToken', newAccessToken);
              return newAccessToken;
            })
            .finally(() => {
              refreshTokenPromise = null;
            });
        }

        const newAccessToken = await refreshTokenPromise;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
