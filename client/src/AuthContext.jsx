import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;

    api.get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data.user);
      })
      .catch((error) => {
        if (active && error.response?.status !== 401) {
          setAuthError('We could not verify your session. Check that the laundry service is running.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials);
      setUser(data.user);
      setAuthError('');
      return data.user;
    },
    async signup(details) {
      const { data } = await api.post('/auth/signup', details);
      setUser(data.user);
      setAuthError('');
      return data.user;
    },
    async logout() {
      await api.post('/auth/logout');
      setUser(null);
      setAuthError('');
    }
  }), [user, loading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
