import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api.js';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await api.get('/auth/me');
        setUser({ ...data, full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signIn = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      await fetchUser();
      toast.success('Welcome back!');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signUp = async (email, password, role, firstName, lastName) => {
    try {
      const { data } = await api.post('/auth/register', {
        email,
        password,
        role,
        first_name: firstName,
        last_name: lastName
      });
      localStorage.setItem('token', data.token);
      await fetchUser();
      toast.success('Account created successfully!');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Signed out successfully');
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const updateProfile = async (data) => {
    try {
      if (!user) return;
      await api.put('/patients/profile', data); // Assume patient for now, expand based on role
      await fetchUser();
      toast.success('Profile updated');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  };

  const uploadAvatar = async (file) => {
    try {
      if (!user) return null;
      const formData = new FormData();
      formData.append('avatar', file);
      
      const { data } = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return data.avatar_url;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isDoctor: user?.role === 'doctor',
      isPatient: user?.role === 'patient',
      signIn,
      signUp,
      signOut,
      refreshUser,
      updateProfile,
      uploadAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
