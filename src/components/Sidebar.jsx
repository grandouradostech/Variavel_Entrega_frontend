import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  FileText, 
  Target, 
  LogOut,
  User,
  X,
  RefreshCw
} from 'lucide-react';
import React, { memo, useState } from 'react';
import { useFilters } from '../context/FilterContext';

const Sidebar = memo(({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const { refreshApp } = useFilters();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshApp();
    // Pequeno delay visual para feedback
    setTimeout(() => {
        setIsRefreshing(false);
        window.location.reload(); // Recarrega a página para garantir tudo novo
    }, 1000);
  };

  // Função para definir a classe do link (ativo ou inativo)
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 
        flex flex-col p-6 z-50 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0
      `}>
        {/* Cabeçalho da Sidebar */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 leading-tight">Sistema de Gestão</h2>
              <p className="text-xs text-gray-500">Dashboard Principal</p>
            </div>
          </div>
          
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={onClose} 
            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

      {/* Navegação */}
      <nav className="flex-1 flex flex-col gap-2">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={20} />
          <span>Visão Geral (Xadrez)</span>
        </NavLink>

        <NavLink to="/incentivo" className={linkClass}>
          <TrendingUp size={20} />
          <span>Incentivo (KPIs)</span>
        </NavLink>

        <NavLink to="/caixas" className={linkClass}>
          <Package size={20} />
          <span>Bónus Caixas</span>
        </NavLink>

        {/* Apenas mostra o resumo de pagamento e metas se for Admin */}
        {user?.role === 'admin' && (
          <>
            <NavLink to="/pagamento" className={linkClass}>
              <FileText size={20} />
              <span>Resumo Pagamento</span>
            </NavLink>

            <NavLink to="/metas" className={linkClass}>
              <Target size={20} />
              <span>Painel de Gestão</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className={`flex items-center gap-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full font-medium ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
        </button>

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full font-medium"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
      </div>
    </>
  );
});

export default Sidebar;