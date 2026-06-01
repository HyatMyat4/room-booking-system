import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api, User } from '../api/client';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  setAuthenticated: (user: User, jwt: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

function loadUser(): User | null {
  try {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(loadUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));

  const setAuthenticated = useCallback((user: User, jwt: string) => {
    setCurrentUser(user);
    setToken(jwt);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    api.logout();
    localStorage.removeItem('currentUser');
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, token, setAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
