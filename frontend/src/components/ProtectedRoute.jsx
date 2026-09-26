import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

export default function ProtectedRoute() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  if (!user && !token) {
    // Redirigir al login si no hay token ni usuario autenticado
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
