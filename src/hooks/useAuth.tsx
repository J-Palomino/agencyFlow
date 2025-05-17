import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on initial load
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          // Verify token with backend
          const response = await axios.get('/api/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(response.data);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      // Get the Google OAuth URL from backend
      const { data } = await axios.get('/auth/google/login');
      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code && !token) {
        try {
          setIsLoading(true);
          const { data } = await axios.get(`/auth/google/callback?code=${code}`);
          
          // Store the token
          localStorage.setItem('token', data.access_token);
          setToken(data.access_token);
          setUser(data.user);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Redirect to home or previous location
          navigate('/');
        } catch (error) {
          console.error('OAuth callback failed:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [token, navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Axios interceptor to add auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
