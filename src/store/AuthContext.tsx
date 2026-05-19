import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'admin' | 'reception' | 'nurse' | 'doctor' | 'lab' | 'pharmacy' | 'accounting' | 'cashier' | 'hospitalization' | 'records';

interface AuthContextType {
  user: any;
  role: UserRole | null;
  activeWorkstation: UserRole | null;
  loading: boolean;
  hospitalName: string;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithPin: (username: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  updateHospitalName: (name: string) => Promise<void>;
  setWorkstation: (role: UserRole) => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setLocalRole] = useState<UserRole | null>(null);
  const [activeWorkstation, setActiveWorkstation] = useState<UserRole | null>(null);
  const [hospitalName, setHospitalName] = useState('Clinique de la Grâce');
  const [loading, setLoading] = useState(true);

  // Helper: authenticated fetch that auto-injects the Bearer token
  const apiFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('clinic_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // /api/hospital is public — no auth needed
        const res = await fetch('/api/hospital');
        if (res.ok) {
          const hospitalData = await res.json();
          setHospitalName(hospitalData.name || 'Clinique de la Grâce');
        }

        // Restore session from localStorage
        const token = localStorage.getItem('clinic_auth_token');
        const savedUser = localStorage.getItem('clinic_user');

        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setLocalRole(userData.role as UserRole);
          setActiveWorkstation(userData.role as UserRole);
        }
      } catch (e) {
        console.error("Auth initialization failed", e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Login failed");
    }

    const { token, user: userData } = await res.json();
    localStorage.setItem('clinic_auth_token', token);
    localStorage.setItem('clinic_user', JSON.stringify(userData));
    setUser(userData);
    setLocalRole(userData.role as UserRole);
    setActiveWorkstation(userData.role as UserRole);
  };

  const loginWithPin = async (username: string, pin: string) => {
    const res = await fetch('/api/auth/pin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Invalid PIN");
    }

    const { token, user: userData } = await res.json();
    localStorage.setItem('clinic_auth_token', token);
    localStorage.setItem('clinic_user', JSON.stringify(userData));
    setUser(userData);
    setLocalRole(userData.role as UserRole);
    setActiveWorkstation(userData.role as UserRole);
  };

  const logout = async () => {
    localStorage.removeItem('clinic_auth_token');
    localStorage.removeItem('clinic_user');
    setUser(null);
    setLocalRole(null);
    setActiveWorkstation(null);
  };

  const setWorkstation = (ws: UserRole) => {
    setActiveWorkstation(ws);
  };

  const updateHospitalName = async (name: string) => {
    await apiFetch('/api/hospital', {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
    setHospitalName(name);
  };

  return (
    <AuthContext.Provider value={{ user, role, activeWorkstation, loading, hospitalName, loginWithEmail, loginWithPin, logout, updateHospitalName, setWorkstation, apiFetch }}>
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
