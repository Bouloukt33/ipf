import { User } from './auth';

// API MOCK - Remplacer par les vrais appels API plus tard
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// Mock login - À REMPLACER par fetch vers ton API
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock validation
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
        return {
            user: {
                id: '1',
                email: credentials.email,
                name: 'John Doe',
            },
            accessToken: 'mock-access-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
        };
    }

    throw new Error('Email ou mot de passe incorrect');
}

// Mock register - À REMPLACER par fetch vers ton API
export async function registerApi(data: RegisterData): Promise<AuthResponse> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock validation
    if (data.email.includes('@')) {
        return {
            user: {
                id: '2',
                email: data.email,
                name: data.name,
            },
            accessToken: 'mock-access-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
        };
    }

    throw new Error('Email invalide');
}

// Exemple de comment ça sera plus tard avec la vraie API :
/*
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur de connexion');
  }
  
  return response.json();
}
*/