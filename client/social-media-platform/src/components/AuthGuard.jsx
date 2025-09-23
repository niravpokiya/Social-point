import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/axiosInstance';

export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify token with server
        const response = await api.get('/api/user/me');
        if (response.data) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up automatic logout after 1 hour
    const logoutTimer = setTimeout(() => {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }, 60 * 60 * 1000); // 1 hour

    return () => clearTimeout(logoutTimer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}




