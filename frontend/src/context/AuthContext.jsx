import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('plm_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem('plm_token');
        delete api.defaults.headers.common['Authorization'];
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, ...userData } = data.data;
    localStorage.setItem('plm_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return data;
  };

  const register = async (name, email, password, role = 'developer') => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    const { token, ...userData } = data.data;
    localStorage.setItem('plm_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('plm_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = { user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
