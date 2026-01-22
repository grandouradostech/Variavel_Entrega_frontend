import React, { memo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = memo(() => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-50 min-h-screen flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="font-bold text-gray-800 text-lg">Sistema de Gestão</div>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 p-4 lg:p-8 w-full">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-4rem)] p-4 lg:p-6">
          {/* Aqui é onde as páginas filhas serão renderizadas */}
          <Outlet />
        </div>
      </div>
    </div>
  );
});

export default Layout;
