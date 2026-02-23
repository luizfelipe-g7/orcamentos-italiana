import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle,
  List
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { resolvePhotoUrl } from '../../utils/photoUrl';

interface SidebarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export function Sidebar({ collapsed, toggleCollapsed }: SidebarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profilePhoto = resolvePhotoUrl(user?.foto_url);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Orçamentos', path: '/orcamentos' },
    { icon: Users, label: 'Membros', path: '/membros' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className={clsx(
        "fixed left-0 top-0 h-screen bg-[#003366] text-white transition-all duration-300 z-20 flex flex-col shadow-xl",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-center border-b border-white/10 relative">
        {collapsed ? (
          <span className="text-2xl font-bold tracking-tighter">EU</span>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold tracking-wide">EU NA EUROPA</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-blue-200">Assessoria</span>
          </div>
        )}
      </div>

      {/* User Info (Condensed) */}
      <div className={clsx(
        "py-6 px-4 border-b border-white/10 transition-all duration-300",
        collapsed ? "items-center" : ""
      )}>
        <div className="flex items-center gap-3">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Foto de perfil"
              className="w-10 h-10 rounded-full object-cover border border-white/30 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-semibold shrink-0">
              {user?.nome?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user?.nome}</p>
              <p className="text-xs text-blue-200 truncate">{user?.role === 'ADM' ? 'Administrador' : 'Vendedor'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-white text-[#003366] shadow-md font-medium" 
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className={clsx("shrink-0", isActive ? "text-[#003366]" : "text-blue-200 group-hover:text-white")} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-24 bg-[#003366] border border-white/20 text-white rounded-full p-1 shadow-lg hover:bg-[#004080] transition-colors z-30"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={clsx(
            "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-red-300 hover:bg-red-500/10 hover:text-red-200",
            collapsed ? "justify-center" : ""
          )}
          title="Sair"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
