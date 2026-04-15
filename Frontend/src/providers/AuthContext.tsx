// In src/providers/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AuthenticationService,
  OpenAPI,
  ApiError,
  Token,
  Body_login_for_access_token_api_auth_login_post as LoginFormData,
  UserResponse
} from '@/api';

// Defines the shape of the context value
interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (storedToken) {
        try {
          OpenAPI.TOKEN = storedToken;
          setToken(storedToken);
          const currentUser = await AuthenticationService.readUsersMeApiAuthMeGet();
          setUser(currentUser);
        } catch (err) {
          // If the token is invalid, clear it
          console.error("Session token is invalid, logging out.", err);
          setToken(null);
          setUser(null);
          OpenAPI.TOKEN = undefined;
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
        }
      }
      // Finished checking, allow the app to render
      setIsLoading(false);
    };

    checkUserSession();
  }, []); // The empty array ensures this runs only once on mount

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    setError(null);
    try {
      // Include 'remember_me' in the formData to send to FastAPI
      const formData: any = {
        username,
        password,
        remember_me: rememberMe, 
      };

      const tokenResponse: Token = await AuthenticationService.loginForAccessTokenApiAuthLoginPost({
        formData,
      });

      const accessToken = tokenResponse.access_token;
      if (!accessToken) {
        throw new Error("Login response did not include an access token.");
      }

      OpenAPI.TOKEN = accessToken;
      setToken(accessToken);

      const currentUser: UserResponse = await AuthenticationService.readUsersMeApiAuthMeGet();
      setUser(currentUser);

      // Store token based on rememberMe flag (frontend storage)
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('authToken', accessToken);

    } catch (err) {
      let errorMessage = 'An unexpected error occurred.';
      if (err instanceof ApiError) {
        errorMessage = (err.body as any)?.detail || 'Invalid username or password.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw error to be caught in the component
    }
  };

  const logout = async () => {
    try {
      // This call might fail if the token is already expired, so we proceed anyway
      await AuthenticationService.logoutApiAuthLogoutPost();
    } catch (err) {
      console.warn('Logout API request failed. Clearing session locally.', err);
    } finally {
      // Clear all session state regardless of API call success
      setUser(null);
      setToken(null);
      OpenAPI.TOKEN = undefined;
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
  };

  const value = { user, token, isLoading, login, logout, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
