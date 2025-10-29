import React from 'react';
import Sidebar from './Sidebar';
interface MainLayoutProps {
  children: React.ReactNode;
}
const MainLayout: React.FC<MainLayoutProps> = ({
  children
}) => {
  return <div className="flex h-screen w-full bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-200">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>;
};
export default MainLayout;