'use client'

import React from 'react';
import MainLayout from './layout/MainLayout';

interface LayoutProps {
  children: React.ReactNode;
}

// El middleware ya verifica la autenticación, no necesitamos hacerlo aquí
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
};

export default Layout;
